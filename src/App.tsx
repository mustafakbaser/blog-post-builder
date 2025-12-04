import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Layout, Settings, Moon, Sun } from 'lucide-react';

const CATEGORIES = [
  'Yazılım Geliştirme',
  'Yazılım Prensipleri',
  'Gelişim',
  'Sanat & Edebiyat',
  'Web Geliştirme',
  'Veri Tabanı',
  'DevOps'
];

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'metadata'>('editor');
  const [darkMode, setDarkMode] = useState(false);
  const [includeReadTime, setIncludeReadTime] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [post, setPost] = useState<BlogPost>({
    id: Date.now(),
    title: 'New Blog Post',
    slug: 'new-blog-post',
    excerpt: 'A short summary of the post...',
    content: [],
    imageUrl: 'https://via.placeholder.com/1200x600',
    publishedAt: new Date().toISOString(),
    category: 'Yazılım Geliştirme',
    readTime: 5,
    seo: {
      title: 'New Blog Post',
      description: 'A short summary of the post...',
      keywords: [],
      author: 'Mustafa Kürşad Başer',
      publishedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      image: 'https://via.placeholder.com/1200x600',
      section: 'Yazılım Geliştirme',
      tags: []
    }
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleExport = () => {
    // Create export object without readTime if not included
    const exportPost = includeReadTime ? post : { ...post };
    if (!includeReadTime) {
      delete (exportPost as any).readTime;
    }

    const exportData = JSON.stringify(exportPost, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug || 'blog-post'}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const updateSections = (newSections: ContentSection[]) => {
    setPost({ ...post, content: newSections });
  };

  const updateKeywords = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setPost({
      ...post,
      seo: { ...post.seo!, keywords }
    });
  };

  const updateTags = (value: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(t => t);
    setPost({
      ...post,
      seo: { ...post.seo!, tags }
    });
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setCustomCategory(true);
    } else {
      setCustomCategory(false);
      setPost({ ...post, category: value, seo: { ...post.seo!, section: value } });
    }
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        {/* Top Bar */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Blog Builder
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create amazing content</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl shadow-inner">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'editor'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <Code className="w-4 h-4" />
                Editor
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'metadata'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <Settings className="w-4 h-4" />
                Metadata
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'preview'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-md"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' ? (
            <Editor
              sections={post.content}
              setSections={updateSections}
              onSelect={setSelectedSectionId}
              selectedId={selectedSectionId}
            />
          ) : activeTab === 'metadata' ? (
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 space-y-10 border border-gray-200 dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Post Metadata
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Configure all aspects of your blog post</p>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">ID</label>
                        <input
                          type="number"
                          value={post.id}
                          onChange={(e) => setPost({ ...post, id: Number(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Slug</label>
                        <input
                          type="text"
                          value={post.slug}
                          onChange={(e) => setPost({ ...post, slug: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="post-url-slug"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Title</label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => setPost({ ...post, title: e.target.value, seo: { ...post.seo!, title: e.target.value } })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Enter your amazing blog post title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</label>
                      {customCategory ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={post.category}
                            onChange={(e) => setPost({ ...post, category: e.target.value, seo: { ...post.seo!, section: e.target.value } })}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter custom category..."
                            autoFocus
                          />
                          <button
                            onClick={() => setCustomCategory(false)}
                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <select
                          value={post.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-white dark:bg-gray-800">
                              {cat}
                            </option>
                          ))}
                          <option value="custom" className="bg-white dark:bg-gray-800 font-semibold text-indigo-600 dark:text-indigo-400">
                            + Yeni Kategori
                          </option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Excerpt</label>
                      <textarea
                        value={post.excerpt}
                        onChange={(e) => setPost({ ...post, excerpt: e.target.value, seo: { ...post.seo!, description: e.target.value } })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                        placeholder="A compelling summary of your post..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Image URL</label>
                      <input
                        type="text"
                        value={post.imageUrl}
                        onChange={(e) => setPost({ ...post, imageUrl: e.target.value, seo: { ...post.seo!, image: e.target.value } })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Published At</label>
                        <input
                          type="datetime-local"
                          value={post.publishedAt.slice(0, 16)}
                          onChange={(e) => setPost({ ...post, publishedAt: new Date(e.target.value).toISOString(), seo: { ...post.seo!, publishedAt: new Date(e.target.value).toISOString(), modifiedAt: new Date().toISOString() } })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={includeReadTime}
                            onChange={(e) => setIncludeReadTime(e.target.checked)}
                            className="w-5 h-5 text-indigo-600 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Include Read Time</span>
                        </label>
                        {includeReadTime && (
                          <input
                            type="number"
                            value={post.readTime}
                            onChange={(e) => setPost({ ...post, readTime: Number(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="5"
                          />
                        )}
                        {!includeReadTime && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                            Will be calculated automatically
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">SEO Settings</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SEO Title</label>
                      <input
                        type="text"
                        value={post.seo?.title || ''}
                        onChange={(e) => setPost({ ...post, seo: { ...post.seo!, title: e.target.value } })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="SEO optimized title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SEO Description</label>
                      <textarea
                        value={post.seo?.description || ''}
                        onChange={(e) => setPost({ ...post, seo: { ...post.seo!, description: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                        placeholder="SEO meta description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Author</label>
                      <input
                        type="text"
                        value={post.seo?.author || ''}
                        onChange={(e) => setPost({ ...post, seo: { ...post.seo!, author: e.target.value } })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Author name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={post.seo?.keywords?.join(', ') || ''}
                        onChange={(e) => updateKeywords(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Docker, DevOps, Tutorial"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={post.seo?.tags?.join(', ') || ''}
                        onChange={(e) => updateTags(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Docker, Containerization, DevOps"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
              <PreviewPost post={post} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
