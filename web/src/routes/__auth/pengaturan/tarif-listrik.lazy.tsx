import { useAuth } from "@/auth";
import { CompLoading, LayoutError } from "@/common";
import { useQueryTarifListrik } from "@/tarif_listrik/hooks";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Link, Outlet, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/__auth/pengaturan/tarif-listrik")({
  component: TarifListrikLayout,
});

function TarifListrikLayout() {
  const auth = useAuth();
  const tarif = useQueryTarifListrik(auth.token);

  return (
    <div>
      <header>
        <h2 className="py-1 flex gap-1 items-center text-2xl">Tarif Listrik</h2>

        <Link
          to="/pengaturan/tarif-listrik/edit"
          className="flex gap-2 items-center justify-center max-w-40 bg-blue-900 py-2 px-4 mb-2 mt-3 text-white rounded inline-block transition hover:bg-blue-900/90"
        >
          {" "}
          Sesuaikan Tarif
        </Link>
      </header>
      <main className="mt-5">
        {tarif.isLoading ? (
          <CompLoading />
        ) : tarif.isError ? (
          <LayoutError process="get data tarif listrik" message={tarif.error} />
        ) : (
          <>
            <p>Harga:</p>
            <p className="my-2 text-3xl flex gap-2">
              <span className="text-lg">Rp</span>
              {tarif.data?.results.harga}
            </p>
            <p className="text-sm text-gray-900/80 italic">
              Terakhir diperbaharui pada:{" "}
              {!tarif.data?.results.updated_at
                ? new Date(
                    tarif.data?.results.created_at as string,
                  ).toLocaleString()
                : new Date(tarif.data.results.updated_at).toLocaleString()}
            </p>
          </>
        )}
        <Outlet />
      </main>
    </div>
  );
}
