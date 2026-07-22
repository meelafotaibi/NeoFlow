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
  // Plans
  addPlan: (plan: Omit<Plan, "id" | "createdAt">) => void;
  updatePlan: (id: string, plan: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  toggleDailyCheckin: (planId: string, date: string) => void;
  // Tasks
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  // Financial Goals
  addFinancialGoal: (goal: Omit<FinancialGoal, "id" | "createdAt">) => void;
  updateFinancialGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  purchaseFinancialGoal: (id: string) => void;
  unpurchaseFinancialGoal: (id: string) => void;
  // Saved Amount & Transactions
  updateSavedAmount: (amount: number) => void;
  addToSavings: (amount: number) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
}

const NeoFlowContext = createContext<NeoFlowContextType | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Parse a raw object into a clean NeoFlowStore — handles plain JSON from Firestore */
function parseStore(raw: unknown): NeoFlowStore | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Record<string, unknown>;

  // Handle encrypted local storage payload (only used in localStorage, NOT in Firestore)
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

/** Load + decrypt from localStorage by key */
function loadFromLocalStorage(key: string): NeoFlowStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    // Try decrypting first
    const decrypted = decryptVaultData(raw);
    if (decrypted) return parseStore(decrypted);
    // Fallback: try plain JSON
    return parseStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Save encrypted store to localStorage */
function saveToLocalStorage(key: string, data: NeoFlowStore) {
  if (typeof window === "undefined") return;
  try {
    const encrypted = encryptVaultData(data);
    localStorage.setItem(key, encrypted);
  } catch (e) {
    console.warn("localStorage save error:", e);
  }
}

export function NeoFlowProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<NeoFlowStore>(emptyStore);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Refs to avoid stale closures and prevent save-then-load loops
  const activeUserRef = useRef<string | null>(null);
  const isLoadingFromCloudRef = useRef(false); // true while we're applying a cloud snapshot
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Auth listener + Firestore real-time sync
  useEffect(() => {
    if (!auth) return;

    let snapshotUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      // Clean up previous snapshot listener when auth changes
      if (snapshotUnsub) {
        snapshotUnsub();
        snapshotUnsub = null;
      }

      if (user) {
        activeUserRef.current = user.uid;
        setCurrentUserId(user.uid);

        const userKey = `${STORAGE_KEY}-${user.uid}`;

        // 1. Immediately show local cache for instant UI (no loading flicker)
        const localCache = loadFromLocalStorage(userKey);
        if (localCache) {
          setStore(localCache);
        }

        // 2. Subscribe to cloud — fires only on server-confirmed writes
        snapshotUnsub = subscribeToUserData(user.uid, (cloudData) => {
          if (!mountedRef.current) return;
          if (!cloudData) return; // New user — keep local state

          const parsed = parseStore(cloudData);
          if (!parsed) return;

          // Apply cloud data and update local cache
          isLoadingFromCloudRef.current = true;
          setStore(parsed);
          saveToLocalStorage(userKey, parsed);
          // Reset flag after React has processed the state update
          setTimeout(() => { isLoadingFromCloudRef.current = false; }, 100);
        });
      } else {
        // Guest / logged out
        activeUserRef.current = "guest";
        setCurrentUserId(null);
        const guestData = loadFromLocalStorage(`${STORAGE_KEY}-guest`) || emptyStore;
        setStore(guestData);
      }
    });

    return () => {
      authUnsub();
      if (snapshotUnsub) snapshotUnsub();
    };
  }, []);

  // Debounced auto-save: saves to localStorage immediately, Firestore after 800ms idle
  // Skips saving when we're in the middle of loading a cloud snapshot (prevents echo loop)
  useEffect(() => {
    if (isLoadingFromCloudRef.current) return;
    if (!activeUserRef.current) return;

    const userId = activeUserRef.current;
    const storageKey = `${STORAGE_KEY}-${userId}`;

    // Always save to localStorage immediately (instant persistence)
    saveToLocalStorage(storageKey, store);

    // Debounce Firestore saves to avoid rapid writes
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    if (userId !== "guest") {
      saveTimerRef.current = setTimeout(() => {
        if (mountedRef.current && activeUserRef.current === userId) {
          // Save PLAIN store to Firestore (no encryption — Firestore security rules protect it)
          saveUserData(userId, store);
        }
      }, 800);
    }

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [store]);

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
