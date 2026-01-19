import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Cargando...',
    size = 'md',
    fullScreen = true
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const containerClass = fullScreen
        ? 'min-h-screen flex items-center justify-center bg-gray-50'
        : 'flex items-center justify-center p-8';

    return (
        <div className={containerClass}>
            <div className="text-center">
                <Loader2
                    className={`${sizeClasses[size]} animate-spin text-[#A19276] mx-auto mb-4`}
                />
                {message && (
                    <p className="text-[var(--text-muted)] text-sm">{message}</p>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
