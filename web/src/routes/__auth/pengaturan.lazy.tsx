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
} from "@heroicons/react/24/outline";

export const Route = createLazyFileRoute("/__auth/pengaturan")({
  component: Pengaturan,
});

const menu: CompSideNavProps[] = [
  {
    label: "Kampus",
    link: "/pengaturan/kampus",
    icon: <BuildingLibraryIcon className="size-5" />,
  },
  {
    label: "Unit",
    link: "/pengaturan/unit",
    icon: <BuildingOffice2Icon className="size-5" />,
  },
  {
    label: "Gedung",
    link: "/pengaturan/gedung",
    icon: <BuildingOfficeIcon className="size-5" />,
  },
  {
    label: "Powermeter",
    link: "/pengaturan/powermeter",
    icon: <CubeIcon className="size-5" />,
  },
  {
    label: "Tarif Listrik",
    link: "/pengaturan/tarif-listrik",
    icon: <BoltIcon className="size-5" />
  }
];

function Pengaturan() {
  return (
    <LayoutBasic>
      <CompSideNav data={menu} />
      <LayoutBasicMainPanel>
        <Outlet />
      </LayoutBasicMainPanel>
    </LayoutBasic>
  );
}
