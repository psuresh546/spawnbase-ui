const DB_COLORS = {
    POSTGRESQL: { bg: '#dbeafe', text: '#1e40af', icon: '🐘' },
    MYSQL:      { bg: '#dcfce7', text: '#166534', icon: '🐬' },
    MONGODB:    { bg: '#fef9c3', text: '#854d0e', icon: '🍃' },
};

export default function DbTypeBadge({ dbType }) {
    const style = DB_COLORS[dbType]
        || { bg: '#f3f4f6', text: '#374151', icon: '💾' };
    return (
        <span style={{
            background: style.bg,
            color: style.text,
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600
        }}>
            {style.icon} {dbType}
        </span>
    );
}