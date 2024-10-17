import React from "react";
import { Link, createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DeviceDetail, newDevices } from "../../../api/devices";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "../../../auth";
import { Api } from "../../../api/internal";
import { getPowermeter, Powermeter } from "../../../api/powermeter";
import { AxiosError } from "axios";
import { Select } from "@headlessui/react";
import { Gedung, getGedung } from "../../../api/gedung";
import { CompLoading } from "@/common";

export const Route: any = createLazyFileRoute("/__auth/perangkat/baru")({
  component: PerangkatBaru,
});

function PerangkatBaru() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const mutation = useMutation({
    mutationFn: newDevices,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["devices", auth.token] });
    },
  });

  const {
    data: powermeter,
    isLoading: pmLoading,
    isSuccess: pmSuccess,
  } = useQuery<Api<Powermeter[]>, AxiosError>({
    queryKey: ["powermeter", auth.token],
    queryFn: getPowermeter,
    retry: 1,
  });

  const {
    data: gedung,
    isLoading: gLoading,
    isSuccess: gSuccess,
  } = useQuery<Api<Gedung[]>, AxiosError>({
    queryKey: ["gedung", auth.token],
    queryFn: getGedung,
    retry: 2,
  });

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    try {
      evt.preventDefault();
      const data = new FormData(evt.currentTarget);
      const payload: DeviceDetail = {
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

      if (!payload.name || !payload.ip_addr) return;
      await mutation.mutate(
        {
          token: auth.token,
          data: payload,
        },
        {
          onSuccess: () => {
            setIsSubmitting(false);
            router.invalidate();
            navigate({ to: "/perangkat" });
          },
        },
      );
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 flex justify-center items-center z-20">
      <div className="bg-white rounded shadow-md w-full max-w-2xl p-3">
        <Link to="/perangkat" className="inline-block float-right">
          <div className="bg-red-900 p-1 rounded w-full transition border border-2 border-red-900 transition hover:border-red-600">
            <XMarkIcon className="block h-6 w-6 text-white" />
          </div>
        </Link>
        <form className="mt-5 mb-10 max-w-lg mx-auto" onSubmit={onFormSubmit}>
          <h2 className="mb-10 text-2xl font-semibold text-center">
            Perangkat Baru
          </h2>
          <fieldset className="w-full grid gap-2">
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="name-input" className="text-sm font-medium">
                Nama Perangkat
              </label>
              <input
                id="name-input"
                name="name"
                placeholder="Masukan Nama Perangkat Baru"
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px] mt-2">
              <label htmlFor="ip-input" className="text-sm font-medium">
                IP Perangkat
              </label>
              <input
                id="ip-input"
                name="ip"
                placeholder="Masukan IP Perangkat Baru"
                type="text"
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px] mt-2">
              <label htmlFor="port-input" className="text-sm font-medium">
                Port Perangkat
              </label>
              <input
                id="port-input"
                name="port"
                placeholder="Masukan Port Perangkat Baru"
                type="number"
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <div className="grid gap-2 items-center min-w-[300px] mt-2">
              <label htmlFor="powermeter-input" className="text-sm font-medium">
                Seri Powermeter
              </label>
              {pmLoading && <CompLoading />}
              {pmSuccess && (
                <Select
                  id="powermeter-input"
                  name="powermeter"
                  aria-label="Seri Powermeter"
                  className="p-2 bg-gray-200/60 rounded"
                >
                  {powermeter?.results.map((item) => (
                    <option value={item.id}>
                      {item.seri} - {item.brand}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <div className="grid gap-2 items-center min-w-[300px] mt-2">
              <label htmlFor="gedung-input" className="text-sm font-medium">
                Lokasi Gedung
              </label>
              {gLoading && <CompLoading />}
              {gSuccess && (
                <Select
                  id="gedung-input"
                  name="gedung"
                  aria-label="Lokasi Gedung"
                  className="p-2 bg-gray-200/60 rounded"
                >
                  {gedung?.results.map((item) => (
                    <option value={item.id}>{item.name}</option>
                  ))}
                </Select>
              )}
            </div>
            <div className="flex gap-4 mt-5">
              <button
                type="submit"
                className="mt-2 bg-blue-900 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500 border border-2 border-blue-900 transition hover:border-blue-500"
              >
                {isSubmitting ? "Loading..." : "Tambahkan"}
              </button>
              <Link
                to="/perangkat"
                className="mt-2 bg-red-900 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500 text-center border border-2 border-red-900 transition hover:border-red-600"
              >
                Batalkan
              </Link>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
