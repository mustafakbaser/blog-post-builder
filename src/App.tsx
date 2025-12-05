import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Settings, Moon, Sun } from 'lucide-react';

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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [includeReadTime, setIncludeReadTime] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
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
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleExport = () => {
    // Convert keywords and tags from input strings to arrays
    const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    // Create export object with updated keywords and tags
    const exportPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      seo: {
        ...post.seo!,
        keywords,
        tags
      }
    };

    // Remove readTime if not included
    if (!includeReadTime) {
      delete (exportPost as any).readTime;
    }

    // Convert to JSON string
    let exportData = JSON.stringify(exportPost, null, 2);

    // Replace double quotes with single quotes
    exportData = exportData.replace(/"([^"]+)":/g, "$1:");  // Remove quotes from keys
    exportData = exportData.replace(/: "([^"]*)"/g, ": '$1'");  // Replace double quotes with single quotes in values
    // Fix all quotes in arrays (handles multiple elements)
    exportData = exportData.replace(/"([^"]*?)"/g, "'$1'");  // Replace remaining double quotes with single quotes


    // Add readTime getter if not included
    if (!includeReadTime) {
      // Find the closing brace before the last one and add the getter
      const lines = exportData.split('\n');
      const lastBraceIndex = lines.length - 1;

      // Insert getter before the last closing brace
      lines.splice(lastBraceIndex, 0, '  get readTime() {');
      lines.splice(lastBraceIndex + 1, 0, '    return calculateReadingTime(this.content);');
      lines.splice(lastBraceIndex + 2, 0, '  }');

      exportData = lines.join('\n');
    }

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
    setKeywordsInput(value);
  };

  const updateTags = (value: string) => {
    setTagsInput(value);
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
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="/blog-logo.svg" alt="Blog Builder Logo" className="w-8 h-8" />
              <div>
                <h1 className="font-semibold text-lg text-slate-900 dark:text-white">
                  Blog Builder
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create amazing content</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Navigation */}
            <nav className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'editor'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Code className="w-4 h-4" />
                Editor
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'metadata'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Settings className="w-4 h-4" />
                Metadata
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              title="Export JSON"
            >
              <Download className="w-5 h-5" />
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
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-8">
                  {/* Header */}
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      Post Metadata
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure all aspects of your blog post</p>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ID</label>
                        <input
                          type="number"
                          value={post.id}
                          onChange={(e) => setPost({ ...post, id: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug</label>
                        <input
                          type="text"
                          value={post.slug}
                          onChange={(e) => setPost({ ...post, slug: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                          placeholder="post-url-slug"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => setPost({ ...post, title: e.target.value, seo: { ...post.seo!, title: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Enter your amazing blog post title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                      {customCategory ? (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={post.category}
                            onChange={(e) => setPost({ ...post, category: e.target.value, seo: { ...post.seo!, section: e.target.value } })}
                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                            placeholder="Enter custom category..."
                            autoFocus
                          />
                          <button
                            onClick={() => setCustomCategory(false)}
                            className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <select
                          value={post.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} className="bg-white dark:bg-slate-800">
                              {cat}
                            </option>
                          ))}
                          <option value="custom" className="bg-white dark:bg-slate-800 font-medium text-indigo-600 dark:text-indigo-400">
                            + Yeni Kategori
                          </option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
                      <textarea
                        value={post.excerpt}
                        onChange={(e) => setPost({ ...post, excerpt: e.target.value, seo: { ...post.seo!, description: e.target.value } })}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white resize-none"
                        placeholder="A compelling summary of your post..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image URL</label>
                      <input
                        type="text"
                        value={post.imageUrl}
                        onChange={(e) => setPost({ ...post, imageUrl: e.target.value, seo: { ...post.seo!, image: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Published At</label>
                        <input
                          type="datetime-local"
                          value={post.publishedAt.slice(0, 16)}
                          onChange={(e) => setPost({ ...post, publishedAt: new Date(e.target.value).toISOString(), seo: { ...post.seo!, publishedAt: new Date(e.target.value).toISOString(), modifiedAt: new Date().toISOString() } })}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={includeReadTime}
                            onChange={(e) => setIncludeReadTime(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Include Read Time</span>
                        </label>
                        {includeReadTime && (
                          <input
                            type="number"
                            value={post.readTime}
                            onChange={(e) => setPost({ ...post, readTime: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                            placeholder="5"
                          />
                        )}
                        {!includeReadTime && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Will be calculated automatically
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="space-y-5 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">SEO Settings</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SEO Title</label>
                      <input
                        type="text"
                        value={post.seo?.title || ''}
                        onChange={(e) => setPost({ ...post, seo: { ...post.seo!, title: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="SEO optimized title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SEO Description</label>
                      <textarea
                        value={post.seo?.description || ''}
                        onChange={(e) => setPost({ ...post, seo: { ...post.seo!, description: e.target.value } })}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white resize-none"
                        placeholder="SEO meta description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author</label>
                      <input
                        type="text"
                        value={post.seo?.author || ''}
                        onChange={(e) => setPost({ ...post, seo: { ...post.seo!, author: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Author name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Keywords (comma separated)</label>
                      <input
                        type="text"
                        value={keywordsInput}
                        onChange={(e) => updateKeywords(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Docker, DevOps, Tutorial"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => updateTags(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        placeholder="Docker, Containerization, DevOps"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-white dark:bg-slate-900">
              <PreviewPost post={post} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
