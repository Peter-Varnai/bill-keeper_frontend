import React from 'react';

interface BreakdownTableProps {
  data: Array<[string, string]>;
  title?: string;
  className?: string;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ data, title, className = '' }) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      {title && (
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#404040' }}>
          {title}
        </div>
      )}
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        <table className={`table ${className}`} style={{ width: '100%', fontSize: '11px', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{
                position: 'sticky' as const,
                top: 0,
                backgroundColor: '#c0c0c0',
                borderBottom: '2px solid #808080',
                zIndex: 5,
              }}>Type</th>
              <th style={{
                position: 'sticky' as const,
                top: 0,
                backgroundColor: '#c0c0c0',
                borderBottom: '2px solid #808080',
                zIndex: 5,
                textAlign: 'right',
              }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map(([type, amount], index) => (
              <tr key={index}>
                <td>{type}</td>
                <td style={{ textAlign: 'right' }}>€ {amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};