import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export interface UpdateProfileData {
  name?: string;
  height?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  name: string;
  birthDate: string;
  sex: "male" | "female";
  height: string;
  plan: "free" | "premium";
  createdAt: string;
  updatedAt: string | null;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get<UserProfile>("/users/me");
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileData) => {
      const { data } = await api.patch<UserProfile>("/users/me", input);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
    },
  });
}
