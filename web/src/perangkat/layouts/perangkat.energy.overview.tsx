import { AdjustmentsHorizontalIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import { PerangkatSubBody, PerangkatSubHeadingPanel, PerangkatSubTitle } from "../components";
import { LayoutPerangkatCard } from "./perangkat.card";
import { Button } from "@headlessui/react";

export default function PerangkatEnergyOverview() {
    return(
        <>
            <PerangkatSubHeadingPanel withoutBackBtn={true}>
                <PerangkatSubTitle className="flex items-center gap-2">
                    <ChartPieIcon className="w-5 h-5" />Dashboard
                </PerangkatSubTitle>
            </PerangkatSubHeadingPanel>
            <PerangkatSubBody>
                <div className="grid grid-cols-4 gap-4 w-full">
                <LayoutPerangkatCard>
                    <PerangkatSubTitle>
                        Tarif Listrik
                    </PerangkatSubTitle>
                    <div className="flex gap-2 py-5">
                        <p>Rp</p>
                        <p className="text-4xl font-bold">2000<span className="text-base font-normal"> / kWh</span></p>
                        
                    </div>
                    <div className="flex justify-end mt-5">
                        <Button className="text-xs backdrop-blur bg-gray-400 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded flex items-center gap-2"><AdjustmentsHorizontalIcon className="size-4" /> Sesuaikan Tarif</Button>
                    </div>
                </LayoutPerangkatCard>
                </div>
            </PerangkatSubBody>
        </>
    )
}