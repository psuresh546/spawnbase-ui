const EVENT_ICONS = {
    INSTANCE_CREATED:   '🌱',
    PROVISIONING_STARTED: '⚙️',
    INSTANCE_RUNNING:   '✅',
    INSTANCE_STOPPED:   '⏸️',
    INSTANCE_FAILED:    '❌',
    INSTANCE_DELETED:   '🗑️',
    DRIFT_DETECTED:     '⚠️',
    STATE_CHANGED:      '🔄',
};

export default function EventLog({ events }) {
    if (!events || events.length === 0) {
        return (
            <div style={{ color: '#9ca3af', padding: 16 }}>
                No events yet.
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            {events.map((ev, i) => (
                <div key={ev.id} style={{
                    display: 'flex',
                    gap: 16,
                    marginBottom: 20,
                    position: 'relative'
                }}>
                    {/* Timeline line */}
                    {i < events.length - 1 && (
                        <div style={{
                            position: 'absolute',
                            left: 19,
                            top: 36,
                            width: 2,
                            height: 'calc(100% + 4px)',
                            background: '#e5e7eb'
                        }} />
                    )}

                    {/* Icon */}
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                        zIndex: 1
                    }}>
                        {EVENT_ICONS[ev.eventType] || '📋'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingTop: 4 }}>
                        <div style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#111827',
                            marginBottom: 2
                        }}>
                            {ev.eventType.replace(/_/g, ' ')}
                        </div>
                        <div style={{
                            fontSize: 13,
                            color: '#6b7280',
                            marginBottom: 4
                        }}>
                            {ev.message}
                        </div>
                        {ev.previousState && (
                            <div style={{
                                fontSize: 12,
                                color: '#9ca3af'
                            }}>
                                {ev.previousState} → {ev.newState}
                            </div>
                        )}
                        <div style={{
                            fontSize: 11,
                            color: '#d1d5db',
                            marginTop: 4
                        }}>
                            {new Date(ev.occurredAt)
                                .toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}