import { sanitizeAnalysis } from './services/aiService.js';

console.log('--- Case 1: valid client payload ---');
console.log(sanitizeAnalysis({
  analysisStatus: 'completed',
  verifiedCategory: 'Infrastructure',
  severity: 'High',
  severityScore: 82,
  summary: 'A large pothole spans most of the road lane.',
}));

console.log('--- Case 2: forged/malformed values get clamped ---');
console.log(sanitizeAnalysis({
  analysisStatus: 'completed',
  verifiedCategory: 'Hacked Category',
  severity: 'Catastrophic',
  severityScore: 9999,
  summary: 12345,
}));

console.log('--- Case 3: failed / missing payload ---');
console.log(sanitizeAnalysis({ analysisStatus: 'failed' }));
console.log(sanitizeAnalysis(null));
