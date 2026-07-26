import { PerangkatSubTitle } from "@/perangkat/components";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { CompLoading, LayoutError } from "@/common";
import { Link } from "@tanstack/react-router";
import { UseQueryResult } from "react-query";
import { Api } from "@/api/internal";
import { TarifListrik } from "../api";
import { AxiosError } from "axios";

export const TarifListrikCard = (props: { tarif: UseQueryResult<Api<TarifListrik>, AxiosError> }) => {
  const tarifListrik = props.tarif

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
      <div className="rounded-xl py-4 px-5 bg-card text-card-foreground border border-border">
        <PerangkatSubTitle>Tarif Listrik</PerangkatSubTitle>
        <div className="flex gap-2 py-5">
          <p>Rp</p>
          <p className="text-4xl font-bold">
            {tarifListrik.data.results.harga}
            <span className="text-base font-normal"> / kWh</span>
          </p>
        </div>
        <p className="text-xs italic text-muted-foreground">
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
            className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2 px-4 rounded flex items-center gap-2 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="size-4" /> Sesuaikan Tarif
          </Link>
        </div>
      </div>
    );
};
