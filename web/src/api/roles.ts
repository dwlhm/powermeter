import axios from "axios";
import { QueryFunctionContext } from "react-query";
import { Api } from "./internal";

export interface Permission {
  id: number;
  code: string;
  name: string;
  group: string;
  description: string | null;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Permission[];
}

export interface RoleCreate {
  name: string;
  description?: string;
  permission_ids: number[];
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  permission_ids?: number[];
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function authHeader(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getRoles(
  context: QueryFunctionContext,
): Promise<Api<Role[]>> {
  const token = context.queryKey[1] as string;
  const { data } = await axios.get(`${backendUrl}/roles/`, {
    headers: authHeader(token),
  });
  return data as Api<Role[]>;
}

export async function getRole({
  token,
  roleId,
}: {
  token: string | null;
  roleId: string;
}): Promise<Api<Role>> {
  const { data } = await axios.get(`${backendUrl}/roles/${roleId}`, {
    headers: authHeader(token),
  });
  return data as Api<Role>;
}

export async function getPermissions(
  context: QueryFunctionContext,
): Promise<Api<Permission[]>> {
  const token = context.queryKey[1] as string;
  const { data } = await axios.get(`${backendUrl}/roles/permissions`, {
    headers: authHeader(token),
  });
  return data as Api<Permission[]>;
}

export async function createRole({
  token,
  payload,
}: {
  token: string | null;
  payload: RoleCreate;
}): Promise<Api<Role>> {
  const { data } = await axios.post(`${backendUrl}/roles/`, payload, {
    headers: authHeader(token),
  });
  return data as Api<Role>;
}

export async function updateRole({
  token,
  roleId,
  payload,
}: {
  token: string | null;
  roleId: string;
  payload: RoleUpdate;
}): Promise<Api<Role>> {
  const { data } = await axios.put(
    `${backendUrl}/roles/${roleId}`,
    payload,
    { headers: authHeader(token) },
  );
  return data as Api<Role>;
}

export async function deleteRole({
  token,
  roleId,
}: {
  token: string | null;
  roleId: string;
}): Promise<Api<{ id: number }>> {
  const { data } = await axios.delete(`${backendUrl}/roles/${roleId}`, {
    headers: authHeader(token),
  });
  return data as Api<{ id: number }>;
}
