import React from "react"

export const LayoutBasic = (props: { children: React.ReactNode }) => {
    return(
        <div className="flex grow w-full bg-slate-50 dark:bg-background flex-col sm:flex-row min-h-[calc(100vh-64px)] transition-colors duration-300">
            {props.children}
        </div>
    )
}

export const LayoutBasicMainPanel = (props: { children: React.ReactNode }) => {
    return(
        <div className="grow p-4 sm:p-6 lg:p-8 m-0 sm:m-4 lg:m-6 bg-white dark:bg-card sm:rounded-2xl shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-white/10 relative transition-all duration-300 text-slate-900 dark:text-slate-100">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50/80 dark:from-white/5 to-transparent pointer-events-none sm:rounded-t-2xl transition-colors duration-300" />
            <div className="relative z-10 w-full h-full">
                {props.children}
            </div>
        </div>
    )
}