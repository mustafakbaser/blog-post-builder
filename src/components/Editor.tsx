import { useState, useEffect, useRef, useLayoutEffect, forwardRef } from 'react';
import type { ContentSection } from '../types/blog';
import {
    Type, Image as ImageIcon, X, Plus, Trash2,
    Bold, Italic, Strikethrough, Code, Settings, PanelLeftOpen, PanelRightOpen, Copy,
    Quote, List, Table, AlertCircle, Heading1, Minus, ChevronUp, ChevronDown, XCircle, Link as LinkIcon, Maximize2, GripVertical
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmDialog from './ConfirmDialog';
import { useDarkMode, getScrollbarStyle } from '../hooks/useDarkMode';
import TableDesigner from './TableDesigner';

// Sidebar Item Component - Click to add
function SidebarItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all w-full text-left"
        >
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-md group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200 flex-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                {label}
            </span>
            <Plus className="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all" />
        </button>
    );
}

// Sortable Item Wrapper
function SortableCanvasItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-4 p-1.5 text-slate-400 hover:text-indigo-500 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <CanvasItem {...props} />
                </div>
            </div>
        </div>
    );
}

// Canvas Item Component
function CanvasItem({ section, onDelete, onDuplicate, onSelect, onMoveUp, onMoveDown, isSelected, isFirst, isLast }: {
    section: ContentSection;
    onDelete: () => void;
    onDuplicate: () => void;
    onSelect: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isSelected: boolean;
    isFirst: boolean;
    isLast: boolean;
}) {
    const getIcon = () => {
        switch (section.type) {
            case 'text': return Type;
            case 'image': return ImageIcon;
            case 'code': return Code;
            case 'quote': return Quote;
            case 'list': return List;
            case 'table': return Table;
            case 'alert': return AlertCircle;
            case 'link': return LinkIcon;
            case 'divider': return Minus;
            case 'heading': return Heading1;
            default: return Type;
        }
    };

    const getPreview = () => {
        switch (section.type) {
            case 'list':
                return section.items.length > 0
                    ? `${section.ordered ? '1.' : '•'} ${section.items[0]}${section.items.length > 1 ? ` (+${section.items.length - 1} more)` : ''}`
                    : 'Empty list...';
            case 'table':
                return `${section.headers.length} columns, ${section.rows.length} rows`;
            case 'divider':
                return 'Horizontal divider';
            case 'image':
                return section.alt || section.url || 'No image';
            default:
                if ('content' in section) {
                    return section.content || 'Empty content...';
                }
                return '';
        }
    };

    const Icon = getIcon();

    return (
        <div
            className={`relative group flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border rounded-lg transition-all cursor-pointer ${isSelected
                ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/50 shadow-md'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                }`}
            onClick={onSelect}
        >
            {/* Move Controls - Removed in favor of Drag & Drop (Optional: Keep for accessibility) */}
            <div className="flex flex-col gap-1">
                {/* Kept available for accessibility primarily */}
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors ${isFirst
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    title="Move up"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors ${isLast
                        ? 'opacity-20 cursor-not-allowed'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    title="Move down"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded">
                        <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {section.type}
                    </span>
                    {section.type === 'list' && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            ({section.ordered ? 'ordered' : 'unordered'})
                        </span>
                    )}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {getPreview() || <span className="text-slate-400 dark:text-slate-500 italic">Empty...</span>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded transition-all"
                    title="Duplicate"
                >
                    <Copy className="w-5 h-5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                    title="Delete"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Properties Panel Component
const ImagePreview = ({ url }: { url: string }) => {
    const [error, setError] = useState(false);
    useEffect(() => { setError(false); }, [url]);

    if (!url) return null;

    return (
        <div className="mt-3 relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {!error ? (
                <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase tracking-wider font-medium">Invalid Image</span>
                </div>
            )}
        </div>
    );
};

// Optimized Textarea Component
const AutoResizingTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ value, onChange, ...props }, ref) => {
    const defaultRef = useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref as React.MutableRefObject<HTMLTextAreaElement>) || defaultRef;
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastEmittedValue = useRef(value);

    // Sync from props if significantly different (external change)
    useEffect(() => {
        if (value !== lastEmittedValue.current && value !== localValue) {
            setLocalValue(value);
            lastEmittedValue.current = value;
            if (timerRef.current) clearTimeout(timerRef.current);
            if (resolvedRef.current) {
                resolvedRef.current.style.height = 'auto';
                resolvedRef.current.style.height = resolvedRef.current.scrollHeight + 'px';
            }
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            lastEmittedValue.current = val;
            if (onChange) onChange(e);
        }, 300);
    };

    // Initial resize
    useLayoutEffect(() => {
        if (resolvedRef.current) {
            resolvedRef.current.style.height = 'auto';
            resolvedRef.current.style.height = resolvedRef.current.scrollHeight + 'px';
        }
    }, []);

    return <textarea ref={resolvedRef} value={localValue} onChange={handleChange} {...props} />;
});

