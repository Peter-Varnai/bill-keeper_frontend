import React from 'react';

interface BillSearchProps {
    amountFilter: string;
    onAmountChange: (value: string) => void;
}

export const BillSearch: React.FC<BillSearchProps> = ({
    amountFilter,
    onAmountChange,
}) => {
    return (
        <div style={{ marginBottom: '8px' }}>
            <input
                type="text"
                value={amountFilter}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Filter by amount..."
                style={{
                    width: '100%',
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '2px inset #fff',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                }}
            />
        </div>
    );
};