import React from "react";

export const LayoutPerangkatCard = (props: { children: React.ReactNode, key?: string, className?: string }) => {
  return (
    <div className={`rounded bg-gray-900 py-4 px-5 text-gray-200${props.className ? ` ${props.className}` : ''}`}>
      {props.children}
    </div>
  );
};
