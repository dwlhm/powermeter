import { Api } from "@/api/internal";
import { AxiosError } from "axios";
import { UseQueryResult, useQuery } from "react-query";
import {
  DetailPerangkat,
  EnergyConsumption,
  PerangkatData,
  getDetailPerangkat,
  getEnergyConsumptionInfo,
  getPerangkatData,
  getPerangkatDataArsip,
} from "./api";
import { Dayjs } from "dayjs";

export const useQueryDetailPerangkat = (
  token: string | null,
  perangkatId: string,
): UseQueryResult<Api<DetailPerangkat>, AxiosError> => {
  return useQuery<Api<DetailPerangkat>, AxiosError>({
    queryKey: [`device.detail.${perangkatId}`, token, perangkatId],
    queryFn: getDetailPerangkat,
  });
};

export type interval_data =
  | "realtime"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type UseQueryPerangkatDataProps = {
  token: string | null;
  perangkatId: string;
  onSuccess?: (data: Api<PerangkatData>) => void;
  interval: interval_data;
  from?: string;
  to?: string;
  limit?: number;
};

export const useQueryPerangkatData = (
  q: UseQueryPerangkatDataProps,
): UseQueryResult<Api<PerangkatData>, AxiosError> =>
  useQuery<Api<PerangkatData>, AxiosError>({
    queryKey: [
      `latest.${q.perangkatId}`,
      q.token,
      q.perangkatId,
      q.interval,
      q.limit,
    ],
    queryFn: getPerangkatData,
    retry: false,
    refetchInterval: 2500, // ms
    onSuccess: q.onSuccess,
  });

export type UseQueryPerangkatArsipDataProps = {
  token: string | null;
  perangkatId: string;
  interval: "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  from: Dayjs | null;
  to: Dayjs | null;
};

export const useQueryPerangkatArsipData = (
  q: UseQueryPerangkatArsipDataProps,
): UseQueryResult<Api<PerangkatData>, AxiosError> =>
  useQuery<Api<any>, AxiosError>({
    queryKey: [`arsip.${q.perangkatId}`, q.token, q.perangkatId, q.interval, q.from?.toISOString(), q.to?.toISOString()],
    queryFn: getPerangkatDataArsip,
    retry: false,
    refetchInterval: false,
    refetchOnMount: false,
  });

  export type UseQueryEnergyConsumptionProps = {
    token: string | null;
    perangkatId: string;
    year?: number;
  }

  export const useQueryEnergyConsumption = (
    q: UseQueryEnergyConsumptionProps,
  ): UseQueryResult<Api<EnergyConsumption[]>, AxiosError> => useQuery({
    queryKey: [`energy.${q.perangkatId}`, q.token, q.perangkatId, q.year],
    queryFn: getEnergyConsumptionInfo,
    retry: false,
    refetchInterval: 120000,
  })
