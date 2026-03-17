import React from 'react';
import { useSummaries } from '../hooks/useSummaries';
import { Window } from './windows98';
import type { Summary } from '../api/types';

const stickyHeaderStyle = {
  position: 'sticky' as const,
  top: 0,
  backgroundColor: '#c0c0c0',
  borderBottom: '2px solid #808080',
  zIndex: 5,
};

interface SummaryPanelProps {
  dataGroupId: number;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ dataGroupId }) => {
  const { data: summaries, isLoading, error } = useSummaries(dataGroupId);

  if (isLoading) {
    return (
      <Window title="Summary" style={{ margin: '8px' }}>
        <div style={{ padding: '16px' }}>Loading summaries...</div>
      </Window>
    );
  }

  if (error) {
    return (
      <Window title="Summary" style={{ margin: '8px' }}>
        <div style={{ padding: '16px', color: 'red' }}>
          Error loading summaries: {error.message}
        </div>
      </Window>
    );
  }

  return (
    <Window title="Summary" style={{ margin: '8px', height: '90vh' }}>
      <div style={{ padding: '8px' }}>
        {summaries?.map((summary: Summary) => (
          <div key={summary.application} style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>{summary.application_name}</span>
              <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#8e44ad' }}>
                € {summary.total}
              </span>
            </div>

            {summary.details.length > 0 && (
              <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                <table className="table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th style={stickyHeaderStyle}>Type</th>
                      <th style={stickyHeaderStyle}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.details.map(([type, amount]: [string, string], index: number) => (
                      <tr key={index}>
                        <td>{type}</td>
                        <td style={{ textAlign: 'right' }}>€ {amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </Window>
  );
};
