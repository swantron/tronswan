import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    hoverable = false
}) => {
    return (
        <div className={`glass-card ${hoverable ? 'glass-card-hover' : ''} ${className}`}>
            {title && <h3 className="glass-card-title">{title}</h3>}
            {children}
        </div>
    );
};
