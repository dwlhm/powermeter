import React from "react";

export const PerangkatSubMenu = (props: { children: React.ReactNode, className?: string }) => {
    return(
        <nav className={`flex overflow-hidden mb-3 w-full rounded-lg bg-muted${props.className ? ` ${props.className}` : ''}`}>
            {props.children}
        </nav>
    )
}