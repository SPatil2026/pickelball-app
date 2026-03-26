export const fmtTime = (dt: string) => {
    if (!dt) return ''
    if (dt.includes('T')) {
        const d = new Date(dt)
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
    }
    return dt.slice(0, 5)
}

export const fmtDate = (dt: string) => {
    try {
        return new Date(dt).toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        })
    } catch { return dt }
}