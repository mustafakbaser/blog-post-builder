import React, { useState } from 'react';
import {
    Type, Image as ImageIcon, Calendar, Tag, Globe,
    User, FileText, Link as LinkIcon, Clock, Hash,
    Layout, Search, X, Plus, ChevronDown
} from 'lucide-react';
import { DebouncedInput, DebouncedTextarea } from './DebouncedControls';
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
        <label className="flex items-center gap-2 text-sm font-semibold text-surface-700 dark:text-surface-300">
            {Icon && <Icon className="w-4 h-4 text-accent-500 dark:text-accent-400" />}
            {label}
        </label>
        {children}
    </div>
);

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
        const currentItems = currentString.split(',').map(s => s.trim()).filter(Boolean);
        const newItems = value.split(',').map(s => s.trim()).filter(Boolean);
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

    const inputClass = "w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-accent-500/20 dark:focus:ring-accent-400/20 focus:border-accent-500 dark:focus:border-accent-400 transition-all text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-600 shadow-sm";

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* Header Section */}
            <div className="flex flex-col gap-2 border-b border-surface-200 dark:border-surface-800 pb-6">
                <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-accent-500" />
                    Post Metadata
                </h2>
                <p className="text-surface-500 dark:text-surface-400">
                    Configure the essential details, SEO settings, and categorization for your blog post.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Card: Basic Details */}
                    <div className="relative bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-elevated border border-surface-200 dark:border-surface-700 space-y-5 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-blue-500" />
                        <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-surface-400" /> Basic Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                            <InputGroup label="Title" icon={Type} className="col-span-1 sm:col-span-4">
                                <DebouncedInput
                                    type="text"
                                    value={post.title}
                                    onChange={(val) => setPost({ ...post, title: val, seo: { ...post.seo!, title: val } })}
                                    className={inputClass}
                                    placeholder="Enter an engaging title..."
                                />
                            </InputGroup>

                            <InputGroup label="Slug" icon={LinkIcon} className="col-span-1 sm:col-span-3">
                                <DebouncedInput
                                    type="text"
                                    value={post.slug}
                                    onChange={(val) => setPost({ ...post, slug: val })}
                                    className={`${inputClass} font-mono text-sm`}
                                    placeholder="post-url-slug"
                                />
                            </InputGroup>

                            <InputGroup label="ID" icon={Hash} className="col-span-1 sm:col-span-1">
                                <DebouncedInput
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={post.id}
                                    onChange={(val) => {
                                        const cleanVal = val.replace(/\D/g, '');
                                        setPost({ ...post, id: Number(cleanVal) });
                                    }}
                                    className={`${inputClass} font-mono text-sm`}
                                />
                            </InputGroup>
                        </div>

                        <InputGroup label="Excerpt" icon={FileText}>
                            <DebouncedTextarea
                                value={post.excerpt}
                                onChange={(val) => setPost({ ...post, excerpt: val, seo: { ...post.seo!, description: val } })}
                                rows={6}
                                className={`${inputClass} resize-none`}
                                placeholder="A compelling summary of your post..."
                            />
                        </InputGroup>
                    </div>

                    {/* Card: SEO & Social */}
                    <div className="relative bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-elevated border border-surface-200 dark:border-surface-700 space-y-5 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
                        <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-emerald-500" /> SEO & Social
                        </h3>

                        <div className="space-y-5">
                            <InputGroup label="SEO Title">
                                <DebouncedInput
                                    type="text"
                                    value={post.seo?.title || ''}
                                    onChange={(val) => setPost({ ...post, seo: { ...post.seo!, title: val } })}
                                    className={inputClass}
                                    placeholder="Optimized title for search engines"
                                />
                            </InputGroup>

                            <InputGroup label="Author" icon={User}>
                                <DebouncedInput
                                    type="text"
                                    value={post.seo?.author || ''}
                                    onChange={(val) => setPost({ ...post, seo: { ...post.seo!, author: val } })}
                                    className={inputClass}
                                    placeholder="Author name"
                                />
                            </InputGroup>

                            <InputGroup label="SEO Description">
                                <DebouncedTextarea
                                    value={post.seo?.description || ''}
                                    onChange={(val) => setPost({ ...post, seo: { ...post.seo!, description: val } })}
                                    rows={5}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Meta description for search results..."
                                />
                            </InputGroup>
                        </div>

                        {/* Keyword Chips */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-accent-500" /> Keywords
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {keywordsInput.split(',').map(s => s.trim()).filter(Boolean).map((keyword, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium border border-accent-100 dark:border-accent-800 animate-scale-in">
                                        {keyword}
                                        <button onClick={() => removeChip(idx, keywordsInput, setKeywordsInput)} className="hover:text-accent-900 dark:hover:text-accent-200 active:scale-90 transition-transform">
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
                                    if (e.target.value.trim()) {
                                        handleChipInput(e.target.value, keywordsInput, setKeywordsInput);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <p className="text-xs text-surface-500">Separated by commas</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Style Controls */}
                <div className="space-y-6">

                    {/* Main Image */}
                    <div className="relative bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-elevated border border-surface-200 dark:border-surface-700 space-y-4 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-rose-500 to-red-500" />
                        <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-pink-500" /> Featured Image
                        </h3>

                        <div className="relative aspect-video bg-surface-100 dark:bg-surface-900 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 flex items-center justify-center group">
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
                                    <ImageIcon className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                                    <p className="text-xs text-surface-400">
                                        {imageError ? "Failed to load image" : "No image provided"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <DebouncedInput
                            type="text"
                            value={post.imageUrl}
                            onChange={(val) => {
                                setPost({ ...post, imageUrl: val, seo: { ...post.seo!, image: val } });
                                setImageError(false);
                            }}
                            className={inputClass}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Categorization */}
                    <div className="relative bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-elevated border border-surface-200 dark:border-surface-700 space-y-5 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 via-accent-500 to-indigo-500" />
                        <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                            <Tag className="w-5 h-5 text-accent-500" /> Taxonomy
                        </h3>

                        <div className="space-y-4">
                            {/* Category */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">Category</label>
                                    {!customCategory && (
                                        <button
                                            onClick={() => setCustomCategory(true)}
                                            className="text-xs text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                                        >
                                            <Plus className="w-3 h-3" /> New
                                        </button>
                                    )}
                                </div>

                                {customCategory ? (
                                    <div className="flex gap-2">
                                        <DebouncedInput
                                            type="text"
                                            value={post.category}
                                            onChange={(val) => setPost({ ...post, category: val, seo: { ...post.seo!, section: val } })}
                                            className={inputClass}
                                            placeholder="Custom category..."
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => setCustomCategory(false)}
                                            className="p-2.5 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors active:scale-95"
                                        >
                                            <X className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={post.category}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') setCustomCategory(true);
                                                else setPost({ ...post, category: e.target.value, seo: { ...post.seo!, section: e.target.value } });
                                            }}
                                            className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                                    </div>
                                )}
                            </div>

                            {/* Tags (Chips) */}
                            <div>
                                <label className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 block">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tagsInput.split(',').map(s => s.trim()).filter(Boolean).map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 text-sm font-medium border border-surface-200 dark:border-surface-600 animate-scale-in">
                                            #{tag}
                                            <button onClick={() => removeChip(idx, tagsInput, setTagsInput)} className="hover:text-red-500 active:scale-90 transition-transform">
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
                    <div className="relative bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-elevated border border-surface-200 dark:border-surface-700 space-y-4 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500" />
                        <h3 className="text-lg font-display font-semibold text-surface-900 dark:text-white flex items-center gap-2">
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
                        <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-surface-400" />
                                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Manual Read Time</span>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" checked={includeReadTime} onChange={(e) => setIncludeReadTime(e.target.checked)} />
                                <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 dark:peer-focus:ring-accent-800 rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent-600"></div>
                            </label>
                        </div>

                        {includeReadTime && (
                            <div className="pl-3 border-l-2 border-accent-200 dark:border-accent-800 ml-2">
                                <InputGroup label="Minutes">
                                    <DebouncedInput
                                        type="number"
                                        value={post.readTime}
                                        onChange={(val) => setPost({ ...post, readTime: Number(val) })}
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
