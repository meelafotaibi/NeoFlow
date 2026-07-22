"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import type { Plan, Task, FinancialGoal, NeoFlowStore, TransactionRecord } from "./types";
import { auth, saveUserData, loadUserData, subscribeToUserData } from "./firebase";
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

function parseStore(raw: unknown): NeoFlowStore | null {
  if (!raw || typeof raw !== "object") return null;
  let parsed = raw as Record<string, unknown>;

  // Unwrap doc.data() container if nested from Firestore saveUserData
  if (parsed.data && typeof parsed.data === "object") {
    parsed = parsed.data as Record<string, unknown>;
  }

  // Decrypt encrypted vault payload if stored in Firestore or LocalStorage
  if (typeof parsed.encryptedPayload === "string") {
    const decrypted = decryptVaultData(parsed.encryptedPayload);
    if (decrypted) return parseStore(decrypted);
  }

  const plans = Array.isArray(parsed.plans) ? parsed.plans : [];
  const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  const financialGoals = Array.isArray(parsed.financialGoals) ? parsed.financialGoals : [];
  const savedAmount = typeof parsed.savedAmount === "number" ? parsed.savedAmount : 0;
  const transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];

  return { plans, tasks, financialGoals, savedAmount, transactions };
}

// Safely load encrypted local storage for a specific key
function loadLocalStorageKey(key: string): NeoFlowStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const decrypted = decryptVaultData(raw);
      return parseStore(decrypted);
    }
  } catch {}
  return null;
}

// Fallback search across local keys if specific key is empty
function getBestLocalStorageData(uid?: string | null): NeoFlowStore {
  if (typeof window === "undefined") return emptyStore;

  const keysToTry: string[] = [];
  if (uid) {
    keysToTry.push(`${STORAGE_KEY}-${uid}`);
  }
  keysToTry.push(STORAGE_KEY);
  keysToTry.push(`${STORAGE_KEY}-guest-user`);
  keysToTry.push(`${STORAGE_KEY}-backup`);

  for (const key of keysToTry) {
    const data = loadLocalStorageKey(key);
    if (data && (data.plans.length > 0 || data.tasks.length > 0 || data.financialGoals.length > 0 || data.savedAmount > 0)) {
      return data;
    }
  }

  // If any valid store exists return it
  const defaultData = loadLocalStorageKey(STORAGE_KEY);
  if (defaultData) return defaultData;

  return emptyStore;
}

export function NeoFlowProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<NeoFlowStore>(emptyStore);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Track active user ID ref to avoid race conditions during auth transitions
  const activeUserRef = useRef<string | null>(null);

  // 1. Initial hydration from local storage on mount
  useEffect(() => {
    const initialData = getBestLocalStorageData(null);
    setStore(initialData);
    setIsHydrated(true);
  }, []);

  // 2. Auth & Real-Time Sync Listener: Subscribes to Firestore for instant Phone & PC sync with strict UID isolation
  useEffect(() => {
    if (!auth) {
      setIsAuthInitialized(true);
      return;
    }

    let snapshotUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (snapshotUnsub) {
        snapshotUnsub();
        snapshotUnsub = null;
      }

      if (user) {
        activeUserRef.current = user.uid;
        setCurrentUserId(user.uid);

        // Load ONLY this specific user's local cache for instant UI rendering
        const userSpecificKey = `${STORAGE_KEY}-${user.uid}`;
        const localUserCache = loadLocalStorageKey(userSpecificKey);
        
        if (localUserCache && (localUserCache.plans.length > 0 || localUserCache.tasks.length > 0 || localUserCache.financialGoals.length > 0 || localUserCache.savedAmount > 0)) {
          setStore(localUserCache);
        }

        // Subscribe to real-time Firestore cloud changes for THIS user
        snapshotUnsub = subscribeToUserData(user.uid, (cloudData) => {
          const parsedCloud = parseStore(cloudData);
          if (parsedCloud) {
            setStore(parsedCloud);
            if (typeof window !== "undefined") {
              const encrypted = encryptVaultData(parsedCloud);
              localStorage.setItem(userSpecificKey, encrypted);
            }
          }
          setIsAuthInitialized(true);
        });
      } else {
        // User logged out: switch to guest session isolated under guest key
        activeUserRef.current = "guest-user";
        setCurrentUserId("guest-user");
        const guestData = loadLocalStorageKey(`${STORAGE_KEY}-guest-user`) || emptyStore;
        setStore(guestData);
        setIsAuthInitialized(true);
      }
    });

    return () => {
      authUnsub();
      if (snapshotUnsub) snapshotUnsub();
    };
  }, []);

  // 3. Auto-save to LocalStorage and Firestore whenever store updates (strictly user-isolated & blocked until Auth is ready)
  useEffect(() => {
    if (!isHydrated || !isAuthInitialized) return;

    const targetId = activeUserRef.current || currentUserId || "guest-user";
    const encryptedString = encryptVaultData(store);

    // Save encrypted vault payload ONLY to user-specific local key
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEY}-${targetId}`, encryptedString);
    }

    // Sync encrypted payload + store to Firestore cloud if logged in
    if (targetId && targetId !== "guest-user") {
      saveUserData(targetId, { encryptedPayload: encryptedString, ...store });
    }
  }, [store, isHydrated, isAuthInitialized, currentUserId]);

  // Plans
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

  // Tasks
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

  // Financial Goals
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
    setStore((prev) => ({
      ...prev,
      transactions: [],
    }));
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
