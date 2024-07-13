import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EnergyConsumption } from "../api";
import { PerangkatSubTitle } from "../components";
import { ChartBarIcon } from "@heroicons/react/24/outline";

const str_bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export const PerangkatEnergyChartCard = (props: {
  data: EnergyConsumption[];
}) => {
  const data: EnergyConsumption[] = props.data.map((v) => ({
    energy: v.energy,
    timestamp: str_bulan[new Date(v.timestamp).getMonth()],
  }));
  return (
    <div>
      <PerangkatSubTitle className="p-5 text-lg flex gap-2 items-center">
        <ChartBarIcon className="size-5 fill-blue-900 text-gray-900" />
        Konsumsi Energi dalam Satu Tahun
      </PerangkatSubTitle>
      <ResponsiveContainer aspect={4}>
        <BarChart
          width={window.screen.availWidth - 500}
          height={400}
          data={data}
        >
          <CartesianGrid strokeDasharray="5 0 0" stroke="#d1d5db" />
          <XAxis dataKey="timestamp" type="category" tickCount={12} stroke="#121828" fontSize={"0.875rem"} />
          <YAxis stroke="#121828" fontSize={"0.875rem"} />
          <Tooltip cursor={{ fill: '#e5e7eb9c' }} formatter={(v) => [v + " kWh", "Energi"]} />
          <Bar dataKey="energy" fill="#121828" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
