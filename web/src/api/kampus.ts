import axios from "axios"
import { QueryFunctionContext } from "react-query";
import { Token } from "../auth"
import { Api } from "./internal";

export interface Kampus {
    id: string,
    name?: string
}

export async function getKampus(context: QueryFunctionContext): Promise<Api<Kampus[]>> {
    const config = {
        method: 'get',
        url: `${import.meta.env.VITE_BACKEND_URL}/kampus`,
        headers: { 
          'Authorization': `Bearer ${context.queryKey[1]}`
        }
      };

      const {data} = await axios(config)
      return data as Api<Kampus[]>
}

export async function newKampus(props: Token<{name: string}>) {
    const config = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${props.token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        name: props.data.name
      })
    }
  
    const res = await axios(`${import.meta.env.VITE_BACKEND_URL}/kampus`, config)
  
    return res
}

export async function updateKampus(props: Token<Kampus>): Promise<Api<Kampus>> {
  
  const config = {
    method: 'put',
    headers: {
      'Authorization': `Bearer ${props.token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      name: props.data.name
    })
  }

  const {data} = await axios(`${import.meta.env.VITE_BACKEND_URL}/kampus/${props.data.id}`, config)

  return data
}

export async function removeKampus(props: {token: string | null, id: string, mode?: string, move_to_id?: string}) {
  const config = {
    method: 'delete',
    headers: {
      'Authorization': `Bearer ${props.token}`
    },
    params: {
      mode: props.mode,
      move_to_id: props.move_to_id
    }
  }

  const res = await axios(`${import.meta.env.VITE_BACKEND_URL}/kampus/${props.id}`, config)

  return res
}