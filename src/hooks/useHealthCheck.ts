import { useQuery } from "@tanstack/react-query";
import { api } from "src/services/api";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await api.get("/");
      return data;
    },
    retry: false,
  });
}
