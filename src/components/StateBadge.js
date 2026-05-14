const STATE_COLORS = {
    RUNNING:      { bg: '#dcfce7', text: '#15803d' },
    REQUESTED:    { bg: '#f3f4f6', text: '#374151' },
    PROVISIONING: { bg: '#dbeafe', text: '#1d4ed8' },
    STOPPED:      { bg: '#fef9c3', text: '#854d0e' },
    STARTING:     { bg: '#e0f2fe', text: '#0369a1' },
    RESTARTING:   { bg: '#ede9fe', text: '#6d28d9' },
    DELETING:     { bg: '#fee2e2', text: '#991b1b' },
    DELETED:      { bg: '#f3f4f6', text: '#9ca3af' },
    FAILED:       { bg: '#fee2e2', text: '#dc2626' },
};

export default function StateBadge({ state }) {
    const colors = STATE_COLORS[state]
        || { bg: '#f3f4f6', text: '#374151' };
    return (
        <span style={{
            background: colors.bg,
            color: colors.text,
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.3
        }}>
            {state}
        </span>
    );
}