/**
 * Vercel Serverless Function: Health Check
 * Endpoint: /api/health
 */

export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    service: 'PrayogaProof API',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    capabilities: ['rubric-validation', 'anti-cheat-xp', 'multi-tenant-sync'],
  });
}
