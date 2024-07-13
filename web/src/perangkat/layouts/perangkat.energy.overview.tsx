import { ChartPieIcon } from "@heroicons/react/24/outline";
import {
  PerangkatSubBody,
  PerangkatSubHeadingPanel,
  PerangkatSubTitle,
} from "../components";
import { TarifListrikCard } from "@/tarif_listrik/layouts/tarif.listrik.card";
import { useQueryEnergyConsumption, useQueryPerangkatData } from "../hooks";
import { CompLoading, LayoutError } from "@/common";
import { useQueryTarifListrik } from "@/tarif_listrik/hooks";
import { TagihanCard } from "./perangkat.tagihan.card";
import { PerangkatEnergyChartCard } from "./perangkat.energy.chart.card";

export default function PerangkatEnergyOverview(props: {
  token: string | null;
  perangkatId: string;
}) {
  const energy = useQueryEnergyConsumption({
    ...props,
    year: new Date().getFullYear(),
  });
  const tarif = useQueryTarifListrik(props.token);
  
  return (
    <>
      <PerangkatSubHeadingPanel withoutBackBtn={true}>
        <PerangkatSubTitle className="flex items-center gap-2">
          <ChartPieIcon className="w-5 h-5" />
          Dashboard
        </PerangkatSubTitle>
      </PerangkatSubHeadingPanel>
      <PerangkatSubBody>
<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <TagihanCard data={energy} tarif={tarif.data?.results.harga} />
          <TarifListrikCard tarif={tarif} />
        </div>
        <div>
          {energy.isLoading ? (
            <CompLoading />
          ) : energy.isError ? (
            <LayoutError
              process="get energy consumption data"
              message={energy.error}
            />
          ) : (
            energy.isSuccess && (
              <div className="mt-3">
                <PerangkatEnergyChartCard data={energy.data.results} />
              </div>
            )
          )}
        </div>
      </PerangkatSubBody>
    </>
  );
}
