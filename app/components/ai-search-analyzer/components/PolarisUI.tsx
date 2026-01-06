import React, { useState } from 'react';

export const Card: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'white',
        border: `1px solid ${hovered ? '#babfc3' : '#e1e3e5'}`,
        borderRadius: '12px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        marginBottom: '16px',
        transition: 'border-color 0.2s',
      }}
    >
      {title && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e1e3e5',
          }}
        >
          <h3
            style={{
              fontWeight: '600',
              fontSize: '14px',
              lineHeight: '1.25',
              color: '#202223',
            }}
          >
            {title}
          </h3>
        </div>
      )}
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  );
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    Delivered: { bg: '#bbe5b3', text: '#1e512d' },
    Shipped: { bg: '#a4e8f2', text: '#005c6e' },
    Pending: { bg: '#ffd5a4', text: '#8a6116' },
    Cancelled: { bg: '#fead9a', text: '#7d201c' },
  };

  const color = colors[status] || { bg: '#f3f4f6', text: '#374151' };

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        backgroundColor: color.bg,
        color: color.text,
      }}
    >
      {status}
    </span>
  );
};

export const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  primary?: boolean;
  outline?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ onClick, children, primary, outline, disabled, className = '' }) => {
  const [hovered, setHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    outline: 'none',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyle: React.CSSProperties = primary
    ? {
        backgroundColor: hovered ? '#006e52' : '#008060',
        color: 'white',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    : outline
    ? {
        backgroundColor: hovered ? '#f6f6f7' : 'transparent',
        border: '1px solid #babfc3',
        color: '#202223',
      }
    : {
        backgroundColor: hovered ? '#f6f6f7' : 'white',
        border: '1px solid #babfc3',
        color: '#202223',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...baseStyle, ...variantStyle }}
    >
      {children}
    </button>
  );
};

export const Spinner = () => {
  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .spinner-dot-1 {
            animation: bounce 1s infinite;
            animation-delay: -0.3s;
          }
          .spinner-dot-2 {
            animation: bounce 1s infinite;
            animation-delay: -0.15s;
          }
          .spinner-dot-3 {
            animation: bounce 1s infinite;
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }}
      >
        <div
          className="spinner-dot-1"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#008060',
            borderRadius: '50%',
          }}
        ></div>
        <div
          className="spinner-dot-2"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#008060',
            borderRadius: '50%',
          }}
        ></div>
        <div
          className="spinner-dot-3"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#008060',
            borderRadius: '50%',
          }}
        ></div>
      </div>
    </>
  );
};
