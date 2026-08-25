import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  fetchJourneys,
  fetchJourneyById,
  createJourney as createJourneyInDb,
  deleteJourney as deleteJourneyInDb,
  incrementJourneyUsage,
  type CustomJourney,
  type CreateJourneyInput,
} from "@/services/journeysService";

export type { CustomJourney } from "@/services/journeysService";

/**
 * Hook di gestione dei percorsi personalizzati.
 * L'accesso ai dati e delegato a `@/services/journeysService`; qui restano solo
 * lo stato locale, la migrazione da localStorage e le notifiche.
 */
export function useCustomJourneys(refreshKey?: number) {
  const [journeys, setJourneys] = useState<CustomJourney[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchJourneys();
    setJourneys(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Migrate localStorage data on first load
  useEffect(() => {
    const migrateKey = "custom_journeys_migrated";
    if (localStorage.getItem(migrateKey)) return;

    const stored = localStorage.getItem("custom_journeys");
    if (!stored) {
      localStorage.setItem(migrateKey, "true");
      return;
    }

    try {
      const local = JSON.parse(stored) as any[];
      if (local.length === 0) {
        localStorage.setItem(migrateKey, "true");
        return;
      }
      (async () => {
        for (const j of local) {
          await createJourneyInDb({
            title: j.title,
            question: j.question || "",
            category: j.category || "explore",
            is_public: j.is_public ?? false,
            steps: (j.steps || []).map((s: any) => ({
              title: s.title || "",
              description: s.description || "",
              indicatorIds: s.indicators || [],
              insightText: s.insight_text || "",
              insightType: s.insight_type || "info",
            })),
          });
        }
        localStorage.setItem(migrateKey, "true");
        toast({ title: "Percorsi ripristinati", description: `${local.length} percorsi salvati in precedenza sono stati importati.` });
        load();
      })();
    } catch {
      localStorage.setItem(migrateKey, "true");
    }
  }, []);

  const createJourney = async (input: CreateJourneyInput): Promise<string | null> => {
    const id = await createJourneyInDb(input);
    if (id) load();
    return id;
  };

  const deleteJourney = async (id: string) => {
    await deleteJourneyInDb(id);
    setJourneys((prev) => prev.filter((j) => j.id !== id));
  };

  const incrementUsage = async (id: string) => {
    await incrementJourneyUsage(id);
    setJourneys((prev) => prev.map((j) => (j.id === id ? { ...j, usage_count: j.usage_count + 1 } : j)));
  };

  const fetchById = (id: string): Promise<CustomJourney | null> => fetchJourneyById(id);

  return { journeys, loading, createJourney, deleteJourney, incrementUsage, fetchById, reload: load };
}
