import {
  Menu,
  MenuButton,
  Transition,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/auth";

export default function PerangkatOptions(props: { perangkatId: string }) {
  const { permissions } = useAuth();
  const hasEdit = permissions.includes("device.edit");
  const hasDelete = permissions.includes("device.delete");

  if (!hasEdit && !hasDelete) return null;

  return (
    <Menu>
      <MenuButton className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground py-1.5 px-3 text-sm/6 font-semibold border border-border focus:outline-none data-[hover]:bg-secondary/80 data-[open]:bg-secondary/80 data-[focus]:outline-1 data-[focus]:outline-foreground transition-colors">
        Pengaturan
        <ChevronDownIcon className="size-4" />
      </MenuButton>
      <Transition
        enter="transition ease-out duration-75"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems
          anchor="bottom end"
          className="mt-2 w-52 origin-top-right rounded-xl border border-border bg-popover text-popover-foreground p-1 text-sm/6 shadow-xl z-50 [--anchor-gap:var(--spacing-1)] focus:outline-none"
        >
          {hasEdit && (
            <MenuItem>
              <Link
                to="/perangkat/$perangkatId/edit"
                params={{ perangkatId: props.perangkatId }}
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-accent data-[focus]:text-accent-foreground transition-colors"
              >
                <PencilIcon className="size-4 text-muted-foreground" />
                Edit
              </Link>
            </MenuItem>
          )}
          {hasEdit && hasDelete && <div className="my-1 h-px bg-border" />}
          {hasDelete && (
            <MenuItem>
              <Link
                to="/perangkat/$perangkatId/hapus"
                params={{ perangkatId: props.perangkatId }}
                className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 text-destructive data-[focus]:bg-destructive/10 transition-colors"
              >
                <TrashIcon className="size-4" />
                Hapus
              </Link>
            </MenuItem>
          )}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
