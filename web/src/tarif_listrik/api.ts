import { Api } from "@/api/internal";
import { Token } from "@/auth";
import axios from "axios";
import { QueryFunctionContext } from "react-query";

export interface TarifListrik {
  harga: number;
  created_at?: string;
  updated_at?: string;
}

export async function getTarifListrik(
  context: QueryFunctionContext,
): Promise<Api<TarifListrik>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/tarif-listrik`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data;
}

export async function updateTarifListrik(
  props: Token<TarifListrik>,
): Promise<Api<TarifListrik>> {
  const config = {
    method: "put",
    headers: {
      Authorization: `Bearer ${props.token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      harga: props.data.harga,
    }),
  };

  const { data } = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/tarif-listrik`,
    config,
  );

  return data;
}
