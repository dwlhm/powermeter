import { Link } from "@tanstack/react-router";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import React from "react";

export interface SideNavData {
    label: string,
    link: string,
    icon?: React.ReactNode
}

export default function SideNav(props: { data: SideNavData[] }) {
    return(
        <div className={`max-w-72 sticky top-16 bottom-0 h-[calc(100vh-4rem)] w-full p-4 overflow-auto border-r border-white/5 bg-card/30`}>
            <div className={`grid gap-2`}>
                {props.data.map((data, index) => {
                    return (
                        <Link 
                        key={index}
                        to={data.link}
                        className={`group transition-all duration-300 py-3 px-4 flex items-center gap-4 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10`}
                        activeProps={{
                            className: 'bg-white/5 text-primary border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                        }}>
                        <div className="text-current group-hover:text-primary transition-colors">
                            { data.icon || <RectangleGroupIcon className={`w-5 h-5`} /> }
                        </div>
                        <div>
                            <h4 className='font-medium text-sm capitalize'>{data.label}</h4>
                        </div>
                        </Link>)
                    })
                }
            </div>
        </div>
    )
}