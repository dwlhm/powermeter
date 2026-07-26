import React from "react";
import { Link, createLazyFileRoute, useRouter } from "@tanstack/react-router";
import { DeviceDetail, newDevices } from "../../../api/devices";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "../../../auth";
import { Api, isNoDataError } from "../../../api/internal";
import { getPowermeter, Powermeter } from "../../../api/powermeter";
import { AxiosError } from "axios";
import { Select } from "@headlessui/react";
import { Gedung, getGedung } from "../../../api/gedung";
import { CompLoading, CompModal } from "@/common";
import Errors from "../../../components/Errors";
import toast from "react-hot-toast";

export const Route = createLazyFileRoute("/__auth/perangkat/baru")({
  component: PerangkatBaru,
});

function PerangkatBaru() {
  const auth = useAuth();
  const { permissions } = auth;
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!permissions.includes("device.create")) {
      navigate({ to: "/perangkat" });
    }
  }, []);
  const mutation = useMutation({
    mutationFn: newDevices,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["devices", auth.token] });
    },
  });

  const pm = useQuery<Api<Powermeter[]>, AxiosError>({
    queryKey: ["powermeter", auth.token],
    queryFn: getPowermeter,
    retry: 1,
  });

  const g = useQuery<Api<Gedung[]>, AxiosError>({
    queryKey: ["gedung", auth.token],
    queryFn: getGedung,
    retry: 2,
  });

  // Server mengembalikan 400 "no data" saat koleksi kosong;
  // perlakukan sebagai list kosong agar form tetap tampil dengan jelas.
  const powermeters = pm.isSuccess ? pm.data.results : [];
  const gedungs = g.isSuccess ? g.data.results : [];
  const referenceLoading = pm.isLoading || g.isLoading;
  const referenceReady = powermeters.length > 0 && gedungs.length > 0;
  const referenceError =
    (pm.isError && !isNoDataError(pm.error) && pm.error) ||
    (g.isError && !isNoDataError(g.error) && g.error) ||
    null;

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
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

    if (
      !payload.name ||
      !payload.ip_addr ||
      !payload.port ||
      !payload.gedung.id ||
      !payload.powermeter.id
    )
      return;

    setIsSubmitting(true);
    await mutation.mutate(
      {
        token: auth.token,
        data: payload,
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.invalidate();
          toast.success("Berhasil menambahkan perangkat baru");
          navigate({ to: "/perangkat" });
        },
        onError: (error: unknown) => {
          setIsSubmitting(false);
          const axiosErr = error as AxiosError;
          const detail = (axiosErr.response?.data as { detail?: string })
            ?.detail;
          toast.error(
            typeof detail === "string"
              ? detail
              : axiosErr.message || "Gagal menambahkan perangkat",
          );
        },
      },
    );
  };

  return (
    <CompModal title="Perangkat Baru" closeTo="/perangkat">
      <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
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
              className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              required
            />
          </div>
          <div className="grid gap-2 items-center min-w-[300px]">
            <label htmlFor="powermeter-input" className="text-sm font-medium">
              Seri Powermeter
            </label>
            {pm.isLoading && <CompLoading />}
            {powermeters.length > 0 && (
              <Select
                id="powermeter-input"
                name="powermeter"
                aria-label="Seri Powermeter"
                required
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full"
              >
                {powermeters.map((item) => (
                  <option key={item.id} value={item.id}>
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
            {g.isLoading && <CompLoading />}
            {gedungs.length > 0 && (
              <Select
                id="gedung-input"
                name="gedung"
                aria-label="Lokasi Gedung"
                required
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow w-full"
              >
                {gedungs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {!referenceLoading && !referenceReady && !referenceError && (
            <div className="rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              {powermeters.length === 0 && gedungs.length === 0
                ? "Belum ada data powermeter dan gedung."
                : powermeters.length === 0
                  ? "Belum ada data powermeter."
                  : "Belum ada data gedung."}{" "}
              Tambahkan terlebih dahulu melalui menu{" "}
              {powermeters.length === 0 && (
                <Link
                  to="/pengaturan/powermeter"
                  className="font-medium underline"
                >
                  Powermeter
                </Link>
              )}
              {powermeters.length === 0 && gedungs.length === 0 && " dan "}
              {gedungs.length === 0 && (
                <Link
                  to="/pengaturan/gedung"
                  className="font-medium underline"
                >
                  Gedung
                </Link>
              )}
              .
            </div>
          )}

          {referenceError && (
            <Errors process="memuat data referensi" message={referenceError} />
          )}

          <div className="flex gap-4 mt-5">
            <button
              type="submit"
              disabled={isSubmitting || !referenceReady}
              className="bg-blue-900 dark:bg-blue-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-blue-900 dark:border-blue-600 transition-colors hover:bg-blue-800 dark:hover:bg-blue-700"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
            <Link
              to="/perangkat"
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Batalkan
            </Link>
          </div>
        </fieldset>
        {mutation.isError && (
          <Errors
            className="mt-4"
            process="tambah perangkat"
            message={mutation.error as AxiosError}
          />
        )}
      </form>
    </CompModal>
  );
}
