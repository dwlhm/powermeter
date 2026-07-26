import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { setStoredToken, useAuth } from "../auth";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useEffect } from "react";

export const Route = createFileRoute("/__auth")({
  beforeLoad: async ({ context, location }) => {
    const token = context.auth.token || localStorage.getItem("auth.token");
    if (!token) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setStoredToken(null);
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.invalidate().finally(() => {
        navigate({ to: "/login" });
      });
    }
  }, [auth.isAuthenticated]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      auth.logout().then(() => {
        router.invalidate().finally(() => {
          navigate({ to: "/" });
        });
      });
    }
  };

  return (
    <>
      <Navbar logout={handleLogout} />
      <div className="mt-16 h-[calc(100vh-64px)]">
        <Outlet />
      </div>
    </>
  );
}
