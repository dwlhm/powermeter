import {
  PerangkatSubBody,
} from "../components";
import { TarifListrikCard } from "@/tarif_listrik/layouts/tarif.listrik.card";
import { useQueryEnergyConsumption } from "../hooks";
import { CompLoading, LayoutError } from "@/common";
import { useQueryTarifListrik } from "@/tarif_listrik/hooks";
import { TagihanCard } from "./perangkat.tagihan.card";
import { PerangkatEnergyChartCard } from "./perangkat.energy.chart.card";
import { useAuth } from "@/auth";

export default function PerangkatEnergyOverview(props: {
  token: string | null;
  perangkatId: string;
}) {
  const { permissions } = useAuth();
  const canViewTarif = permissions.includes("tarif.view");

  const energy = useQueryEnergyConsumption({
    ...props,
    year: new Date().getFullYear(),
  });
  const tarif = useQueryTarifListrik(props.token, canViewTarif);

  return (
    <>
      <PerangkatSubBody>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <TagihanCard data={energy} tarif={tarif.data?.results.harga} />
          {canViewTarif && <TarifListrikCard tarif={tarif} />}
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
