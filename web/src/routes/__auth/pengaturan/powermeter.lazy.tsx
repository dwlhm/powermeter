import { Api } from "@/api/internal";
import { useAuth } from "@/auth";
import Errors from "@/components/Errors";
import Loadings from "@/components/Loadings";
import {
  Link,
  Outlet,
  createLazyFileRoute,
  useParams,
} from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useQuery } from "react-query";
import { ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline";
import { Powermeter, getPowermeter } from "@/api/powermeter";
import { CompEmptyState } from "@/common";

export const Route = createLazyFileRoute("/__auth/pengaturan/powermeter")({
  component: PengaturanPowermeter,
});

function PengaturanPowermeter() {
  const auth = useAuth();
  const { permissions } = useAuth();
  const { powermeterId } = useParams({ strict: false });
  const { isLoading, isError, error, isSuccess, data } = useQuery<
    Api<Powermeter[]>,
    AxiosError
  >({
    queryKey: ["powermeter", auth.token],
    queryFn: getPowermeter,
    retry: 2,
  });
  const powermeter_data = data?.results.find((item) => item.id == powermeterId);

  return (
    <div>
      <header>
        <h2 className="py-1 flex gap-1 items-center">
          <Link to="/pengaturan/powermeter" className="text-2xl">
            Powermeter
          </Link>{" "}
          {powermeter_data && (
            <>
              <ChevronRightIcon className="w-6 h-6 inline" />{" "}
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                <Link
                  to="/pengaturan/powermeter/$powermeterId"
                  params={{ powermeterId: powermeterId as string }}
                >
                  {powermeter_data.seri}
                </Link>
              </span>
            </>
          )}
        </h2>
        {!powermeterId && permissions.includes("powermeter.create") && (
          <Link
            to="/pengaturan/powermeter/baru"
            className="bg-blue-600 hover:bg-blue-700 py-2 px-5 mb-2 mt-3 text-white font-medium rounded-lg inline-block transition shadow-sm"
          >
            Tambah Powermeter
          </Link>
        )}
      </header>
      <main className="mt-5">
        {isLoading && <Loadings />}
        {isError && (
          <Errors
            process="mendapatkan data list powermeter"
            message={error}
            action={
              permissions.includes("powermeter.create") && (
              <Link
                className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
                to="/pengaturan/powermeter/baru"
              >
                Tambah Powermeter
              </Link>
              )
            }
          />
        )}
        {isSuccess && !powermeterId && <ListPowermeter data={data} />}
        <Outlet />
      </main>
    </div>
  );
}

function ListPowermeter(props: { data: Api<Powermeter[]> }) {
  if (!props.data.results || props.data.results.length === 0) {
    return (
      <CompEmptyState
        title="Belum Ada Data Powermeter"
        description="Saat ini belum ada data powermeter yang terdaftar. Silakan tambahkan powermeter baru."
        icon={<CubeIcon className="w-8 h-8" />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {props.data.results.map((data, index) => {
        const powermeterId = data.id as string;

        return (
          <Link
            key={index}
            to="/pengaturan/powermeter/$powermeterId"
            params={{ powermeterId }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 p-6 shadow-sm backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 text-blue-600 dark:text-blue-400">
              <CubeIcon className="w-24 h-24 transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            
            <div className="relative z-10 flex items-start space-x-4">
              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <CubeIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xl text-slate-800 dark:text-slate-100 truncate">{data.seri}</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Brand: <span className="text-slate-700 dark:text-slate-300">{data.brand}</span>
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Slave ID</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.slave_id ?? 1}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Count</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.count ?? 2}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Timeout</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.timeout ?? 4}s</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
