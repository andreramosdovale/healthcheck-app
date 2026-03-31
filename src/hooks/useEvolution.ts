import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

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
