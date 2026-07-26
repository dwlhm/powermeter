import { Link, createLazyFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Api } from "@/api/internal";
import { Permission, RoleCreate, createRole, getPermissions } from "@/api/roles";
import { useAuth } from "@/auth";
import Errors from "@/components/Errors";
import { CompLoading, CompModal } from "@/common";
import toast from "react-hot-toast";
import { ShieldCheckIcon, CheckIcon } from "@heroicons/react/24/outline";

export const Route = createLazyFileRoute("/__auth/pengaturan/role/baru")({
  component: TambahRole,
});

function TambahRole() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<number>>(new Set());

  const permsQuery = useQuery<Api<Permission[]>, AxiosError>({
    queryKey: ["permissions", auth.token],
    queryFn: getPermissions,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: createRole,
    onSettled: () => {
      queryClient.invalidateQueries(["roles", auth.token]);
    },
  });

  const groupedPermissions = React.useMemo(() => {
    if (!permsQuery.isSuccess) return new Map<string, Permission[]>();
    const map = new Map<string, Permission[]>();
    for (const perm of permsQuery.data.results || []) {
      const group = perm.group;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(perm);
    }
    return map;
  }, [permsQuery.data, permsQuery.isSuccess]);

  const togglePermission = (id: number) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (perms: Permission[], selected: boolean) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (selected) next.add(p.id);
        else next.delete(p.id);
      }
      return next;
    });
  };

  const isGroupFullySelected = (perms: Permission[]) =>
    perms.every((p) => selectedPermissions.has(p.id));

  const isGroupPartiallySelected = (perms: Permission[]) =>
    perms.some((p) => selectedPermissions.has(p.id)) && !isGroupFullySelected(perms);

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setFormError(null);
    const data = new FormData(evt.currentTarget);

    const name = data.get("name") as string;
    const description = data.get("description") as string;

    if (!name) {
      setFormError("Nama role wajib diisi.");
      return;
    }

    const payload: RoleCreate = {
      name,
      description: description || undefined,
      permission_ids: Array.from(selectedPermissions),
    };

    setIsSubmitting(true);
    mutation.mutate(
      { token: auth.token, payload },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.invalidate();
          toast.success("Role berhasil ditambahkan");
          navigate({ to: "/pengaturan/role" });
        },
        onError: (error: unknown) => {
          setIsSubmitting(false);
          const axiosErr = error as AxiosError;
          const detail = (axiosErr.response?.data as { detail?: string })?.detail;
          toast.error(
            typeof detail === "string"
              ? detail
              : axiosErr.message || "Gagal menambahkan role",
          );
        },
      },
    );
  };

  return (
    <CompModal title="Tambah Role Baru" closeTo="/pengaturan/role" className="max-w-xl">
      <form onSubmit={onFormSubmit} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <fieldset
          disabled={isSubmitting || permsQuery.isLoading}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-muted-foreground" />
              Nama Role
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="cth: Viewer, Operator, Manajer"
              required
              className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Jelaskan role ini (opsional)"
              rows={2}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Hak Akses (Permission)
              </label>
              <span className="text-xs text-muted-foreground">
                {selectedPermissions.size} dipilih
              </span>
            </div>
            {permsQuery.isLoading && <CompLoading />}
            {permsQuery.isError && (
              <Errors process="memuat permission" message={permsQuery.error as AxiosError} />
            )}
            {groupedPermissions.size > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-2 border border-border rounded-xl p-2">
                {Array.from(groupedPermissions.entries()).map(([group, perms]) => {
                  const allSelected = isGroupFullySelected(perms);
                  const someSelected = isGroupPartiallySelected(perms);
                  return (
                    <div
                      key={group}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(perms, !allSelected)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 bg-muted/30 hover:bg-muted/60 transition text-left"
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                            allSelected
                              ? "bg-blue-600 border-blue-600"
                              : someSelected
                                ? "bg-blue-600/30 border-blue-600"
                                : "border-input bg-background"
                          }`}
                        >
                          {allSelected && <CheckIcon className="w-3 h-3 text-white" />}
                          {someSelected && <div className="w-2 h-0.5 bg-blue-600 rounded" />}
                        </div>
                        <span className="text-sm font-semibold text-foreground flex-1">
                          {group}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {perms.filter((p) => selectedPermissions.has(p.id)).length}/{perms.length}
                        </span>
                      </button>
                      <div className="divide-y divide-border/50">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-white dark:bg-slate-900 dark:border-slate-600"
                            />
                            <div className="min-w-0">
                              <span className="text-sm text-foreground block leading-tight">
                                {perm.name}
                              </span>
                              {perm.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
            <Link
              to="/pengaturan/role"
              className="flex-1 py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-xl text-center transition border border-border"
            >
              Batal
            </Link>
          </div>
        </fieldset>

        {mutation.isError && (
          <Errors
            className="mt-4"
            process="tambah role"
            message={mutation.error as AxiosError}
          />
        )}
      </form>
    </CompModal>
  );
}
