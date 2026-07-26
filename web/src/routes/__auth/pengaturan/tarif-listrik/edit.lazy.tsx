import { useAuth } from "@/auth";
import { CompLoading, LayoutError, CompModal } from "@/common";
import { TarifListrik } from "@/tarif_listrik/api";
import {
  useMutationTarifListrik,
  useQueryTarifListrik,
} from "@/tarif_listrik/hooks";
import { Button } from "@headlessui/react";
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
      <CompModal
        title="Sesuaikan Tarif Listrik"
        closeTo="/pengaturan/tarif-listrik"
      >
        <form className="mb-4 max-w-lg mx-auto" onSubmit={onFormSubmit}>
          <fieldset className="w-full grid gap-4">
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
                className="bg-transparent dark:bg-slate-800 border border-gray-300 dark:border-slate-700 dark:text-slate-100 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                required
              />
            </div>
            <div className="flex gap-4 mt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-900 dark:bg-blue-600 text-white py-2 px-4 rounded-md w-full disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:text-slate-500 border border-blue-900 dark:border-blue-600 transition-colors hover:bg-blue-800 dark:hover:bg-blue-700"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
              <Button
                onClick={goBack}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md w-full text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Batalkan
              </Button>
            </div>
          </fieldset>
        </form>
      </CompModal>
    );
}
