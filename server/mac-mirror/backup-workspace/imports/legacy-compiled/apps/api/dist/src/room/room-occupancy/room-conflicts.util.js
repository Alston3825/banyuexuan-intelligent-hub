"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brief = void 0;
exports.overlapsWithBuffer = overlapsWithBuffer;
exports.computeConflicts = computeConflicts;
const DAY = 86400_000;
const brief = (o) => ({
    id: o.id,
    occupancyNo: o.occupancyNo,
    customerName: o.customerName,
    status: o.status,
    plannedCheckIn: o.plannedCheckIn,
    plannedCheckOut: o.plannedCheckOut,
    priority: o.contractId && o.contractStatus === 'ACTIVE' ? 'SIGNED' : 'INTENT',
});
exports.brief = brief;
function overlapsWithBuffer(aIn, aOut, bIn, bOut, bufferDays) {
    const buf = bufferDays * DAY;
    return aIn.getTime() < bOut.getTime() + buf && bIn.getTime() < aOut.getTime() + buf;
}
function computeConflicts(rows, bufferDays, now = new Date()) {
    const byRoom = new Map();
    for (const r of rows)
        byRoom.set(r.roomId, [...(byRoom.get(r.roomId) ?? []), r]);
    const out = [];
    for (const list of byRoom.values()) {
        const sorted = [...list].sort((x, y) => x.plannedCheckIn.getTime() - y.plannedCheckIn.getTime());
        for (let i = 0; i < sorted.length; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                const a = sorted[i];
                const b = sorted[j];
                if (!overlapsWithBuffer(a.plannedCheckIn, a.plannedCheckOut, b.plannedCheckIn, b.plannedCheckOut, bufferDays))
                    continue;
                const start = Math.max(a.plannedCheckIn.getTime(), b.plannedCheckIn.getTime());
                const end = Math.min(a.plannedCheckOut.getTime(), b.plannedCheckOut.getTime());
                const overlapDays = Math.max(0, Math.round((end - start) / DAY));
                const ba = (0, exports.brief)(a);
                const bb = (0, exports.brief)(b);
                let suggest = bb.id;
                if (a.status === 'CHECKED_IN' && b.status !== 'CHECKED_IN')
                    suggest = bb.id;
                else if (b.status === 'CHECKED_IN' && a.status !== 'CHECKED_IN')
                    suggest = ba.id;
                else if (ba.priority !== bb.priority)
                    suggest = ba.priority === 'INTENT' ? ba.id : bb.id;
                else
                    suggest = a.createdAt.getTime() > b.createdAt.getTime() ? ba.id : bb.id;
                out.push({
                    roomId: a.roomId,
                    roomNo: a.roomNo,
                    a: ba,
                    b: bb,
                    overlapDays,
                    bufferOnly: overlapDays === 0,
                    startsInDays: Math.ceil((start - now.getTime()) / DAY),
                    suggestId: suggest,
                });
            }
        }
    }
    return out.sort((x, y) => x.startsInDays - y.startsInDays);
}
//# sourceMappingURL=room-conflicts.util.js.map