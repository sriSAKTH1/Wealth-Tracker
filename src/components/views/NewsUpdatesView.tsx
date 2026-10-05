import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Share2,
  BookOpen
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AppNewsPost } from '../../types';
import { fetchNewsPosts } from '../../services/firebase';

export const NewsUpdatesView: React.FC = () => {
  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [posts, setPosts] = useState<AppNewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<AppNewsPost | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const data = await fetchNewsPosts();
        setPosts(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  const categories = ['all', 'Feature Release', 'Market News', 'Personal Finance', 'Platform Update'];

  const filteredPosts = posts.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                News, Release Blogs &amp; Feature Updates
              </h1>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Official release notes, financial wealth strategies, and product announcements published by Admin.
              </p>
            </div>
          </div>

          {activePost && (
            <button
              type="button"
              onClick={() => setActivePost(null)}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Articles</span>
            </button>
          )}
        </div>
      </div>

      {/* SINGLE ARTICLE VIEW */}
      {activePost ? (
        <article className={`p-6 sm:p-10 rounded-3xl border shadow-sm space-y-6 animate-in fade-in duration-200 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                {activePost.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{activePost.readTimeMinutes || 3} min read</span>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(activePost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {activePost.title}
            </h2>

            <p className="text-sm text-slate-500 font-medium">
              By {activePost.author}
            </p>
          </div>

          {/* Lead Summary */}
          <div className={`p-4 rounded-2xl border text-sm font-semibold leading-relaxed ${
            isLight ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950' : 'bg-indigo-950/20 border-indigo-500/20 text-indigo-200'
          }`}>
            {activePost.summary}
          </div>

          {/* Full Body Text */}
          <div className="text-sm leading-relaxed space-y-4 whitespace-pre-line text-slate-700 dark:text-slate-200 font-normal">
            {activePost.content}
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActivePost(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all posts</span>
            </button>
          </div>
        </article>
      ) : (
        /* ARTICLES LIST VIEW */
        <div className="space-y-6">
          {/* Search & Category Filter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Updates' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search releases & blogs..."
                className={`w-full pl-9 pr-3.5 py-1.5 rounded-xl border text-xs ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* Cards Grid */}
          {filteredPosts.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <h3 className="font-bold text-sm">No articles match your filter.</h3>
              <p className="text-xs text-slate-400 mt-1">Check back later or try clearing your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setActivePost(post)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-3 group ${
                    isLight ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTimeMinutes || 3} min</span>
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold group-hover:text-blue-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>By {post.author}</span>
                    <span className="font-bold text-blue-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Article <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
