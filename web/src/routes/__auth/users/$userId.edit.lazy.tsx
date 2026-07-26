import { Link, createLazyFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Api } from "@/api/internal";
import { getRoles, getUser, Role, updateUser, User, UserUpdate } from "@/api/users";
import { useAuth } from "@/auth";
import Errors from "@/components/Errors";
import { CompLoading, CompModal } from "@/common";
import toast from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

export const Route = createLazyFileRoute("/__auth/users/$userId/edit")({
  component: EditUser,
});

function EditUser() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { userId } = Route.useParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const userQuery = useQuery<Api<User>, AxiosError>({
    queryKey: ["user", userId, auth.token],
    queryFn: () => getUser({ token: auth.token, userId }),
    retry: 1,
  });

  const rolesQuery = useQuery<Api<Role[]>, AxiosError>({
    queryKey: ["roles", auth.token],
    queryFn: getRoles,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: updateUser,
    onSettled: () => {
      queryClient.invalidateQueries(["users", auth.token]);
      queryClient.invalidateQueries(["user", userId, auth.token]);
    },
  });

  const user = userQuery.isSuccess ? userQuery.data.results : null;
  const roles = rolesQuery.isSuccess ? rolesQuery.data.results || [] : [];
  const isLoading = userQuery.isLoading || rolesQuery.isLoading;
  const isError = userQuery.isError || rolesQuery.isError;

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setFormError(null);
    const data = new FormData(evt.currentTarget);

    const full_name = data.get("full_name") as string;
    const username = data.get("username") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const role = data.get("role") as string;

    const payload: UserUpdate = {};
    if (full_name) payload.full_name = full_name;
    if (username) payload.username = username;
    if (email) payload.email = email;
    if (role) payload.role = Number(role);
    if (password) {
      if (password.length < 8) {
        setFormError("Password baru minimal 8 karakter.");
        return;
      }
      payload.password = password;
    }

    if (Object.keys(payload).length === 0) {
      setFormError("Tidak ada perubahan yang disimpan.");
      return;
    }

    setIsSubmitting(true);
    mutation.mutate(
      { token: auth.token, userId, payload },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.invalidate();
          toast.success("User berhasil diperbarui");
          navigate({ to: "/users" });
        },
        onError: (error: unknown) => {
          setIsSubmitting(false);
          const axiosErr = error as AxiosError;
          const detail = (axiosErr.response?.data as { detail?: string })?.detail;
          toast.error(
            typeof detail === "string"
              ? detail
              : axiosErr.message || "Gagal memperbarui user",
          );
        },
      },
    );
  };

  return (
    <CompModal title="Edit User" closeTo="/users" className="max-w-lg">
      {isLoading && (
        <div className="py-8">
          <CompLoading />
        </div>
      )}
      {isError && (
        <div className="py-4">
          <Errors
            process="memuat data user"
            message={
              (userQuery.error as AxiosError) ||
              (rolesQuery.error as AxiosError)
            }
            action={
              <button
                onClick={() => {
                  userQuery.refetch();
                  rolesQuery.refetch();
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 px-4 rounded-lg text-sm font-medium transition"
              >
                Coba Lagi
              </button>
            }
          />
        </div>
      )}
      {user && (
        <form onSubmit={onFormSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <fieldset
            disabled={isSubmitting || rolesQuery.isLoading}
            className="space-y-4"
          >
            <FormField
              id="full_name"
              name="full_name"
              label="Nama Lengkap"
              type="text"
              placeholder="Masukkan nama lengkap"
              defaultValue={user.full_name}
              icon={<IdentificationIcon className="w-5 h-5" />}
              required
            />
            <FormField
              id="username"
              name="username"
              label="Username"
              type="text"
              placeholder="Masukkan username"
              defaultValue={user.username}
              icon={<UserIcon className="w-5 h-5" />}
              required
              minLength={3}
            />
            <FormField
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Masukkan email"
              defaultValue={user.email}
              icon={<EnvelopeIcon className="w-5 h-5" />}
              required
            />

            <div className="grid gap-2">
              <label
                htmlFor="role"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <ShieldCheckIcon className="w-4 h-4 text-muted-foreground" />
                Role
              </label>
              {rolesQuery.isLoading && <CompLoading />}
              {roles.length > 0 && (
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue={user.role}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
              {roles.length === 0 && !rolesQuery.isLoading && (
                <p className="text-sm text-destructive">
                  Tidak ada role tersedia.
                </p>
              )}
            </div>

            <FormField
              id="password"
              name="password"
              label="Password Baru"
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah"
              icon={<LockClosedIcon className="w-5 h-5" />}
              minLength={8}
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Biarkan kosong untuk mempertahankan password saat ini.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || roles.length === 0}
                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <Link
                to="/users"
                className="flex-1 py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-xl text-center transition border border-border"
              >
                Batal
              </Link>
            </div>
          </fieldset>

          {mutation.isError && (
            <Errors
              className="mt-4"
              process="update user"
              message={mutation.error as AxiosError}
            />
          )}
        </form>
      )}
    </CompModal>
  );
}

function FormField({
  id,
  label,
  icon,
  ...inputProps
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground flex items-center gap-2"
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
    </div>
  );
}
