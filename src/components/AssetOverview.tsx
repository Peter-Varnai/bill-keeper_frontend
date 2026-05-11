import React, { useState, useEffect } from 'react';
import { useUtilityData, useSaveUtilityData } from '../hooks/useUtilityData';

interface AssetOverviewProps {
    dataGroupId: number;
}

export const AssetOverview: React.FC<AssetOverviewProps> = ({ dataGroupId }) => {
    const { data, isLoading, error } = useUtilityData(dataGroupId);
    const saveMutation = useSaveUtilityData(dataGroupId);

    const [bankStand, setBankStand] = useState<string>('');
    const [cashStand, setCashStand] = useState<string>('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (data) {
            setBankStand(data.bank_stand !== null ? data.bank_stand.toString() : '');
            setCashStand(data.cash_stand !== null ? data.cash_stand.toString() : '');
            setHasChanges(false);
        }
    }, [data]);

    const handleBankChange = (value: string) => {
        setBankStand(value);
        setHasChanges(true);
    };

    const handleCashChange = (value: string) => {
        setCashStand(value);
        setHasChanges(true);
    };

    const handleSave = () => {
        const bankValue = bankStand === '' ? null : parseFloat(bankStand);
        const cashValue = cashStand === '' ? null : parseFloat(cashStand);

        saveMutation.mutate(
            { bankStand: bankValue, cashStand: cashValue },
            {
                onSuccess: () => {
                    setHasChanges(false);
                },
            }
        );
    };

    if (isLoading) {
        return <div style={{ padding: '16px', textAlign: 'center' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ padding: '16px', textAlign: 'center', color: 'red' }}>Error loading data</div>;
    }

    const formatCurrency = (value: number | null) => {
        if (value === null) return '€ 0.00';
        return `€ ${value.toFixed(2)}`;
    };

    return (
        <div
            style={{
                backgroundColor: '#c0c0c0',
                border: '3px outset #fff',
                padding: '12px',
            }}
        >
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0' }}>Asset Overview</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '4px', width: '25%' }}>Field</th>
                            <th style={{ padding: '4px', width: '25%' }}>Input</th>
                            <th style={{ padding: '4px', width: '25%' }}>Current DB Value</th>
                            <th style={{ padding: '4px', width: '25%' }}>With Expenses</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '4px' }}>
                                <label htmlFor="bank_stand" style={{ fontWeight: 'bold' }}>bank_stand:</label>
                            </td>
                            <td style={{ padding: '4px' }}>
                                <input
                                    id="bank_stand"
                                    type="number"
                                    step="0.01"
                                    value={bankStand}
                                    onChange={(e) => handleBankChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '4px',
                                        border: '2px inset #808080',
                                        backgroundColor: '#fff',
                                    }}
                                />
                            </td>
                            <td style={{ padding: '4px' }}>
                                <span style={{ fontFamily: 'monospace' }}>
                                    {formatCurrency(data?.bank_stand ?? null)}
                                </span>
                            </td>
                            <td style={{ padding: '4px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    {formatCurrency(data?.calculated_totals?.bank_with_expenses ?? null)}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '4px' }}>
                                <label htmlFor="cash_stand" style={{ fontWeight: 'bold' }}>cash_stand:</label>
                            </td>
                            <td style={{ padding: '4px' }}>
                                <input
                                    id="cash_stand"
                                    type="number"
                                    step="0.01"
                                    value={cashStand}
                                    onChange={(e) => handleCashChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '4px',
                                        border: '2px inset #808080',
                                        backgroundColor: '#fff',
                                    }}
                                />
                            </td>
                            <td style={{ padding: '4px' }}>
                                <span style={{ fontFamily: 'monospace' }}>
                                    {formatCurrency(data?.cash_stand ?? null)}
                                </span>
                            </td>
                            <td style={{ padding: '4px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    {formatCurrency(data?.calculated_totals?.cash_with_expenses ?? null)}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || saveMutation.isPending}
                        style={{
                            padding: '6px 16px',
                            backgroundColor: hasChanges ? '#c0c0c0' : '#a0a0a0',
                            border: '2px outset #fff',
                            cursor: hasChanges ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold',
                        }}
                        onMouseDown={(e) => {
                            if (hasChanges) (e.currentTarget as HTMLButtonElement).style.border = '2px inset #808080';
                        }}
                        onMouseUp={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.border = '2px outset #fff';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.border = '2px outset #fff';
                        }}
                    >
                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};