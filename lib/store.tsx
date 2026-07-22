"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import type { Plan, Task, FinancialGoal, NeoFlowStore, TransactionRecord } from "./types";
import { auth, saveUserData, subscribeToUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { encryptVaultData, decryptVaultData } from "./crypto-vault";

const STORAGE_KEY = "neoflow-data";

const emptyStore: NeoFlowStore = {
  plans: [],
  tasks: [],
  financialGoals: [],
  savedAmount: 0,
  transactions: [],
};

interface NeoFlowContextType extends NeoFlowStore {
  currentUserId: string | null;
  addPlan: (plan: Omit<Plan, "id" | "createdAt">) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  toggleDailyCheckin: (planId: string, date: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addFinancialGoal: (goal: Omit<FinancialGoal, "id" | "createdAt">) => void;
  updateFinancialGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  purchaseFinancialGoal: (id: string) => void;
  unpurchaseFinancialGoal: (id: string) => void;
  updateSavedAmount: (amount: number) => void;
  addToSavings: (amount: number) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
}

const NeoFlowContext = createContext<NeoFlowContextType | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parseStore(raw: unknown): NeoFlowStore | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Record<string, unknown>;

  // Handle encrypted local storage payload if present
  if (typeof parsed.encryptedPayload === "string") {
    const decrypted = decryptVaultData(parsed.encryptedPayload);
    if (decrypted) return parseStore(decrypted);
    return null;
  }

  const plans = Array.isArray(parsed.plans) ? parsed.plans : [];
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  const financialGoals = Array.isArray(parsed.financialGoals) ? parsed.financialGoals : [];
  const savedAmount = typeof parsed.savedAmount === "number" ? parsed.savedAmount : 0;
  const transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];

  return { plans, tasks, financialGoals, savedAmount, transactions };
}

function loadFromLocalStorage(key: string): NeoFlowStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const decrypted = decryptVaultData(raw);
    if (decrypted) return parseStore(decrypted);
    return parseStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveToLocalStorage(key: string, data: NeoFlowStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, encryptVaultData(data));
  } catch {}
}

