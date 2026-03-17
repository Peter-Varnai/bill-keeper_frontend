import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSummaries } from '../hooks/useSummaries';
import { useApplicationReports } from '../hooks/useApplicationReports';
import { useEar } from '../hooks/useReports';
import { Window } from './windows98';
import { BreakdownTable } from './BreakdownTable';
import { ApplicationReportCard } from './ApplicationReportCard';
import { ApplicationReportModal } from './ApplicationReportModal';
import { getImageUrl, getReportByApplicationReport } from '../api/client';
import { EXPENSE_TYPES } from '../api/types';
import type { Summary, ReportItem, EarResponse, Expense, ApplicationReport } from '../api/types';

interface DashboardViewProps {
  dataGroupId: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ dataGroupId }) => {
    const { data: summaries, isLoading, error } = useSummaries(dataGroupId);
    const { data: applicationReports, isLoading: isLoadingApps } = useApplicationReports(dataGroupId);
    
    const [activeReportAppId, setActiveReportAppId] = useState<number | null>(null);
    const [activeReportType, setActiveReportType] = useState<'application' | 'ear' | null>(null);
    const [expandedSummary, setExpandedSummary] = useState<number | null>(null);
    const [mandatoryTab, setMandatoryTab] = useState<'ear' | 'assets'>('ear');
    const [earExpanded, setEarExpanded] = useState(false);
    
    // Edit/Create modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAppReport, setEditingAppReport] = useState<ApplicationReport | null>(null);

    const earQuery = useEar(dataGroupId);

    // Fetch report data dynamically based on activeReportAppId
    const [reportData, setReportData] = useState<ReportItem[] | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    // Load report when app ID changes
    React.useEffect(() => {
        if (activeReportType === 'application' && activeReportAppId) {
            setIsLoadingReport(true);
            getReportByApplicationReport(activeReportAppId, dataGroupId)
                .then(data => {
                    setReportData(data);
                    setIsLoadingReport(false);
                })
                .catch(() => {
                    setReportData([]);
                    setIsLoadingReport(false);
                });
        } else {
            setReportData(null);
        }
    }, [activeReportAppId, activeReportType, dataGroupId]);

    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `${activeReportAppId || 'ear'}_report`,
    });

    const handleViewReport = (appId: number) => {
        if (activeReportAppId === appId && activeReportType === 'application') {
            setActiveReportAppId(null);
            setActiveReportType(null);
        } else {
            setActiveReportAppId(appId);
            setActiveReportType('application');
        }
    };

    const handleViewEar = () => {
        if (activeReportType === 'ear') {
            setActiveReportType(null);
            setActiveReportAppId(null);
        } else {
            setActiveReportType('ear');
            setActiveReportAppId(null);
        }
    };

    const handlePrintDirect = (appId?: number) => {
        if (appId) {
            setActiveReportAppId(appId);
            setActiveReportType('application');
        } else {
            setActiveReportType('ear');
        }
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    const toggleExpand = (appId: number) => {
        setExpandedSummary(expandedSummary === appId ? null : appId);
    };

    // Get application name by ID
    const getAppName = (appId: number): string => {
        const app = applicationReports?.find(a => a.id === appId);
        return app?.name || 'Unknown';
    };

    const getEarDetails = () => {
        if (!earQuery.data) return { incomes: [], expenses: [] };
        const { expenses } = earQuery.data;
        
        const incomesMap = new Map<string, number>();
        const expensesMap = new Map<string, number>();
        
        expenses.forEach((expense) => {
            const type = EXPENSE_TYPES[expense.expense_type] || 'Unknown';
            const amount = expense.amount;
            
            if (expense.expense_type >= 50 && expense.expense_type <= 56) {
                const current = incomesMap.get(type) || 0;
                incomesMap.set(type, current + amount);
            } else {
                const current = expensesMap.get(type) || 0;
                expensesMap.set(type, current + amount);
            }
        });
        
        const incomes = Array.from(incomesMap.entries())
            .map(([type, amount]) => [type, amount.toFixed(2)] as [string, string])
            .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
            
        const expensesArr = Array.from(expensesMap.entries())
            .map(([type, amount]) => [type, Math.abs(amount).toFixed(2)] as [string, string])
            .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
        
        return { incomes, expenses: expensesArr };
    };

    // Modal handlers
    const handleAddNew = () => {
        setEditingAppReport(null);
        setShowEditModal(true);
    };

    const handleEditClick = (app: ApplicationReport) => {
        setEditingAppReport(app);
        setShowEditModal(true);
    };

    const renderReportContent = (data: ReportItem[] | EarResponse | undefined, title: string) => {
        if (!data) {
            return <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>No data available</div>;
        }

        if ('expenses' in data) {
            const { expenses, totals } = data;
            const ITEMS_PER_PAGE = 48;
            const pages: Expense[][] = [];
            for (let i = 0; i < expenses.length; i += ITEMS_PER_PAGE) {
                pages.push(expenses.slice(i, i + ITEMS_PER_PAGE));
            }

            return (
                <div ref={reportRef}>
                    <style>{`
                        @media print {
                            .page {
                                page-break-after: always;
                                width: 210mm;
                                min-height: 297mm;
                                padding: 20mm;
                                box-sizing: border-box;
                            }
                            .page:last-child {
                                page-break-after: auto;
                            }
                        }
                    `}</style>

                    {pages.map((pageExpenses, pageIndex) => (
                        <div key={pageIndex} className="page" style={{ marginBottom: '20px' }}>
                            {pageIndex === 0 && (
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    Einnahmen Ausgaben Rechnung {dataGroupId}
                                </h2>
                            )}

                            <table className="table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Date</th>
                                        <th>Partner</th>
                                        <th>Bank (€)</th>
                                        <th>Cash (€)</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageExpenses.map((expense: Expense) => (
                                        <tr key={expense.id}>
                                            <td>{expense.id}</td>
                                            <td>{expense.date || ''}</td>
                                            <td>{expense.partner}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {!expense.Bargeldabhebung ? expense.amount.toFixed(2) : ''}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {expense.Bargeldabhebung ? expense.amount.toFixed(2) : ''}
                                            </td>
                                            <td>{EXPENSE_TYPES[expense.expense_type] || ''}</td>
                                        </tr>
                                    ))}

                                    {pageIndex === pages.length - 1 && (
                                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
                                            <td colSpan={3} style={{ textAlign: 'right' }}>
                                                Schlussbilanz:
                                            </td>
                                            <td style={{ textAlign: 'right' }}>{totals.bank_total} €</td>
                                            <td style={{ textAlign: 'right' }}>{totals.cash_total} €</td>
                                            <td></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '10px' }}>
                                Page {pageIndex + 1} of {pages.length}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        const reportItems = data as ReportItem[];
        if (reportItems.length === 0) {
            return <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>No data available</div>;
        }

        return (
            <div ref={reportRef}>
                <style>{`
                    @media print {
                        .report-page {
                            page-break-after: always;
                            width: 210mm;
                            min-height: 297mm;
                            padding: 14mm;
                            box-sizing: border-box;
                        }
                        .report-page:last-child {
                            page-break-after: auto;
                        }
                    }
                `}</style>
                {reportItems.map((item, index) => (
                    <div key={item.expense_id} className="report-page" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {item.filename ? (
                                    <img
                                        src={getImageUrl(item.filename, dataGroupId)}
                                        alt={`Expense ${item.expense_id}`}
                                        style={{ maxWidth: '100%', maxHeight: '250mm', border: '1px solid #ccc' }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div style={{ width: '27%' }}>
                                <table className="table" style={{ width: '100%', fontSize: '11px' }}>
                                    <tbody>
                                        <tr><td>No. {item.expense_id}</td></tr>
                                        <tr><td style={{ fontWeight: 'bold' }}>€ {item.amount}</td></tr>
                                        <tr><td>{EXPENSE_TYPES[item.expense_type] || 'Unknown'}</td></tr>
                                        <tr><td>{item.partner}</td></tr>
                                        <tr><td>{item.date || '-'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '10px' }}>
                            Page {index + 1} of {reportItems.length} - {title}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const currentReportTitle = activeReportType === 'ear' 
        ? 'EAR Report' 
        : (activeReportAppId ? getAppName(activeReportAppId) : '');

    return (
        <div style={{ display: 'flex', gap: '8px', height: 'calc(100vh - 80px)' }}>
            {/* Summary (55%) */}
            <div style={{ width: '55%' }}>
                <Window title="Summary" style={{ height: '100%' }}>
                    <div style={{ padding: '16px', overflow: 'auto', height: '100%' }}>
                        {/* Header with Add button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Application Reports</span>
                            <button
                                onClick={handleAddNew}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    backgroundColor: '#c0c0c0',
                                    border: '2px outset #fff',
                                    cursor: 'pointer',
                                }}
                            >
                                + Add Application
                            </button>
                        </div>

                        {isLoading || isLoadingApps ? (
                            <div>Loading summaries...</div>
                        ) : error ? (
                            <div style={{ color: 'red' }}>Error: {error.message}</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {summaries?.map((summary: Summary) => (
                                    <ApplicationReportCard
                                        key={summary.application}
                                        summary={summary}
                                        isActive={activeReportAppId === summary.application}
                                        isExpanded={expandedSummary === summary.application}
                                        onToggleExpand={() => toggleExpand(summary.application)}
                                        onViewReport={handleViewReport}
                                        onPrintReport={handlePrintDirect}
                                        onEdit={handleEditClick}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Mandatory Documents Section */}
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                                Mandatory Documents
                            </div>
                            <menu role="tablist" style={{ margin: '0 0 16px 0', padding: 0, display: 'flex', gap: '8px' }}>
                                <li
                                    role="tab"
                                    aria-selected={mandatoryTab === 'ear'}
                                    onClick={() => setMandatoryTab('ear')}
                                    style={{ cursor: 'pointer', padding: '4px 8px', backgroundColor: mandatoryTab === 'ear' ? '#d4d0c8' : '#c0c0c0', border: '2px outset #fff' }}
                                >
                                    Einnahmen Ausgaben Rechnung
                                </li>
                                <li
                                    role="tab"
                                    aria-selected={mandatoryTab === 'assets'}
                                    onClick={() => setMandatoryTab('assets')}
                                    style={{ cursor: 'pointer', padding: '4px 8px', backgroundColor: mandatoryTab === 'assets' ? '#d4d0c8' : '#c0c0c0', border: '2px outset #fff' }}
                                >
                                    Asset Overview
                                </li>
                            </menu>

                            {mandatoryTab === 'ear' && (
                                earQuery.data && (
                                    <div
                                        key="ear"
                                        style={{
                                            backgroundColor: '#c0c0c0',
                                            border: '3px outset #fff',
                                            padding: '12px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Einnahmen Ausgaben Rechnung (EAR)</span>
                                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000080', display: 'block', marginTop: '4px' }}>
                                                    <div>Bank: € {parseFloat(earQuery.data.totals.bank_total) >= 0 ? `+${earQuery.data.totals.bank_total}` : earQuery.data.totals.bank_total}</div>
                                                    <div>Cash: € {parseFloat(earQuery.data.totals.cash_total) >= 0 ? `+${earQuery.data.totals.cash_total}` : earQuery.data.totals.cash_total}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <button
                                                    onClick={() => handleViewEar()}
                                                    style={{
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        backgroundColor: activeReportType === 'ear' ? '#d4d0c8' : '#c0c0c0',
                                                        border: '2px outset #fff',
                                                        cursor: 'pointer',
                                                        minWidth: '100px',
                                                    }}
                                                >
                                                    {activeReportType === 'ear' ? '✓ View Report' : 'View Report'}
                                                </button>
                                                <button
                                                    onClick={() => handlePrintDirect()}
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
                                            </div>
                                        </div>

                                        {(() => {
                                            const earDetails = getEarDetails();
                                            const hasIncomes = earDetails.incomes.length > 0;
                                            const hasExpenses = earDetails.expenses.length > 0;
                                            const hasAnyData = hasIncomes || hasExpenses;
                                            
                                            if (!hasAnyData) {
                                                return (
                                                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '2px solid #808080' }}>
                                                        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                                                            Add expenses to see breakdown...
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            
                                            const incomesToShow = earExpanded ? earDetails.incomes : earDetails.incomes.slice(0, 5);
                                            const expensesToShow = earExpanded ? earDetails.expenses : earDetails.expenses.slice(0, 5);
                                            
                                            const incomesOver5 = Math.max(0, earDetails.incomes.length - 5);
                                            const expensesOver5 = Math.max(0, earDetails.expenses.length - 5);
                                            const totalOver5 = incomesOver5 + expensesOver5;
                                            const hasMore = totalOver5 > 0;
                                            
                                            return (
                                                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '2px solid #808080' }}>
                                                    {hasIncomes && (
                                                        <BreakdownTable 
                                                            data={incomesToShow}
                                                            title="Incomes"
                                                        />
                                                    )}
                                                    {hasExpenses && (
                                                        <BreakdownTable 
                                                            data={expensesToShow}
                                                            title="Expenses"
                                                        />
                                                    )}
                                                    {hasMore && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                                            {!earExpanded && (
                                                                <span style={{ fontSize: '13px', color: '#666' }}>
                                                                    ... and {totalOver5} more
                                                                </span>
                                                            )}
                                                            <span
                                                                onClick={() => setEarExpanded(!earExpanded)}
                                                                style={{
                                                                    fontSize: '13px',
                                                                    color: '#0000FF',
                                                                    cursor: 'pointer',
                                                                    textDecoration: 'underline',
                                                                }}
                                                            >
                                                                {earExpanded ? 'Collapse' : 'Expand'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )
                            )}

                            {mandatoryTab === 'assets' && (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                                    Asset Overview - Coming soon...
                                </div>
                            )}
                        </div>
                    </div>
                </Window>
            </div>

            {/* Right Column - View Report (45%) - only visible when report is selected */}
            {(activeReportType === 'application' || activeReportType === 'ear') && (
                <div style={{ width: '45%' }}>
                    <Window
                        title={`${currentReportTitle} Report`}
                        style={{ height: '100%' }}
                    >
                        <div style={{ padding: '8px', height: '100%', overflow: 'auto' }}>
                            {isLoadingReport ? (
                                <div style={{ padding: '16px', textAlign: 'center' }}>Loading report...</div>
                            ) : (
                                renderReportContent(
                                    activeReportType === 'ear' ? earQuery.data : reportData || [],
                                    currentReportTitle
                                )
                            )}
                        </div>
                    </Window>
                </div>
            )}

            {/* Application Report Modal */}
            <ApplicationReportModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                editingAppReport={editingAppReport}
                dataGroupId={dataGroupId}
            />
        </div>
    );
};
