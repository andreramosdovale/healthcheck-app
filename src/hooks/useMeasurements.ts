import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface Measurement {
  id: string;
  userId: string;
  measurementDate: string;
  weight: string;
  bodyFatPercentage: string | null;
  navyBodyFatPercentage: string | null;
  leanMass: string | null;
  fatMass: string | null;
  createdAt: string;
}

export function useMeasurements() {
  return useQuery({
    queryKey: ["measurements"],
    queryFn: async () => {
      const { data } = await api.get<Measurement[]>("/measurements");
      return data;
    },
  });
}

export function useDeleteMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/measurements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
    },
  });
}
