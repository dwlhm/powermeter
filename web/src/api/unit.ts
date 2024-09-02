import axios from "axios";
import { QueryFunctionContext } from "react-query";
import { Token } from "../auth";
import { Api } from "./internal";
import { Kampus } from "./kampus";

export interface Unit {
  id?: string;
  name?: string;
  kampus?: Kampus;
}

export async function getUnit(
  context: QueryFunctionContext,
): Promise<Api<Unit[]>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/unit`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data as Api<Unit[]>;
}

export async function newUnit(props: Token<Unit>) {
  const config = {
    method: "post",
    headers: {
      Authorization: `Bearer ${props.token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      name: props.data.name,
      kampus: props.data.kampus?.id as string,
    }),
  };

  const res = await axios(`${import.meta.env.VITE_BACKEND_URL}/unit`, config);

  return res;
}

export async function updateUnit(props: Token<Unit>): Promise<Api<Unit>> {
  console.log(props.data);

  const config = {
    method: "put",
    headers: {
      Authorization: `Bearer ${props.token}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      name: props.data.name,
      kampus: props.data.kampus?.id,
    }),
  };

  const { data } = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/unit/${props.data.id}`,
    config,
  );

  return data;
}

export async function removeUnit(props: { token: string | null; id: string }) {
  const config = {
    method: "delete",
    headers: {
      Authorization: `Bearer ${props.token}`,
    },
  };

  const res = await axios(
    `${import.meta.env.VITE_BACKEND_URL}/unit/${props.id}`,
    config,
  );

  return res;
}
