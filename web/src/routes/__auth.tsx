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
    const config = {
      method: "get",
      url: `${import.meta.env.VITE_BACKEND_URL}/users/me`,
      headers: {
        Authorization: `Bearer ${context.auth.token}`,
      },
    };

    axios(config)
      .then(() => {})
      .catch(() => {
        setStoredToken(null);
        context.auth.isAuthenticated = false;
        redirect({
          to: "/login",
          search: {
            redirect: location.href,
          },
        });
      });
    if (!context.auth.isAuthenticated && !localStorage.getItem("auth.token")) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
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
    // const { isError } = useQuery<Api<UserProfile>, AxiosError>({
    //   queryKey: ["user.profile", auth.token],
    //   queryFn: getProfile,
    //   retry: 0,
    // });
    // if (isError) {
    //   auth.isAuthenticated = false;
    //   setStoredToken(null);
    //   auth.token = null;
    //   router.invalidate().finally(() => {
    //     navigate({ to: "/" });
    //   });
    // }
  }, [auth]);

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
