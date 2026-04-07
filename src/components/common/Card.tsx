import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
}) => {
  return (
    <div
      className={`glass-card ${hoverable ? 'glass-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
