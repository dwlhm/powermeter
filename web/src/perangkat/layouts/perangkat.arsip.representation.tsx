import { Dayjs } from "dayjs";
import { useQueryPerangkatArsipData } from "../hooks";
import { CompLoading, LayoutError } from "@/common";
import { RegisterItem } from "@/api/register";
import { PerangkatData } from "../api";
import { Api } from "@/api/internal";

export type PerangkatArsipInterval =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type PerangkatArsipRepresentationProps = {
  token: string | null;
  perangkatId: string;
  interval: PerangkatArsipInterval;
  from: Dayjs | null;
  to: Dayjs | null;
  register: RegisterItem[] | undefined;
};

function isValidArsipData(data: unknown): data is Api<PerangkatData> {
  if (typeof data !== "object" || data === null) return false;
  const api = data as Partial<Api<PerangkatData>>;
  if (api.status !== "success" || typeof api.results !== "object" || api.results === null) return false;
  const results = api.results as Partial<PerangkatData>;
  if (typeof results.data !== "object" || results.data === null) return false;
  if (!Array.isArray(results.timestamp)) return false;
  if (typeof results.length !== "number") return false;
  return true;
}

function getRegisterValue(
  data: PerangkatData,
  register: RegisterItem,
  index: number,
): string {
  const param = register[4];
  const series = data.data[param];
  if (!Array.isArray(series)) return "-";
  const value = series[index];
  if (value === undefined || value === null) return "-";
  return String(value);
}

export const PerangkatArsipRepresentation = (
  props: PerangkatArsipRepresentationProps,
) => {
  const { isLoading, isError, isSuccess, data, error } =
    useQueryPerangkatArsipData({
      token: props.token,
      perangkatId: props.perangkatId,
      interval: props.interval,
      from: props.from,
      to: props.to,
    });

  if (!props.token || !props.from || !props.to) {
    return <CompLoading />;
  }

  if (isLoading) return <CompLoading />;

  if (!props.register) return <CompLoading />;

  if (isError) return <LayoutError process="get Arsip data" message={error} />;

  if (!isSuccess || !isValidArsipData(data)) {
    return (
      <LayoutError
        process="get Arsip data"
        message="Format data arsip tidak valid"
      />
    );
  }

  const results = data.results;

  if (results.length === 0 || results.timestamp.length === 0) {
    return (
      <LayoutError
        process="get Arsip data"
        message="Data arsip tidak tersedia untuk rentang waktu yang dipilih"
      />
    );
  }

  return (
    <div className="mb-5 sm:max-w-[calc(100vw-20rem)] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full table-auto border-collapse">
        <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10">
          <tr className="text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
            <th className="px-3 py-4 font-semibold">No</th>
            <th className="px-3 py-4 font-semibold min-w-40">Timestamp</th>
            {props.register.map((item) => (
              <th key={`hdr.${item[4]}`} className="px-3 py-4 font-semibold min-w-40">{`${item[3]} ${item[2] !== " " ? `(${item[2]})` : ""}`}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          {results.timestamp.map((timestamp, rowIndex) => (
            <tr
              key={`row.${timestamp}.${rowIndex}`}
              className="py-1 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="p-2 text-center">{rowIndex + 1}</td>
              <td className="p-2 text-center w-full">{new Date(timestamp).toLocaleString()}</td>
              {props.register?.map((item) => (
                <td key={`val.${timestamp}.${rowIndex}.${item[4]}`} className="p-2 text-center">
                  {getRegisterValue(results, item, rowIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
