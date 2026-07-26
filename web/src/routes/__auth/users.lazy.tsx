import { Api } from "@/api/internal";
import {
  User,
  deleteUser,
  getRoles,
  getUsers,
} from "@/api/users";
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
import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  Transition,
} from "@headlessui/react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const Route = createLazyFileRoute("/__auth/users")({
  component: UserManagement,
});

function UserManagement() {
  const auth = useAuth();
  const { permissions } = auth;
  const [search, setSearch] = useState("");

  if (!permissions.includes("user.view")) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-600">404</h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Halaman tidak ditemukan</p>
      </div>
    );
  }
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const queryClient = useQueryClient();

  const usersQuery = useQuery<Api<User[]>, AxiosError>({
    queryKey: ["users", auth.token],
    queryFn: getUsers,
    retry: 1,
  });

  const rolesQuery = useQuery<Api<{ id: number; name: string }[]>, AxiosError>({
    queryKey: ["roles", auth.token],
    queryFn: getRoles,
    retry: 1,
  });

  const roles = useMemo(() => {
    if (!rolesQuery.isSuccess) return [];
    return rolesQuery.data.results || [];
  }, [rolesQuery.data, rolesQuery.isSuccess]);

  const filteredUsers = useMemo(() => {
    const users = usersQuery.data?.results || [];
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.full_name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role_name.toLowerCase().includes(term);
      const matchesRole =
        roleFilter === "all" || user.role.toString() === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersQuery.data, search, roleFilter]);

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User berhasil dihapus");
    },
    onError: (error: any) => {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus user";
      toast.error(detail);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["users", auth.token]);
      setDeleteId(null);
      setDeleteName("");
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ token: auth.token, userId: deleteId });
    }
  };

  const openDelete = (user: User) => {
    setDeleteId(user.id.toString());
    setDeleteName(user.full_name || user.username);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UsersIcon className="w-7 h-7 text-primary" />
              Manajemen User
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Kelola akun pengguna, role, dan akses sistem.
            </p>
          </div>
          {permissions.includes("user.create") && (
            <Link
              to="/users/baru"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-5 rounded-xl transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <PlusIcon className="w-5 h-5" />
              Tambah User
            </Link>
          )}
        </div>
      </header>

      <main className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, username, email, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="relative min-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="all">Semua Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id.toString()}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {usersQuery.isLoading && <Loadings />}
        {usersQuery.isError && (
          <div className="p-6">
            <Errors
              process="mendapatkan data user"
              message={usersQuery.error}
              action={
                <button
                  onClick={() => usersQuery.refetch()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 px-4 rounded-lg text-sm font-medium transition"
                >
                  Coba Lagi
                </button>
              }
            />
          </div>
        )}

        {usersQuery.isSuccess && (
          <>
            {filteredUsers.length === 0 ? (
              <div className="p-6">
                <CompEmptyState
                  title="Tidak Ada User"
                  description={
                    search || roleFilter !== "all"
                      ? "Tidak ada user yang cocok dengan pencarian atau filter Anda."
                      : "Belum ada user yang terdaftar. Tambahkan user pertama untuk memulai."
                  }
                  icon={<UsersIcon className="w-8 h-8" />}
                  action={
                    permissions.includes("user.create") ? (
                      <Link
                        to="/users/baru"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-xl transition"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Tambah User
                      </Link>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Kontak</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <UserCircleIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">
                                {user.full_name}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span className="text-foreground">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            {user.role_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {permissions.includes("user.edit") && (
                              <Link
                                to="/users/$userId/edit"
                                params={{ userId: user.id.toString() }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                              </Link>
                            )}
                            {permissions.includes("user.delete") && (
                              <button
                                type="button"
                                onClick={() => openDelete(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 transition focus:outline-none focus:ring-2 focus:ring-destructive/50"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-4 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Menampilkan {filteredUsers.length} user
                {(search || roleFilter !== "all") && " (terfilter)"}
              </span>
              <span>Total: {usersQuery.data?.results?.length || 0} user</span>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Transition appear show={!!deleteId} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => !deleteMutation.isLoading && setDeleteId(null)}
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold text-foreground"
                    >
                      Hapus User
                    </Dialog.Title>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Apakah Anda yakin ingin menghapus user{" "}
                      <strong className="text-foreground">{deleteName}</strong>? Tindakan ini
                      tidak dapat dibatalkan.
                    </p>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={deleteMutation.isLoading}
                      className="inline-flex justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 transition"
                      onClick={() => setDeleteId(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isLoading}
                      className="inline-flex justify-center rounded-xl border border-transparent bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-50 transition"
                      onClick={handleDelete}
                    >
                      {deleteMutation.isLoading ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Outlet />
    </div>
  );
}
