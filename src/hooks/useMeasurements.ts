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

export interface MeasurementDetail {
  id: string;
  userId: string;
  measurementDate: string;
  weight: number;
  skinfolds: {
    triceps: number;
    subscapular: number;
    chest: number;
    midaxillary: number;
    suprailiac: number;
    abdominal: number;
    thigh: number;
  } | null;
  circumferences: {
    neck: number | null;
    waist: number | null;
    hip: number | null;
    shoulders: number | null;
    chestCirc: number | null;
    leftThigh: number | null;
    rightThigh: number | null;
    leftCalf: number | null;
    rightCalf: number | null;
    leftBicepRelaxed: number | null;
    rightBicepRelaxed: number | null;
    leftBicepFlexed: number | null;
    rightBicepFlexed: number | null;
  } | null;
  calculated: {
    bodyFatPercentage: number | null;
    bodyFatMethod: "pollock" | "navy" | null;
    leanMass: number | null;
    fatMass: number | null;
  };
  createdAt: string;
  updatedAt: string | null;
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

export function useMeasurement(id: string) {
  return useQuery({
    queryKey: ["measurements", id],
    queryFn: async () => {
      const { data } = await api.get<MeasurementDetail>(`/measurements/${id}`);
      return data;
    },
    enabled: !!id,
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
