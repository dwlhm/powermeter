import React from "react";
import { removeDevices } from "@/api/devices";
import { useAuth } from "@/auth";
import { CompModal } from "@/common";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

export const Route = createLazyFileRoute("/__auth/perangkat/$perangkatId/hapus")(
  {
    component: HapusPerangkat,
  },
);

function HapusPerangkat() {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const { permissions } = auth;
  const { perangkatId } = Route.useParams();
  const navigate = Route.useNavigate();

  React.useEffect(() => {
    if (!permissions.includes("device.delete")) {
      navigate({ to: "/perangkat" });
    }
  }, []);
  const mutation = useMutation({
    mutationFn: removeDevices,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["devices", auth.token] });
    },
  });

  const onRemove = async () => {
    await mutation.mutate(
      {
        token: auth.token,
        id: perangkatId,
      },
      {
        onSuccess: () => {
          toast.success("Perangkat berhasil dihapus");
          navigate({ to: "/perangkat" });
        },
        onError: () => {
          toast.error("Gagal menghapus perangkat");
        },
      },
    );
  };

  return (
    <CompModal
      title="Hapus Perangkat"
      closeTo="/perangkat/$perangkatId"
      closeParams={{ perangkatId }}
      className="max-w-md"
    >
      <div className="grid gap-6">
        <p className="text-slate-600 dark:text-slate-300">
          Apakah Anda yakin ingin menghapus perangkat ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onRemove}
            disabled={mutation.isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-md transition-colors"
          >
            {mutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
          </button>
          <Link
            to="/perangkat/$perangkatId"
            params={{ perangkatId }}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 px-4 rounded-md text-center border border-slate-300 dark:border-slate-700 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </Link>
        </div>
      </div>
    </CompModal>
  );
}
