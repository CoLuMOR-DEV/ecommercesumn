export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.setHeader('Set-Cookie', 'admin_auth=1; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax');
  return res.status(200).json({ success: true });
}
