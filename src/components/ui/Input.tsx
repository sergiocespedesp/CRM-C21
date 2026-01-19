import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ElementType;
    rightIcon?: React.ElementType;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    helperText,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {LeftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <LeftIcon className="h-5 w-5" />
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
                        input w-full transition-all duration-200
                        ${LeftIcon ? 'pl-10' : ''}
                        ${RightIcon ? 'pr-10' : ''}
                        ${error 
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                            : 'border-gray-200 focus:border-[#BEAF87] focus:ring-[#BEAF87]/20'
                        }
                    `}
                    {...props}
                />
                {RightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <RightIcon className="h-5 w-5" />
                    </div>
                )}
            </div>
            {error && (
                <div className="mt-1 flex items-center text-xs text-red-500">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span>{error}</span>
                </div>
            )}
            {!error && helperText && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
