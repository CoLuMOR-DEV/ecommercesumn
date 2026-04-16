import { getDbPool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.cookies?.admin_auth !== '1') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT id, user_id, skin_id, action_type, level_purchased, vp_cost, status, created_at
     FROM transactions
     ORDER BY created_at DESC
     LIMIT 500`
  );

  return res.status(200).json({ transactions: rows });
}
