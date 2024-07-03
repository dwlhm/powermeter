import { AdjustmentsHorizontalIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import { PerangkatSubBody, PerangkatSubHeadingPanel, PerangkatSubTitle } from "../components";
import { LayoutPerangkatCard } from "./perangkat.card";
import { Button } from "@headlessui/react";
import { TarifListrikCard } from "@/tarif_listrik/layouts/tarif.listrik.card";
import { useAuth } from "@/auth";

export default function PerangkatEnergyOverview() {
    const auth = useAuth()
    return(
        <>
            <PerangkatSubHeadingPanel withoutBackBtn={true}>
                <PerangkatSubTitle className="flex items-center gap-2">
                    <ChartPieIcon className="w-5 h-5" />Dashboard
                </PerangkatSubTitle>
            </PerangkatSubHeadingPanel>
            <PerangkatSubBody>
                <div className="grid grid-cols-4 gap-4 w-full">
                    <TarifListrikCard token={auth.token} />
                </div>
            </PerangkatSubBody>
        </>
    )
}