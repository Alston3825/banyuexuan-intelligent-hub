"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDocxText = readDocxText;
const xlsx_reader_1 = require("./xlsx-reader");
const decode = (s) => s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');
function paraText(xml) {
    const parts = [];
    const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g;
    let m;
    while ((m = re.exec(xml)))
        parts.push(m[1] !== undefined ? decode(m[1]) : ' ');
    return parts.join('').trim();
}
function readDocxText(buf) {
    const files = (0, xlsx_reader_1.readZip)(buf);
    const doc = files.get('word/document.xml');
    if (!doc)
        throw new Error('不是有效的 Word（.docx）文件');
    const xml = doc.toString('utf8');
    const lines = [];
    const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p[ >][\s\S]*?<\/w:p>/g;
    let m;
    while ((m = re.exec(xml))) {
        const chunk = m[0];
        if (chunk.startsWith('<w:tbl>')) {
            for (const row of chunk.match(/<w:tr[ >][\s\S]*?<\/w:tr>/g) ?? []) {
                const cells = (row.match(/<w:tc>[\s\S]*?<\/w:tc>/g) ?? []).map((c) => (c.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []).map(paraText).filter(Boolean).join(' '));
                if (cells.some(Boolean))
                    lines.push(cells.join(' | '));
            }
        }
        else {
            const t = paraText(chunk);
            if (t)
                lines.push(t);
        }
    }
    return lines.join('\n');
}
//# sourceMappingURL=docx-reader.js.map