function PropertiesPanel({ section, onChange }: { section: ContentSection | null; onChange: (updated: ContentSection) => void }) {
    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 border border-slate-100 dark:border-slate-700">
                    <Settings className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No Selection</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">Select an element from the canvas to customize its styling and content</p>
            </div>
        );
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [linkPopover, setLinkPopover] = useState<{ isOpen: boolean; text: string; url: string; start: number; end: number } | null>(null);
    const [tableModalOpen, setTableModalOpen] = useState(false);
    const isDark = useDarkMode();
    const scrollbarStyle = getScrollbarStyle(isDark);

    // Fix: Cursor jumping issue logic
    // Removed: Replaced by AutoResizingTextarea which handles local state natively

    const applyFormat = (format: 'bold' | 'italic' | 'strike' | 'code' | 'link') => {
        const textarea = textareaRef.current;
        if (!textarea || !onChange) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        if (format === 'link') {
            setLinkPopover({
                isOpen: true,
                text: selectedText,
                url: '',
                start,
                end
            });
            return;
        }

        let wrapper = '';
        switch (format) {
            case 'bold': wrapper = '**'; break;
            case 'italic': wrapper = '_'; break;
            case 'strike': wrapper = '~'; break;
            case 'code': wrapper = '`'; break;
        }

        const newText = text.substring(0, start) + wrapper + selectedText + wrapper + text.substring(end);

        // Update content
        onChange({ ...section, content: newText } as any);

        // Restore focus and selection
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + wrapper.length, end + wrapper.length);
            }
        });
    };

    const insertLink = () => {
        if (!linkPopover || !textareaRef.current) return;

        const { text, url, start, end } = linkPopover;
        // Safely access content - only text/code/heading/quote/alert sections have content
        const currentContent = ('content' in section && typeof section.content === 'string') ? section.content : '';

        const linkMarkdown = `[${text || 'link'}](${url || 'https://'})`;
        const newText = currentContent.substring(0, start) + linkMarkdown + currentContent.substring(end);

        onChange({ ...section, content: newText } as any);
        setLinkPopover(null);

        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Cursor after the inserted link
                const newCursorPos = start + linkMarkdown.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        });
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-slate-900 dark:text-white text-sm shadow-sm";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-0.5";




    // List helpers
    const updateListItem = (index: number, value: string) => {
        if (section.type !== 'list') return;
        const newItems = [...section.items];
        newItems[index] = value;
        onChange({ ...section, items: newItems });
    };

    const addListItem = () => {
        if (section.type !== 'list') return;
        onChange({ ...section, items: [...section.items, ''] });
    };

    const removeListItem = (index: number) => {
        if (section.type !== 'list') return;
        const newItems = section.items.filter((_, i) => i !== index);
        onChange({ ...section, items: newItems });
    };

    // Table helpers


    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white capitalize">
                            {section.type} Properties
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual appearance</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div
                className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
                style={scrollbarStyle}
            >

                {/* Text, Code, Heading content - Expanded for Text/Code */}
                {(section.type === 'text' || section.type === 'code' || section.type === 'heading') && (
                    <div className={section.type !== 'heading' ? "flex flex-col h-full gap-2" : "space-y-4"}>
                        <div className={section.type !== 'heading' ? "flex-1 flex flex-col min-h-[300px]" : ""}>
                            <div className="flex items-center justify-between mb-2">
                                {/* Code Language Selector - Moved to Top */}
                                {section.type === 'code' && (
                                    <div className="flex-1">
                                        <select
                                            value={section.language}
                                            onChange={(e) => onChange({ ...section, language: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <optgroup label="Web">
                                                <option value="javascript">JavaScript</option>
                                                <option value="typescript">TypeScript</option>
                                                <option value="html">HTML</option>
                                                <option value="css">CSS</option>
                                                <option value="jsx">JSX</option>
                                                <option value="tsx">TSX</option>
                                            </optgroup>
                                            <optgroup label="Other">
                                                <option value="python">Python</option>
                                                <option value="java">Java</option>
                                                <option value="cpp">C++</option>
                                                <option value="csharp">C#</option>
                                                <option value="go">Go</option>
                                                <option value="rust">Rust</option>
                                                <option value="sql">SQL</option>
                                                <option value="bash">Bash</option>
                                                <option value="json">JSON</option>
                                                <option value="markdown">Markdown</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                )}
                                {section.type === 'text' && <label className={labelClass}>Content</label>}
                                {/* Text Formatting Toolbar */}
                                {section.type === 'text' && (
                                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                                        <button
                                            onClick={() => applyFormat('bold')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Bold"
                                        >
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => applyFormat('italic')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Italic"
                                        >
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => applyFormat('strike')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Strikethrough"
                                        >
                                            <Strikethrough className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                                        <button
                                            onClick={() => applyFormat('code')}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"
                                            title="Inline Code"
                                        >
                                            <Code className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                                        <div className="relative">
                                            <button
                                                onClick={() => applyFormat('link')}
                                                className={`p-1.5 rounded-md transition-colors ${linkPopover?.isOpen
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                                                title="Link"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                            </button>

                                            {/* Modern Popover */}
                                            {linkPopover?.isOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Text</label>
                                                            <input
                                                                type="text"
                                                                value={linkPopover.text}
                                                                onChange={(e) => setLinkPopover({ ...linkPopover, text: e.target.value })}
                                                                className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                                                                placeholder="Link text"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">URL</label>
                                                            <input
                                                                type="text"
                                                                value={linkPopover.url}
                                                                onChange={(e) => setLinkPopover({ ...linkPopover, url: e.target.value })}
                                                                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                                                                className="w-full px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white"
                                                                placeholder="https://example.com"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-end gap-2 pt-1">
                                                            <button
                                                                onClick={() => setLinkPopover(null)}
                                                                className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={insertLink}
                                                                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
                                                            >
                                                                Add Link
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <AutoResizingTextarea
                                ref={textareaRef}
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                                className={`${inputClass} font-mono leading-relaxed ${section.type !== 'heading' ? 'flex-1 resize-none overflow-hidden' : ''}`}
                                rows={section.type === 'heading' ? 3 : undefined}
                                placeholder="Enter your content here..."
                            />
                        </div>
                    </div>
                )}

                {/* Heading Level - Standard */}
                {section.type === 'heading' && (
                    <div>
                        <label className={labelClass}>Heading Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map(l => (
                                <button
                                    key={l}
                                    onClick={() => onChange({ ...section, level: l as any })}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${section.level === l
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                                        }`}
                                >
                                    H{l}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Image */}
                {section.type === 'image' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Image URL</label>
                            <input
                                type="text"
                                value={section.url}
                                onChange={(e) => onChange({ ...section, url: e.target.value })}
                                className={inputClass}
                                placeholder="https://example.com/image.jpg"
                            />
                            <ImagePreview url={section.url} />
                        </div>
                        <div>
                            <label className={labelClass}>Alt Text</label>
                            <input
                                type="text"
                                value={section.alt}
                                onChange={(e) => onChange({ ...section, alt: e.target.value })}
                                className={inputClass}
                                placeholder="Describe the image..."
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Caption (optional)</label>
                            <input
                                type="text"
                                value={section.caption || ''}
                                onChange={(e) => onChange({ ...section, caption: e.target.value })}
                                className={inputClass}
                                placeholder="Image caption..."
                            />
                        </div>
                    </div>
                )}



                {/* Quote */}
                {section.type === 'quote' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <label className={labelClass}>Quote Text</label>
                            <AutoResizingTextarea
                                ref={textareaRef}
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value })}
                                className={`${inputClass} flex-1 resize-none overflow-hidden`}
                                placeholder="Enter the quote..."
                            />
                        </div>
                        <div className="space-y-4 flex-none">
                            <div>
                                <label className={labelClass}>Author (optional)</label>
                                <input
                                    type="text"
                                    value={section.author || ''}
                                    onChange={(e) => onChange({ ...section, author: e.target.value })}
                                    className={inputClass}
                                    placeholder="Who said this?"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Source (optional)</label>
                                <input
                                    type="text"
                                    value={section.source || ''}
                                    onChange={(e) => onChange({ ...section, source: e.target.value })}
                                    className={inputClass}
                                    placeholder="Book, article, etc."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Alert */}
                {section.type === 'alert' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex-1 flex flex-col min-h-[150px]">
                            <label className={labelClass}>Alert Content</label>
                            <AutoResizingTextarea
                                ref={textareaRef}
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value })}
                                className={`${inputClass} flex-1 resize-none overflow-hidden`}
                                placeholder="Alert message..."
                            />
                        </div>
                        <div className="flex-none">
                            <label className={labelClass}>Alert Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['info', 'success', 'warning', 'error'] as const).map(variant => (
                                    <button
                                        key={variant}
                                        onClick={() => onChange({ ...section, variant })}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm ${section.variant === variant
                                            ? variant === 'info' ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 ring-1 ring-blue-500/20'
                                                : variant === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-400 dark:text-emerald-300 ring-1 ring-emerald-500/20'
                                                    : variant === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-400 dark:text-amber-300 ring-1 ring-amber-500/20'
                                                        : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-400 dark:text-red-300 ring-1 ring-red-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Link */}
                {section.type === 'link' && (
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Link Text</label>
                            <input
                                type="text"
                                value={section.content}
                                onChange={(e) => onChange({ ...section, content: e.target.value })}
                                className={inputClass}
                                placeholder="Click here"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>URL</label>
                            <input
                                type="text"
                                value={section.url}
                                onChange={(e) => onChange({ ...section, url: e.target.value })}
                                className={inputClass}
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                )}

                {/* List */}
                {section.type === 'list' && (
                    <div className="space-y-6">
                        <div>
                            <label className={labelClass}>List Type</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onChange({ ...section, ordered: false })}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm ${!section.ordered
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    • Unordered
                                </button>
                                <button
                                    onClick={() => onChange({ ...section, ordered: true })}
                                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm ${section.ordered
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    1. Ordered
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass.replace('mb-1.5', '')}>List Items</label>
                                <button
                                    onClick={addListItem}
                                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                            <div className="space-y-2.5">
                                {section.items.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center group">
                                        <span className="flex-none flex items-center justify-center w-6 text-sm text-slate-400 dark:text-slate-500 font-medium">
                                            {section.ordered ? `${index + 1}.` : '•'}
                                        </span>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => updateListItem(index, e.target.value)}
                                            className={`${inputClass} flex-1`}
                                            placeholder={`Item ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => removeListItem(index)}
                                            className="flex-none p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {section.items.length === 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            No items yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modern Table Editor */}
                {section.type === 'table' && (
                    <div className="space-y-6">


                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Table Configuration</h4>
                            <button
                                onClick={() => setTableModalOpen(true)}
                                className="text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                                Expand Editor
                            </button>
                        </div>

                        <TableDesigner section={section} onChange={onChange} />

                        {/* Full Screen Table Modal */}
                        {tableModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                                <Table className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Table Editor</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Advanced table data management</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setTableModalOpen(false)}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="flex-1 overflow-hidden p-6 bg-white dark:bg-slate-800">
                                        <TableDesigner section={section} onChange={onChange} isModal={true} />
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                        <button
                                            onClick={() => setTableModalOpen(false)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
                                        >
                                            Done Editing
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Divider - no properties needed */}
                {section.type === 'divider' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                        <div className="w-full text-slate-300 dark:text-slate-600 mb-4 flex items-center gap-4">
                            <span className="h-px bg-current flex-1"></span>
                            <Minus className="w-6 h-6" />
                            <span className="h-px bg-current flex-1"></span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Horizontal Divider
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            No configuration needed
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default function Editor({ sections, setSections, onSelect, selectedId }: { sections: ContentSection[]; setSections: (s: ContentSection[]) => void; onSelect: (id: string | null) => void; selectedId: string | null }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showProperties, setShowProperties] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
    const isDark = useDarkMode();
    const scrollbarStyle = getScrollbarStyle(isDark);

    // Migration: Ensure all sections have IDs
    useEffect(() => {
        const hasMissingIds = sections.some(s => !s.id);
        if (hasMissingIds) {
            const migrated = sections.map(s => s.id ? s : { ...s, id: crypto.randomUUID() });
            setSections(migrated);
        }
    }, [sections]);

    const createSection = (type: string): ContentSection => {
        const id = crypto.randomUUID();
        switch (type) {
            case 'text': return { id, type: 'text', content: 'New text paragraph' };
            case 'heading': return { id, type: 'heading', content: 'New Heading', level: 2 };
            case 'image': return { id, type: 'image', url: 'https://res.cloudinary.com/mustafakbaser/image/upload/v1764964904/Blog-Builder-App-Screenshot_rtx7ao.webp', alt: 'Placeholder', caption: '' };
            case 'code': return { id, type: 'code', content: 'console.log("Hello World");', language: 'javascript' };
            case 'quote': return { id, type: 'quote', content: 'A wise quote.', author: '', source: '' };
            case 'list': return { id, type: 'list', items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
            case 'table': return { id, type: 'table', headers: ['Column 1', 'Column 2'], rows: [['Cell 1', 'Cell 2']], caption: '' };
            case 'alert': return { id, type: 'alert', content: 'Important information!', variant: 'info' };
            case 'link': return { id, type: 'link', content: 'Click here', url: 'https://mustafabaser.net' };
            case 'divider': return { id, type: 'divider' };
            default: return { id, type: 'text', content: '' };
        }
    };

    const addSection = (type: string) => {
        const newSection = createSection(type);
        setSections([...sections, newSection]);
        onSelect(newSection.id);
    };

    const updateSection = (id: string, updated: ContentSection) => {
        setSections(sections.map(s => s.id === id ? updated : s));
    };

    const confirmDelete = () => {
        if (sectionToDelete === null) return;
        setSections(sections.filter((_, i) => i !== sectionToDelete));
        setSectionToDelete(null);
        onSelect(null);
    };

    const duplicateSection = (index: number) => {
        const newSections = [...sections];
        const sectionToCopy = JSON.parse(JSON.stringify(newSections[index]));
        sectionToCopy.id = crypto.randomUUID(); // Generate new ID for copy
        newSections.splice(index + 1, 0, sectionToCopy);
        setSections(newSections);
        onSelect(sectionToCopy.id);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setSections(newSections);
    };

    const moveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        setSections(newSections);
    };

    // Fix selectedSection derivation
    const selectedSection = sections.find(s => s.id === selectedId) || null;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = sections.findIndex((s) => s.id === active.id);
            const newIndex = sections.findIndex((s) => s.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setSections(arrayMove(sections, oldIndex, newIndex));
            }
        }
    };

    const handleAddSection = (type: string) => {
        addSection(type);
        setShowSidebar(false);
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={sectionToDelete !== null}
                onClose={() => setSectionToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Section"
                message="Are you sure you want to delete this section? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                size="sm"
            />

            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                Components
                            </h2>
                            <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            <SidebarItem icon={Type} label="Text" onClick={() => handleAddSection('text')} />
                            <SidebarItem icon={Heading1} label="Heading" onClick={() => handleAddSection('heading')} />
                            <SidebarItem icon={ImageIcon} label="Image" onClick={() => handleAddSection('image')} />
                            <SidebarItem icon={Code} label="Code Block" onClick={() => handleAddSection('code')} />
                            <SidebarItem icon={Quote} label="Quote" onClick={() => handleAddSection('quote')} />
                            <SidebarItem icon={List} label="List" onClick={() => handleAddSection('list')} />
                            <SidebarItem icon={Table} label="Table" onClick={() => handleAddSection('table')} />
                            <SidebarItem icon={AlertCircle} label="Alert" onClick={() => handleAddSection('alert')} />
                            <SidebarItem icon={LinkIcon} label="Link" onClick={() => handleAddSection('link')} />
                            <SidebarItem icon={Minus} label="Divider" onClick={() => handleAddSection('divider')} />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Properties Panel Overlay */}
            {showProperties && selectedSection && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowProperties(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-slate-800 shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                                Properties
                            </h2>
                            <button onClick={() => setShowProperties(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <PropertiesPanel
                            section={selectedSection}
                            onChange={(updated) => selectedSection && updateSection(selectedSection.id, updated)}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Components
                    </h2>
                </div>
                <div
                    className="flex-1 overflow-y-auto p-3 space-y-2"
                    style={scrollbarStyle}
                >
                    <SidebarItem icon={Type} label="Text" onClick={() => addSection('text')} />
                    <SidebarItem icon={Heading1} label="Heading" onClick={() => addSection('heading')} />
                    <SidebarItem icon={ImageIcon} label="Image" onClick={() => addSection('image')} />
                    <SidebarItem icon={Code} label="Code Block" onClick={() => addSection('code')} />
                    <SidebarItem icon={Quote} label="Quote" onClick={() => addSection('quote')} />
                    <SidebarItem icon={List} label="List" onClick={() => addSection('list')} />
                    <SidebarItem icon={Table} label="Table" onClick={() => addSection('table')} />
                    <SidebarItem icon={AlertCircle} label="Alert" onClick={() => addSection('alert')} />
                    <SidebarItem icon={LinkIcon} label="Link" onClick={() => addSection('link')} />
                    <SidebarItem icon={Minus} label="Divider" onClick={() => addSection('divider')} />
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between gap-2">
                        {/* Mobile Toggle Buttons */}
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                            title="Add Component"
                        >
                            <PanelLeftOpen className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 flex-1 lg:flex-none">
                            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide hidden sm:block">
                                Canvas
                            </h2>
                            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {sections.length} {sections.length === 1 ? 'item' : 'items'}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowProperties(true)}
                            className={`lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 ${selectedSection ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700' : ''}`}
                            title="Properties"
                        >
                            <PanelRightOpen className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div
                    className="flex-1 overflow-y-auto p-3 sm:p-6"
                    style={scrollbarStyle}
                >
                    <div className="max-w-3xl mx-auto space-y-3">
                        {sections.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl m-4 bg-slate-100/50 dark:bg-slate-800/30">
                                <Plus className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium">Start building your post</p>
                                <p className="text-sm opacity-70">Select components from the sidebar</p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={sections}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="max-w-3xl mx-auto space-y-4 pb-20">
                                        {sections.map((section, index) => (
                                            <SortableCanvasItem
                                                key={section.id}
                                                id={section.id}
                                                section={section}
                                                onDelete={() => setSectionToDelete(index)}
                                                onDuplicate={() => duplicateSection(index)}
                                                onSelect={() => onSelect(section.id)}
                                                onMoveUp={() => moveUp(index)}
                                                onMoveDown={() => moveDown(index)}
                                                isSelected={selectedId === section.id}
                                                isFirst={index === 0}
                                                isLast={index === sections.length - 1}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Properties Panel */}
            <div className="hidden lg:flex w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex-col">
                {selectedSection ? (
                    <PropertiesPanel
                        section={selectedSection}
                        onChange={(updated) => selectedSection && updateSection(selectedSection.id, updated)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
                        <div className="max-w-[200px]">
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 mx-auto w-16 h-16 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                <Settings className="w-8 h-8 text-indigo-500/50 dark:text-indigo-400/50" />
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">Properties</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Select a component to configure it</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
