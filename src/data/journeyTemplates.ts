/**
 * Template predefiniti per la creazione di percorsi personalizzati.
 * Gli utenti possono clonare un template e personalizzarlo nel wizard.
 */

export interface JourneyTemplate {
  id: string;
  title: string;
  question: string;
  subtitle: string;
  category: "attention" | "explore" | "plan";
  icon: string;
  description: string;
  difficulty: "base" | "intermedio" | "avanzato";
  tags: string[];
  steps: {
    title: string;
    description: string;
    indicatorIds: string[];
    insightText: string;
    insightType: "success" | "warning" | "danger" | "info";
  }[];
}

import data from "./json/journeyTemplates.json";

export const journeyTemplates: JourneyTemplate[] = data.journeyTemplates as JourneyTemplate[];
