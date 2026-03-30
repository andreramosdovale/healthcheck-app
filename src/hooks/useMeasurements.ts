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

type DeltaDirection = "up" | "down" | "stable" | null;

export interface MeasurementDelta {
  measurementId: string;
  previousMeasurementId: string | null;
  delta: {
    // composição corporal
    weight: DeltaDirection;
    bodyFatPercentage: DeltaDirection;
    leanMass: DeltaDirection;
    fatMass: DeltaDirection;
    // dobras cutâneas
    triceps: DeltaDirection;
    subscapular: DeltaDirection;
    chest: DeltaDirection;
    midaxillary: DeltaDirection;
    suprailiac: DeltaDirection;
    abdominal: DeltaDirection;
    thigh: DeltaDirection;
    skinfoldSum: DeltaDirection;
    // circunferências
    neck: DeltaDirection;
    waist: DeltaDirection;
    hip: DeltaDirection;
    shoulders: DeltaDirection;
    chestCirc: DeltaDirection;
    leftBicepFlexed: DeltaDirection;
    rightBicepFlexed: DeltaDirection;
  } | null;
}

const DOWN_IS_GOOD = [
  "bodyFatPercentage",
  "fatMass",
  "triceps",
  "subscapular",
  "chest",
  "midaxillary",
  "suprailiac",
  "abdominal",
  "thigh",
  "skinfoldSum",
  "waist",
  "hip",
  "neck",
  "chestCirc",
];
const UP_IS_GOOD = ["leanMass", "leftBicepFlexed", "rightBicepFlexed"];

export function getDeltaIndicator(
  field: string,
  direction: DeltaDirection,
): { arrow: "↑" | "↓"; color: string } | null {
  if (!direction || direction === "stable") return null;

  if (field === "weight") return { arrow: direction === "up" ? "↑" : "↓", color: "#6B7280" };

  const isPositive =
    (DOWN_IS_GOOD.includes(field) && direction === "down") ||
    (UP_IS_GOOD.includes(field) && direction === "up");

  return {
    arrow: direction === "up" ? "↑" : "↓",
    color: isPositive ? "#22c55e" : "#ef4444",
  };
}

export function useMeasurementDelta(id: string) {
  return useQuery({
    queryKey: ["measurements-delta", id],
    queryFn: async () => {
      const { data } = await api.get<MeasurementDelta>(`/evolution/delta/${id}`);
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
