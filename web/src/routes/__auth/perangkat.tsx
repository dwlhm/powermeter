import {
  Link,
  Outlet,
  createFileRoute,
  useParams,
} from "@tanstack/react-router";
import { useQuery } from "react-query";
import { Api } from "../../api/internal";
import { DeviceDetail, getDevices } from "../../api/devices";
import { useAuth } from "../../auth";
import { AxiosError } from "axios";
import { ArrowPathIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import React from "react";
import { CompEmptyState, LayoutError } from "@/common";

export const Route = createFileRoute("/__auth/perangkat")({
  component: Dashboard,
});

function DeviceListSkeleton({ isViewAllMode }: { isViewAllMode: boolean }) {
  return (
    <div
      role="status"
      aria-label="Memuat daftar perangkat"
      className={`grid ${isViewAllMode ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid"} gap-4`}
    >
      {Array.from({ length: isViewAllMode ? 8 : 5 }).map((_, index) => (
        <div
          key={index}
          className="py-4 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border bg-card/40 animate-pulse"
        >
          <div className="p-3 rounded-xl bg-muted w-12 h-12 shrink-0" />
          <div className="flex-1 w-full space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function Dashboard() {
  const user = useAuth();
  const { permissions } = user;
  const [menu, setMenu] = React.useState<boolean>(false);
  const { perangkatId } = useParams({ strict: false }) as {
    perangkatId: string;
  };
  const isViewAllMode = !perangkatId;

  const { isLoading, isError, isSuccess, data, error, refetch, isFetching } =
    useQuery<Api<DeviceDetail[]>, AxiosError>({
      queryKey: ["devices", user.token],
      queryFn: getDevices,
      retry: 2,
    });

  const openMenu = () => {
    setMenu((prev) => !prev);
  };

  if (isLoading)
    return (
      <div className="flex min-h-[calc(100vh-64px)] w-full bg-background flex-col sm:flex-row">
        <div
          className={`${perangkatId && "sm:max-w-72 sm:h-[calc(100vh-64px)] sm:sticky sm:top-16"} w-full p-4 overflow-auto border-r border-border bg-card/30`}
        >
          <DeviceListSkeleton isViewAllMode={isViewAllMode} />
        </div>
        <div className="block flex-1 bg-background sm:rounded-tl-2xl border-t sm:border-l border-border shadow-2xl overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  if (isError)
    return (
      <>
        <LayoutError
          process="mendapatkan list data perangkat"
          message={error}
          action={
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 px-4 rounded-lg transition"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Memuat ulang..." : "Coba Lagi"}
            </button>
          }
        />
        <Outlet />
      </>
    );
  if (isSuccess)
    return (
      <div
        className={`flex min-h-[calc(100vh-64px)] w-full bg-background flex-col sm:flex-row`}
      >
        <div
          className={`${perangkatId && `sm:max-w-72 relative sm:bottom-0 ${menu ? "h-[calc(100vh-64px)] sticky top-16" : "sm:h-[calc(100vh-64px)] sm:sticky sm:top-16"}`} w-full p-4 overflow-auto border-r border-border bg-card/30`}
        >
          {perangkatId && (
            <button
              className={`${menu ? "sticky top-0" : "block"} sm:hidden bg-secondary text-secondary-foreground text-sm py-2 px-5 w-full text-center rounded-xl mb-4 shadow-sm border border-border`}
              onClick={() => openMenu()}
            >
              {menu ? "Tutup" : "Daftar Perangkat"}
            </button>
          )}

          {data.results.length > 0 && permissions.includes("device.create") && (
            <Link
              to={"/perangkat/baru"}
              className={`bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-xl shadow-[0_0_15px rgba(59,130,246,0.3)] text-center transition-all hover:scale-105 ${menu || !perangkatId ? "block mb-6" : "hidden sm:block sm:mb-6"}`}
            >
              + Perangkat Baru
            </Link>
          )}

          {data.results.length === 0 ? (
            <CompEmptyState
              title="Belum Ada Data Perangkat"
              description="Saat ini belum ada data perangkat yang terdaftar. Silakan tambahkan perangkat baru."
              icon={<CpuChipIcon className="w-8 h-8" />}
              action={
                permissions.includes("device.create") ? (
                  <Link
                    to={"/perangkat/baru"}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-5 rounded-xl shadow-[0_0_15px rgba(59,130,246,0.3)] transition hover:scale-105 inline-block"
                  >
                    + Perangkat Baru
                  </Link>
                ) : undefined
              }
            />
          ) : (
          <div
            className={`grid ${!perangkatId ? "sm:grid-cols-2 lg:grid-cols-4" : `${menu ? "grid" : "hidden"} sm:grid`} gap-4`}
          >
            {data.results.map((data, index) => {
              const perangkatId = data.id as string;
              return (
                <Link
                  key={index}
                  to="/perangkat/$perangkatId"
                  params={{ perangkatId }}
                  onClick={() => setMenu(false)}
                  className={`perangkat group transition-all duration-300 py-4 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border ${isViewAllMode ? "bg-card/40 border-border hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-1" : "bg-transparent border-transparent hover:bg-foreground/5 hover:border-border"}`}
                >
                  <div className={`p-3 rounded-xl ${isViewAllMode ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"} transition-colors`}>
                    <CpuChipIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1 capitalize text-foreground group-hover:text-primary transition-colors">
                      {data.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono bg-background/50 inline-block px-2 py-1 rounded-md border border-border">
                      {data.ip_addr}:{data.port}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </div>
        <div
          className={`${menu ? "hidden" : "block flex-1"} bg-background sm:rounded-tl-2xl border-t sm:border-l border-border shadow-2xl overflow-hidden`}
        >
          <Outlet />
        </div>
      </div>
    );
}
