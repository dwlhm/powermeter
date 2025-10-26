import { Api } from "@/api/internal";
import { UseQueryResult } from "react-query";
import { EnergyConsumption } from "../api";
import { AxiosError } from "axios";
import { LayoutPerangkatCard } from "./perangkat.card";
import { PerangkatSubTitle } from "../components";

export const TagihanCard = (props: {
  data: UseQueryResult<Api<EnergyConsumption[]>, AxiosError>;
  tarif: number | undefined;
}) => {
  if (props.data.isSuccess) {
    const tagihan =
      props.data.data?.results[props.data.data?.results.length - 1];
    
    if (!tagihan || typeof tagihan.energy !== 'number') {
      return (
        <LayoutPerangkatCard>
          <PerangkatSubTitle>Konsumsi Energi Bulan Ini</PerangkatSubTitle>
          <div className="flex gap-2 py-5">
            <p className="text-gray-500">Data energi tidak tersedia</p>
          </div>
        </LayoutPerangkatCard>
      );
    }
    
    return (
      <LayoutPerangkatCard>
        <PerangkatSubTitle>Konsumsi Energi Bulan Ini</PerangkatSubTitle>
        <div className="flex gap-2 py-5">
          <p>Rp</p>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat("id-ID").format(
              tagihan.energy * (props.tarif || 1),
            )}
              <span className="block mt-3 px-3 w-fit text-lg font-medium bg-gray-300 text-gray-900 rounded">
                <span className="text-xs">atau</span> {tagihan.energy} kWh
              </span>
          </p>
        </div>
        <p className="text-xs italic text-gray-200/50">
          Terakhir diperbaharui pada:{" "}
          {new Date(tagihan.timestamp).toLocaleString()}
        </p>
     </LayoutPerangkatCard>
    );
  }
};
