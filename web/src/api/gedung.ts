import axios from "axios"
import { QueryFunctionContext } from "react-query";
import { Token } from "../auth"
import { Api } from "./internal";
import { Unit } from "./unit";

export interface Gedung {
    id?: string,
    name?: string,
    unit?: Unit
}

export async function getGedung(context: QueryFunctionContext): Promise<Api<Gedung[]>> {
    const config = {
        method: 'get',
        url: `${import.meta.env.VITE_BACKEND_URL}/gedung/`,
        headers: { 
          'Authorization': `Bearer ${context.queryKey[1]}`
        }
      };

      const {data} = await axios(config)
      return data as Api<Gedung[]>
}

export async function newGedung(props: Token<Gedung>) {
    const config = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${props.token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        name: props.data.name,
        unit: props.data.unit?.id
      })
    }
  
    const res = await axios(`${import.meta.env.VITE_BACKEND_URL}/gedung/`, config)
  
    return res
}

export async function updateGedung(props: Token<Gedung>): Promise<Api<Gedung>> {
  
  const config = {
    method: 'put',
    headers: {
      'Authorization': `Bearer ${props.token}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      name: props.data.name,
      unit: props.data.unit?.id
    })
  }

  const {data} = await axios(`${import.meta.env.VITE_BACKEND_URL}/gedung/${props.data.id}`, config)

  return data
}

export async function removeGedung(props: {token: string | null, id: string}) {
  const config = {
    method: 'delete',
    headers: {
      'Authorization': `Bearer ${props.token}`
    }
  }

  const res = await axios(`${import.meta.env.VITE_BACKEND_URL}/gedung/${props.id}`, config)

  return res
}