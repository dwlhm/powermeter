import { Link, createLazyFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Api } from "@/api/internal";
import { createUser, getRoles, Role, UserCreate } from "@/api/users";
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

export const Route = createLazyFileRoute("/__auth/users/baru")({
  component: TambahUser,
});

function TambahUser() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const rolesQuery = useQuery<Api<Role[]>, AxiosError>({
    queryKey: ["roles", auth.token],
    queryFn: getRoles,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSettled: () => {
      queryClient.invalidateQueries(["users", auth.token]);
    },
  });

  const roles = rolesQuery.isSuccess ? rolesQuery.data.results || [] : [];

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setFormError(null);
    const data = new FormData(evt.currentTarget);

    const full_name = data.get("full_name") as string;
    const username = data.get("username") as string;
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const confirm_password = data.get("confirm_password") as string;
    const role = Number(data.get("role"));

    if (!full_name || !username || !email || !password || !role) {
      setFormError("Semua field wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirm_password) {
      setFormError("Konfirmasi password tidak cocok.");
      return;
    }

    const payload: UserCreate = {
      full_name,
      username,
      email,
      password,
      role,
    };

    setIsSubmitting(true);
    mutation.mutate(
      { token: auth.token, payload },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          router.invalidate();
          toast.success("User berhasil ditambahkan");
          navigate({ to: "/users" });
        },
        onError: (error: unknown) => {
          setIsSubmitting(false);
          const axiosErr = error as AxiosError;
          const detail = (axiosErr.response?.data as { detail?: string })?.detail;
          toast.error(
            typeof detail === "string"
              ? detail
              : axiosErr.message || "Gagal menambahkan user",
          );
        },
      },
    );
  };

  return (
    <CompModal title="Tambah User Baru" closeTo="/users" className="max-w-lg">
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
            icon={<IdentificationIcon className="w-5 h-5" />}
            required
          />
          <FormField
            id="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Masukkan username"
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
                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="" disabled>
                  Pilih role
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
            {roles.length === 0 && !rolesQuery.isLoading && (
              <p className="text-sm text-destructive">
                Tidak ada role tersedia. Hubungi administrator.
              </p>
            )}
          </div>

          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Minimal 8 karakter"
            icon={<LockClosedIcon className="w-5 h-5" />}
            required
            minLength={8}
          />
          <FormField
            id="confirm_password"
            name="confirm_password"
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password"
            icon={<LockClosedIcon className="w-5 h-5" />}
            required
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || roles.length === 0}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
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
            process="tambah user"
            message={mutation.error as AxiosError}
          />
        )}
      </form>
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
