import React from "react";

export const LayoutPerangkatCard = (props: { children: React.ReactNode, key?: string, className?: string }) => {
  return (
    <div className={`rounded-xl bg-card text-card-foreground border border-border py-4 px-5${props.className ? ` ${props.className}` : ''}`}>
      {props.children}
    </div>
  );
};
