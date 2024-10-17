import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AuthContext } from "../auth";
import { QueryClient } from "react-query";
import { Toaster } from "react-hot-toast";

interface CustomRouteContext {
  auth: AuthContext;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<CustomRouteContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" reverseOrder={true} />
    </>
  ),
});
