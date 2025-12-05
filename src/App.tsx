import { useState, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Settings, Moon, Sun, RotateCcw, Upload } from 'lucide-react';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './utils/localStorage';
import { useAutoSave } from './hooks/useAutoSave';
import { parseImportedFile, extractMetadata } from './utils/importExport';

const CATEGORIES = [
  'Yazılım Geliştirme',
  'Yazılım Prensipleri',
  'Gelişim',
  'Sanat & Edebiyat',
  'Web Geliştirme',
  'Veri Tabanı',
  'DevOps'
];

const getDefaultPost = (): BlogPost => ({
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

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Initialize state from localStorage or defaults
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'metadata'>(() => {
    const saved = loadFromLocalStorage();
    return saved?.activeTab || 'editor';
  });

  const [includeReadTime, setIncludeReadTime] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved?.includeReadTime || false;
  });

  const [customCategory, setCustomCategory] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved?.customCategory || false;
  });

  const [keywordsInput, setKeywordsInput] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved?.keywordsInput || '';
  });

  const [tagsInput, setTagsInput] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved?.tagsInput || '';
  });

  const [post, setPost] = useState<BlogPost>(() => {
    const saved = loadFromLocalStorage();
    return saved?.post || getDefaultPost();
  });

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Auto-save to localStorage with debounce
  useAutoSave(
    () => {
      saveToLocalStorage({
        post,
        keywordsInput,
        tagsInput,
        includeReadTime,
        customCategory,
        activeTab,
        lastSaved: new Date().toISOString()
      });
    },
    1000, // 1 second debounce
    [post, keywordsInput, tagsInput, includeReadTime, customCategory, activeTab]
  );

  const handleReset = () => {
    clearLocalStorage();
    setPost(getDefaultPost());
    setKeywordsInput('');
    setTagsInput('');
    setIncludeReadTime(false);
    setCustomCategory(false);
    setActiveTab('editor');
    setSelectedSectionId(null);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedPost = await parseImportedFile(file);

      if (!importedPost) {
        throw new Error('Invalid blog post data');
      }

      const { keywords, tags } = extractMetadata(importedPost);

      // Update all state with imported data
      setPost(importedPost);
      setKeywordsInput(keywords);
      setTagsInput(tags);

      // Check if readTime exists in imported data
      if (importedPost.readTime !== undefined) {
        setIncludeReadTime(true);
      }

      // Auto-save will trigger and persist to localStorage
      setToast({ message: 'Blog post imported successfully!', type: 'success' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setToast({ message: `Failed to import: ${errorMessage}`, type: 'error' });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

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

    // Debug: Log export data before modifications
    console.log('📤 Export data (valid JSON):', exportData.substring(0, 200));

    // COMMENTED OUT: These modifications break JSON format
    // Replace double quotes with single quotes
    // exportData = exportData.replace(/"([^"]+)":/g, "$1:");  // Remove quotes from keys
    // exportData = exportData.replace(/: "([^"]*)"/g, ": '$1'");  // Replace double quotes with single quotes in values
    // Fix all quotes in arrays (handles multiple elements)
    // exportData = exportData.replace(/"([^"]*?)"/g, "'$1'");  // Replace remaining double quotes with single quotes


    // COMMENTED OUT: Getter functions are not valid JSON
    // Add readTime getter if not included
    // if (!includeReadTime) {
    //   // Find the closing brace before the last one and add the getter
    //   const lines = exportData.split('\n');
    //   const lastBraceIndex = lines.length - 1;

    //   // Insert getter before the last closing brace
    //   lines.splice(lastBraceIndex, 0, '  get readTime() {');
    //   lines.splice(lastBraceIndex + 1, 0, '    return calculateReadingTime(this.content);');
    //   lines.splice(lastBraceIndex + 2, 0, '  }');

    //   exportData = lines.join('\n');
    // }

    console.log('📤 Final export data (first 500 chars):', exportData.substring(0, 500));
    console.log('✅ Export data is valid JSON:', (() => {
      try {
        JSON.parse(exportData);
        return true;
      } catch {
        return false;
      }
    })());

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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
        title="Reset All Changes"
        message="All changes will be deleted and default settings will be restored. This action cannot be undone. Do you want to continue?"
        confirmText="Yes, Reset"
        cancelText="Cancel"
        variant="danger"
      />

      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Top Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/blog-logo.svg" alt="Blog Builder Logo" className="w-7 h-7 sm:w-8 sm:h-8" />
              <div>
                <h1 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
                  Blog Builder
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Create amazing content</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Tab Navigation */}
            <nav className="flex bg-slate-100 dark:bg-slate-700/50 p-0.5 sm:p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === 'editor'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === 'metadata'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Metadata</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setShowResetDialog(true)}
              className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-colors"
              title="Reset All"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Import Button */}
            <button
              onClick={triggerImport}
              className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              title="Import JSON"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              title="Export JSON"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
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
            <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                  {/* Header */}
                  <div className="border-b border-slate-200 dark:border-slate-700 pb-4 sm:pb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                      Post Metadata
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Configure all aspects of your blog post</p>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                  <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">SEO Settings</h3>
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
