import { Outlet, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useAuth } from "../auth";
import Navbar from "../components/Navbar";

export const Route = createFileRoute('/__auth')({
    beforeLoad: async ({ context, location }) => {
        if (!context.auth.isAuthenticated && !localStorage.getItem("auth.token")) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.href
                }
            })
        }
    },
    component: AuthLayout
})

function AuthLayout() {
    const router = useRouter()
    const navigate = Route.useNavigate()
    const auth = useAuth()

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
        auth.logout().then(() => {
            router.invalidate().finally(() => {
            navigate({ to: '/' })
            })
        })
        }
    }

    return (
        <>
          <Navbar logout={handleLogout} />
          <div className="mt-16 h-[calc(100vh-64px)]">
            <Outlet />
          </div>
        </>
      )
}