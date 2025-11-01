import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  category: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  view_count: number;
  like_count: number;
  published_at: string | null;
  created_at: string;
  tags: string[] | null;
  author?: {
    full_name: string;
    role: string;
  };
}

const contentTypes = {
  article: { label: 'Artikel', icon: '📖', color: 'from-blue-500 to-cyan-500' },
  video: { label: 'Video', icon: '🎥', color: 'from-purple-500 to-pink-500' },
  infographic: { label: 'Infografik', icon: '📊', color: 'from-green-500 to-emerald-500' },
  faq: { label: 'FAQ', icon: '❓', color: 'from-indigo-500 to-blue-500' },
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article?.id) {
      incrementViewCount();
    }
  }, [article?.id]);

  const loadArticle = async () => {
    if (!slug || typeof slug !== 'string') return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .select(`
          id,
          title,
          slug,
          content_type,
          category,
          content,
          excerpt,
          thumbnail_url,
          video_url,
          view_count,
          like_count,
          published_at,
          created_at,
          tags,
          staff_users!educational_content_author_id_fkey(full_name, role)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      // Handle staff_users which might be an array or single object
      const staffUserData = data.staff_users;
      const staffUser = Array.isArray(staffUserData) 
        ? (staffUserData[0] as { full_name: string; role: string } | undefined)
        : (staffUserData as { full_name: string; role: string } | null | undefined);
      
      const formatted = {
        ...data,
        author: staffUser ? { full_name: staffUser.full_name, role: staffUser.role } : undefined,
      };

      setArticle(formatted as Article);
    } catch (error: any) {
      console.error('Error loading article:', error);
      if (error.code === 'PGRST116') {
        // Not found
        router.push('/edukasi');
      }
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!article?.id) return;
    try {
      await supabase
        .from('educational_content')
        .update({ view_count: article.view_count + 1 })
        .eq('id', article.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async () => {
    if (!article?.id || liked) return;
    
    setLiked(true);
    try {
      const newLikeCount = article.like_count + 1;
      await supabase
        .from('educational_content')
        .update({ like_count: newLikeCount })
        .eq('id', article.id);
      
      setArticle({ ...article, like_count: newLikeCount });
    } catch (error) {
      console.error('Error liking article:', error);
      setLiked(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Artikel Tidak Ditemukan</h2>
          <Link href="/edukasi" className="text-blue-600 hover:underline">
            Kembali ke halaman edukasi
          </Link>
        </div>
      </div>
    );
  }

  const contentType = contentTypes[article.content_type as keyof typeof contentTypes] || contentTypes.article;

  return (
    <>
      <Head>
        <title>{article.title} - SLIDER Edukasi</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl p-2.5 shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SLIDER</h1>
                </div>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link href="/edukasi" className="text-white font-medium transition border-b-2 border-white">Edukasi</Link>
                <Link href="/konsultasi" className="text-gray-300 hover:text-white font-medium transition">Konsultasi</Link>
                <Link href="/layanan" className="text-gray-300 hover:text-white font-medium transition">Layanan</Link>
                <Link href="/layanan-rekomendasi" className="text-gray-300 hover:text-white font-medium transition">Layanan Rekomendasi</Link>
              </nav>
              <div className="flex gap-3">
                <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:shadow-lg transition">Login</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/edukasi" className="text-blue-600 hover:underline mb-6 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Edukasi
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${contentType.color} text-white font-semibold flex items-center gap-1`}>
                <span>{contentType.icon}</span>
                {contentType.label}
              </span>
              <span className="text-sm text-gray-600 px-3 py-1 rounded-full bg-gray-100">
                {article.category.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-4">{article.title}</h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
            )}

            <div className="flex items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
              {article.author && (
                <div>
                  <span className="font-semibold text-gray-800">{article.author.full_name}</span>
                  {article.author.role && <span className="text-gray-500 ml-2">• {article.author.role}</span>}
                </div>
              )}
              {article.published_at && (
                <span>{formatDate(article.published_at)}</span>
              )}
              <div className="flex items-center gap-4 ml-auto">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article.view_count}
                </span>
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={`flex items-center gap-1 ${liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'} transition`}
                >
                  <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {article.like_count}
                </button>
              </div>
            </div>
          </div>

          {/* Thumbnail/Video */}
          {article.thumbnail_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {article.video_url && article.content_type === 'video' && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <iframe
                  src={article.video_url}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Tags:</span>
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share/Back */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <Link href="/edukasi" className="text-blue-600 hover:underline inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Artikel
            </Link>
          </div>
        </article>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">SLIDER</h4>
                <p className="text-gray-400 text-sm">
                  Sistem Layanan Integrasi Data Edukasi Realtime
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Layanan</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/konsultasi" className="hover:text-white transition">Konsultasi Online</Link></li>
                  <li><Link href="/layanan" className="hover:text-white transition">Layanan Klinik</Link></li>
                  <li><Link href="/edukasi" className="hover:text-white transition">Edukasi</Link></li>
                  <li><Link href="/layanan-rekomendasi" className="hover:text-white transition">Layanan Rekomendasi</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Informasi</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/tentang" className="hover:text-white transition">Tentang Kami</Link></li>
                  <li><Link href="/kontak" className="hover:text-white transition">Kontak</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                  <li><Link href="/bantuan" className="hover:text-white transition">Bantuan</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Kontak</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>📞 (021) 8765311</li>
                  <li>✉️ diskanak@bogorkab.go.id</li>
                  <li>📍 Jl. Bersih, Kel Tengah, Kec Cibinong, Kab. Bogor, Prov. Jawa Barat</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              © 2024 SLIDER. All rights reserved.<br />
              <span className="mt-2 block">Copyright © Ruli Kurniawan, S.Pt</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

