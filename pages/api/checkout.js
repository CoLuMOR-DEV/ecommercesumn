import { getDbPool } from '../../lib/db';

/**
 * POST /api/checkout
 * body: { userId: number, itemId: number, vpCost: number }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, itemId, vpCost } = req.body || {};

  if (!userId || !itemId || !vpCost || Number(vpCost) <= 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const pool = getDbPool();

  try {
    // mysql2 returns each result-set entry for CALL in nested arrays
    const [rows] = await pool.query('CALL ProcessFakeCheckout(?, ?, ?)', [
      Number(userId),
      Number(itemId),
      Number(vpCost),
    ]);

    const result = rows?.[0]?.[0] || {
      checkout_status: 'FAILED',
      message: 'No checkout response from procedure.',
      remaining_vp: null,
    };

    const ok = result.checkout_status === 'SUCCESS';

    return res.status(ok ? 200 : 402).json({
      success: ok,
      status: result.checkout_status,
      message: result.message,
      remainingVp: result.remaining_vp,
    });
  } catch (error) {
    console.error('[checkout] error:', error);
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      message: 'Checkout failed unexpectedly.',
    });
  }
}
