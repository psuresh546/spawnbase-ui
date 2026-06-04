import { useState } from 'react';
import { createInstance, transitionState,
         provisionInstance } from '../api/client';

export default function CreateInstanceModal({
    onClose, onCreated
}) {
    const [form, setForm] = useState({
        name: '',
        dbType: 'POSTGRESQL',
        ownerId: 'user-001',
        dbName: '',
        password: '',
        username: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            setError('Name is required');
            return;
        }
        if (form.dbName && !/^[a-z][a-z0-9_]*$/.test(form.dbName)) {
            setError('DB name: lowercase letters, digits, underscores only, must start with a letter');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await createInstance({
                name: form.name,
                dbType: form.dbType,
                ownerId: form.ownerId
            });
            const id = res.data.id;

            await transitionState(id, 'PROVISIONING');

            await provisionInstance(id, form.dbType, {
                password: form.password || undefined,
                dbName: form.dbName || undefined,
                username: form.username || undefined
            });

            onCreated(id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to create instance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                width: 460,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{
                    margin: '0 0 24px',
                    fontSize: 20,
                    fontWeight: 700
                }}>
                    Create Database Instance
                </h2>

                <label style={labelStyle}>Instance Name *</label>
                <input
                    style={inputStyle}
                    placeholder="e.g. my-postgres-db"
                    value={form.name}
                    onChange={e => setForm({
                        ...form, name: e.target.value
                    })}
                />

                <label style={labelStyle}>Database Type</label>
                <select
                    style={inputStyle}
                    value={form.dbType}
                    onChange={e => setForm({
                        ...form, dbType: e.target.value
                    })}
                >
                    <option value="POSTGRESQL">PostgreSQL</option>
                    <option value="MYSQL">MySQL</option>
                    <option value="MONGODB">MongoDB</option>
                </select>

                <label style={labelStyle}>Owner ID</label>
                <input
                    style={inputStyle}
                    value={form.ownerId}
                    onChange={e => setForm({
                        ...form, ownerId: e.target.value
                    })}
                />

                <label style={labelStyle}>
                    Database Name
                    <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                        {' '}(optional — auto-generated if blank)
                    </span>
                </label>
                <input
                    style={inputStyle}
                    placeholder="e.g. myapp_db"
                    value={form.dbName}
                    onChange={e => setForm({
                        ...form, dbName: e.target.value.toLowerCase()
                    })}
                />

                <label style={labelStyle}>
                    Password
                    <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                        {' '}(optional — auto-generated if blank)
                    </span>
                </label>
                <input
                    style={inputStyle}
                    type="password"
                    placeholder="Leave blank to auto-generate"
                    value={form.password}
                    onChange={e => setForm({
                        ...form, password: e.target.value
                    })}
                />

                {error && (
                    <div style={{
                        color: '#dc2626',
                        fontSize: 13,
                        marginBottom: 16,
                        padding: '8px 12px',
                        background: '#fee2e2',
                        borderRadius: 8
                    }}>
                        {error}
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 8
                }}>
                    <button
                        onClick={onClose}
                        style={cancelBtnStyle}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            ...primaryBtnStyle,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading
                                ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading
                            ? 'Creating...'
                            : 'Create & Provision'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6
};

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    marginBottom: 16,
    boxSizing: 'border-box',
    outline: 'none'
};

const cancelBtnStyle = {
    flex: 1,
    padding: '10px 0',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: 'white',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500
};

const primaryBtnStyle = {
    flex: 2,
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontSize: 14,
    fontWeight: 600
};