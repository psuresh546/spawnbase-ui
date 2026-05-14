export default function StatCard({
    title, value, color = '#3b82f6', icon
}) {
    return (
        <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${color}`,
            minWidth: 160
        }}>
            <div style={{
                fontSize: 13,
                color: '#6b7280',
                marginBottom: 6,
                fontWeight: 500
            }}>
                {icon && <span style={{ marginRight: 6 }}>
                    {icon}
                </span>}
                {title}
            </div>
            <div style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#111827'
            }}>
                {value}
            </div>
        </div>
    );
}