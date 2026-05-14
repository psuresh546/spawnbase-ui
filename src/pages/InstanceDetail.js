import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInstance, getEvents,
         getCredentials, recoverInstance }
    from '../api/client';
import StateBadge from '../components/StateBadge';
import DbTypeBadge from '../components/DbTypeBadge';
import EventLog from '../components/EventLog';

export default function InstanceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instance, setInstance] = useState(null);
    const [events, setEvents] = useState([]);
    const [credentials, setCredentials] = useState(null);
    const [showCreds, setShowCreds] = useState(false);
    const [recovering, setRecovering] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [instRes, evRes] = await Promise.all([
                    getInstance(id),
                    getEvents(id)
                ]);
                setInstance(instRes.data);
                setEvents(evRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetch();
        const interval = setInterval(fetch, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const handleShowCreds = async () => {
        if (credentials) {
            setShowCreds(!showCreds);
            return;
        }
        try {
            const res = await getCredentials(id);
            setCredentials(res.data);
            setShowCreds(true);
        } catch {
            alert('No credentials found for this instance.');
        }
    };

    const handleRecover = async () => {
        setRecovering(true);
        try {
            await recoverInstance(id);
            const res = await getInstance(id);
            setInstance(res.data);
        } catch (err) {
            alert(err.response?.data?.message
                || 'Recovery failed');
        } finally {
            setRecovering(false);
        }
    };

    if (!instance) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: '#9ca3af',
            fontFamily: 'sans-serif'
        }}>
            Loading...
        </div>
    );

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
                gap: 16
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 20,
                        color: '#6b7280'
                    }}
                >
                    ←
                </button>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 700
                    }}>
                        {instance.name}
                    </h1>
                    <div style={{
                        fontSize: 12,
                        color: '#9ca3af',
                        marginTop: 2,
                        fontFamily: 'monospace'
                    }}>
                        {instance.id}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto',
                    display: 'flex', gap: 8 }}>
                    <StateBadge state={instance.state} />
                    <DbTypeBadge dbType={instance.dbType} />
                </div>
            </div>

            <div style={{
                padding: '28px 32px',
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: 24
            }}>
                {/* Left — Details */}
                <div style={{ display: 'flex',
                    flexDirection: 'column', gap: 20 }}>

                    {/* Info Card */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>
                            Instance Details
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16
                        }}>
                            {[
                                ['Owner', instance.ownerId],
                                ['Host Port',
                                    instance.hostPort || '—'],
                                ['Created',
                                    new Date(instance.createdAt)
                                        .toLocaleString()],
                                ['Updated',
                                    new Date(instance.updatedAt)
                                        .toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <div style={{
                                        fontSize: 12,
                                        color: '#9ca3af',
                                        marginBottom: 4
                                    }}>
                                        {label}
                                    </div>
                                    <div style={{
                                        fontWeight: 500,
                                        fontSize: 14
                                    }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {instance.containerId && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{
                                    fontSize: 12,
                                    color: '#9ca3af',
                                    marginBottom: 4
                                }}>
                                    Container ID
                                </div>
                                <div style={{
                                    fontFamily: 'monospace',
                                    fontSize: 12,
                                    color: '#374151',
                                    background: '#f9fafb',
                                    padding: '6px 10px',
                                    borderRadius: 6
                                }}>
                                    {instance.containerId
                                        .substring(0, 24)}...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Actions</h3>
                        <div style={{
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap'
                        }}>
                            {instance.state === 'RUNNING' && (
                                <button
                                    onClick={handleShowCreds}
                                    style={actionBtnStyle(
                                        '#2563eb')}
                                >
                                    {showCreds ? '🔒 Hide' :
                                        '🔑 Show'} Credentials
                                </button>
                            )}
                            {instance.state === 'FAILED' && (
                                <button
                                    onClick={handleRecover}
                                    disabled={recovering}
                                    style={actionBtnStyle(
                                        '#16a34a')}
                                >
                                    {recovering
                                        ? 'Recovering...'
                                        : '🔄 Recover Instance'}
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/')}
                                style={actionBtnStyle('#6b7280')}
                            >
                                ← Back to Dashboard
                            </button>
                        </div>

                        {/* Credentials panel */}
                        {showCreds && credentials && (
                            <div style={{
                                marginTop: 16,
                                background: '#f0fdf4',
                                borderRadius: 10,
                                padding: 16,
                                border: '1px solid #bbf7d0'
                            }}>
                                <div style={{
                                    fontWeight: 600,
                                    marginBottom: 12,
                                    color: '#166534'
                                }}>
                                    🔑 Connection Details
                                </div>
                                {[
                                    ['Username',
                                        credentials.username],
                                    ['Password',
                                        credentials.password],
                                    ['Host Port',
                                        credentials.hostPort],
                                    ['Database',
                                        credentials.dbName],
                                    ['Connection URL',
                                        credentials.connectionUrl],
                                ].map(([label, value]) => (
                                    <div key={label}
                                        style={{
                                            marginBottom: 8
                                        }}>
                                        <span style={{
                                            fontSize: 12,
                                            color: '#6b7280',
                                            marginRight: 8
                                        }}>
                                            {label}:
                                        </span>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: '#166534'
                                        }}>
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Event Log */}
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>
                        📋 Event History
                    </h3>
                    <EventLog events={events} />
                </div>
            </div>
        </div>
    );
}

const cardStyle = {
    background: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};

const cardTitleStyle = {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 700,
    color: '#111827'
};

const actionBtnStyle = (color) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: color,
    color: 'white',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600
});