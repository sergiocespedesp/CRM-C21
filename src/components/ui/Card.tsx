import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
    return (
        <div className={`card ${className}`}>
            <div className={`${noPadding ? '' : 'card-body'}`}>
                {children}
            </div>
        </div>
    );
};

interface CardHeaderProps {
    title: string;
    action?: React.ReactNode;
    subtitle?: string;
    icon?: React.ElementType;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, action, subtitle, icon: Icon, className = '' }) => {
    return (
        <div className={`card-header ${className}`}>
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5 text-[#BEAF87]" />}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return <div className={`p-6 ${className}`}>{children}</div>
}
