import { Api } from "@/api/internal";
import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { TarifListrik, getTarifListrik, updateTarifListrik } from "./api";
import { AxiosError } from "axios";

export const useQueryTarifListrik = (
  token: string | null,
): UseQueryResult<Api<TarifListrik>, AxiosError> => {
  return useQuery<Api<TarifListrik>, AxiosError>({
    queryKey: ["tarif.listrik", token],
    queryFn: getTarifListrik,
  });
};

export const useMutationTarifListrik = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTarifListrik,
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["tarif.listrik"],
      });
    },
  });
};
