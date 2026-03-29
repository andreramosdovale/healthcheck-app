import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface Measurement {
  id: string;
  userId: string;
  measurementDate: string;
  weight: string;
  triceps: string | null;
  subscapular: string | null;
  chest: string | null;
  midaxillary: string | null;
  suprailiac: string | null;
  abdominal: string | null;
  thigh: string | null;
  neck: string | null;
  waist: string | null;
  hip: string | null;
  bodyFatPercentage: string | null;
  navyBodyFatPercentage: string | null;
  leanMass: string | null;
  fatMass: string | null;
  createdAt: string;
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
      const { data: response } = await api.post<Measurement>(
        "/measurements",
        data,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
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
