import { useAuth } from "@/auth";
import { CompLoading, LayoutError } from "@/common";
import { TarifListrik } from "@/tarif_listrik/api";
import {
  useMutationTarifListrik,
  useQueryTarifListrik,
} from "@/tarif_listrik/hooks";
import { Button } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createLazyFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";

export const Route = createLazyFileRoute(
  "/__auth/pengaturan/tarif-listrik/edit",
)({
  component: EditTarifListrik,
});

function EditTarifListrik() {
  const { history } = useRouter();
  const goBack = () => history.back();
  const auth = useAuth();
  const tarif = useQueryTarifListrik(auth.token);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const tarifMutation = useMutationTarifListrik();
  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData(evt.currentTarget);
      const payload: TarifListrik = {
        harga: data.get("harga") as unknown as number,
      };
      tarifMutation.mutate(
        {
          token: auth.token,
          data: payload,
        },
        {
          onSuccess: () => {
            goBack();
          },
        },
      );
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  if (tarif.isLoading) return <CompLoading />;
  if (tarif.isError)
    return (
      <LayoutError process="get data tarif listrik" message={tarif.error} />
    );
  if (tarif.isSuccess)
    return (
      <div className="fixed inset-0 flex justify-center items-center z-20">
        <div className="bg-white rounded shadow-md w-full max-w-2xl p-3">
          <Button onClick={goBack} className="inline-block float-right">
            <div className="bg-red-900 p-1 rounded w-full transition border border-2 border-red-900 transition hover:border-red-600">
              <XMarkIcon className="block h-6 w-6 text-white" />
            </div>
          </Button>
          <form className="mt-5 mb-10 max-w-lg mx-auto" onSubmit={onFormSubmit}>
            <h2 className="mb-10 text-2xl font-semibold text-center">
              Sesuaikan Tarif Listrik
            </h2>
            <fieldset className="w-full grid gap-2">
              <div className="grid gap-2 items-center min-w-[300px]">
                <label htmlFor="harga-input" className="text-sm font-medium">
                  Harga per-Kwh (rupiah)
                </label>
                <input
                  id="harga-input"
                  name="harga"
                  placeholder="Masukan Harga Baru"
                  type="number"
                  defaultValue={tarif.data.results.harga}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              <div className="flex gap-4 mt-5">
                <button
                  type="submit"
                  className="mt-2 bg-blue-900 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500 border border-2 border-blue-900 transition hover:border-blue-500"
                >
                  {isSubmitting ? "Loading..." : "Simpan"}
                </button>
                <Button
                  onClick={goBack}
                  className="mt-2 bg-red-900 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500 text-center border border-2 border-red-900 transition hover:border-red-600"
                >
                  Batalkan
                </Button>
              </div>
            </fieldset>
            <div>
              {/* {mutation.isError ? (
                <Errors
                  className="mt-3"
                  process="update data perangkat"
                  message={mutation.error as AxiosError}
                />
              ) : (
                <></>
              )} */}
            </div>
          </form>
        </div>
      </div>
    );
}
