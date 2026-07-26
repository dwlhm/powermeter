import { useAuth } from "@/auth";
import { CompLoading, LayoutError, CompEmptyState } from "@/common";
import { BoltIcon } from "@heroicons/react/24/outline";
import { useQueryTarifListrik } from "@/tarif_listrik/hooks";
import { Link, Outlet, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/__auth/pengaturan/tarif-listrik")({
  component: TarifListrikLayout,
});

function TarifListrikLayout() {
  const auth = useAuth();
  const { permissions } = useAuth();

  if (!permissions.includes("tarif.view")) return null;

  const tarif = useQueryTarifListrik(auth.token);

  return (
    <div>
      <header>
        <h2 className="py-1 flex gap-1 items-center text-2xl font-semibold">Tarif Listrik</h2>

        {permissions.includes("tarif.edit") && (
        <Link
          to="/pengaturan/tarif-listrik/edit"
          className="flex gap-2 items-center justify-center w-fit bg-blue-600 hover:bg-blue-700 py-2 px-5 mb-2 mt-3 text-white font-medium rounded-lg transition shadow-sm"
        >
          {" "}
          Sesuaikan Tarif
        </Link>
        )}
      </header>
      <main className="mt-5">
        {tarif.isLoading ? (
          <CompLoading />
        ) : tarif.isError ? (
          <LayoutError process="get data tarif listrik" message={tarif.error} />
        ) : !tarif.data?.results || !tarif.data?.results.harga ? (
          <CompEmptyState
            title="Belum Ada Tarif Listrik"
            description="Saat ini belum ada data tarif listrik yang terdaftar. Silakan sesuaikan tarif listrik."
            icon={<BoltIcon className="w-8 h-8" />}
          />
        ) : (
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-sm inline-block">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Harga:</p>
            <p className="my-2 text-4xl flex gap-2 font-bold text-slate-800 dark:text-slate-100">
              <span className="text-xl mt-1 text-slate-400 dark:text-slate-500">Rp</span>
              {tarif.data?.results.harga}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              Terakhir diperbaharui pada:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {!tarif.data?.results.updated_at
                  ? new Date(
                      tarif.data?.results.created_at as string,
                    ).toLocaleString()
                  : new Date(tarif.data.results.updated_at).toLocaleString()}
              </span>
            </p>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
