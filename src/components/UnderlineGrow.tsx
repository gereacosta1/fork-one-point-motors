// src/components/UnderlineGrow.tsx
import React from "react";

type Props = { children: React.ReactNode };

export default function UnderlineGrow({ children }: Props) {
  return (
    <span
      className="
        relative inline-block
        after:content-[''] after:absolute after:left-0 after:-bottom-1
        after:h-[6px] after:w-0 after:bg-[rgb(199,48,48)]
        after:transition-[width] after:duration-300 after:ease-in
        hover:after:w-full
      "
    >
      {children}
    </span>
  );
}
