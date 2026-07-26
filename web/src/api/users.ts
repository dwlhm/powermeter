import axios from "axios";
import { QueryFunctionContext } from "react-query";
import { Api } from "./internal";

export interface Login {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: number;
  role_name: string;
  permissions: string[];
}

export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: number;
  role_name: string;
}

export interface UserCreate {
  full_name: string;
  username: string;
  email: string;
  password: string;
  role: number;
}

export interface UserUpdate {
  full_name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: number;
}

export interface Role {
  id: number;
  name: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function authHeader(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function doLogin({ username, password }: Login) {
  const data = new URLSearchParams();
  data.append("username", username);
  data.append("password", password);

  const config = {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };
  const res = await axios(`${backendUrl}/token`, config);

  return res;
}

export async function getProfile(
  context: QueryFunctionContext,
): Promise<Api<UserProfile>> {
  const config = {
    method: "get",
    url: `${backendUrl}/users/me`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data as Api<UserProfile>;
}

export async function getUsers(
  context: QueryFunctionContext,
): Promise<Api<User[]>> {
  const token = context.queryKey[1] as string;
  const { data } = await axios.get(`${backendUrl}/users/`, {
    headers: authHeader(token),
  });
  return data as Api<User[]>;
}

export async function getRoles(
  context: QueryFunctionContext,
): Promise<Api<Role[]>> {
  const token = context.queryKey[1] as string;
  const { data } = await axios.get(`${backendUrl}/users/roles`, {
    headers: authHeader(token),
  });
  return data as Api<Role[]>;
}

export async function getUser({
  token,
  userId,
}: {
  token: string | null;
  userId: string;
}): Promise<Api<User>> {
  const { data } = await axios.get(`${backendUrl}/users/${userId}`, {
    headers: authHeader(token),
  });
  return data as Api<User>;
}

export async function createUser({
  token,
  payload,
}: {
  token: string | null;
  payload: UserCreate;
}): Promise<Api<User>> {
  const { data } = await axios.post(`${backendUrl}/users/`, payload, {
    headers: authHeader(token),
  });
  return data as Api<User>;
}

export async function updateUser({
  token,
  userId,
  payload,
}: {
  token: string | null;
  userId: string;
  payload: UserUpdate;
}): Promise<Api<User>> {
  const { data } = await axios.put(`${backendUrl}/users/${userId}`, payload, {
    headers: authHeader(token),
  });
  return data as Api<User>;
}

export async function deleteUser({
  token,
  userId,
}: {
  token: string | null;
  userId: string;
}): Promise<Api<{ id: number }>> {
  const { data } = await axios.delete(`${backendUrl}/users/${userId}`, {
    headers: authHeader(token),
  });
  return data as Api<{ id: number }>;
}
