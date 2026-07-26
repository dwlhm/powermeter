import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { AxiosError } from "axios";

export default function Errors(props: {
  process: string;
  message: AxiosError | string;
  action?: React.ReactNode | null;
  className?: string;
}) {
  const err_msg: string | string[] =
    typeof props.message == "string"
      ? props.message
      : props.message.response?.data
        ? (props.message.response.data as { detail: string }).detail
        : props.message.message;
  
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 shadow-sm w-full my-4 ${props.className || ""}`}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100/50 dark:bg-red-900/30 shadow-sm border border-red-200 dark:border-red-800/50 mb-4 text-red-500 dark:text-red-400">
        <ExclamationCircleIcon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1 capitalize">
        Error {props.process}
      </h3>
      <p className="text-red-600 dark:text-red-400/80 text-sm max-w-sm mb-5">
        {typeof err_msg == "string" ? err_msg : "Terjadi kesalahan pada sistem."}
      </p>
      
      {typeof props.message != "string" &&
      (props.message as AxiosError).response?.status == 401 ? (
        <Link
          to={"/login"}
          className="bg-blue-600 hover:bg-blue-700 py-2 px-5 rounded-lg text-white font-medium transition shadow-sm"
        >
          Masuk Kembali
        </Link>
      ) : (
        props.action
      )}
    </div>
  );
}
