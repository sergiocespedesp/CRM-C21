import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'btn';
    
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        success: 'btn-success',
        warning: 'btn-warning'
    };

    const sizes = {
        sm: 'py-1 px-2 text-xs',
        md: 'py-2 px-4 text-sm',
        lg: 'py-3 px-6 text-base'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {!isLoading && LeftIcon && <LeftIcon className="w-4 h-4 mr-2" />}
            {children}
            {!isLoading && RightIcon && <RightIcon className="w-4 h-4 ml-2" />}
        </button>
    );
};
