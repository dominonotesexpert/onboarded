import { type HTMLAttributes, type ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
    glass?: boolean;
}

export function Card({
    children,
    className = "",
    hover = false,
    glass = true,
    ...props
}: CardProps) {
    return (
        <div
            className={`
        ${glass ? "glass" : "bg-surface-800"} 
        rounded-2xl p-6 
        transition-all duration-300
        ${hover ? "hover:shadow-card-hover hover:-translate-y-1 cursor-pointer" : ""}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
