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
import { CpuChipIcon } from "@heroicons/react/24/outline";
import React from "react";
import { CompButton, CompLoading, LayoutError } from "@/common";

export const Route = createFileRoute("/__auth/perangkat")({
  component: Dashboard,
});

function Dashboard() {
  const user = useAuth();
  const [menu, setMenu] = React.useState<boolean>(false);
  const { perangkatId } = useParams({ strict: false }) as {
    perangkatId: string;
  };
  const isViewAllMode = !perangkatId;

  const { isLoading, isError, isSuccess, data, error } = useQuery<
    Api<DeviceDetail[]>,
    AxiosError
  >({
    queryKey: ["devices", user.token],
    queryFn: getDevices,
    retry: 2,
  });

  const openMenu = () => {
    setMenu((prev) => !prev);
  };

  if (isLoading)
    return (
      <>
        <CompLoading />
        <Outlet />
      </>
    );
  if (isError) {
    if (error.response?.status == 401) 
    return (
      <>
        <LayoutError
          process="mendapatkan list data perangkat"
          message={error}
          action={
            <Link
              to={"/perangkat/baru"}
              className="bg-blue-900 rounded-full py-2 px-5 text-white shadow-md border border-2 border-blue-900 hover:border-blue-600 transition hover:shadow-lg"
            >
              + Perangkat Baru
            </Link>
          }
        />
        <Outlet />
      </>
    );
  }
  if (isSuccess)
    return (
      <div
        className={`flex grow w-full ${!perangkatId ? "bg-gray-200" : "bg-blue-900 flex-col sm:flex-row"}`}
      >
        <div
          className={`${perangkatId && `sm:max-w-64 relative sm:bottom-0 ${menu ? "h-[calc(100vh-3.9rem)] sticky top-16" : "sm:h-[calc(100vh-3.9rem)] sm:sticky sm:top-16"}`} w-full p-2 overflow-auto`}
        >
          {perangkatId && (
            <button
              className={`${menu ? "sticky top-0" : "block"} sm:hidden bg-gray-900 text-gray-200 text-sm py-2 px-5 w-full text-center rounded mb-2`}
              onClick={() => openMenu()}
            >
              {menu ? "Tutup" : "Daftar Perangkat"}
            </button>
          )}

          <CompButton
            as="div"
            className={`sm:bottom-10 sm:right-10 sm:z-10 ${menu ? "block mb-5" : !perangkatId ? "block mb-5" : "hidden sm:block"} sm:fixed sm:max-w-48 sm:shadow-lg transition hover:bg-gray-900/95`}
          >
            <Link to={"/perangkat/baru"}>+ Perangkat Baru</Link>
          </CompButton>
          <div
            className={`grid ${!perangkatId ? "sm:grid-cols-3 lg:grid-cols-5" : `${menu ? "grid" : "hidden"} sm:grid`} gap-4`}
          >
            {data.results.map((data, index) => {
              const perangkatId = data.id as string;
              return (
                <Link
                  key={index}
                  to="/perangkat/$perangkatId"
                  params={{ perangkatId }}
                  onClick={() => setMenu(false)}
                  className={`perangkat transition py-2 px-3 flex items-center gap-3 ${isViewAllMode ? "bg-white border border-2 border-white hover:border-blue-800 shadow-md hover:shadow-xl rounded" : "text-gray-100 hover:bg-gray-800/50 hover:rounded"}`}
                >
                  <CpuChipIcon
                    className={`w-6 h-6 ${isViewAllMode ? "text-slate-800" : "text-white/60"}`}
                  />
                  <div>
                    <h4 className="font-medium text-lg mb-1 capitalize">
                      {data.name}
                    </h4>
                    <p
                      className={`text-xs ${isViewAllMode ? "text-slate-800" : "text-gray-200"}`}
                    >
                      {data.ip_addr}:{data.port}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div
          className={`${menu ? "hidden" : "block grow"} bg-white rounded shadow`}
        >
          <Outlet />
        </div>
      </div>
    );
}
