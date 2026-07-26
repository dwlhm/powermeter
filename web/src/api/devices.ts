import axios from "axios";
import { QueryFunctionContext } from "react-query";
import { Token } from "../auth";
import { Api, isNoDataError } from "./internal";
import { Gedung } from "./gedung";
import { Powermeter } from "./powermeter";

export type Devices = [string, string, number, string];
export type Datasheets = [number, number, string, string];

export interface SensorData {
  data: { [key: string]: number };
  timestamp: string;
}

export interface Data<T> {
  data: T;
}

export interface DeviceLog {
  type: string;
  message: string;
  created_at: string;
}

export interface DeviceDetail {
  id?: string;
  name: string;
  ip_addr: string;
  port?: number | 502;
  gedung: Gedung;
  powermeter: Powermeter;
  status?: string;
}

export async function getDevices(
  context: QueryFunctionContext,
): Promise<Api<DeviceDetail[]>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/device/`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  try {
    const { data } = await axios(config);
    return data as Api<DeviceDetail[]>;
  } catch (error) {
    // Server mengembalikan 400 "no data" ketika belum ada perangkat
    // terdaftar; perlakukan sebagai koleksi kosong, bukan error.
    if (isNoDataError(error)) {
      return { status: "success", results: [] };
    }
    throw error;
  }
}

export async function getDeviceDetail(
  context: QueryFunctionContext,
): Promise<Api<DeviceDetail>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/device/${context.queryKey[2]}`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data;
}

export async function newDevices(props: Token<DeviceDetail>) {
  const config = {
    method: "post",
    headers: {
      Authorization: `Bearer ${props.token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      name: props.data.name,
      gedung: props.data.gedung?.id,
      ip_addr: props.data.ip_addr,
      port: props.data.port,
      powermeter: props.data.powermeter?.id,
    }),
  };

  const res = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/device/`,
    config,
  );

  return res;
}

export async function updateDevices(
  props: Token<DeviceDetail>,
): Promise<Api<null>> {
  const config = {
    method: "put",
    headers: {
      Authorization: `Bearer ${props.token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      name: props.data.name,
      ip_addr: props.data.ip_addr,
      port: props.data.port,
      gedung: props.data.gedung?.id,
      powermeter: props.data.powermeter?.id,
    }),
  };

  const { data } = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/device/${props.data.id}`,
    config,
  );

  return data;
}

export async function removeDevices(props: {
  token: string | null;
  id: string;
}) {
  const config = {
    method: "delete",
    headers: {
      Authorization: `Bearer ${props.token}`,
    },
  };

  const res = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/device/${props.id}`,
    config,
  );

  return res;
}

export async function getSensorData(
  context: QueryFunctionContext,
): Promise<Api<SensorData>> {
  const config = {
    method: "get",
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/device/${context.queryKey[2]}/latest`,
    config,
  );
  return data;
}

export async function getDatasheetDevices(
  context: QueryFunctionContext,
): Promise<Api<Datasheets[]>> {
  const config = {
    method: "get",
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/datasheet/${context.queryKey[2] === "undefined" ? "AW9L" : context.queryKey[2]}`,
    config,
  );
  return data;
}

export type DeviceLogType = "error" | "warning" | "info" | string;

export async function getDeviceLogs(
  context: QueryFunctionContext,
): Promise<Api<DeviceLog[]>> {
  const config = {
    method: "get",
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
    params: {
      type: context.queryKey[3] || undefined,
      from_date: context.queryKey[4] || undefined,
      to_date: context.queryKey[5] || undefined,
      limit: context.queryKey[6] || undefined,
    },
  };

  const { data } = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/device/${context.queryKey[2]}/logs`,
    config,
  );
  return data;
}
