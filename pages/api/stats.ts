import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseServerClient();

    // Get stats
    const [consultationsResult, contentResult, usersResult] = await Promise.all([
      supabase.from('consultations').select('id', { count: 'exact', head: true }),
      supabase.from('educational_content').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('public_users').select('id', { count: 'exact', head: true })
    ]);

    return res.status(200).json({
      consultations: consultationsResult.count || 0,
      articles: contentResult.count || 0,
      users: usersResult.count || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      consultations: 0,
      articles: 0,
      users: 0
    });
  }
}

