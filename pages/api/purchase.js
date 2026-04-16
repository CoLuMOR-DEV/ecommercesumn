import { getDbPool } from '../../lib/db';

/**
 * POST /api/purchase
 * body: { userId:number, skinId:string, level:number, vpCost:number }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, skinId, level, vpCost } = req.body || {};

  if (!userId || !skinId || !level || vpCost === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const pool = getDbPool();

  try {
    const [rows] = await pool.query('CALL ProcessUpgradePurchase(?, ?, ?, ?)', [
      Number(userId),
      String(skinId),
      Number(level),
      Number(vpCost),
    ]);

    const payload = rows?.[0]?.[0];

    if (!payload) {
      return res.status(500).json({ success: false, message: 'No procedure response.' });
    }

    const ok = payload.status === 'SUCCESS';

    return res.status(ok ? 200 : 402).json({
      success: ok,
      ...payload,
    });
  } catch (error) {
    console.error('[purchase] error', error);
    return res.status(500).json({
      success: false,
      message: error?.sqlMessage || 'Upgrade purchase failed',
    });
  }
}
