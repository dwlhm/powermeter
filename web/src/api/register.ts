import axios from "axios";
import { QueryFunctionContext } from "react-query";
import { Powermeter } from "./powermeter";
import { Api } from "./internal";
import { Token } from "../auth";


export type RegisterItem = [
  alamat: Number,
  pengkali: Number,
  besaran: string,
  nama: string,
  param: string,
];

export interface Register {
  id?: string;
  register: string;
  powermeter?: Powermeter;
}

export async function getRegisterByPowermeter(
  context: QueryFunctionContext,
): Promise<Api<Register>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/powermeter/${context.queryKey[2]}/register`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data;
}

export async function addRegister(props: Token<Register>) {
  const config = {
    method: "post",
    headers: {
      Authorization: `Bearer ${props.token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      registers: props.data.register,
    }),
  };

  const res = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/powermeter/${props.data.powermeter?.id}/register`,
    config,
  );

  return res;
}
