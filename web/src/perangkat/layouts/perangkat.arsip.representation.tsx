import { Dayjs } from "dayjs";
import { useQueryPerangkatArsipData } from "../hooks";
import { CompLoading, LayoutError } from "@/common";
import { RegisterItem } from "@/api/register";
import styles from "./layout.module.css"

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

  if (isLoading) return <CompLoading />;

  if (!props.register) return <CompLoading />;

  if (isError) return <LayoutError process="get Arsip data" message={error} />;

  if (isSuccess)
    return (
      <div className="mb-5 sm:max-w-[calc(100vw-20rem)] overflow-auto">
        <table className="table-auto border-collapse rounded overflow-hidden">
          <thead className="bg-gray-900">
            <tr className="text-gray-100">
              <th className="px-3 py-6">No</th>
              <th className="px-3 py-6 min-w-40">Timestamp</th>
              {props.register.map((v) => (
                <th key={v[3]} className="px-3 py-6 min-w-40">{`${v[3]} ${v[2] !== " " ? `(${v[2]})` : ""}`}</th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.table}>
            {
              data.results.timestamp.map((v: string, i: number) => (
                <tr key={v} className="py-1">
                  <td className="p-2 text-center">{i+1}</td>
                  <td className="p-2 text-center w-full">{new Date(v).toLocaleString()}</td>
                  {
                    props.register?.map(v => (
                      <td key={`val.${v}`} className="p-2 text-center">
                        {data.results.data[v[4]][i]}
                      </td>
                    ))
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
};
