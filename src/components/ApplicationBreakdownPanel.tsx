import React from 'react';
import { useSummaries } from '../hooks/useSummaries';
import { EXPENSE_TYPES } from '../api/types';
import { Window } from './windows98';

interface ApplicationBreakdownPanelProps {
    dataGroupId: number;
}

export const ApplicationBreakdownPanel: React.FC<ApplicationBreakdownPanelProps> = ({ dataGroupId }) => {
    const { data: summaries, isLoading, error } = useSummaries(dataGroupId);

    if (isLoading) {
        return (
            <Window title="Applications" style={{ height: '100%' }}>
                <div style={{ padding: '8px' }}>Loading...</div>
            </Window>
        );
    }

    if (error) {
        return (
            <Window title="Applications" style={{ height: '100%' }}>
                <div style={{ padding: '8px', color: 'red', fontSize: '11px' }}>
                    Error loading summaries
                </div>
            </Window>
        );
    }

    return (
        <Window title="Applications" style={{ height: '100%' }}>
            <div style={{
                overflow: 'auto',
                height: '100%',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {summaries?.map((summary) => {
                    const expenseDetails = summary.details.filter(([name]) => {
                        const typeId = Object.entries(EXPENSE_TYPES).find(([, n]) => n === name)?.[0];
                        return typeId && Number(typeId) >= 1 && Number(typeId) <= 19;
                    });

                    if (expenseDetails.length === 0) return null;

                    return (
                        <div key={summary.application} style={{
                            backgroundColor: '#c0c0c0',
                            border: '2px outset #fff',
                            padding: '8px',
                        }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                                {summary.application_name}
                            </div>
                            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {expenseDetails.map(([name, amount]) => (
                                        <tr key={name}>
                                            <td style={{ padding: '2px 4px', verticalAlign: 'top' }}>{name}</td>
                                            <td style={{ textAlign: 'right', padding: '2px 4px' }}>€ {amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{
                                marginTop: '6px',
                                paddingTop: '4px',
                                borderTop: '1px solid #808080',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: 'bold',
                                fontSize: '12px',
                            }}>
                                <span>Total</span>
                                <span>€ {summary.total}</span>
                            </div>
                            {summary.target_amount !== null && summary.target_amount > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '11px',
                                    color: '#666',
                                    marginTop: '2px',
                                }}>
                                    <span>Target</span>
                                    <span>€ {summary.target_amount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {summaries?.length === 0 && (
                    <div style={{ padding: '8px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                        No applications yet
                    </div>
                )}
            </div>
        </Window>
    );
};