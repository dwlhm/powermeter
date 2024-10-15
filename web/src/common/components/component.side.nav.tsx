import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import React from "react";
import { CompButton } from "./component.button";

export interface CompSideNavProps {
  label: string;
  link: string;
  icon?: React.ReactNode;
}

export const CompSideNav = (props: { data: CompSideNavProps[] }) => {
  const [menu, setMenu] = React.useState<boolean>(false);
  return (
    <div
      className={`sm:max-w-64 sticky top-16 ${menu ? "h-[calc(100vh-64px)] sticky top-16" : "sm:h-[calc(100vh-64px)] sm:sticky sm:top-16"} w-full p-2 overflow-auto`}
    >
      <CompButton onClick={() => setMenu((prev) => !prev)} className="block sm:hidden mb-2">
        {!menu ? "Lihat Pengaturan Lain" : "Tutup"}
      </CompButton>
      <div className={`grid gap-2 sm:block ${menu ? "block" : "hidden"}`}>
        {props.data.map((data, index) => {
          return (
            <Link
              key={index}
              to={data.link}
              className={`transition py-2 px-3 flex items-center gap-3 text-gray-100 hover:bg-gray-800/50 hover:rounded font-medium text-lg mb-1 capitalize`}
              activeProps={{ className: "bg-gray-800/50 rounded" }}
              onClick={() => setMenu(false)}
            >
              {data.icon || (
                <Cog6ToothIcon className={`w-6 h-6 text-white/60`} />
              )}
              {data.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
