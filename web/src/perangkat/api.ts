import { Gedung } from "@/api/gedung";
import { Api } from "@/api/internal";
import { Powermeter } from "@/api/powermeter";
import axios, { AxiosRequestConfig } from "axios";
import { QueryFunctionContext } from "react-query";

export interface DetailPerangkat {
  id?: string;
  name: string;
  ip_addr: string;
  port?: number | 502;
  gedung: Gedung;
  powermeter: Powermeter;
  status?: string;
}

export async function getDetailPerangkat(
  context: QueryFunctionContext,
): Promise<Api<DetailPerangkat>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/device/${context.queryKey[2]}/`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data;
}

export interface PerangkatData {
  data: { [key: string]: number[] };
  timestamp: string[];
  length: number;
}

export async function getPerangkatData(
  context: QueryFunctionContext,
): Promise<Api<PerangkatData>> {
  const config: AxiosRequestConfig = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/data/${context.queryKey[2]}/`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
    params: {
      interval: context.queryKey[3],
      limit: context.queryKey[4],
    },
  };

  const { data } = await axios(config);
  return data;
}

export async function getPerangkatDataArsip(
  context: QueryFunctionContext
): Promise<Api<any>> {
  const config: AxiosRequestConfig = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/data/${context.queryKey[2]}/arsip/`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
    params: {
      interval: context.queryKey[3],
      dfrom: context.queryKey[4],
      dto: context.queryKey[5],
    },
  };

  const { data } = await axios(config);
  return data;

}

export type EnergyConsumption = {
  energy: number,
  timestamp: string
}

export async function getEnergyConsumptionInfo(
  context: QueryFunctionContext
): Promise<Api<EnergyConsumption[]>> {
  const config: AxiosRequestConfig = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/data/${context.queryKey[2]}/consumption`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
    params: {
      year: context.queryKey[3],
    },
  };

  const { data } = await axios(config);
  return data;
}