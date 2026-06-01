import React, { useState, useEffect, useMemo } from 'react';
import { useBills, useUpdateBill, useDeleteBill } from '../hooks/useBills';
import { useExpenses } from '../hooks/useExpenses';
import { Window, Button, Dialog } from './windows98';
import { getImageUrl } from '../api/client';
import { BillExpensesTable } from './BillExpensesTable';
import { BillSearch } from './BillSearch';
import type { Bill } from '../api/types';

interface BillsViewProps {
    dataGroupId: number;
}

export const BillsView: React.FC<BillsViewProps> = ({ dataGroupId }) => {
    const { data: bills, isLoading, error } = useBills(dataGroupId);
    const { data: expenses } = useExpenses(dataGroupId);
    const updateBill = useUpdateBill(dataGroupId);
    const deleteBill = useDeleteBill(dataGroupId);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [isCash, setIsCash] = useState(false);
    const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
    const [amountFilter, setAmountFilter] = useState('');

    const filteredBills = useMemo(() => {
        if (!amountFilter.trim()) return bills;
        return bills?.filter(bill =>
            bill.amount !== null && bill.amount !== undefined &&
            bill.amount.toString().toLowerCase().includes(amountFilter.toLowerCase())
        );
    }, [bills, amountFilter]);

    const linkedBillIds = useMemo(() => {
        return new Set(
            expenses?.map(e => e.bill).filter((b): b is number => b !== null) || []
        );
    }, [expenses]);

    useEffect(() => {
        setSelectedBill(null);
        setAmount('');
        setDate('');
        setIsCash(false);
    }, [dataGroupId]);

    useEffect(() => {
        if (bills && bills.length > 0 && !selectedBill) {
            const firstBill = bills[0];
            setSelectedBill(firstBill);
            setAmount(firstBill.amount?.toString() || '');
            setDate(firstBill.date || '');
            setIsCash(firstBill.is_cash ?? false);
        }
    }, [bills, selectedBill]);

    useEffect(() => {
        if (selectedBill) {
            setAmount(selectedBill.amount?.toString() || '');
            setDate(selectedBill.date || '');
            setIsCash(selectedBill.is_cash ?? false);
        }
    }, [selectedBill]);

    const handleBillSelect = (bill: Bill) => {
        setSelectedBill(bill);
    };

    const handleSave = () => {
        if (selectedBill) {
            updateBill.mutate({
                id: selectedBill.id,
                bill: {
                    filename: selectedBill.filename,
                    amount: amount ? parseFloat(amount) : null,
                    date: date || null,
                    is_cash: isCash,
                },
            });
        }
    };

    const handleConfirmDelete = () => {
        if (billToDelete) {
            deleteBill.mutate({ id: billToDelete.id });
            if (selectedBill && selectedBill.id === billToDelete.id) {
                setSelectedBill(null);
                setAmount('');
                setDate('');
            }
        }
        setBillToDelete(null);
    };

    if (isLoading) {
        return (
            <Window title="Bills" style={{ height: 'calc(100vh - 80px)' }}>
                <div style={{ padding: '16px' }}>Loading bills...</div>
            </Window>
        );
    }

    if (error) {
        return (
            <Window title="Bills" style={{ height: 'calc(100vh - 80px)' }}>
                <div style={{ padding: '16px', color: 'red' }}>
                    Error loading bills: {error.message}
                </div>
            </Window>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '8px', height: 'calc(100vh - 80px)' }}>
            {/* Left Column - Bills List (14%) */}
            <div style={{ width: '14%', minWidth: '180px' }}>
                <Window title="Bills List" style={{ height: '100%' }}>
                    <div style={{
                        padding: '8px',
                        overflow: 'auto',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <BillSearch amountFilter={amountFilter} onAmountChange={setAmountFilter} />
                        {filteredBills && filteredBills.length === 0 ? (
                            <div style={{ padding: '8px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                                No bills found
                            </div>
                        ) : (
                            filteredBills?.map((bill) => (
                                <div
                                    key={bill.id}
                                    onClick={() => handleBillSelect(bill)}
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        padding: '8px',
                                        backgroundColor: linkedBillIds.has(bill.id) ? '#90EE90' : (selectedBill?.id === bill.id ? '#d4d0c8' : '#c0c0c0'),
                                        border: selectedBill?.id === bill.id ? '2px inset #808080' : '2px outset #fff',
                                        cursor: 'pointer',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div style={{ flexShrink: 0 }}>
                                        {bill.filename ? (
                                            <img
                                                src={getImageUrl(bill.filename, dataGroupId)}
                                                alt={`Bill ${bill.id}`}
                                                style={{
                                                    maxWidth: '50px',
                                                    maxHeight: '100px',
                                                    border: '1px solid #808080',
                                                    backgroundColor: '#fff'
                                                }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '50px',
                                                    height: '100px',
                                                    backgroundColor: '#e0e0e0',
                                                    border: '1px solid #808080',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '8px',
                                                    color: '#666',
                                                }}
                                            >
                                                No Img
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                            Bill #{bill.id}
                                        </div>
                                        <div style={{ fontSize: '11px' }}>
                                            {bill.amount !== null && bill.amount !== undefined
                                                ? `€ ${bill.amount.toFixed(2)}`
                                                : '--'}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#666' }}>
                                            {bill.filename || 'No filename'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setBillToDelete(bill); }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                padding: '4px',
                                            }}
                                            title="Delete bill"
                                            className='delete-expense-button'
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Window>
            </div>

            {/* Middle Column - Edit Bill (43%) */}
            <div style={{ width: '43%', flex: 1 }}>
                <Window title="Edit Bill" style={{ height: '100%' }}>
                    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {selectedBill ? (
                            <>
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#e0e0e0',
                                    border: '2px inset #808080',
                                    marginBottom: '16px',
                                    minHeight: '400px',
                                }}>
                                    {selectedBill.filename ? (
                                        <img
                                            src={getImageUrl(selectedBill.filename, dataGroupId)}
                                            alt={`Bill ${selectedBill.id}`}
                                            style={{
                                                maxWidth: '90%',
                                                maxHeight: '90%',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div style={{ color: '#666', fontSize: '18px' }}>
                                            No image available
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <label style={{ width: '80px', fontWeight: 'bold' }}>Amount:</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="--"
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                fontSize: '14px',
                                                border: '2px inset #808080',
                                                backgroundColor: '#fff',
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <label style={{ width: '80px', fontWeight: 'bold' }}>Date:</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            placeholder="--"
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                fontSize: '14px',
                                                border: '2px inset #808080',
                                                backgroundColor: '#fff',
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <input
                                            id="cash-checkbox"
                                            type="checkbox"
                                            checked={isCash}
                                            onChange={(e) => setIsCash(e.target.checked)}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <label htmlFor="cash-checkbox" style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                                            Cash (Bargeld)
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <Button onClick={handleSave}>Save Changes</Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                                Select a bill from the list to edit
                            </div>
                        )}
                    </div>
                </Window>
            </div>

            {/* Right Column - Expenses Table (43%) */}
            <div style={{ width: '43%', flex: 1 }}>
                <BillExpensesTable dataGroupId={dataGroupId} />
            </div>

            <Dialog
                title="Delete Scanned Bill"
                message="Are you sure you want to delete this scanned bill? The bill number will be cleared from any linked expenses."
                isOpen={!!billToDelete}
                onClose={() => setBillToDelete(null)}
                onConfirm={handleConfirmDelete}
                type="warning"
            />
        </div>
    );
};