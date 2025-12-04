import { useState } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Layout } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [post, setPost] = useState<BlogPost>({
    id: Date.now(),
    title: 'New Blog Post',
    slug: 'new-blog-post',
    excerpt: 'A short summary of the post...',
    content: [],
    imageUrl: 'https://via.placeholder.com/1200x600',
    publishedAt: new Date().toISOString(),
    category: 'General',
    readTime: 5,
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const handleExport = () => {
    const exportData = JSON.stringify(post, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${post.slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateSections = (newSections: ContentSection[]) => {
    setPost({ ...post, content: newSections });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Layout className="w-6 h-6" />
            <span className="font-bold text-xl">Blog Builder</span>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <input
            type="text"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="text-lg font-medium text-gray-800 border-none focus:ring-0 placeholder-gray-400 w-96"
            placeholder="Enter post title..."
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Code className="w-4 h-4" />
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
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
        ) : (
          <div className="h-full overflow-y-auto bg-white">
            <PreviewPost post={post} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
