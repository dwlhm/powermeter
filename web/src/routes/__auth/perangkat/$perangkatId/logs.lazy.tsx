import { createLazyFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/auth";
import {
  PerangkatSubBody,
  PerangkatSubHeadingPanel,
  PerangkatSubTitle,
} from "@/perangkat/components";
import { CompButton, CompEmptyState, CompLoading, LayoutError } from "@/common";
import { useQueryDeviceLogs } from "@/perangkat/hooks";
import { DeviceLogType, DeviceLog } from "@/api/devices";
import { PerangkatFilterBar } from "@/perangkat/layouts";
import { CompPerangkatDateRangeFilter } from "@/perangkat/components/perangkat.date.range.filter";
import {
  ArrowPathIcon,
  CodeBracketSquareIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

dayjs.extend(relativeTime);

export const Route = createLazyFileRoute("/__auth/perangkat/$perangkatId/logs")(
  {
    component: DeviceLogs,
  },
);

const LOG_TYPES: { value: DeviceLogType | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "error", label: "Error" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

function getLogTypeMeta(type: string) {
  switch (type.toLowerCase()) {
    case "error":
      return {
        label: "Error",
        icon: ShieldExclamationIcon,
        className:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
        dot: "bg-red-500",
      };
    case "warning":
      return {
        label: "Warning",
        icon: ExclamationTriangleIcon,
        className:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900",
        dot: "bg-amber-500",
      };
    case "info":
      return {
        label: "Info",
        icon: InformationCircleIcon,
        className:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
        dot: "bg-blue-500",
      };
    default:
      return {
        label: type,
        icon: InformationCircleIcon,
        className:
          "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        dot: "bg-slate-500",
      };
  }
}

function LogTypeBadge({ type }: { type: string }) {
  const meta = getLogTypeMeta(type);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

function LogItem({ log }: { log: DeviceLog }) {
  const meta = getLogTypeMeta(log.type);
  const createdAt = dayjs(log.created_at);

  return (
    <li className="relative pl-8 pb-8 last:pb-0">
      <span
        className={`absolute left-[11px] top-2 bottom-0 w-0.5 ${meta.dot}/30 last:hidden`}
        aria-hidden="true"
      />
      <span
        className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${meta.dot}`}
        aria-hidden="true"
      />
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <LogTypeBadge type={log.type} />
            <time
              className="text-xs text-slate-500 dark:text-slate-400"
              dateTime={log.created_at}
              title={createdAt.format("DD MMMM YYYY HH:mm:ss")}
            >
              {createdAt.format("DD MMM YYYY, HH:mm:ss")}
            </time>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
            {log.message}
          </p>
        </div>
      </div>
    </li>
  );
}

function LogTypeFilter({
  value,
  onChange,
}: {
  value: DeviceLogType | "";
  onChange: (value: DeviceLogType | "") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5">
      {LOG_TYPES.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value || "all"}
            type="button"
            onClick={() => onChange(item.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              active
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function DeviceLogs() {
  const auth = useAuth();
  const { perangkatId } = Route.useParams();

  const [type, setType] = React.useState<DeviceLogType | "">("");
  const [from, setFrom] = React.useState<Dayjs | null>(dayjs().subtract(7, "day").startOf("day"));
  const [to, setTo] = React.useState<Dayjs | null>(dayjs().endOf("day"));

  const {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    refetch,
    isFetching,
  } = useQueryDeviceLogs({
    token: auth.token,
    perangkatId,
    type: type || null,
    from,
    to,
    limit: 500,
  });

  if (isLoading) return <CompLoading />;

  if (isError)
    return (
      <>
        <PerangkatSubHeadingPanel withoutBackBtn={true}>
          <PerangkatSubTitle className="flex items-center gap-2">
            <CodeBracketSquareIcon className="size-5" />
            Log Perangkat
          </PerangkatSubTitle>
        </PerangkatSubHeadingPanel>
        <PerangkatSubBody>
          <LayoutError process="memuat log perangkat" message={error} />
        </PerangkatSubBody>
      </>
    );

  const logs = data?.results ?? [];

  return (
    <>
      <PerangkatSubHeadingPanel withoutBackBtn={true}>
        <PerangkatSubTitle className="flex items-center gap-2">
          <CodeBracketSquareIcon className="size-5" />
          Log Perangkat
        </PerangkatSubTitle>
      </PerangkatSubHeadingPanel>
      <PerangkatSubBody>
        <PerangkatFilterBar>
          <div className="flex flex-wrap items-center gap-3">
            <LogTypeFilter value={type} onChange={setType} />
            <CompPerangkatDateRangeFilter
              from={from}
              to={to}
              setFrom={setFrom}
              setTo={setTo}
              onFilterChanged={() => {}}
            />
          </div>
          <CompButton
            className="!bg-slate-100 dark:!bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:!bg-slate-200 dark:hover:!bg-slate-700 rounded-full px-4 py-2 transition-colors inline-flex items-center gap-2"
            onClick={() => refetch()}
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </CompButton>
        </PerangkatFilterBar>

        {isSuccess && logs.length === 0 && (
          <CompEmptyState
            title="Tidak Ada Log"
            description="Belum ada log untuk perangkat ini pada rentang waktu yang dipilih."
            icon={<CodeBracketSquareIcon className="w-8 h-8" />}
          />
        )}

        {isSuccess && logs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {logs.length} log ditemukan
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Diperbarui {dayjs().format("HH:mm:ss")}
              </span>
            </div>
            <ul className="space-y-0">
              {logs.map((log, index) => (
                <LogItem key={`logs.${perangkatId}.${index}`} log={log} />
              ))}
            </ul>
          </div>
        )}
      </PerangkatSubBody>
    </>
  );
}
