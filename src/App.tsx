import React, { useState, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import MetadataForm from './components/MetadataForm';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Settings, Moon, Sun, RotateCcw, Upload, Undo2, Redo2, Github } from 'lucide-react';
import { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './utils/localStorage';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistory } from './hooks/useHistory';
import { parseImportedFile, extractMetadata } from './utils/importExport';



const getDefaultPost = (): BlogPost => ({
  id: Date.now(),
  title: 'New Blog Post',
  slug: 'new-blog-post',
  excerpt: 'A short summary of the post...',
  content: [],
  imageUrl: 'https://res.cloudinary.com/mustafakbaser/image/upload/v1764964904/Blog-Builder-App-Screenshot_rtx7ao.webp',
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
    image: 'https://res.cloudinary.com/mustafakbaser/image/upload/v1764964904/Blog-Builder-App-Screenshot_rtx7ao.webp',
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

  // Advanced Undo/Redo for content sections
  const {
    state: sections,
    set: setSections,
    undo,
    redo,
    canUndo,
    canRedo,
    clear: resetHistory
  } = useHistory<ContentSection[]>(post.content, { maxHistory: 50 });

  // Sync sections with post state whenever history changes
  useEffect(() => {
    // Avoid double updates: Only update if current post.content is different from sections
    if (JSON.stringify(post.content) !== JSON.stringify(sections)) {
      setPost(prev => ({ ...prev, content: sections }));
    }
  }, [sections]);

  // Keyboard shortcuts configuration
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      description: 'Save manually',
      action: () => {
        saveToLocalStorage({
          post,
          keywordsInput,
          tagsInput,
          includeReadTime,
          customCategory,
          activeTab,
          lastSaved: new Date().toISOString()
        });
        setToast({ message: 'Saved successfully!', type: 'success' });
      },
    },
    {
      key: 'z',
      ctrl: true,
      description: 'Undo',
      action: () => {
        if (canUndo) {
          undo();
          setToast({ message: 'Undone', type: 'success' });
        }
      },
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Redo',
      action: () => {
        if (canRedo) {
          redo();
          setToast({ message: 'Redone', type: 'success' });
        }
      },
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Toggle Preview',
      action: () => setActiveTab(prev => prev === 'preview' ? 'editor' : 'preview'),
    },
    {
      key: 'Escape',
      description: 'Deselect section',
      action: () => setSelectedSectionId(null),
    },
  ]);

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
    const defaultPost = getDefaultPost();
    setPost(defaultPost);
    resetHistory(defaultPost.content); // Reset history to default content
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
      resetHistory(importedPost.content); // Reset history to imported content
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

    // Add readTime getter if not included (User Requirement)
    if (!includeReadTime) {
      const lines = exportData.split('\n');
      lines.pop(); // Remove last }

      // Ensure comma on last property
      if (lines[lines.length - 1].trim() && !lines[lines.length - 1].trim().endsWith(',')) {
        lines[lines.length - 1] = lines[lines.length - 1] + ',';
      }

      // Add getter function
      lines.push('  get readTime() {');
      lines.push('    return calculateReadingTime(this.content);');
      lines.push('  }');
      lines.push('}');

      exportData = lines.join('\n');
    }

    console.log('📤 Export data:', exportData.substring(0, 200));

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Robust filename generation
    const safeSlug = post.slug?.trim() || 'blog-post';
    a.download = `${safeSlug}.json`;

    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const updateSections = (newSections: ContentSection[]) => {
    setSections(newSections);
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
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-50">
          <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
            {/* Left Section: Logo + GitHub Link */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Logo (Desktop Only) */}
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <img src="/blog-logo.svg" alt="Blog Builder Logo" className="w-7 h-7 sm:w-8 sm:h-8" />
                <div>
                  <h1 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white">
                    Blog Builder
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Create amazing content</p>
                </div>
              </div>

              {/* GitHub Link (Desktop Only) */}
              <a
                href="https://github.com/mustafakbaser/blog-post-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:inline">GitHub</span>
              </a>
            </div>

            {/* Right Section: Controls */}

            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Undo/Redo Buttons */}
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-2 sm:pr-3">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

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
            <div className="h-full overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-900">
              <MetadataForm
                post={post}
                setPost={setPost}
                keywordsInput={keywordsInput}
                setKeywordsInput={setKeywordsInput}
                tagsInput={tagsInput}
                setTagsInput={setTagsInput}
                includeReadTime={includeReadTime}
                setIncludeReadTime={setIncludeReadTime}
                customCategory={customCategory}
                setCustomCategory={setCustomCategory}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col bg-white dark:bg-slate-900">
              <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900/50">
                <div className="min-h-full w-full flex flex-col items-center py-8">
                  {/* Standard responsive container */}
                  <div className="bg-white dark:bg-slate-900 w-full max-w-5xl shadow-lg mx-auto min-h-full">
                    <PreviewPost post={post} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
}

export default App;
