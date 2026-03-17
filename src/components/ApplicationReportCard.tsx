import React from 'react';
import { BreakdownTable } from './BreakdownTable';
import type { Summary, ApplicationReport } from '../api/types';

interface ApplicationReportCardProps {
    summary: Summary;
    isActive: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onViewReport: (appId: number) => void;
    onPrintReport: (appId: number) => void;
    onEdit: (app: ApplicationReport) => void;
}

export const ApplicationReportCard: React.FC<ApplicationReportCardProps> = ({
    summary,
    isActive,
    isExpanded,
    onToggleExpand,
    onViewReport,
    onPrintReport,
    onEdit,
}) => {
    const displayDetails = isExpanded ? summary.details : summary.details.slice(0, 5);
    const hasMore = summary.details.length > 5;
    const isTargetMet = summary.is_target_met;
    const targetAmount = summary.target_amount;

    return (
        <div
            style={{
                backgroundColor: '#c0c0c0',
                border: '3px outset #fff',
                padding: '12px',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{summary.application_name}</span>
                        {targetAmount !== null && targetAmount > 0 && (
                            <span style={{
                                fontSize: '12px',
                                padding: '2px 6px',
                                backgroundColor: isTargetMet ? '#4caf50' : '#ff9800',
                                color: 'white',
                                borderRadius: '4px',
                            }}>
                                {isTargetMet ? '✓ Target Met' : '⚠️ Below Target'}
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#000080', display: 'block', marginTop: '4px' }}>€ {summary.total}</span>
                    {targetAmount !== null && targetAmount > 0 && (
                        <>
                            <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                                Need to be covered: € {(targetAmount + parseFloat(summary.total)).toFixed(2)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                                Total gained: € {targetAmount.toFixed(2)}
                            </span>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                        onClick={() => onViewReport(summary.application)}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: isActive ? '#d4d0c8' : '#c0c0c0',
                            border: '2px outset #fff',
                            cursor: 'pointer',
                            minWidth: '100px',
                        }}
                    >
                        {isActive ? '✓ View Report' : 'View Report'}
                    </button>
                    <button
                        onClick={() => onPrintReport(summary.application)}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#c0c0c0',
                            border: '2px outset #fff',
                            cursor: 'pointer',
                            minWidth: '100px',
                        }}
                    >
                        Print Report
                    </button>
                    <button
                        onClick={() => onEdit({
                            id: summary.application,
                            data_group_id: 0,
                            name: summary.application_name,
                            amount: summary.target_amount || 0,
                            date_created: '',
                            submission_deadline: null,
                        })}
                        style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#c0c0c0',
                            border: '2px outset #fff',
                            cursor: 'pointer',
                            minWidth: '100px',
                        }}
                    >
                        Edit
                    </button>
                </div>
            </div>

            {summary.details.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '2px solid #808080' }}>
                    <BreakdownTable
                        data={displayDetails}
                        title="Expenses breakdown"
                    />

                    {hasMore && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            {!isExpanded && (
                                <span style={{ fontSize: '13px', color: '#666' }}>
                                    ... and {summary.details.length - 5} more
                                </span>
                            )}
                            <span
                                onClick={onToggleExpand}
                                style={{
                                    fontSize: '13px',
                                    color: '#0000FF',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                }}
                            >
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
