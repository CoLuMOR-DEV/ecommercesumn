import { getDbPool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, vpAmount } = req.body || {};
  if (!userId || !vpAmount || Number(vpAmount) <= 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('UPDATE users SET vp_balance = vp_balance + ? WHERE id = ?', [
      Number(vpAmount),
      Number(userId),
    ]);

    await connection.query(
      `INSERT INTO transactions (user_id, skin_id, action_type, level_purchased, vp_cost, status, detail)
       VALUES (?, NULL, 'TOP_UP', NULL, ?, 'SUCCESS', 'Fake top-up success')`,
      [Number(userId), Number(vpAmount)]
    );

    const [[user]] = await connection.query('SELECT vp_balance FROM users WHERE id = ?', [Number(userId)]);

    await connection.commit();

    return res.status(200).json({ success: true, vpBalance: user?.vp_balance ?? null });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Top-up failed' });
  } finally {
    connection.release();
  }
}
