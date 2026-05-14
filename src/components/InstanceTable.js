import { useNavigate } from 'react-router-dom';
import StateBadge from './StateBadge';
import DbTypeBadge from './DbTypeBadge';

export default function InstanceTable({ instances }) {
    const navigate = useNavigate();

    if (!instances || instances.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 48,
                color: '#9ca3af'
            }}>
                No instances found.
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14
            }}>
                <thead>
                    <tr style={{
                        background: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        {['Name', 'DB Type', 'State',
                          'Port', 'Owner', 'Updated']
                            .map(h => (
                            <th key={h} style={{
                                padding: '10px 16px',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: '#374151',
                                fontSize: 13
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {instances.map(inst => (
                        <tr key={inst.id}
                            onClick={() =>
                                navigate(`/instances/${inst.id}`)}
                            style={{
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                transition: 'background 0.1s'
                            }}
                            onMouseEnter={e =>
                                e.currentTarget.style
                                    .background = '#f9fafb'}
                            onMouseLeave={e =>
                                e.currentTarget.style
                                    .background = 'white'}
                        >
                            <td style={{
                                padding: '12px 16px',
                                fontWeight: 500
                            }}>
                                {inst.name}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                                <DbTypeBadge
                                    dbType={inst.dbType} />
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                                <StateBadge
                                    state={inst.state} />
                            </td>
                            <td style={{
                                padding: '12px 16px',
                                color: '#6b7280',
                                fontFamily: 'monospace'
                            }}>
                                {inst.hostPort || '—'}
                            </td>
                            <td style={{
                                padding: '12px 16px',
                                color: '#6b7280'
                            }}>
                                {inst.ownerId}
                            </td>
                            <td style={{
                                padding: '12px 16px',
                                color: '#9ca3af',
                                fontSize: 12
                            }}>
                                {new Date(inst.updatedAt)
                                    .toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}