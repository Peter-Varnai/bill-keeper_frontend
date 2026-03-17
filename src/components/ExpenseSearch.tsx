import React from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ExpenseSearchProps {
    searchName: string;
    onSearchNameChange: (name: string) => void;
    selectedMonth: number | null;
    onMonthChange: (month: number | null) => void;
}

export const ExpenseSearch: React.FC<ExpenseSearchProps> = ({
    searchName,
    onSearchNameChange,
    selectedMonth,
    onMonthChange,
}) => {
    return (
        <div style={{ padding: '8px', borderBottom: '2px solid #808080', backgroundColor: '#c0c0c0' }}>
            <div style={{ marginBottom: '8px' }}>
                <input
                    type="text"
                    value={searchName}
                    onChange={(e) => onSearchNameChange(e.target.value)}
                    placeholder="Search by partner name..."
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
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {MONTHS.map((month, index) => {
                    const monthNum = index + 1;
                    const isSelected = selectedMonth === monthNum;
                    return (
                        <button
                            key={month}
                            onClick={() => onMonthChange(isSelected ? null : monthNum)}
                            style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                border: isSelected ? '2px inset #808080' : '2px outset #fff',
                                backgroundColor: isSelected ? '#d4d0c8' : '#c0c0c0',
                                cursor: 'pointer',
                                fontWeight: isSelected ? 'bold' : 'normal',
                            }}
                        >
                            {month}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
