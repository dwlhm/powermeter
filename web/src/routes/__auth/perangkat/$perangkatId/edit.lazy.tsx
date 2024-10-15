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
import {
  PerangkatSubBody,
  PerangkatSubHeadingPanel,
  PerangkatSubTitle,
} from "@/perangkat/components";
import { CompLoading, LayoutError } from "@/common";

export const Route = createLazyFileRoute("/__auth/perangkat/$perangkatId/edit")(
  {
    component: EditPerangkat,
  },
);

function EditPerangkat() {
  const user = useAuth();
  const { perangkatId } = Route.useParams();
  const queryClient = useQueryClient();

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
    onError(error, _a, _b) {
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
          },
          onError: () => {
            setIsSubmitting(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (perangkatInfo.isSuccess)
    return (
      <>
        <PerangkatSubHeadingPanel>
          <PerangkatSubTitle>Edit Perangkat</PerangkatSubTitle>
        </PerangkatSubHeadingPanel>
        <PerangkatSubBody>
          <form onSubmit={onFormSubmit} className="max-w-96">
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
                  defaultValue={perangkatInfo.data.results.name}
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
                  defaultValue={perangkatInfo.data.results.ip_addr}
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
                  defaultValue={perangkatInfo.data.results.port}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              <div className="grid gap-2 items-center min-w-[300px] mt-2">
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
                    className="p-2 bg-gray-200/60 rounded"
                    defaultValue={perangkatInfo.data.results.powermeter?.id}
                  >
                    {powermeter?.results.map((item) => (
                      <option
                      key={`e.p_p_${item.id}`}
                      defaultValue={item.id}
                      >
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
                    defaultValue={perangkatInfo.data.results.gedung?.id}
                  >
                    {gedung?.results.map((item) => (
                      <option
                      key={`e.p_g_${item.id}`}
                      defaultValue={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="flex gap-4 mt-5">
                <button
                  type="submit"
                  className="mt-2 bg-blue-900 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500 border border-2 border-blue-900 transition hover:border-blue-500"
                >
                  {isSubmitting ? "Loading..." : "Simpan"}
                </button>
              </div>
            </fieldset>
            <div>
              {mutation.isError ? (
                <LayoutError
                  className="mt-3"
                  process="update data perangkat"
                  message={mutation.error as AxiosError}
                />
              ) : (
                <></>
              )}
            </div>
          </form>
        </PerangkatSubBody>
      </>
    );
}
