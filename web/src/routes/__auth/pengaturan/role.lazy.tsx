import { Api } from "@/api/internal";
import { Role, deleteRole, getRoles } from "@/api/roles";
import { useAuth } from "@/auth";
import Errors from "@/components/Errors";
import Loadings from "@/components/Loadings";
import { CompEmptyState } from "@/common";
import {
  Link,
  Outlet,
  createLazyFileRoute,
} from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Fragment, useState } from "react";
import {
  Dialog,
  Transition,
} from "@headlessui/react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Pencil, Trash2, Fingerprint, Shield } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createLazyFileRoute("/__auth/pengaturan/role")({
  component: RoleManagement,
});

function RoleManagement() {
  const auth = useAuth();
  const { permissions } = auth;
  const { isLoading, isError, error, isSuccess, data } = useQuery<
    Api<Role[]>,
    AxiosError
  >({
    queryKey: ["roles", auth.token],
    queryFn: getRoles,
    retry: 1,
  });

  return (
    <div>
      <header>
        <h2 className="py-1 flex gap-1 items-center text-2xl">
          Manajemen Role
        </h2>
        {permissions.includes("role.create") && (
          <Link
            to="/pengaturan/role/baru"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2.5 px-5 mb-2 mt-3 text-white font-medium rounded-xl transition shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Role
          </Link>
        )}
      </header>
      <main className="mt-5">
        {isLoading && <Loadings />}
        {isError && (
          <Errors
            process="mendapatkan data role"
            message={error}
            action={
              <Link
                className="bg-blue-900 py-1 px-3 rounded text-white transition hover:bg-blue-900/80"
                to="/pengaturan/role/baru"
              >
                Tambah Role
              </Link>
            }
          />
        )}
        {isSuccess && <ListRole data={data} />}
        <Outlet />
      </main>
    </div>
  );
}

function ListRole(props: { data: Api<Role[]> }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const auth = useAuth();
  const { permissions } = auth;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success("Role berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus role";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["roles", auth.token]);
      setDeleteId(null);
      setDeleteName("");
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      mutation.mutate({ token: auth.token, roleId: deleteId });
    }
  };

  const openDelete = (role: Role) => {
    setDeleteId(role.id.toString());
    setDeleteName(role.name);
  };

  if (!props.data.results || props.data.results.length === 0) {
    return (
      <CompEmptyState
        title="Belum Ada Data Role"
        description="Saat ini belum ada role yang terdaftar. Silakan tambahkan role baru."
        icon={<ShieldCheckIcon className="w-8 h-8" />}
        action={
          permissions.includes("role.create") ? (
            <Link
              to="/pengaturan/role/baru"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-xl transition"
            >
              <PlusIcon className="w-5 h-5" />
              Tambah Role
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        {props.data.results.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-6 flex flex-col justify-between gap-6 relative overflow-hidden transition-all hover:shadow-md dark:hover:shadow-slate-900/50"
          >
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm">
                  <Shield size={26} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {role.name}
                  </h3>
                  {role.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {role.description}
                    </p>
                  )}
                </div>
              </div>

              {role.is_system && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 w-fit">
                  Role Sistem
                </span>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/50 w-fit px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                <Fingerprint size={16} className="text-slate-400 dark:text-slate-500" />
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {role.permissions.length} Permission
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10 md:pt-2">
              {permissions.includes("role.edit") && (
                <Link
                  to="/pengaturan/role/$roleId/edit"
                  params={{ roleId: role.id.toString() }}
                  className="group flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 active:scale-[0.98]"
                >
                  <Pencil
                    size={16}
                    className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                  />
                  Edit
                </Link>
              )}
              {!role.is_system && permissions.includes("role.delete") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    openDelete(role);
                  }}
                  className="group flex flex-1 justify-center items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold transition-all hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white hover:border-red-600 dark:hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:outline-none focus:ring-4 focus:ring-red-500/20 active:scale-[0.98]"
                >
                  <Trash2
                    size={16}
                    className="text-red-500 dark:text-red-500 group-hover:text-white transition-colors"
                  />
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Transition appear show={!!deleteId} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => !mutation.isLoading && setDeleteId(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-slate-900 dark:text-white"
                    >
                      Hapus Role
                    </Dialog.Title>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Apakah Anda yakin ingin menghapus role{" "}
                      <strong className="text-foreground">{deleteName}</strong>?
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={mutation.isLoading}
                      className="inline-flex justify-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                      onClick={() => setDeleteId(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                      onClick={handleDelete}
                      disabled={mutation.isLoading}
                    >
                      {mutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
