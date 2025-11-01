import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  category: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  published_at: string | null;
  created_at: string;
  tags: string[] | null;
  author?: {
    full_name: string;
  };
}


const contentTypes = {
  article: { label: 'Artikel', icon: '📖', color: 'from-blue-500 to-cyan-500' },
  video: { label: 'Video', icon: '🎥', color: 'from-purple-500 to-pink-500' },
  infographic: { label: 'Infografik', icon: '📊', color: 'from-green-500 to-emerald-500' },
  faq: { label: 'FAQ', icon: '❓', color: 'from-indigo-500 to-blue-500' },
};

export default function EdukasiPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('kesehatan_hewan');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('educational_content')
        .select(`
          id,
          title,
          slug,
          content_type,
          category,
          excerpt,
          thumbnail_url,
          view_count,
          like_count,
          published_at,
          created_at,
          tags,
          staff_users!educational_content_author_id_fkey(full_name)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const formatted = (data || []).map((item: any) => ({
        ...item,
        author: item.staff_users ? { full_name: item.staff_users.full_name } : undefined,
      }));

      setArticles(formatted);
    } catch (error: any) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles();
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

  const filteredArticles = articles.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.excerpt?.toLowerCase().includes(query) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <Head>
        <title>Artikel Kesehatan Hewan - SLIDER | Dinas Perikanan dan Peternakan Kabupaten Bogor</title>
        <meta name="description" content="Artikel edukatif tentang kesehatan hewan di Kabupaten Bogor" />
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

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-green-500 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-white text-center mb-4">Artikel Kesehatan Hewan</h2>
            <p className="text-white/90 text-center text-lg max-w-2xl mx-auto">
              Akses artikel edukatif tentang kesehatan hewan, penyakit, pencegahan, dan penanganan
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="container mx-auto px-4 py-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Category Info */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <div className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg">
              <span className="mr-2">🏥</span>
              Kesehatan Hewan
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-4 pb-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Memuat artikel...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Artikel</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Tidak ada artikel yang sesuai dengan pencarian Anda.' : 'Belum ada artikel yang diterbitkan.'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const contentType = contentTypes[article.content_type as keyof typeof contentTypes] || contentTypes.article;
                return (
                  <Link
                    key={article.id}
                    href={`/edukasi/${article.slug}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
                  >
                    {/* Thumbnail */}
                    {article.thumbnail_url ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.thumbnail_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className={`absolute top-4 right-4 bg-gradient-to-r ${contentType.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                          <span>{contentType.icon}</span>
                          {contentType.label}
                        </div>
                      </div>
                    ) : (
                      <div className={`h-48 bg-gradient-to-br ${contentType.color} flex items-center justify-center`}>
                        <span className="text-6xl">{contentType.icon}</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                          {article.category.replace('_', ' ')}
                        </span>
                        {article.tags && article.tags.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {article.tags.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {article.view_count}
                          </span>
                          {article.author && (
                            <span>{article.author.full_name}</span>
                          )}
                        </div>
                        {article.published_at && (
                          <span>{formatDate(article.published_at)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

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

