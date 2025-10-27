import React from 'react';

interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default Card;