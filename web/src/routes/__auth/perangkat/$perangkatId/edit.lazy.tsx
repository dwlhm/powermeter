import {
  DeviceDetail,
  getDeviceDetail,
  updateDevices,
} from "@/api/devices";
import { useAuth } from "@/auth";
import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AxiosError } from "axios";
import { Select } from "@headlessui/react";
import { Api } from "@/api/internal";
import { Powermeter, getPowermeter } from "@/api/powermeter";
import { Gedung, getGedung } from "@/api/gedung";
import { CompLoading, CompModal, LayoutError } from "@/common";
import { Link } from "@tanstack/react-router";
import toast from "react-hot-toast";

export const Route = createLazyFileRoute("/__auth/perangkat/$perangkatId/edit")(
  {
    component: EditPerangkat,
  },
);

function EditPerangkat() {
  const user = useAuth();
  const { permissions } = user;
  const { perangkatId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();

  React.useEffect(() => {
    if (!permissions.includes("device.edit")) {
      navigate({ to: "/perangkat" });
    }
  }, []);

  const perangkatInfo = useQuery({
    queryFn: getDeviceDetail,
    queryKey: [`devices.${perangkatId}`, user.token, perangkatId],
  });

  const {
    data: powermeter,
    isLoading: pmLoading,
    isSuccess: pmSuccess,
  } = useQuery<Api<Powermeter[]>, AxiosError>({
    queryKey: ["powermeter", user.token],
    queryFn: getPowermeter,
    retry: 1,
  });

  const {
    data: gedung,
    isLoading: gLoading,
    isSuccess: gSuccess,
  } = useQuery<Api<Gedung[]>, AxiosError>({
    queryKey: ["gedung", user.token],
    queryFn: getGedung,
    retry: 2,
  });

  const mutation = useMutation({
    mutationFn: updateDevices,
    onError(error) {
      console.error("ERROR", error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [`devices.${perangkatId}`, user.token, perangkatId],
      });
      queryClient.invalidateQueries({ queryKey: ["devices", user.token] });
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    try {
      evt.preventDefault();
      const data = new FormData(evt.currentTarget);
      const payload: DeviceDetail = {
        id: perangkatId,
        name: data.get("name") as string,
        ip_addr: data.get("ip") as string,
        port: Number(data.get("port")),
        gedung: {
          id: data.get("gedung") as string,
        },
        powermeter: {
          id: data.get("powermeter") as string,
        },
      };

      mutation.mutate(
        {
          token: user.token,
          data: payload,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false);
            toast.success("Data perangkat berhasil diperbarui");
            navigate({ to: "/perangkat/$perangkatId", params: { perangkatId } });
          },
          onError: (error: unknown) => {
            setIsSubmitting(false);
            const axiosErr = error as AxiosError;
            const detail = (axiosErr.response?.data as { detail?: string })
              ?.detail;
            toast.error(
              typeof detail === "string"
                ? detail
                : axiosErr.message || "Gagal memperbarui perangkat",
            );
          },
        },
      );
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (perangkatInfo.isLoading || pmLoading || gLoading) return <CompLoading />;

  if (perangkatInfo.isError)
    return (
      <CompModal
        title="Edit Perangkat"
        closeTo="/perangkat/$perangkatId"
        closeParams={{ perangkatId }}
        className="max-w-lg"
      >
        <LayoutError
          process="memuat data perangkat"
          message={perangkatInfo.error as AxiosError}
        />
      </CompModal>
    );

  if (perangkatInfo.isSuccess)
    return (
      <CompModal
        title="Edit Perangkat"
        closeTo="/perangkat/$perangkatId"
        closeParams={{ perangkatId }}
        className="max-w-lg"
      >
        <form onSubmit={onFormSubmit} className="max-w-lg mx-auto">
          <fieldset className="w-full grid gap-4">
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="name-input" className="text-sm font-medium">
                Nama Perangkat
              </label>
              <input
                id="name-input"
                name="name"
                placeholder="Masukan Nama Perangkat Baru"
                type="text"
                defaultValue={perangkatInfo.data.results.name}
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="ip-input" className="text-sm font-medium">
                IP Perangkat
              </label>
              <input
                id="ip-input"
                name="ip"
                placeholder="Masukan IP Perangkat Baru"
                type="text"
                defaultValue={perangkatInfo.data.results.ip_addr}
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="port-input" className="text-sm font-medium">
                Port Perangkat
              </label>
              <input
                id="port-input"
                name="port"
                placeholder="Masukan Port Perangkat Baru"
                type="number"
                defaultValue={perangkatInfo.data.results.port}
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label
                htmlFor="powermeter-input"
                className="text-sm font-medium"
              >
                Seri Powermeter
              </label>
              {pmLoading && <CompLoading />}
              {pmSuccess && (
                <Select
                  id="powermeter-input"
                  name="powermeter"
                  aria-label="Seri Powermeter"
                  required
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full"
                  defaultValue={perangkatInfo.data.results.powermeter?.id}
                >
                  {powermeter?.results.map((item) => (
                    <option key={`e.p_p_${item.id}`} value={item.id}>
                      {item.seri} - {item.brand}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="gedung-input" className="text-sm font-medium">
                Lokasi Gedung
              </label>
              {gLoading && <CompLoading />}
              {gSuccess && (
                <Select
                  id="gedung-input"
                  name="gedung"
                  aria-label="Lokasi Gedung"
                  required
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full"
                  defaultValue={perangkatInfo.data.results.gedung?.id}
                >
                  {gedung?.results.map((item) => (
                    <option key={`e.p_g_${item.id}`} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="flex gap-4 mt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-900 dark:bg-blue-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-blue-900 dark:border-blue-600 transition-colors hover:bg-blue-800 dark:hover:bg-blue-700"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
              <Link
                to="/perangkat/$perangkatId"
                params={{ perangkatId }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </Link>
            </div>
          </fieldset>
          {mutation.isError && (
            <LayoutError
              className="mt-4"
              process="update data perangkat"
              message={mutation.error as AxiosError}
            />
          )}
        </form>
      </CompModal>
    );

  return null;
}
