import { PerangkatSubTitle } from "@/perangkat/components";
import { LayoutPerangkatCard } from "@/perangkat/layouts";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useQueryTarifListrik } from "../hooks";
import { CompLoading, LayoutError } from "@/common";
import { Link } from "@tanstack/react-router";

export const TarifListrikCard = (props: { token: string | null }) => {
  const tarifListrik = useQueryTarifListrik(props.token);

  if (tarifListrik.isLoading) return <CompLoading />;

  if (tarifListrik.isError)
    return (
      <LayoutError
        process="get data tarif listrik"
        message={tarifListrik.error}
      />
    );

  if (tarifListrik.isSuccess)
    return (
      <LayoutPerangkatCard>
        <PerangkatSubTitle>Tarif Listrik</PerangkatSubTitle>
        <div className="flex gap-2 py-5">
          <p>Rp</p>
          <p className="text-4xl font-bold">
            {tarifListrik.data.results.harga}
            <span className="text-base font-normal"> / kWh</span>
          </p>
        </div>
        <p className="text-xs italic text-gray-100/50">
          Terakhir diperbaharui pada:{" "}
          {!tarifListrik.data.results.updated_at
            ? new Date(
                tarifListrik.data.results.created_at as string,
              ).toLocaleString()
            : new Date(tarifListrik.data.results.updated_at).toLocaleString()}
        </p>
        <div className="flex justify-end mt-5">
          <Link
            to="/pengaturan/tarif-listrik/edit"
            className="text-xs backdrop-blur bg-gray-400 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded flex items-center gap-2"
          >
            <AdjustmentsHorizontalIcon className="size-4" /> Sesuaikan Tarif
          </Link>
        </div>
      </LayoutPerangkatCard>
    );
};
