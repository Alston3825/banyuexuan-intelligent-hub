"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkText = chunkText;
exports.cosineSimilarity = cosineSimilarity;
function chunkText(content, chunkSize = 500) {
    const trimmed = content.trim();
    if (!trimmed)
        return [];
    const chunks = [];
    for (let i = 0; i < trimmed.length; i += chunkSize) {
        chunks.push(trimmed.slice(i, i + chunkSize));
    }
    return chunks;
}
function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
//# sourceMappingURL=chunk-text.util.js.map