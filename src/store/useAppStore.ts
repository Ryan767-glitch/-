import { create } from "zustand";

export type RiskLevel = "safe" | "caution" | "danger";

export interface Incident {
  id: string;
  timestamp: number;
  type: "sms" | "image" | "voice";
  riskLevel: RiskLevel;
  summary: string;
  detail: string;
}

interface AppState {
  safetyScore: number;
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, "id" | "timestamp">) => void;
  resetScore: () => void;
}

const SCORE_PENALTY: Record<RiskLevel, number> = {
  safe: 0,
  caution: -5,
  danger: -15,
};

export const useAppStore = create<AppState>((set) => ({
  safetyScore: 100,
  incidents: [],

  addIncident: (partial) => {
    const incident: Incident = {
      ...partial,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    set((state) => ({
      incidents: [incident, ...state.incidents],
      safetyScore: Math.max(
        0,
        state.safetyScore + SCORE_PENALTY[incident.riskLevel],
      ),
    }));
  },

  resetScore: () => set({ safetyScore: 100, incidents: [] }),
}));
