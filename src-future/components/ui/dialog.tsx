import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, title, description, children }) => {
  return (
    <div className={`dialog ${open ? 'open' : ''}`}>
      <div className="dialog-overlay" onClick={() => onOpenChange(false)} />
      <div className="dialog-content">
        <header className="dialog-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={() => onOpenChange(false)}>X</button>
        </header>
        {description && <p className="dialog-description">{description}</p>}
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;