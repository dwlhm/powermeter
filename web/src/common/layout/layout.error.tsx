import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { AxiosError } from "axios";

export const LayoutError = (props: {
  process: string;
  message: AxiosError | string;
  action?: React.ReactNode | null;
  className?: string;
}) => {
  const err_msg: string | string[] =
    typeof props.message == "string"
      ? props.message
      : (props.message.response?.data as { detail: string }).detail;
  return (
    <div
      className={`flex justify-center items-center gap-3 px-5 py-3 rounded border border-red-500 bg-red-200 w-auto m-auto ${props.className}`}
    >
      <ExclamationCircleIcon className="w-8 h-8 text-red-900" />
      <h4 className="text-base font-medium text-red-900 capitalize">
        Error {props.process}:
      </h4>
      <p className="italic text-red-800 text-base">
        {typeof err_msg == "string" ? err_msg : "system error"}
      </p>
      {typeof props.message != "string" &&
      (props.message as AxiosError).response?.status == 401 ? (
        <Link
          to={"/login"}
          className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
        >
          Login
        </Link>
      ) : (
        props.action
      )}
    </div>
  );
};
