import { Link } from "@remix-run/react";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: string;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white shadow-glow hover:bg-blue-600 hover:shadow-glow-lg",
    secondary: "bg-glass-light text-white border border-glass-border hover:bg-glass-medium hover:border-white/20",
    ghost: "text-slate-400 hover:text-white hover:bg-glass-light",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
};

const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
};

export function Button({
    variant = "primary",
    size = "md",
    className = "",
    href,
    isLoading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variantStyles = variants[variant];
    const sizeStyles = sizes[size];

    const classes = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`;

    const content = (
        <>
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
    );

    if (href) {
        return (
            <Link to={href} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <button disabled={isLoading || disabled} className={classes} {...props}>
            {content}
        </button>
    );
}
