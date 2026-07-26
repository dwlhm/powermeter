import { RegisterItem } from "@/api/register";
import { interval_data, useQueryPerangkatData } from "../hooks";
import { PerangkatData } from "../api";
import { Api } from "@/api/internal";
import { CompLoading, LayoutError } from "@/common";
import { LayoutPerangkatCard } from "./perangkat.card";
import { CompPerangkatLineChart } from "../components";
import React, { useEffect } from "react";

const EMPTY_DATA: PerangkatData = {
  data: {},
  timestamp: [],
  length: 0,
};

function mergeNewData(prev: PerangkatData, next: PerangkatData): PerangkatData {
  if (prev.length === 0 || next.length === 0) {
    return next.length > 0 ? next : prev;
  }

  const lastTimestamp = prev.timestamp[prev.length - 1];
  const startIndex = next.timestamp.findIndex(
    (t) => new Date(t) > new Date(lastTimestamp),
  );

  if (startIndex === -1) {
    return prev;
  }

  const newData: PerangkatData["data"] = {};
  Object.keys(next.data).forEach((key) => {
    newData[key] = next.data[key].slice(startIndex);
  });

  const merged: PerangkatData["data"] = {};
  Object.keys(prev.data).forEach((key) => {
    merged[key] = [...prev.data[key], ...(newData[key] ?? [])];
  });

  Object.keys(newData).forEach((key) => {
    if (!(key in merged)) {
      merged[key] = newData[key];
    }
  });

  return {
    data: merged,
    timestamp: [...prev.timestamp, ...next.timestamp.slice(startIndex)],
    length: prev.length + next.timestamp.length - startIndex,
  };
}

export type PerangkatDataRepresentationMode = "grafik" | "table";

export type PerangkatDataRepresentationProps = {
  token: string | null;
  perangkatId: string;
  register: RegisterItem[];
  interval: interval_data;
  isFilterChanged: boolean;
  onFilterChanged: (b: boolean) => void;
};

export const PerangkatDataRepresentation = (
  props: PerangkatDataRepresentationProps,
) => {
  const {
    token,
    perangkatId,
    register,
    interval,
    isFilterChanged,
    onFilterChanged,
  } = props;

  const [data, setData] = React.useState<PerangkatData>(EMPTY_DATA);
  const [hasInitialData, setHasInitialData] = React.useState(false);

  useEffect(() => {
    setData(EMPTY_DATA);
    setHasInitialData(false);
    if (isFilterChanged) {
      onFilterChanged(false);
    }
  }, [perangkatId, interval, isFilterChanged, onFilterChanged]);

  const q = useQueryPerangkatData({
    token,
    perangkatId,
    limit: hasInitialData ? 1 : 10,
    interval,
    refetchInterval: hasInitialData ? 2500 : false,
    enabled: !!token && !!perangkatId,
    onSuccess: (res: Api<PerangkatData>) => {
      const results = res.results;
      if (!hasInitialData) {
        setData(results);
        setHasInitialData(true);
      } else {
        setData((prev) => mergeNewData(prev, results));
      }
    },
  });

  if (q.isError)
    return <LayoutError process="get data perangkat" message={q.error} />;

  if (!hasInitialData || data.length <= 0) return <CompLoading />;

  if (q.isSuccess && data.length <= 0)
    return (
      <LayoutError
        process="Pengambilan data perangkat"
        message="Data tidak tersedia"
      />
    );

  return (
    <div className="grid sm:grid-cols-3 gap-2">
      {register.map((item, index) => (
        <LayoutPerangkatCard key={`i.c.${item[4]}.${index}`}>
          <h4 className="text-base font-medium">{`${item[3]} ${item[2] !== " " ? `(${item[2]})` : ""}`}</h4>
          <div className="my-1 h-px bg-white/50 mb-2" />

          <CompPerangkatLineChart
            value={data.data[item[4]] ?? []}
            timestamp={data.timestamp.map((d) =>
              new Date(d).toLocaleTimeString(),
            )}
          />
        </LayoutPerangkatCard>
      ))}
    </div>
  );
};
