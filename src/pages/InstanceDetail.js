import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getInstance, getEvents, getCredentials,
    recoverInstance, stopInstance, startInstance,
    restartInstance, deleteInstance,
    transitionState, provisionInstance
} from '../api/client';
import StateBadge from '../components/StateBadge';
import DbTypeBadge from '../components/DbTypeBadge';
import EventLog from '../components/EventLog';

const getCliCommand = (creds, dbType) => {
    const encodePassword = (pwd) =>
        encodeURIComponent(pwd);

    switch(dbType) {
        case 'POSTGRESQL':
            return `psql -h localhost -p ${creds.hostPort} -U ${creds.username} -d ${creds.dbName}`;
        case 'MYSQL':
            return `mysql -h 127.0.0.1 -P ${creds.hostPort} -u ${creds.username} ${creds.dbName} -p`;
        case 'MONGODB':
            return `mongosh "mongodb://${creds.username}:${encodePassword(creds.password)}@localhost:${creds.hostPort}/${creds.dbName}"`;
        default:
            return `# Connect to ${dbType} on port ${creds.hostPort}`;
    }
};

const getCliLabel = (dbType) => {
    switch (dbType) {
        case 'POSTGRESQL': return 'psql CLI';
        case 'MYSQL':      return 'mysql CLI';
        case 'MONGODB':    return 'mongosh CLI';
        default:           return 'CLI Command';
    }
};

const getUrlLabel = (dbType) => {
    switch (dbType) {
        case 'MONGODB': return 'Connection String';
        default:        return 'JDBC URL';
    }
};

function PasswordField({ value }) {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                fontFamily: 'monospace', fontSize: 13,
                fontWeight: 600, color: '#166534',
                background: '#f0fdf4', padding: '6px 10px',
                borderRadius: 6, flex: 1, wordBreak: 'break-all'
            }}>
                {visible ? value : '••••••••••••••••'}
            </div>
            <button onClick={() => setVisible(!visible)} style={smallBtnStyle}>
                {visible ? 'Hide' : 'Show'}
            </button>
            <button onClick={copy} style={smallBtnStyle}>
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
}

function CopyField({ value }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
                fontFamily: 'monospace', fontSize: 12,
                color: '#166534', background: '#f0fdf4',
                padding: '6px 10px', borderRadius: 6,
                flex: 1, wordBreak: 'break-all'
            }}>
                {value}
            </div>
            <button onClick={copy} style={smallBtnStyle}>
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
}

