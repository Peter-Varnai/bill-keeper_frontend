import React, { useState } from 'react';
import { Select } from './windows98';
import type { DataGroup } from '../api/types';

interface DataGroupSelectorProps {
    groups: DataGroup[];
    selectedDataGroup: number;
    onSelectDataGroup: (groupId: number) => void;
    onAddGroup: (name: string, group_type: 'project' | 'organization') => void;
    onDeleteGroup: (groupId: number) => void;
    isLoading?: boolean;
}

export const DataGroupSelector: React.FC<DataGroupSelectorProps> = ({
    groups,
    selectedDataGroup,
    onSelectDataGroup,
    onAddGroup,
    onDeleteGroup,
    isLoading = false,
}) => {
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'project' | 'organization'>('project');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);

    const handleCreate = () => {
        if (newName.trim()) {
            onAddGroup(newName.trim(), newType);
            setNewName('');
            setShowForm(false);
        }
    };

    const handleCancel = () => {
        setNewName('');
        setShowForm(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* + Button */}
            <button
                onClick={() => setShowForm(true)}
                disabled={isLoading}
                style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#c0c0c0',
                    border: '2px outset #fff',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    minWidth: '32px',
                    height: '100%',
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.border = '2px inset #808080';
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.border = '2px outset #fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px outset #fff';
                }}
            >
                +
            </button>

            {/* Delete Button */}
            <button
                onClick={() => {
                    setGroupToDelete(selectedDataGroup);
                    setShowDeleteConfirm(true);
                }}
                disabled={isLoading || groups.length <= 1}
                title={groups.length <= 1 ? 'Cannot delete the last data group' : 'Delete data group'}
                style={{
                    padding: '6px 10px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: '#c0c0c0',
                    border: '2px outset #fff',
                    cursor: isLoading || groups.length <= 1 ? 'not-allowed' : 'pointer',
                    color: groups.length <= 1 ? '#888' : '#000',
                    height: '100%',
                }}
                onMouseDown={(e) => {
                    if (groups.length > 1 && !isLoading) {
                        e.currentTarget.style.border = '2px inset #808080';
                    }
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.border = '2px outset #fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px outset #fff';
                }}
            >
                🗑
            </button>

            {/* Dropdown */}
            <Select
                value={selectedDataGroup}
                onChange={(value) => onSelectDataGroup(Number(value))}
                options={groups.map((group) => ({
                    value: group.id,
                    label: `${group.name} (${group.type})`,
                }))}
                style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#c0c0c0',
                    border: '2px outset #fff',
                    minWidth: '200px',
                    height: '100%',
                }}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && groupToDelete !== null && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="window"
                        style={{
                            minWidth: '320px',
                            backgroundColor: '#c0c0c0',
                            border: '2px outset #fff',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="title-bar"
                            style={{
                                backgroundColor: '#800000',
                                color: 'white',
                                padding: '4px 8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div className="title-bar-text" style={{ fontWeight: 'bold' }}>
                                Confirm Delete
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    backgroundColor: '#c0c0c0',
                                    border: '2px outset #fff',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="window-body" style={{ padding: '16px' }}>
                            <div style={{ marginBottom: '16px', fontSize: '14px' }}>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>Warning:</strong> This will permanently delete this data group and ALL related data including:
                                </p>
                                <ul style={{ marginLeft: '20px', fontSize: '12px' }}>
                                    <li>All expenses</li>
                                    <li>All bills</li>
                                    <li>All application reports</li>
                                    <li>Utility data</li>
                                    <li>All uploaded files</li>
                                </ul>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '12px',
                                        backgroundColor: '#c0c0c0',
                                        border: '2px outset #fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onDeleteGroup(groupToDelete);
                                        setShowDeleteConfirm(false);
                                        setGroupToDelete(null);
                                    }}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '12px',
                                        backgroundColor: '#c0c0c0',
                                        border: '2px outset #fff',
                                        cursor: 'pointer',
                                        color: '#800000',
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.border = '2px inset #808080';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.border = '2px outset #fff';
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Group Form Modal */}
            {showForm && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}
                    onClick={handleCancel}
                >
                    <div
                        className="window"
                        style={{
                            minWidth: '300px',
                            backgroundColor: '#c0c0c0',
                            border: '2px outset #fff',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="title-bar"
                            style={{
                                backgroundColor: '#000080',
                                color: 'white',
                                padding: '4px 8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div className="title-bar-text" style={{ fontWeight: 'bold' }}>
                                Add New Data Group
                            </div>
                            <button
                                onClick={handleCancel}
                                style={{
                                    backgroundColor: '#c0c0c0',
                                    border: '2px outset #fff',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="window-body" style={{ padding: '16px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                                    Name:
                                </label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter group name"
                                    style={{
                                        width: '100%',
                                        padding: '4px 8px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        border: '2px inset #c0c0c0',
                                        height: '28px',
                                    }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreate();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
                                    Type:
                                </label>
                                <div className="field-row">
                                    <input
                                        id="radio-organization"
                                        type="radio"
                                        name="groupType"
                                        value="organization"
                                        checked={newType === 'organization'}
                                        onChange={() => setNewType('organization')}
                                    />
                                    <label htmlFor="radio-organization">Organization</label>
                                </div>
                                <div className="field-row">
                                    <input
                                        id="radio-project"
                                        type="radio"
                                        name="groupType"
                                        value="project"
                                        checked={newType === 'project'}
                                        onChange={() => setNewType('project')}
                                    />
                                    <label htmlFor="radio-project">Project</label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleCancel}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '12px',
                                        backgroundColor: '#c0c0c0',
                                        border: '2px outset #fff',
                                        cursor: 'pointer',
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.border = '2px inset #808080';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.border = '2px outset #fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.border = '2px outset #fff';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newName.trim()}
                                    style={{
                                        padding: '6px 16px',
                                        fontSize: '12px',
                                        backgroundColor: '#c0c0c0',
                                        border: '2px outset #fff',
                                        cursor: newName.trim() ? 'pointer' : 'not-allowed',
                                        opacity: newName.trim() ? 1 : 0.6,
                                    }}
                                    onMouseDown={(e) => {
                                        if (newName.trim()) {
                                            e.currentTarget.style.border = '2px inset #808080';
                                        }
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.border = '2px outset #fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.border = '2px outset #fff';
                                    }}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
