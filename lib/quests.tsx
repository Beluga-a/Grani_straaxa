"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";

export interface Quest {
  id: number;
  name: string;
  desc: string;
  fear: number;
  diff: number;
  players: string;
  playersMin: number;
  playersMax: number;
  time: string;
  timeMin: number;
  age: string;
  price: string;
  priceNum: number;
  rating: string;
  badge: string;
  bg: string;
  img?: string;
  cat: "extreme" | "mystery" | "classic";
  tags: string[];
  active: boolean;
  schedule: TimeSlot[];
  icon?: string;
  full?: string;
  atmosphere?: string[];
  included?: string[];
  reviews?: number;
  basePrice?: number;
  baseUpTo?: number;
  extraPrice?: number;
  scheduleText?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  taken: boolean;
  bookedBy?: string;
}

interface QuestCtx {
  quests: Quest[];
  loading: boolean;
  addQuest: (q: Omit<Quest, "id" | "schedule" | "active">) => Promise<void>;
  updateQuest: (id: number, patch: Partial<Quest>) => Promise<void>;
  deleteQuest: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
  addSlot: (questId: number, slot: Omit<TimeSlot, "id" | "taken">) => Promise<void>;
  removeSlot: (questId: number, slotId: string) => Promise<void>;
  bookSlot: (questId: number, slotId: string, email: string) => Promise<void>;
  freeSlot: (questId: number, slotId: string) => Promise<void>;
}

const Ctx = createContext<QuestCtx>({} as QuestCtx);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем квесты из файла при старте
  useEffect(() => {
    fetch("/api/quests")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => { setQuests(Array.isArray(data) ? data : []); setLoading(false) })
      .catch((e) => { console.error('Failed to load quests:', e); setLoading(false) });
  }, []);

  const addQuest = useCallback(async (q: Omit<Quest, "id" | "schedule" | "active">) => {
    const res = await fetch("/api/quests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) });
    const newQuest = await res.json();
    setQuests((prev) => [...prev, newQuest]);
  }, []);

  const updateQuest = useCallback(async (id: number, patch: Partial<Quest>) => {
    const res = await fetch("/api/quests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    const updated = await res.json();
    setQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }, []);

  const deleteQuest = useCallback(async (id: number) => {
    await fetch("/api/quests", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: number) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;
    await updateQuest(id, { active: !quest.active });
  }, [quests, updateQuest]);

  const addSlot = useCallback(async (questId: number, slot: Omit<TimeSlot, "id" | "taken">) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;
    const newSlot: TimeSlot = { ...slot, id: Date.now().toString(), taken: false };
    await updateQuest(questId, { schedule: [...quest.schedule, newSlot] });
  }, [quests, updateQuest]);

  const removeSlot = useCallback(async (questId: number, slotId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;
    await updateQuest(questId, { schedule: quest.schedule.filter((s) => s.id !== slotId) });
  }, [quests, updateQuest]);

  const bookSlot = useCallback(async (questId: number, slotId: string, email: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;
    await updateQuest(questId, { schedule: quest.schedule.map((s) => s.id === slotId ? { ...s, taken: true, bookedBy: email } : s) });
  }, [quests, updateQuest]);

  const freeSlot = useCallback(async (questId: number, slotId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;
    await updateQuest(questId, { schedule: quest.schedule.map((s) => s.id === slotId ? { ...s, taken: false, bookedBy: undefined } : s) });
  }, [quests, updateQuest]);

  const value = useMemo(() => ({
    quests, loading, addQuest, updateQuest, deleteQuest, toggleActive,
    addSlot, removeSlot, bookSlot, freeSlot,
  }), [quests, loading, addQuest, updateQuest, deleteQuest, toggleActive, addSlot, removeSlot, bookSlot, freeSlot]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useQuests = () => useContext(Ctx);
export const usePublicQuests = () => {
  const { quests } = useQuests();
  return quests.filter((q) => q.active);
};
