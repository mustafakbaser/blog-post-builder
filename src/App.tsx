import React, { useState, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import MetadataForm from './components/MetadataForm';
import ConfirmDialog from './components/ConfirmDialog';
import Toast from './components/Toast';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Settings, Moon, Sun, RotateCcw, Upload, Undo2, Redo2, Github, MoreHorizontal } from 'lucide-react';
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

const TAB_CONFIG = [
  { key: 'editor' as const, label: 'Editor', icon: Code },
  { key: 'metadata' as const, label: 'Metadata', icon: Settings },
  { key: 'preview' as const, label: 'Preview', icon: Eye },
];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

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
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const {
    state: sections,
    set: setSections,
    undo,
    redo,
    canUndo,
    canRedo,
    clear: resetHistory
  } = useHistory<ContentSection[]>(post.content, { maxHistory: 50 });

  useEffect(() => {
    if (JSON.stringify(post.content) !== JSON.stringify(sections)) {
      setPost(prev => ({ ...prev, content: sections }));
    }
  }, [sections]);

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
        setSaveStatus('saved');
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

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflowMenu(false);
      }
    };
    if (showOverflowMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOverflowMenu]);

  useAutoSave(
    () => {
      setSaveStatus('saving');
      saveToLocalStorage({
        post,
        keywordsInput,
        tagsInput,
        includeReadTime,
        customCategory,
        activeTab,
        lastSaved: new Date().toISOString()
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    1000,
    [post, keywordsInput, tagsInput, includeReadTime, customCategory, activeTab]
  );

  const handleReset = () => {
    clearLocalStorage();
    const defaultPost = getDefaultPost();
    setPost(defaultPost);
    resetHistory(defaultPost.content);
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

      setPost(importedPost);
      resetHistory(importedPost.content);
      setKeywordsInput(keywords);
      setTagsInput(tags);

      if (importedPost.readTime !== undefined) {
        setIncludeReadTime(true);
      }

      setToast({ message: 'Blog post imported successfully!', type: 'success' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setToast({ message: `Failed to import: ${errorMessage}`, type: 'error' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
    setShowOverflowMenu(false);
  };

  const toJsObjectLiteral = (json: string): string => {
    return json.replace(/^(\s*)"([^"]+)":\s*/gm, '$1$2: ').replace(/"([^"]*)"/g, (_, content) => {
      const escaped = content.replace(/'/g, "\\'");
      return `'${escaped}'`;
    });
  };

  const handleExport = () => {
    const keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    const exportPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content.map(({ id, ...rest }) => rest),
      imageUrl: post.imageUrl,
      publishedAt: post.publishedAt,
      readTime: post.readTime,
      seo: {
        ...post.seo!,
        keywords,
        tags
      }
    };

    if (!includeReadTime) {
      delete (exportPost as any).readTime;
    }

    let exportData = toJsObjectLiteral(JSON.stringify(exportPost, null, 2));

    if (!includeReadTime) {
      const lines = exportData.split('\n');
      lines.pop();

      if (lines[lines.length - 1].trim() && !lines[lines.length - 1].trim().endsWith(',')) {
        lines[lines.length - 1] = lines[lines.length - 1] + ',';
      }

      lines.push('  get readTime() {');
      lines.push('    return calculateReadingTime(this.content);');
      lines.push('  }');
      lines.push('}');

      exportData = lines.join('\n');
    }

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const safeSlug = post.slug?.trim() || 'blog-post';
    a.download = `${safeSlug}.json`;

    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    setShowOverflowMenu(false);
  };

  const updateSections = (newSections: ContentSection[]) => {
    setSections(newSections);
  };

  // Calculate tab indicator position
  const activeTabIndex = TAB_CONFIG.findIndex(t => t.key === activeTab);

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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

      <div className="h-full flex flex-col bg-surface-50 dark:bg-surface-900 theme-transition">
        {/* Top Bar */}
        <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-50 theme-transition">
          <div className="relative flex items-center justify-center sm:justify-between w-full gap-2 sm:gap-4">
            {/* Left: Undo/Redo (mobile only) + Logo (desktop) */}
            <div className="absolute left-3 sm:relative sm:left-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Undo/Redo — mobile only (on desktop these are in the right section) */}
              <div className="flex sm:hidden items-center gap-0.5">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
              {/* Logo — desktop only */}
              <div className="hidden sm:flex items-center gap-2.5">
                <img src="/blog-logo.svg" alt="Blog Builder Logo" className="w-8 h-8" />
                <h1 className="font-display font-bold text-lg text-surface-900 dark:text-white tracking-tight">
                  Blog Builder
                </h1>
              </div>
              <a
                href="https://github.com/mustafakbaser/blog-post-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95"
                title="View on GitHub"
              >
                <Github className="w-4.5 h-4.5" />
              </a>
            </div>

            {/* Center: Tab Navigation with animated indicator */}
            <nav className="relative flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl border border-surface-200 dark:border-surface-700">
              {/* Animated background indicator */}
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-surface-700 shadow-elevated transition-all duration-300 ease-spring"
                style={{
                  left: `calc(${activeTabIndex * 33.33}% + 4px)`,
                  width: `calc(33.33% - 8px)`,
                }}
              />
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'text-accent-600 dark:text-accent-400'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="absolute right-3 sm:relative sm:right-auto flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Undo/Redo — desktop only (on mobile these are in the left section) */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-surface-200 dark:bg-surface-700 mx-1" />

              {/* Auto-save Status */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-surface-400 px-1 w-[90px] md:w-[90px]">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                  saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' :
                  saveStatus === 'saved' ? 'bg-emerald-400' :
                  'bg-surface-300 dark:bg-surface-600 animate-pulse-soft'
                }`} />
                <span className="hidden md:inline font-medium">
                  {saveStatus === 'saving' ? 'Saving...' :
                   saveStatus === 'saved' ? 'Saved' : 'Auto-save'}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-5 bg-surface-200 dark:bg-surface-700 mx-1" />

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
              </button>

              {/* Overflow Menu */}
              <div ref={overflowRef} className="relative">
                <button
                  onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-700 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 transition-all active:scale-95"
                  title="More actions"
                >
                  <MoreHorizontal className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>
                {showOverflowMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-elevated-lg border border-surface-200 dark:border-surface-700 py-1 z-50 animate-scale-in">
                    <button
                      onClick={triggerImport}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Import JSON
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export JSON
                    </button>
                    <div className="h-px bg-surface-100 dark:bg-surface-700 my-1" />
                    <button
                      onClick={() => { setShowResetDialog(true); setShowOverflowMenu(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div key={activeTab} className="h-full animate-fade-in">
            {activeTab === 'editor' ? (
              <Editor
                sections={post.content}
                setSections={updateSections}
                onSelect={setSelectedSectionId}
                selectedId={selectedSectionId}
              />
            ) : activeTab === 'metadata' ? (
              <div className="h-full overflow-y-auto p-4 sm:p-6 bg-surface-100 dark:bg-surface-900 theme-transition">
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
              <div className="h-full overflow-y-auto bg-surface-100 dark:bg-surface-950 theme-transition">
                <PreviewPost post={post} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
