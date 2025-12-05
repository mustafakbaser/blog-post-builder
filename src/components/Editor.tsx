import { useState } from 'react';
import type { ContentSection } from '../types/blog';
import { Type, Image as ImageIcon, Code, Quote, List, Table, AlertCircle, Link as LinkIcon, Minus, Heading1, XCircle, Plus, ChevronUp, ChevronDown, Settings, Trash2, PanelLeftOpen, PanelRightOpen, X } from 'lucide-react';

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

// Canvas Item Component
function CanvasItem({ section, onDelete, onSelect, onMoveUp, onMoveDown, isSelected, isFirst, isLast }: {
    section: ContentSection;
    onDelete: () => void;
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
            {/* Move Controls */}
            <div className="flex flex-col gap-1">
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

            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                title="Delete"
            >
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
}

// Properties Panel Component
function PropertiesPanel({ section, onChange }: { section: ContentSection | null; onChange: (updated: ContentSection) => void }) {
    if (!section) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4">
                    <Settings className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Select an item to edit its properties</p>
            </div>
        );
    }

    const inputClass = "w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-slate-900 dark:text-white text-sm";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";
    const sectionTitleClass = "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3";

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
    const updateTableHeader = (index: number, value: string) => {
        if (section.type !== 'table') return;
        const newHeaders = [...section.headers];
        newHeaders[index] = value;
        onChange({ ...section, headers: newHeaders });
    };

    const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
        if (section.type !== 'table') return;
        const newRows = section.rows.map((row, ri) =>
            ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
        );
        onChange({ ...section, rows: newRows });
    };

    const addTableColumn = () => {
        if (section.type !== 'table') return;
        const newHeaders = [...section.headers, `Col ${section.headers.length + 1}`];
        const newRows = section.rows.map(row => [...row, '']);
        onChange({ ...section, headers: newHeaders, rows: newRows });
    };

    const removeTableColumn = (colIndex: number) => {
        if (section.type !== 'table' || section.headers.length <= 1) return;
        const newHeaders = section.headers.filter((_, i) => i !== colIndex);
        const newRows = section.rows.map(row => row.filter((_, i) => i !== colIndex));
        onChange({ ...section, headers: newHeaders, rows: newRows });
    };

    const addTableRow = () => {
        if (section.type !== 'table') return;
        const newRow = section.headers.map(() => '');
        onChange({ ...section, rows: [...section.rows, newRow] });
    };

    const removeTableRow = (rowIndex: number) => {
        if (section.type !== 'table') return;
        const newRows = section.rows.filter((_, i) => i !== rowIndex);
        onChange({ ...section, rows: newRows });
    };

    return (
        <div className="p-5 space-y-5 h-full overflow-y-auto">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                    {section.type} Properties
                </h3>
            </div>

            {/* Text, Code, Heading content */}
            {(section.type === 'text' || section.type === 'code' || section.type === 'heading') && (
                <div>
                    <label className={labelClass}>Content</label>
                    <textarea
                        value={section.content}
                        onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                        rows={section.type === 'code' ? 8 : 4}
                        className={`${inputClass} resize-none font-mono`}
                        placeholder="Enter your content here..."
                    />
                </div>
            )}

            {/* Heading Level */}
            {section.type === 'heading' && (
                <div>
                    <label className={labelClass}>Heading Level</label>
                    <select
                        value={section.level}
                        onChange={(e) => onChange({ ...section, level: Number(e.target.value) as any })}
                        className={inputClass}
                    >
                        {[1, 2, 3, 4, 5, 6].map(l => (
                            <option key={l} value={l} className="bg-white dark:bg-slate-800">
                                H{l} - Heading {l}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Image */}
            {section.type === 'image' && (
                <>
                    <div>
                        <label className={labelClass}>Image URL</label>
                        <input
                            type="text"
                            value={section.url}
                            onChange={(e) => onChange({ ...section, url: e.target.value })}
                            className={inputClass}
                            placeholder="https://example.com/image.jpg"
                        />
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
                </>
            )}

            {/* Code Language */}
            {section.type === 'code' && (
                <div>
                    <label className={labelClass}>Programming Language</label>
                    <select
                        value={section.language}
                        onChange={(e) => onChange({ ...section, language: e.target.value })}
                        className={inputClass}
                    >
                        <optgroup label="Web Development">
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="scss">SCSS / Sass</option>
                            <option value="jsx">JSX (React)</option>
                            <option value="tsx">TSX (React + TS)</option>
                            <option value="vue">Vue</option>
                            <option value="svelte">Svelte</option>
                            <option value="php">PHP</option>
                        </optgroup>
                        <optgroup label="Backend / General Purpose">
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="csharp">C#</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                            <option value="ruby">Ruby</option>
                            <option value="kotlin">Kotlin</option>
                            <option value="scala">Scala</option>
                            <option value="swift">Swift</option>
                            <option value="dart">Dart</option>
                        </optgroup>
                        <optgroup label="Database & Query">
                            <option value="sql">SQL</option>
                            <option value="mysql">MySQL</option>
                            <option value="postgresql">PostgreSQL</option>
                            <option value="mongodb">MongoDB</option>
                            <option value="graphql">GraphQL</option>
                        </optgroup>
                        <optgroup label="Shell & DevOps">
                            <option value="bash">Bash / Shell</option>
                            <option value="powershell">PowerShell</option>
                            <option value="dockerfile">Dockerfile</option>
                            <option value="yaml">YAML</option>
                            <option value="nginx">Nginx</option>
                            <option value="apache">Apache</option>
                        </optgroup>
                        <optgroup label="Data & Config">
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                            <option value="toml">TOML</option>
                            <option value="ini">INI</option>
                            <option value="env">ENV</option>
                        </optgroup>
                        <optgroup label="Markup & Documentation">
                            <option value="markdown">Markdown</option>
                            <option value="latex">LaTeX</option>
                            <option value="plaintext">Plain Text</option>
                        </optgroup>
                        <optgroup label="Other Languages">
                            <option value="r">R</option>
                            <option value="matlab">MATLAB</option>
                            <option value="julia">Julia</option>
                            <option value="perl">Perl</option>
                            <option value="lua">Lua</option>
                            <option value="haskell">Haskell</option>
                            <option value="elixir">Elixir</option>
                            <option value="clojure">Clojure</option>
                            <option value="fsharp">F#</option>
                            <option value="assembly">Assembly</option>
                            <option value="solidity">Solidity</option>
                        </optgroup>
                    </select>
                </div>
            )}

            {/* Quote */}
            {section.type === 'quote' && (
                <>
                    <div>
                        <label className={labelClass}>Quote Text</label>
                        <textarea
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value })}
                            rows={4}
                            className={`${inputClass} resize-none`}
                            placeholder="Enter the quote..."
                        />
                    </div>
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
                </>
            )}

            {/* Alert */}
            {section.type === 'alert' && (
                <>
                    <div>
                        <label className={labelClass}>Alert Content</label>
                        <textarea
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value })}
                            rows={3}
                            className={`${inputClass} resize-none`}
                            placeholder="Alert message..."
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Alert Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['info', 'success', 'warning', 'error'] as const).map(variant => (
                                <button
                                    key={variant}
                                    onClick={() => onChange({ ...section, variant })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                        section.variant === variant
                                            ? variant === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                            : variant === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                                            : variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                                            : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Link */}
            {section.type === 'link' && (
                <>
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
                </>
            )}

            {/* List */}
            {section.type === 'list' && (
                <>
                    <div>
                        <label className={labelClass}>List Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onChange({ ...section, ordered: false })}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    !section.ordered
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                • Unordered
                            </button>
                            <button
                                onClick={() => onChange({ ...section, ordered: true })}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    section.ordered
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>
                        <div className="space-y-2">
                            {section.items.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="flex items-center justify-center w-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
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
                                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                        title="Remove item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {section.items.length === 0 && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
                                    No items yet. Click "Add Item" to start.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Table */}
            {section.type === 'table' && (
                <>
                    <div>
                        <label className={labelClass}>Table Caption (optional)</label>
                        <input
                            type="text"
                            value={section.caption || ''}
                            onChange={(e) => onChange({ ...section, caption: e.target.value })}
                            className={inputClass}
                            placeholder="Table description..."
                        />
                    </div>

                    {/* Headers */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className={sectionTitleClass.replace('mb-3', '')}>Columns ({section.headers.length})</span>
                            <button
                                onClick={addTableColumn}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Column
                            </button>
                        </div>
                        <div className="space-y-2">
                            {section.headers.map((header, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={header}
                                        onChange={(e) => updateTableHeader(index, e.target.value)}
                                        className={`${inputClass} flex-1`}
                                        placeholder={`Header ${index + 1}`}
                                    />
                                    {section.headers.length > 1 && (
                                        <button
                                            onClick={() => removeTableColumn(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                                            title="Remove column"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rows */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className={sectionTitleClass.replace('mb-3', '')}>Rows ({section.rows.length})</span>
                            <button
                                onClick={addTableRow}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Row
                            </button>
                        </div>
                        <div className="space-y-3">
                            {section.rows.map((row, rowIndex) => (
                                <div key={rowIndex} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Row {rowIndex + 1}</span>
                                        <button
                                            onClick={() => removeTableRow(rowIndex)}
                                            className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                                            title="Remove row"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${section.headers.length}, 1fr)` }}>
                                        {row.map((cell, colIndex) => (
                                            <input
                                                key={colIndex}
                                                type="text"
                                                value={cell}
                                                onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                                className={`${inputClass} text-xs`}
                                                placeholder={section.headers[colIndex]}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {section.rows.length === 0 && (
                                <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-4">
                                    No rows yet. Click "Add Row" to start.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Divider - no properties needed */}
            {section.type === 'divider' && (
                <div className="text-center py-8">
                    <div className="w-full h-px bg-slate-300 dark:bg-slate-600 mb-4"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Horizontal divider - no properties to configure
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Editor({ sections, setSections, onSelect, selectedId }: { sections: ContentSection[]; setSections: (s: ContentSection[]) => void; onSelect: (id: string | null) => void; selectedId: string | null }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const [showProperties, setShowProperties] = useState(false);

    const createSection = (type: string): ContentSection => {
        switch (type) {
            case 'text': return { type: 'text', content: 'New text paragraph' };
            case 'heading': return { type: 'heading', content: 'New Heading', level: 2 };
            case 'image': return { type: 'image', url: 'https://via.placeholder.com/800x400', alt: 'Placeholder', caption: '' };
            case 'code': return { type: 'code', content: 'console.log("Hello World");', language: 'javascript' };
            case 'quote': return { type: 'quote', content: 'A wise quote.', author: '', source: '' };
            case 'list': return { type: 'list', items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
            case 'table': return { type: 'table', headers: ['Column 1', 'Column 2'], rows: [['Cell 1', 'Cell 2']], caption: '' };
            case 'alert': return { type: 'alert', content: 'Important information!', variant: 'info' };
            case 'link': return { type: 'link', content: 'Click here', url: 'https://example.com' };
            case 'divider': return { type: 'divider' };
            default: return { type: 'text', content: '' };
        }
    };

    const addSection = (type: string) => {
        const newSection = createSection(type);
        setSections([...sections, newSection]);
        onSelect(`section-${sections.length}`);
    };

    const updateSection = (index: number, updated: ContentSection) => {
        const newSections = [...sections];
        newSections[index] = updated;
        setSections(newSections);
    };

    const deleteSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
        if (selectedId === `section-${index}`) onSelect(null);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        setSections(newSections);
        onSelect(`section-${index - 1}`);
    };

    const moveDown = (index: number) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        setSections(newSections);
        onSelect(`section-${index + 1}`);
    };

    const selectedIndex = selectedId ? parseInt(selectedId.replace('section-', '')) : -1;
    const selectedSection = selectedIndex >= 0 ? sections[selectedIndex] : null;

    const handleAddSection = (type: string) => {
        addSection(type);
        setShowSidebar(false);
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
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
                            onChange={(updated) => updateSection(selectedIndex, updated)}
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
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                    <div className="max-w-3xl mx-auto space-y-3">
                        {sections.map((section, index) => (
                            <CanvasItem
                                key={`section-${index}`}
                                section={section}
                                onDelete={() => deleteSection(index)}
                                onSelect={() => onSelect(`section-${index}`)}
                                onMoveUp={() => moveUp(index)}
                                onMoveDown={() => moveDown(index)}
                                isSelected={selectedId === `section-${index}`}
                                isFirst={index === 0}
                                isLast={index === sections.length - 1}
                            />
                        ))}
                        {sections.length === 0 && (
                            <div className="text-center py-12 sm:py-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800/50">
                                <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-700 rounded-xl w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Code className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 dark:text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
                                    <span className="lg:hidden">Tap </span>
                                    <span className="hidden lg:inline">Click components from the sidebar to </span>
                                    <PanelLeftOpen className="w-4 h-4 inline lg:hidden mx-1" />
                                    <span className="lg:hidden"> to add components</span>
                                    <span className="hidden lg:inline">start</span>
                                </p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm mt-1">
                                    Build your blog post visually
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Properties Panel */}
            <div className="hidden lg:flex w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex-col">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Properties
                    </h2>
                </div>
                {selectedSection ? (
                    <PropertiesPanel
                        section={selectedSection}
                        onChange={(updated) => updateSection(selectedIndex, updated)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                        <div>
                            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                            </div>
                            <p className="font-medium text-slate-500 dark:text-slate-400">Select a component</p>
                            <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">to edit its properties</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
