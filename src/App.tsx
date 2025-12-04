import { useState } from 'react';
import Editor from './components/Editor';
import PreviewPost from './components/PreviewPost';
import type { BlogPost, ContentSection } from './types/blog';
import { Eye, Code, Download, Layout, Settings } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'metadata'>('editor');
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
    seo: {
      title: 'New Blog Post',
      description: 'A short summary of the post...',
      keywords: [],
      author: 'Mustafa Kürşad Başer',
      publishedAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      image: 'https://via.placeholder.com/1200x600',
      section: 'General',
      tags: []
    }
  });
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const handleExport = () => {
    const exportData = JSON.stringify(post, null, 2);
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
            onChange={(e) => setPost({ ...post, title: e.target.value, seo: { ...post.seo!, title: e.target.value } })}
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
              onClick={() => setActiveTab('metadata')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'metadata' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Settings className="w-4 h-4" />
              Metadata
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
        ) : activeTab === 'metadata' ? (
          <div className="h-full overflow-y-auto bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Post Metadata</h2>

              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => setPost({ ...post, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="post-url-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={post.category}
                      onChange={(e) => setPost({ ...post, category: e.target.value, seo: { ...post.seo!, section: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="DevOps, Frontend, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    value={post.excerpt}
                    onChange={(e) => setPost({ ...post, excerpt: e.target.value, seo: { ...post.seo!, description: e.target.value } })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="A short summary of the post..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={post.imageUrl}
                      onChange={(e) => setPost({ ...post, imageUrl: e.target.value, seo: { ...post.seo!, image: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Read Time (minutes)</label>
                    <input
                      type="number"
                      value={post.readTime}
                      onChange={(e) => setPost({ ...post, readTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Published At</label>
                  <input
                    type="datetime-local"
                    value={post.publishedAt.slice(0, 16)}
                    onChange={(e) => setPost({ ...post, publishedAt: new Date(e.target.value).toISOString(), seo: { ...post.seo!, publishedAt: new Date(e.target.value).toISOString(), modifiedAt: new Date().toISOString() } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800">SEO Settings</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={post.seo?.title || ''}
                    onChange={(e) => setPost({ ...post, seo: { ...post.seo!, title: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                  <textarea
                    value={post.seo?.description || ''}
                    onChange={(e) => setPost({ ...post, seo: { ...post.seo!, description: e.target.value } })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="SEO meta description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={post.seo?.author || ''}
                    onChange={(e) => setPost({ ...post, seo: { ...post.seo!, author: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={post.seo?.keywords?.join(', ') || ''}
                    onChange={(e) => updateKeywords(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Docker, DevOps, Tutorial"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={post.seo?.tags?.join(', ') || ''}
                    onChange={(e) => updateTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Docker, Containerization, DevOps"
                  />
                </div>
              </div>
            </div>
          </div>
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