export default function InstanceDetail({ onLogout }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instance, setInstance] = useState(null);
    const [events, setEvents] = useState([]);
    const [credentials, setCredentials] = useState(null);
    const [showCreds, setShowCreds] = useState(false);
    const [recovering, setRecovering] = useState(false);
    const [recovered, setRecovered] = useState(false);
    const [stopping, setStopping] = useState(false);
    const [starting, setStarting] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [actionMsg, setActionMsg] = useState('');

    const fetchData = async () => {
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

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [id]);

    const handleShowCreds = async () => {
        if (credentials) { setShowCreds(!showCreds); return; }
        try {
            const res = await getCredentials(id);
            setCredentials(res.data);
            setShowCreds(true);
        } catch {
            alert('No credentials found.');
        }
    };

    const handleRecover = async () => {
        setRecovering(true);
        try {
            await recoverInstance(id);
            await fetchData();
            setRecovered(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Recovery failed');
        } finally { setRecovering(false); }
    };

    const handleReprovision = async () => {
        setActionMsg('Re-provisioning...');
        try {
            await transitionState(id, 'PROVISIONING');
            await provisionInstance(id, instance.dbType);
            setRecovered(false);
            setActionMsg('Provisioning started — polling for RUNNING');
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Provision failed');
            setActionMsg('');
        }
    };

    const handleStop = async () => {
        setStopping(true);
        setActionMsg('Stopping...');
        try {
            await stopInstance(id, instance.containerId);
            setActionMsg('Stop initiated — polling for STOPPED state');
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Stop failed');
            setActionMsg('');
        } finally { setStopping(false); }
    };

    const handleStart = async () => {
        setStarting(true);
        setActionMsg('Starting...');
        try {
            await startInstance(id, instance.containerId, instance.dbType);
            setActionMsg('Start initiated — polling for RUNNING state');
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Start failed');
            setActionMsg('');
        } finally { setStarting(false); }
    };

    const handleRestart = async () => {
        setRestarting(true);
        setActionMsg('Restarting...');
        try {
            await restartInstance(id, instance.containerId);
            setActionMsg('Restart initiated — polling for RUNNING state');
            await fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Restart failed');
            setActionMsg('');
        } finally { setRestarting(false); }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${instance.name}"?\n\nThis will permanently remove the container and all credentials. This cannot be undone.`
        );
        if (!confirmed) return;

        setDeleting(true);
        setActionMsg('Deleting...');
        try {
            await deleteInstance(id, instance.containerId);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed');
            setActionMsg('');
            setDeleting(false);
        }
    };

    if (!instance) return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '100vh',
            color: '#9ca3af', fontFamily: 'sans-serif'
        }}>
            Loading...
        </div>
    );

    const isRunning = instance.state === 'RUNNING';
    const isStopped = instance.state === 'STOPPED';
    const isFailed  = instance.state === 'FAILED';
    const canAct    = !stopping && !starting && !restarting && !deleting;

    return (
        <div style={{
            minHeight: '100vh', background: '#f8fafc',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '16px 32px',
                display: 'flex', alignItems: 'center', gap: 16
            }}>
                <button onClick={() => navigate('/')} style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 20, color: '#6b7280'
                }}>←</button>
                <div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                        {instance.name}
                    </h1>
                    <div style={{
                        fontSize: 12, color: '#9ca3af',
                        marginTop: 2, fontFamily: 'monospace'
                    }}>
                        {instance.id}
                    </div>
                </div>
                <div style={{
                    marginLeft: 'auto',
                    display: 'flex', gap: 8, alignItems: 'center'
                }}>
                    <StateBadge state={instance.state} />
                    <DbTypeBadge dbType={instance.dbType} />
                    <button onClick={onLogout} style={{
                        marginLeft: 8, padding: '6px 14px',
                        borderRadius: 8, border: '1px solid #fca5a5',
                        background: 'white', color: '#ef4444',
                        cursor: 'pointer', fontSize: 13, fontWeight: 500
                    }}>
                        Sign out
                    </button>
                </div>
            </div>

            <div style={{
                padding: '28px 32px',
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: 24
            }}>
                {/* Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Info card */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Instance Details</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr', gap: 16
                        }}>
                            {[
                                ['Owner', instance.ownerId],
                                ['Host Port', instance.hostPort || '—'],
                                ['Created', new Date(instance.createdAt).toLocaleString()],
                                ['Updated', new Date(instance.updatedAt).toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <div style={{
                                        fontSize: 12, color: '#9ca3af', marginBottom: 4
                                    }}>{label}</div>
                                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {instance.containerId && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{
                                    fontSize: 12, color: '#9ca3af', marginBottom: 4
                                }}>Container ID</div>
                                <div style={{
                                    fontFamily: 'monospace', fontSize: 12,
                                    color: '#374151', background: '#f9fafb',
                                    padding: '6px 10px', borderRadius: 6
                                }}>
                                    {instance.containerId.substring(0, 24)}...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={cardStyle}>
                        <h3 style={cardTitleStyle}>Actions</h3>

                        {actionMsg && (
                            <div style={{
                                marginBottom: 12, padding: '8px 12px',
                                background: '#eff6ff', borderRadius: 8,
                                fontSize: 13, color: '#1d4ed8'
                            }}>
                                {actionMsg}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {isRunning && (
                                <button onClick={handleShowCreds} style={actionBtnStyle('#2563eb')}>
                                    {showCreds ? 'Hide Credentials' : 'Show Credentials'}
                                </button>
                            )}
                            {isRunning && (
                                <button onClick={handleStop} disabled={!canAct} style={actionBtnStyle('#f59e0b', !canAct)}>
                                    {stopping ? 'Stopping...' : 'Stop'}
                                </button>
                            )}
                            {isStopped && (
                                <button onClick={handleStart} disabled={!canAct} style={actionBtnStyle('#16a34a', !canAct)}>
                                    {starting ? 'Starting...' : 'Start'}
                                </button>
                            )}
                            {isRunning && (
                                <button onClick={handleRestart} disabled={!canAct} style={actionBtnStyle('#7c3aed', !canAct)}>
                                    {restarting ? 'Restarting...' : 'Restart'}
                                </button>
                            )}
                            {isFailed && (
                                <button onClick={handleRecover} disabled={recovering} style={actionBtnStyle('#16a34a', recovering)}>
                                    {recovering ? 'Recovering...' : 'Recover'}
                                </button>
                            )}
                            {(instance.state === 'REQUESTED' || recovered) && (
                                <button
                                    onClick={handleReprovision}
                                    style={actionBtnStyle('#2563eb')}
                                >
                                    Provision
                                </button>
                            )}
                            <button onClick={handleDelete} disabled={!canAct} style={actionBtnStyle('#dc2626', !canAct)}>
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button onClick={() => navigate('/')} style={actionBtnStyle('#6b7280')}>
                                Back to Dashboard
                            </button>
                        </div>

                        {/* Credentials panel */}
                        {showCreds && credentials && (
                            <div style={{
                                marginTop: 16, background: '#f0fdf4',
                                borderRadius: 10, padding: 16,
                                border: '1px solid #bbf7d0'
                            }}>
                                <div style={{
                                    fontWeight: 600, marginBottom: 16,
                                    color: '#166534', fontSize: 15
                                }}>
                                    Connection Details
                                </div>

                                {[
                                    { label: 'Username', value: credentials.username },
                                    { label: 'Database', value: credentials.dbName },
                                    { label: 'Host Port', value: String(credentials.hostPort) },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ marginBottom: 12 }}>
                                        <div style={{
                                            fontSize: 12, color: '#6b7280',
                                            marginBottom: 4, fontWeight: 500
                                        }}>
                                            {label}
                                        </div>
                                        <CopyField value={value} />
                                    </div>
                                ))}

                                <div style={{ marginBottom: 12 }}>
                                    <div style={{
                                        fontSize: 12, color: '#6b7280',
                                        marginBottom: 4, fontWeight: 500
                                    }}>
                                        Password
                                    </div>
                                    <PasswordField value={credentials.password} />
                                </div>

                                <div style={{ marginBottom: 12 }}>
                                    <div style={{
                                        fontSize: 12, color: '#6b7280',
                                        marginBottom: 4, fontWeight: 500
                                    }}>
                                        {getCliLabel(instance.dbType)}
                                    </div>
                                    <CopyField value={getCliCommand(credentials, instance.dbType)} />
                                </div>

                                <div style={{ marginBottom: 4 }}>
                                    <div style={{
                                        fontSize: 12, color: '#6b7280',
                                        marginBottom: 4, fontWeight: 500
                                    }}>
                                        {getUrlLabel(instance.dbType)}
                                    </div>
                                    <CopyField value={credentials.connectionUrl} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Event Log */}
                <div style={cardStyle}>
                    <h3 style={cardTitleStyle}>Event History</h3>
                    <EventLog events={events} />
                </div>
            </div>
        </div>
    );
}

const cardStyle = {
    background: 'white', borderRadius: 12,
    padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};

const cardTitleStyle = {
    margin: '0 0 16px', fontSize: 16,
    fontWeight: 700, color: '#111827'
};

const smallBtnStyle = {
    padding: '5px 10px', borderRadius: 6,
    border: '1px solid #d1d5db', background: 'white',
    cursor: 'pointer', fontSize: 12, color: '#374151',
    whiteSpace: 'nowrap'
};

const actionBtnStyle = (color, disabled = false) => ({
    padding: '8px 16px', borderRadius: 8,
    border: 'none', background: disabled ? '#e5e7eb' : color,
    color: disabled ? '#9ca3af' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 13, fontWeight: 600
});