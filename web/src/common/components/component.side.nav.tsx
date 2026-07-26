import { Cog6ToothIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import React from "react";
export interface CompSideNavProps {
  label: string;
  link: string;
  icon?: React.ReactNode;
}

export const CompSideNav = (props: { data: CompSideNavProps[] }) => {
  const [menu, setMenu] = React.useState<boolean>(false);
  
  return (
    <div
      className={`sm:w-72 shrink-0 sticky top-16 ${
        menu ? "h-[calc(100vh-64px)]" : "h-auto sm:h-[calc(100vh-64px)]"
      } w-full bg-slate-900 border-r border-slate-800 shadow-2xl sm:shadow-none z-20 flex flex-col transition-all duration-300`}
    >
      <div className="p-4 flex items-center justify-between sm:hidden border-b border-slate-800">
        <span className="font-semibold text-slate-100">Menu Pengaturan</span>
        <button
          onClick={() => setMenu((prev) => !prev)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {menu ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <Bars3Icon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div
        className={`p-4 pt-4 sm:pt-8 flex-col gap-2 ${
          menu ? "flex" : "hidden sm:flex"
        }`}
      >
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-3">
          Pengaturan Sistem
        </div>
        {props.data.map((data, index) => {
          return (
            <Link
              key={index}
              to={data.link}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-50 font-medium transition-all duration-300 hover:bg-slate-800 relative overflow-hidden"
              activeProps={{
                className: "active !text-blue-400 !bg-blue-950/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
              }}
              onClick={() => setMenu(false)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 group-hover:bg-slate-700 transition-colors duration-300 group-[.active]:bg-blue-900/50 group-[.active]:text-blue-400 text-slate-400 group-hover:text-slate-200">
                {data.icon || <Cog6ToothIcon className="w-5 h-5" />}
              </div>
              <span className="truncate">{data.label}</span>
              
              {/* Active Indicator Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-r-full transition-all duration-300 group-[.active]:h-1/2 opacity-0 group-[.active]:opacity-100" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};
