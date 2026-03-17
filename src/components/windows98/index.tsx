import React from 'react';
import '98.css';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Window: React.FC<WindowProps> = ({ title, children, className = '', style }) => {
  return (
    <div 
      className={`window ${className}`} 
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div 
        className="title-bar" 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <div 
        className="window-body" 
        style={{
          overflow: 'auto',
          flex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false, 
  type = 'button',
  style 
}) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

interface DialogProps {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const Dialog: React.FC<DialogProps> = ({ 
  title, 
  message, 
  isOpen, 
  onClose, 
  onConfirm,
  type = 'error' 
}) => {
  if (!isOpen) return null;

  const iconMap = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <Window title={title} style={{ minWidth: '300px', maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '32px' }}>{iconMap[type]}</div>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {onConfirm ? (
            <>
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={onConfirm}>Confirm</Button>
            </>
          ) : (
            <Button onClick={onClose}>OK</Button>
          )}
        </div>
      </Window>
    </div>
  );
};

interface InputProps {
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  disabled = false,
  style 
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
    />
  );
};

interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  disabled = false,
  style 
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={style}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
