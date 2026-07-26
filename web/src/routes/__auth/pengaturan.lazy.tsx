import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import {
  CompSideNav,
  CompSideNavProps,
  LayoutBasic,
  LayoutBasicMainPanel,
} from "@/common";
import {
  BoltIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CubeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/auth";
import { useMemo } from "react";

export const Route = createLazyFileRoute("/__auth/pengaturan")({
  component: Pengaturan,
});

interface MenuItem extends CompSideNavProps {
  permission: string;
}

const allMenuItems: MenuItem[] = [
  {
    label: "Kampus",
    link: "/pengaturan/kampus",
    icon: <BuildingLibraryIcon className="size-5" />,
    permission: "kampus.view",
  },
  {
    label: "Unit",
    link: "/pengaturan/unit",
    icon: <BuildingOffice2Icon className="size-5" />,
    permission: "unit.view",
  },
  {
    label: "Gedung",
    link: "/pengaturan/gedung",
    icon: <BuildingOfficeIcon className="size-5" />,
    permission: "gedung.view",
  },
  {
    label: "Powermeter",
    link: "/pengaturan/powermeter",
    icon: <CubeIcon className="size-5" />,
    permission: "powermeter.view",
  },
  {
    label: "Tarif Listrik",
    link: "/pengaturan/tarif-listrik",
    icon: <BoltIcon className="size-5" />,
    permission: "tarif.view",
  },
  {
    label: "Role",
    link: "/pengaturan/role",
    icon: <ShieldCheckIcon className="size-5" />,
    permission: "role.view",
  },
];

function Pengaturan() {
  const { permissions } = useAuth();

  const filteredMenu = useMemo(
    () => allMenuItems.filter((item) => permissions.includes(item.permission)),
    [permissions],
  );

  return (
    <LayoutBasic>
      <CompSideNav data={filteredMenu} />
      <LayoutBasicMainPanel>
        <Outlet />
      </LayoutBasicMainPanel>
    </LayoutBasic>
  );
}