export function NeoFlowProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<NeoFlowStore>(emptyStore);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const activeUserRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  /**
   * CRITICAL FIX FOR CROSS-DEVICE SYNC:
   * isCloudLoadedRef prevents a newly refreshed device (or phone login) from
   * auto-saving its initial empty React state over valid Firestore cloud data
   * BEFORE the initial cloud snapshot has arrived and loaded.
   */
  const isCloudLoadedRef = useRef(false);

  /**
   * writeInFlightRef blocks applying incoming snapshots during an active local write
   * to avoid local state flickers while a save is processing.
   */
  const writeInFlightRef = useRef(false);
  const writeGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce timer for Firestore saves
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /**
   * Save store data to Firestore cloud safely
   */
  const doCloudSave = useCallback(async (uid: string, data: NeoFlowStore) => {
    // Only save if cloud initial sync has completed
    if (!isCloudLoadedRef.current) return;

    writeInFlightRef.current = true;
    if (writeGraceTimerRef.current) clearTimeout(writeGraceTimerRef.current);
    try {
      await saveUserData(uid, data);
    } catch (e) {
      console.warn("Cloud save error:", e);
    } finally {
      writeGraceTimerRef.current = setTimeout(() => {
        writeInFlightRef.current = false;
      }, 800);
    }
  }, []);

  // Auth listener + Firestore real-time subscription
  useEffect(() => {
    if (!auth) return;

    let snapshotUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (snapshotUnsub) {
        snapshotUnsub();
        snapshotUnsub = null;
      }

      if (user) {
        activeUserRef.current = user.uid;
        setCurrentUserId(user.uid);
        isCloudLoadedRef.current = false; // Reset cloud load flag for this user session

        const userKey = `${STORAGE_KEY}-${user.uid}`;

        // 1. Show local cache immediately for instant UI responsiveness
        const localCache = loadFromLocalStorage(userKey);
        if (localCache) {
          setStore(localCache);
        }

        // 2. Subscribe to real-time Firestore cloud data
        snapshotUnsub = subscribeToUserData(user.uid, (cloudData) => {
          if (!mountedRef.current) return;

          // If we have an active write in flight, ignore snapshot to avoid state flickering
          if (writeInFlightRef.current) {
            return;
          }

          if (cloudData) {
            const parsed = parseStore(cloudData);
            if (parsed) {
              setStore(parsed);
              saveToLocalStorage(userKey, parsed);
            }
          }

          // Mark cloud sync as loaded so future local edits can save to cloud
          isCloudLoadedRef.current = true;
        });

        // Fallback: If snapshot callback takes too long or user is offline, unlock auto-save after 3 seconds
        setTimeout(() => {
          if (mountedRef.current && activeUserRef.current === user.uid) {
            isCloudLoadedRef.current = true;
          }
        }, 3000);

      } else {
        // Guest mode
        activeUserRef.current = "guest";
        setCurrentUserId(null);
        isCloudLoadedRef.current = true;
        const guestData = loadFromLocalStorage(`${STORAGE_KEY}-guest`) || emptyStore;
        setStore(guestData);
      }
    });

    return () => {
      authUnsub();
      if (snapshotUnsub) snapshotUnsub();
    };
  }, []);

  // Auto-save: localStorage immediately, Firestore debounced (only after cloud initial load)
  useEffect(() => {
    const userId = activeUserRef.current;
    if (!userId) return;

    const storageKey = `${STORAGE_KEY}-${userId}`;

    // Always persist locally immediately
    saveToLocalStorage(storageKey, store);

    // Sync to Firestore ONLY after cloud has loaded and for logged in users
    if (userId !== "guest" && isCloudLoadedRef.current) {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(() => {
        if (mountedRef.current && activeUserRef.current === userId) {
          doCloudSave(userId, store);
        }
      }, 500);
    }
  }, [store, doCloudSave]);

  // ── Plans ──────────────────────────────────────────────────────────────────

  const addPlan = useCallback((plan: Omit<Plan, "id" | "createdAt">) => {
    const newPlan: Plan = { ...plan, id: generateId(), createdAt: new Date().toISOString() };
    setStore((prev) => ({ ...prev, plans: [...prev.plans, newPlan] }));
  }, []);

  const updatePlan = useCallback((id: string, updates: Partial<Plan>) => {
    setStore((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deletePlan = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, plans: prev.plans.filter((p) => p.id !== id) }));
  }, []);

  const toggleDailyCheckin = useCallback((planId: string, date: string) => {
    setStore((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => {
        if (p.id !== planId) return p;
        const currentCheckins = p.dailyCheckins || {};
        const isChecked = currentCheckins[date] === true;
        return { ...p, dailyCheckins: { ...currentCheckins, [date]: !isChecked } };
      }),
    }));
  }, []);

  // ── Tasks ──────────────────────────────────────────────────────────────────

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
    setStore((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setStore((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: (t.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      }),
    }));
  }, []);

  // ── Financial Goals ────────────────────────────────────────────────────────

  const addFinancialGoal = useCallback((goal: Omit<FinancialGoal, "id" | "createdAt">) => {
    const newGoal: FinancialGoal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
    setStore((prev) => ({ ...prev, financialGoals: [...prev.financialGoals, newGoal] }));
  }, []);

  const updateFinancialGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    setStore((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteFinancialGoal = useCallback((id: string) => {
    setStore((prev) => ({ ...prev, financialGoals: prev.financialGoals.filter((g) => g.id !== id) }));
  }, []);

  const purchaseFinancialGoal = useCallback((id: string) => {
    setStore((prev) => {
      const goal = prev.financialGoals.find((g) => g.id === id);
      if (!goal || goal.isPurchased || prev.savedAmount < goal.price) return prev;
      const newTx: TransactionRecord = {
        id: generateId(),
        type: "purchase",
        amount: goal.price,
        description: `Purchased Goal: "${goal.name}"`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        savedAmount: Math.max(0, prev.savedAmount - goal.price),
        financialGoals: prev.financialGoals.map((g) =>
          g.id === id ? { ...g, isPurchased: true, purchasedAt: new Date().toISOString() } : g
        ),
        transactions: [newTx, ...(prev.transactions || [])],
      };
    });
  }, []);

  const unpurchaseFinancialGoal = useCallback((id: string) => {
    setStore((prev) => {
      const goal = prev.financialGoals.find((g) => g.id === id);
      if (!goal || !goal.isPurchased) return prev;
      const newTx: TransactionRecord = {
        id: generateId(),
        type: "refund",
        amount: goal.price,
        description: `Reverted purchase for Goal: "${goal.name}"`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        savedAmount: prev.savedAmount + goal.price,
        financialGoals: prev.financialGoals.map((g) =>
          g.id === id ? { ...g, isPurchased: false, purchasedAt: undefined } : g
        ),
        transactions: [newTx, ...(prev.transactions || [])],
      };
    });
  }, []);

  const updateSavedAmount = useCallback((amount: number) => {
    setStore((prev) => ({ ...prev, savedAmount: Math.max(0, amount) }));
  }, []);

  const addToSavings = useCallback((amount: number) => {
    setStore((prev) => {
      const newTx: TransactionRecord = {
        id: generateId(),
        type: amount >= 0 ? "deposit" : "withdrawal",
        amount: Math.abs(amount),
        description: amount >= 0 ? `Deposit to Wallet` : `Withdrawal from Wallet`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        savedAmount: Math.max(0, prev.savedAmount + amount),
        transactions: [newTx, ...(prev.transactions || [])],
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      transactions: (prev.transactions || []).filter((tx) => tx.id !== id),
    }));
  }, []);

  const clearAllTransactions = useCallback(() => {
    setStore((prev) => ({ ...prev, transactions: [] }));
  }, []);

  return (
    <NeoFlowContext.Provider
      value={{
        ...store,
        currentUserId,
        addPlan,
        updatePlan,
        deletePlan,
        toggleDailyCheckin,
        addTask,
        updateTask,
        deleteTask,
        toggleSubtask,
        addFinancialGoal,
        updateFinancialGoal,
        deleteFinancialGoal,
        purchaseFinancialGoal,
        unpurchaseFinancialGoal,
        updateSavedAmount,
        addToSavings,
        deleteTransaction,
        clearAllTransactions,
      }}
    >
      {children}
    </NeoFlowContext.Provider>
  );
}

export function useNeoFlow() {
  const context = useContext(NeoFlowContext);
  if (!context) throw new Error("useNeoFlow must be used within a NeoFlowProvider");
  return context;
}
