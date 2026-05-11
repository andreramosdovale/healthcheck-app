import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

// ─── Summary ─────────────────────────────────────────────────────────────────

/** Shape raw retornada pelo GET /evolution/summary */
export interface SummaryPoint {
  date: string;                              // "YYYY-MM-DD"
  weight: number;
  bodyFatPercentage: number | null;
  bodyFatMethod: "pollock" | "navy" | null;
  leanMass: number | null;
  fatMass: number | null;
  waistHipRatio: number | null;
}

export type WhrRisk = "low" | "moderate" | "high";

/** Shape enriquecida usada nos gráficos */
export interface ChartPoint extends SummaryPoint {
  timestamp: number;                         // Date.parse(date) — eixo X
  leanMassPercentage: number | null;         // 100 - bodyFatPercentage
  whrRisk: WhrRisk | null;                  // derivado no cliente com base no sexo
}

export type MetricKey =
  | "weight"
  | "bodyFatPercentage"
  | "leanMassPercentage"
  | "leanMass"
  | "fatMass"
  | "waistHipRatio";

export const METRIC_UNIT: Record<MetricKey, string> = {
  weight:             "kg",
  bodyFatPercentage:  "%",
  leanMassPercentage: "%",
  leanMass:           "kg",
  fatMass:            "kg",
  waistHipRatio:      "",
};

/** Métricas que pertencem ao eixo Y direito (%) */
export const METRIC_RIGHT_AXIS = new Set<MetricKey>([
  "bodyFatPercentage",
  "leanMassPercentage",
]);

export function classifyWhr(
  value: number | null,
  sex: "male" | "female" | null | undefined,
): WhrRisk | null {
  if (value == null || sex == null) return null;
  if (sex === "male") {
    if (value < 0.9)  return "low";
    if (value < 1.0)  return "moderate";
    return "high";
  }
  // female
  if (value < 0.8)  return "low";
  if (value < 0.85) return "moderate";
  return "high";
}

function transform(
  raw: SummaryPoint[],
  sex: "male" | "female" | null | undefined,
): ChartPoint[] {
  return raw.map((p) => ({
    ...p,
    timestamp: Date.parse(p.date),
    leanMassPercentage:
      p.bodyFatPercentage != null ? 100 - p.bodyFatPercentage : null,
    whrRisk: classifyWhr(p.waistHipRatio, sex),
  }));
}

export type WeeksParam = 4 | 8 | 12 | 26 | 52 | "all";

export function useEvolutionSummary(
  weeks: WeeksParam = "all",
  sex?: "male" | "female" | null,
) {
  return useQuery({
    queryKey: ["evolution", "summary", weeks],
    queryFn: async () => {
      const params = weeks !== "all" ? { weeks } : {};
      const { data } = await api.get<SummaryPoint[]>("/evolution/summary", { params });
      return transform(data, sex);
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Latest ───────────────────────────────────────────────────────────────────

interface LatestMeasurement {
  id: string;
  measurementDate: string;
  weight: string;
  bodyFatPercentage: string | null;
  navyBodyFatPercentage: string | null;
  leanMass: string | null;
  fatMass: string | null;
}

export interface LatestResult {
  current: LatestMeasurement;
  previous: LatestMeasurement | null;
  trend: "improving" | "stable" | "worsening" | null;
  trendCode: string | null;
}

export function useEvolutionLatest() {
  return useQuery({
    queryKey: ["evolution", "latest"],
    queryFn: async () => {
      const { data } = await api.get<LatestResult>("/evolution/latest");
      return data;
    },
  });
}
