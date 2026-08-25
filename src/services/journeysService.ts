import { supabase } from "@/integrations/supabase/client";

export interface CustomJourney {
  id: string;
  title: string;
  question: string;
  subtitle: string;
  category: "attention" | "explore" | "plan";
  is_public: boolean;
  steps: {
    step_order: number;
    title: string;
    description: string;
    indicators: string[];
    insight_text: string;
    insight_type: string;
  }[];
  created_at: string;
  author: string;
  author_id: string | null;
  usage_count: number;
}

export interface CreateJourneyInput {
  title: string;
  question: string;
  category: "attention" | "explore" | "plan";
  is_public: boolean;
  steps: {
    title: string;
    description: string;
    indicatorIds: string[];
    insightText: string;
    insightType: string;
  }[];
}

// Fixed demo author ID (the demo user in auth.users)
export const DEMO_AUTHOR_ID = "bd2340df-5f23-44bc-9fc9-3190c781f112";

/** Recupera tutti i percorsi personalizzati con relative tappe e indicatori. */
export async function fetchJourneys(): Promise<CustomJourney[]> {
  const { data: journeys, error } = await supabase
    .from("user_journeys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !journeys) return [];

  const journeyIds = journeys.map((j) => j.id);
  if (journeyIds.length === 0) return [];

  const { data: steps } = await supabase
    .from("user_journey_steps")
    .select("*")
    .in("journey_id", journeyIds)
    .order("step_order", { ascending: true });

  const stepIds = (steps || []).map((s) => s.id);
  let indicators: any[] = [];
  if (stepIds.length > 0) {
    const { data } = await supabase
      .from("user_journey_step_indicators")
      .select("*")
      .in("step_id", stepIds);
    indicators = data || [];
  }

  return journeys.map((j) => {
    const jSteps = (steps || []).filter((s) => s.journey_id === j.id);
    return {
      id: j.id,
      title: j.title,
      question: j.question || "",
      subtitle: j.subtitle || "",
      category: j.category as CustomJourney["category"],
      is_public: j.is_public,
      steps: jSteps.map((s) => ({
        step_order: s.step_order,
        title: s.title,
        description: s.description || "",
        indicators: indicators.filter((i) => i.step_id === s.id).map((i) => i.indicator_id),
        insight_text: s.insight_text || "",
        insight_type: s.insight_type || "info",
      })),
      created_at: j.created_at,
      author: j.subtitle || "Utente",
      author_id: j.author_id,
      usage_count: j.usage_count,
    };
  });
}

/** Recupera un singolo percorso per id. */
export async function fetchJourneyById(id: string): Promise<CustomJourney | null> {
  const all = await fetchJourneys();
  return all.find((j) => j.id === id) ?? null;
}

/** Crea un percorso con le relative tappe e indicatori. Ritorna l'id creato. */
export async function createJourney(input: CreateJourneyInput): Promise<string | null> {
  const totalIndicators = input.steps.reduce((sum, s) => sum + s.indicatorIds.length, 0);

  const { data: journey, error } = await supabase
    .from("user_journeys")
    .insert({
      author_id: DEMO_AUTHOR_ID,
      title: input.title,
      question: input.question,
      subtitle: `${input.steps.length} tappe \u00b7 ${totalIndicators} indicatori`,
      category: input.category,
      is_public: input.is_public,
    })
    .select("id")
    .single();

  if (error || !journey) return null;

  for (let i = 0; i < input.steps.length; i++) {
    const s = input.steps[i];
    const { data: step } = await supabase
      .from("user_journey_steps")
      .insert({
        journey_id: journey.id,
        step_order: i,
        title: s.title || `Tappa ${i + 1}`,
        description: s.description,
        insight_text: s.insightText,
        insight_type: s.insightType as any,
      })
      .select("id")
      .single();

    if (step && s.indicatorIds.length > 0) {
      await supabase
        .from("user_journey_step_indicators")
        .insert(s.indicatorIds.map((ind) => ({ step_id: step.id, indicator_id: ind })));
    }
  }

  return journey.id;
}

/** Elimina un percorso e le sue tappe/indicatori. */
export async function deleteJourney(id: string): Promise<void> {
  const { data: steps } = await supabase
    .from("user_journey_steps")
    .select("id")
    .eq("journey_id", id);

  if (steps && steps.length > 0) {
    await supabase
      .from("user_journey_step_indicators")
      .delete()
      .in("step_id", steps.map((s) => s.id));
    await supabase.from("user_journey_steps").delete().eq("journey_id", id);
  }
  await supabase.from("user_journeys").delete().eq("id", id);
}

/** Incrementa il contatore di utilizzo di un percorso (RPC). */
export async function incrementJourneyUsage(id: string): Promise<void> {
  await supabase.rpc("increment_journey_usage", { p_journey_id: id });
}
