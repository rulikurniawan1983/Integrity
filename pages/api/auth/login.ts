import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase-server';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  try {
    // Get user from database
    const { data: user, error } = await supabase
      .from('staff_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Verify password
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Password tidak ditemukan' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
}

