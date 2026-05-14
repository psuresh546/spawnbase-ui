import { useState, useEffect, useCallback } from 'react';
import { getDashboard, getInstances } from '../api/client';
import StatCard from '../components/StatCard';
import InstanceTable from '../components/InstanceTable';
import CreateInstanceModal from
    '../components/CreateInstanceModal';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [instances, setInstances] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [filter, setFilter] = useState({
        state: '', dbType: '', page: 0, size: 10
    });
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: filter.page,
                size: filter.size,
                ...(filter.state && { state: filter.state }),
                ...(filter.dbType && { dbType: filter.dbType })
            };
            const [dashRes, instRes] = await Promise.all([
                getDashboard(),
                getInstances(params)
            ]);
            setSummary(dashRes.data);
            setInstances(instRes.data.content);
            setPagination(instRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            fontFamily: '-apple-system, BlinkMacSystemFont,' +
                        '"Segoe UI", sans-serif'
        }}>

            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#111827'
                    }}>
                        🚀 SpawnBase
                    </h1>
                    <div style={{
                        fontSize: 13,
                        color: '#9ca3af',
                        marginTop: 2
                    }}>
                        Database Instance Control Plane
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={fetchData}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: '1px solid #d1d5db',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: 13
                        }}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={() => setShowCreate(true)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#2563eb',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600
                        }}
                    >
                        + New Instance
                    </button>
                </div>
            </div>

            <div style={{ padding: '28px 32px' }}>

                {/* Stat Cards */}
                {summary && (
                    <div style={{
                        display: 'flex',
                        gap: 16,
                        marginBottom: 28,
                        flexWrap: 'wrap'
                    }}>
                        <StatCard
                            title="Total Instances"
                            value={summary.totalInstances}
                            color="#6366f1"
                            icon="📦"
                        />
                        <StatCard
                            title="Running"
                            value={summary.runningInstances}
                            color="#22c55e"
                            icon="✅"
                        />
                        <StatCard
                            title="Provisioning"
                            value={summary.provisioningInstances}
                            color="#3b82f6"
                            icon="⚙️"
                        />
                        <StatCard
                            title="Failed"
                            value={summary.failedInstances}
                            color="#ef4444"
                            icon="❌"
                        />
                        <StatCard
                            title="Stopped"
                            value={summary.stoppedInstances}
                            color="#f59e0b"
                            icon="⏸️"
                        />
                    </div>
                )}

                {/* DB Type Breakdown */}
                {summary?.byDbType && (
                    <div style={{
                        display: 'flex',
                        gap: 16,
                        marginBottom: 28,
                        flexWrap: 'wrap'
                    }}>
                        {Object.entries(summary.byDbType)
                            .map(([type, count]) => (
                            <StatCard
                                key={type}
                                title={type}
                                value={count}
                                color={
                                    type === 'POSTGRESQL'
                                        ? '#3b82f6'
                                    : type === 'MYSQL'
                                        ? '#22c55e'
                                    : '#f59e0b'
                                }
                            />
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <span style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#374151'
                    }}>
                        Filter:
                    </span>

                    <select
                        value={filter.state}
                        onChange={e => setFilter({
                            ...filter,
                            state: e.target.value,
                            page: 0
                        })}
                        style={selectStyle}
                    >
                        <option value="">All States</option>
                        {['REQUESTED', 'PROVISIONING',
                          'RUNNING', 'STOPPED', 'FAILED',
                          'DELETED'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <select
                        value={filter.dbType}
                        onChange={e => setFilter({
                            ...filter,
                            dbType: e.target.value,
                            page: 0
                        })}
                        style={selectStyle}
                    >
                        <option value="">All DB Types</option>
                        <option value="POSTGRESQL">
                            🐘 PostgreSQL
                        </option>
                        <option value="MYSQL">🐬 MySQL</option>
                        <option value="MONGODB">
                            🍃 MongoDB
                        </option>
                    </select>

                    {(filter.state || filter.dbType) && (
                        <button
                            onClick={() => setFilter({
                                state: '',
                                dbType: '',
                                page: 0,
                                size: 10
                            })}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 6,
                                border: '1px solid #d1d5db',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: 13,
                                color: '#6b7280'
                            }}
                        >
                            ✕ Clear
                        </button>
                    )}

                    <span style={{
                        marginLeft: 'auto',
                        fontSize: 13,
                        color: '#9ca3af'
                    }}>
                        {pagination?.totalElements || 0} instances
                        {' · '}Auto-refreshes every 10s
                    </span>
                </div>

                {/* Instance Table */}
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    overflow: 'hidden'
                }}>
                    {loading
                        ? <div style={{
                            textAlign: 'center',
                            padding: 48,
                            color: '#9ca3af'
                          }}>
                            Loading...
                          </div>
                        : <InstanceTable
                            instances={instances} />
                    }

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 8,
                            padding: 16,
                            borderTop: '1px solid #f3f4f6'
                        }}>
                            <button
                                disabled={pagination.first}
                                onClick={() => setFilter({
                                    ...filter,
                                    page: filter.page - 1
                                })}
                                style={pageBtnStyle(
                                    pagination.first)}
                            >
                                ← Prev
                            </button>
                            <span style={{
                                padding: '6px 12px',
                                fontSize: 13,
                                color: '#6b7280'
                            }}>
                                Page {filter.page + 1} of{' '}
                                {pagination.totalPages}
                            </span>
                            <button
                                disabled={pagination.last}
                                onClick={() => setFilter({
                                    ...filter,
                                    page: filter.page + 1
                                })}
                                style={pageBtnStyle(
                                    pagination.last)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showCreate && (
                <CreateInstanceModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => {
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}

const selectStyle = {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 13,
    outline: 'none',
    cursor: 'pointer'
};

const pageBtnStyle = (disabled) => ({
    padding: '6px 16px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: disabled ? '#f9fafb' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13,
    color: disabled ? '#d1d5db' : '#374151'
});