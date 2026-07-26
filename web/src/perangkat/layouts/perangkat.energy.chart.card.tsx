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
import { themeColor, useTheme } from "@/common";

const str_bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

export const PerangkatEnergyChartCard = (props: {
  data: EnergyConsumption[];
}) => {
  const { theme } = useTheme();
  const data: EnergyConsumption[] = (props.data ?? []).map((v) => ({
    energy: v.energy,
    timestamp: str_bulan[new Date(v.timestamp).getMonth()],
  }));

  // Warna mengikuti tema aktif (dibaca dari CSS variable)
  const colors = {
    grid: themeColor("--border", theme === "dark" ? "#27272a" : "#e4e4e7"),
    axis: themeColor("--muted-foreground", theme === "dark" ? "#a1a1aa" : "#71717a"),
    bar: themeColor("--primary", "#3b82f6"),
    tooltipBg: themeColor("--popover", theme === "dark" ? "#18181b" : "#ffffff"),
    tooltipText: themeColor("--popover-foreground", theme === "dark" ? "#fafafa" : "#09090b"),
    cursor: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
  };

  return (
    <div className="rounded-xl bg-card text-card-foreground border border-border">
      <PerangkatSubTitle className="p-5 text-lg flex gap-2 items-center">
        <ChartBarIcon className="size-5 text-primary" />
        Konsumsi Energi dalam Satu Tahun
      </PerangkatSubTitle>
      <div className="px-3 pb-4">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="timestamp"
              type="category"
              tickCount={12}
              stroke={colors.axis}
              fontSize={"0.875rem"}
              tickLine={false}
              axisLine={{ stroke: colors.grid }}
            />
            <YAxis
              stroke={colors.axis}
              fontSize={"0.875rem"}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: colors.cursor }}
              formatter={(v) => [v + " kWh", "Energi"]}
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.grid}`,
                borderRadius: "0.75rem",
                color: colors.tooltipText,
              }}
              labelStyle={{ color: colors.tooltipText }}
              itemStyle={{ color: colors.tooltipText }}
            />
            <Bar dataKey="energy" fill={colors.bar} barSize={30} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
