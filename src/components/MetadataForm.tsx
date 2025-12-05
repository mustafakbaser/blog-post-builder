import React, { useState } from 'react';
import {
    Type, Image as ImageIcon, Calendar, Tag, Globe,
    User, FileText, Link as LinkIcon, Clock, Hash,
    Layout, Search, X, Plus
} from 'lucide-react';
import type { BlogPost } from '../types/blog';

interface MetadataFormProps {
    post: BlogPost;
    setPost: (post: BlogPost) => void;
    keywordsInput: string;
    setKeywordsInput: (value: string) => void;
    tagsInput: string;
    setTagsInput: (value: string) => void;
    includeReadTime: boolean;
    setIncludeReadTime: (value: boolean) => void;
    customCategory: boolean;
    setCustomCategory: (value: boolean) => void;
}

const CATEGORIES = [
    'Yazılım Geliştirme',
    'Yazılım Prensipleri',
    'Gelişim',
    'Sanat & Edebiyat',
    'Web Geliştirme',
    'Veri Tabanı',
    'DevOps'
];

export default function MetadataForm({
    post,
    setPost,
    keywordsInput,
    setKeywordsInput,
    tagsInput,
    setTagsInput,
    includeReadTime,
    setIncludeReadTime,
    customCategory,
    setCustomCategory
}: MetadataFormProps) {
    const [imageError, setImageError] = useState(false);

    // Helper to handle chip inputs (Tags/Keywords)
    const handleChipInput = (
        value: string,
        currentString: string,
        setter: (val: string) => void
    ) => {
        // Parse current string to array
        const currentItems = currentString.split(',').map(s => s.trim()).filter(Boolean);

        // Add new items (split by comma if pasted)
        const newItems = value.split(',').map(s => s.trim()).filter(Boolean);

        // Combine and deduplicate roughly (case sensitive for now)
        const combined = [...new Set([...currentItems, ...newItems])];

        setter(combined.join(', '));
    };

    const removeChip = (
        index: number,
        currentString: string,
        setter: (val: string) => void
    ) => {
        const items = currentString.split(',').map(s => s.trim()).filter(Boolean);
        items.splice(index, 1);
        setter(items.join(', '));
    };

    // Generic Input Helper
    const InputGroup = ({
        label,
        icon: Icon,
        children,
        className = ""
    }: {
        label: string,
        icon?: any,
        children: React.ReactNode,
        className?: string
    }) => (
        <div className={`space-y-2 ${className}`}>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {Icon && <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />}
                {label}
            </label>
            {children}
        </div>
    );

    const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm";

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* Header Section */}
            <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-500" />
                    Post Metadata
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Configure the essential details, SEO settings, and categorization for your blog post.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Card: Basic Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-slate-400" /> Basic Details
                        </h3>

                        <div className="grid grid-cols-4 gap-5">
                            <InputGroup label="Title" icon={Type} className="col-span-4">
                                <input
                                    type="text"
                                    value={post.title}
                                    onChange={(e) => setPost({ ...post, title: e.target.value, seo: { ...post.seo!, title: e.target.value } })}
                                    className={inputClass}
                                    placeholder="Enter an engaging title..."
                                />
                            </InputGroup>

                            <InputGroup label="Slug" icon={LinkIcon} className="col-span-3">
                                <input
                                    type="text"
                                    value={post.slug}
                                    onChange={(e) => setPost({ ...post, slug: e.target.value })}
                                    className={`${inputClass} font-mono text-sm`}
                                    placeholder="post-url-slug"
                                />
                            </InputGroup>

                            <InputGroup label="Internal ID" icon={Hash} className="col-span-1">
                                <input
                                    type="number"
                                    value={post.id}
                                    onChange={(e) => setPost({ ...post, id: Number(e.target.value) })}
                                    className={inputClass}
                                />
                            </InputGroup>
                        </div>

                        <InputGroup label="Excerpt" icon={FileText}>
                            <textarea
                                value={post.excerpt}
                                onChange={(e) => setPost({ ...post, excerpt: e.target.value, seo: { ...post.seo!, description: e.target.value } })}
                                rows={6}
                                className={`${inputClass} resize-none`}
                                placeholder="A compelling summary of your post..."
                            />
                        </InputGroup>
                    </div>

                    {/* Card: SEO & Social */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-emerald-500" /> SEO & Social
                        </h3>

                        <div className="space-y-5">
                            <InputGroup label="SEO Title">
                                <input
                                    type="text"
                                    value={post.seo?.title || ''}
                                    onChange={(e) => setPost({ ...post, seo: { ...post.seo!, title: e.target.value } })}
                                    className={inputClass}
                                    placeholder="Optimized title for search engines"
                                />
                            </InputGroup>

                            <InputGroup label="Author" icon={User}>
                                <input
                                    type="text"
                                    value={post.seo?.author || ''}
                                    onChange={(e) => setPost({ ...post, seo: { ...post.seo!, author: e.target.value } })}
                                    className={inputClass}
                                    placeholder="Author name"
                                />
                            </InputGroup>

                            <InputGroup label="SEO Description">
                                <textarea
                                    value={post.seo?.description || ''}
                                    onChange={(e) => setPost({ ...post, seo: { ...post.seo!, description: e.target.value } })}
                                    rows={5}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Meta description for search results..."
                                />
                            </InputGroup>
                        </div>

                        {/* Keyword Chips */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-500" /> Keywords
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {keywordsInput.split(',').map(s => s.trim()).filter(Boolean).map((keyword, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                                        {keyword}
                                        <button onClick={() => removeChip(idx, keywordsInput, setKeywordsInput)} className="hover:text-indigo-900 dark:hover:text-indigo-200">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Type and press comma to add keywords..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        handleChipInput(e.currentTarget.value, keywordsInput, setKeywordsInput);
                                        e.currentTarget.value = '';
                                    }
                                }}
                                onBlur={(e) => {
                                    // Also add on blur if there is content
                                    if (e.target.value.trim()) {
                                        handleChipInput(e.target.value, keywordsInput, setKeywordsInput);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <p className="text-xs text-slate-500">Separated by commas</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Style Controls */}
                <div className="space-y-6">

                    {/* Main Image */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-pink-500" /> Featured Image
                        </h3>

                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center group">
                            {post.imageUrl && !imageError ? (
                                <img
                                    src={post.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                    onError={() => setImageError(true)}
                                    onLoad={() => setImageError(false)}
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">
                                        {imageError ? "Failed to load image" : "No image provided"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <input
                            type="text"
                            value={post.imageUrl}
                            onChange={(e) => {
                                setPost({ ...post, imageUrl: e.target.value, seo: { ...post.seo!, image: e.target.value } });
                                setImageError(false);
                            }}
                            className={inputClass}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Categorization */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Tag className="w-5 h-5 text-indigo-500" /> Taxonomy
                        </h3>

                        <div className="space-y-4">
                            {/* Category */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                                    {!customCategory && (
                                        <button
                                            onClick={() => setCustomCategory(true)}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> New
                                        </button>
                                    )}
                                </div>

                                {customCategory ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={post.category}
                                            onChange={(e) => setPost({ ...post, category: e.target.value, seo: { ...post.seo!, section: e.target.value } })}
                                            className={inputClass}
                                            placeholder="Custom category..."
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => setCustomCategory(false)}
                                            className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        value={post.category}
                                        onChange={(e) => {
                                            if (e.target.value === 'custom') setCustomCategory(true);
                                            else setPost({ ...post, category: e.target.value, seo: { ...post.seo!, section: e.target.value } });
                                        }}
                                        className={inputClass}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Tags (Chips) */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tagsInput.split(',').map(s => s.trim()).filter(Boolean).map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-600">
                                            #{tag}
                                            <button onClick={() => removeChip(idx, tagsInput, setTagsInput)} className="hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Add tags..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault();
                                            handleChipInput(e.currentTarget.value, tagsInput, setTagsInput);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value.trim()) {
                                            handleChipInput(e.target.value, tagsInput, setTagsInput);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Publishing */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-500" /> Publishing
                        </h3>

                        <InputGroup label="Publish Date">
                            <input
                                type="datetime-local"
                                value={post.publishedAt.slice(0, 16)}
                                onChange={(e) => setPost({ ...post, publishedAt: new Date(e.target.value).toISOString(), seo: { ...post.seo!, publishedAt: new Date(e.target.value).toISOString(), modifiedAt: new Date().toISOString() } })}
                                className={inputClass}
                            />
                        </InputGroup>

                        {/* Read Time Toggle */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Manual Read Time</span>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" checked={includeReadTime} onChange={(e) => setIncludeReadTime(e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {includeReadTime && (
                            <div className="pl-3 border-l-2 border-indigo-200 dark:border-indigo-800 ml-2">
                                <InputGroup label="Minutes">
                                    <input
                                        type="number"
                                        value={post.readTime}
                                        onChange={(e) => setPost({ ...post, readTime: Number(e.target.value) })}
                                        className={inputClass}
                                        placeholder="5"
                                    />
                                </InputGroup>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
