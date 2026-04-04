import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

// Shape real retornada pela API (MeasurementResponse do backend)
export interface Measurement {
  id: string;
  userId: string;
  measurementDate: string;
  weight: number;
  calculated: {
    bodyFatPercentage: number | null;
    bodyFatMethod: "pollock" | "navy" | null;
    leanMass: number | null;
    fatMass: number | null;
    leanMassPercentage: number | null;
    waistHipRatio: {
      value: number;
      risk: "low" | "moderate" | "high" | null;
    } | null;
  };
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
    shoulders: number | null;
    chestCirc: number | null;
    waist: number | null;
    hip: number | null;
    leftThigh: number | null;
    rightThigh: number | null;
    leftCalf: number | null;
    rightCalf: number | null;
    leftBicepRelaxed: number | null;
    rightBicepRelaxed: number | null;
    leftBicepFlexed: number | null;
    rightBicepFlexed: number | null;
  } | null;
  createdAt: string;
  updatedAt: string | null;
}

// Alias para uso no detalhe (mesma shape)
export type MeasurementDetail = Measurement;

export type DeltaDirection = "up" | "down" | "stable" | null;

export interface MeasurementDelta {
  measurementId: string;
  previousMeasurementId: string | null;
  delta: {
    weight: DeltaDirection;
    bodyFatPercentage: DeltaDirection;
    leanMass: DeltaDirection;
    fatMass: DeltaDirection;
    triceps: DeltaDirection;
    subscapular: DeltaDirection;
    chest: DeltaDirection;
    midaxillary: DeltaDirection;
    suprailiac: DeltaDirection;
    abdominal: DeltaDirection;
    thigh: DeltaDirection;
    skinfoldSum: DeltaDirection;
    neck: DeltaDirection;
    waist: DeltaDirection;
    hip: DeltaDirection;
    shoulders: DeltaDirection;
    chestCirc: DeltaDirection;
    leftThigh: DeltaDirection;
    rightThigh: DeltaDirection;
    leftCalf: DeltaDirection;
    rightCalf: DeltaDirection;
    leftBicepRelaxed: DeltaDirection;
    rightBicepRelaxed: DeltaDirection;
    leftBicepFlexed: DeltaDirection;
    rightBicepFlexed: DeltaDirection;
    compositionBalance: DeltaDirection;
  } | null;
}

// Fields where "down" is good (lower = better)
const LOWER_IS_BETTER = new Set([
  "weight",
  "bodyFatPercentage",
  "navyBodyFatPercentage",
  "fatMass",
  "skinfoldSum",
  "triceps",
  "subscapular",
  "chest",
  "midaxillary",
  "suprailiac",
  "abdominal",
  "thigh",
  "waist",
  "hip",
]);

export function getDeltaIndicator(
  field: string,
  direction: DeltaDirection,
): { arrow: string; color: string } | null {
  if (!direction || direction === "stable") return null;
  const lowerIsBetter = LOWER_IS_BETTER.has(field);
  const isGood = lowerIsBetter ? direction === "down" : direction === "up";
  return {
    arrow: direction === "up" ? "↑" : "↓",
    color: isGood ? "#059669" : "#EF4444",
  };
}

export interface UpdateMeasurementData {
  measurementDate?: string;
  weight?: number;
  triceps?: number | null;
  subscapular?: number | null;
  chest?: number | null;
  midaxillary?: number | null;
  suprailiac?: number | null;
  abdominal?: number | null;
  thigh?: number | null;
  neck?: number | null;
  waist?: number | null;
  hip?: number | null;
  shoulders?: number | null;
  chestCirc?: number | null;
  leftThigh?: number | null;
  rightThigh?: number | null;
  leftCalf?: number | null;
  rightCalf?: number | null;
  leftBicepRelaxed?: number | null;
  rightBicepRelaxed?: number | null;
  leftBicepFlexed?: number | null;
  rightBicepFlexed?: number | null;
}

export interface CreateMeasurementData {
  measurementDate: string;
  weight: number;
  triceps?: number;
  subscapular?: number;
  chest?: number;
  midaxillary?: number;
  suprailiac?: number;
  abdominal?: number;
  thigh?: number;
  neck?: number;
  waist?: number;
  hip?: number;
  shoulders?: number;
  chestCirc?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  leftBicepRelaxed?: number;
  rightBicepRelaxed?: number;
  leftBicepFlexed?: number;
  rightBicepFlexed?: number;
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

export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMeasurementData) => {
      const { data: response } = await api.post<Measurement>("/measurements", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["evolution"] });
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
      queryClient.invalidateQueries({ queryKey: ["evolution"] });
    },
  });
}

export function useMeasurement(id: string | undefined) {
  return useQuery({
    queryKey: ["measurements", id],
    queryFn: async () => {
      const { data } = await api.get<MeasurementDetail>(`/measurements/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateMeasurement(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMeasurementData) => {
      const { data: response } = await api.patch<MeasurementDetail>(`/measurements/${id}`, data);
      return response;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["measurements", id], updated);
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      queryClient.invalidateQueries({ queryKey: ["evolution"] });
    },
  });
}

export function useMeasurementDelta(id: string | undefined) {
  return useQuery({
    queryKey: ["evolution", "delta", id],
    queryFn: async () => {
      const { data } = await api.get<MeasurementDelta>(`/evolution/delta/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
