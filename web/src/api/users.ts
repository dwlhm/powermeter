import axios from "axios";
import { QueryFunctionContext } from "react-query";
import { Api } from "./internal";

export interface Login {
  username: string;
  password: string;
}

export interface UserProfile {
    username: string;
    email: string;
    token: string;
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
  const res = await axios(`${import.meta.env.VITE_BACKEND_URL}/token`, config);

  return res;
}

export async function getProfile(
  context: QueryFunctionContext,
): Promise<Api<UserProfile>> {
  const config = {
    method: "get",
    url: `${import.meta.env.VITE_BACKEND_URL}/users/me`,
    headers: {
      Authorization: `Bearer ${context.queryKey[1]}`,
    },
  };

  const { data } = await axios(config);
  return data as Api<UserProfile>;
}
