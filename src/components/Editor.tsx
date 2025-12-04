import type { ContentSection } from '../types/blog';
import { Type, Image as ImageIcon, Code, Quote, List, Table, AlertCircle, Link as LinkIcon, Minus, Heading1, XCircle, Plus, ChevronUp, ChevronDown } from 'lucide-react';

// Sidebar Item Component - Click to add
function SidebarItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors w-full text-left"
        >
            <Icon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700 flex-1">{label}</span>
            <Plus className="w-4 h-4 text-indigo-500" />
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

    const Icon = getIcon();

    return (
        <div
            className={`relative group flex items-start gap-3 p-4 bg-white border rounded-lg shadow-sm transition-all cursor-pointer ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-300'}`}
            onClick={onSelect}
        >
            <div className="flex flex-col gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                    disabled={isFirst}
                    className={`p-1 rounded hover:bg-gray-100 ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title="Move up"
                >
                    <ChevronUp className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                    disabled={isLast}
                    className={`p-1 rounded hover:bg-gray-100 ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title="Move down"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.type}</span>
                </div>
                <div className="text-sm text-gray-800 line-clamp-2">
                    {'content' in section ? (section.content || <span className="text-gray-400 italic">Empty content...</span>) : <span className="text-gray-400 italic">Divider</span>}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                title="Delete"
            >
                <XCircle className="w-5 h-5" />
            </button>
        </div>
    );
}

// Properties Panel Component
function PropertiesPanel({ section, onChange }: { section: ContentSection | null; onChange: (updated: ContentSection) => void }) {
    if (!section) return <div className="p-6 text-center text-gray-500">Select an item to edit its properties</div>;

    return (
        <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-4 capitalize">{section.type} Properties</h3>

            {'content' in section && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    {section.type === 'text' || section.type === 'quote' || section.type === 'alert' ? (
                        <textarea
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    ) : (
                        <input
                            type="text"
                            value={section.content}
                            onChange={(e) => onChange({ ...section, content: e.target.value } as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    )}
                </div>
            )}

            {section.type === 'heading' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                        value={section.level}
                        onChange={(e) => onChange({ ...section, level: Number(e.target.value) as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {[1, 2, 3, 4, 5, 6].map(l => <option key={l} value={l}>H{l}</option>)}
                    </select>
                </div>
            )}

            {section.type === 'image' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input
                            type="text"
                            value={section.url}
                            onChange={(e) => onChange({ ...section, url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                        <input
                            type="text"
                            value={section.alt}
                            onChange={(e) => onChange({ ...section, alt: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                        <input
                            type="text"
                            value={section.caption || ''}
                            onChange={(e) => onChange({ ...section, caption: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </>
            )}

            {section.type === 'code' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <input
                        type="text"
                        value={section.language}
                        onChange={(e) => onChange({ ...section, language: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            )}

            {section.type === 'alert' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variant</label>
                    <select
                        value={section.variant}
                        onChange={(e) => onChange({ ...section, variant: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                        <option value="error">Error</option>
                    </select>
                </div>
            )}
        </div>
    );
}

export default function Editor({ sections, setSections, onSelect, selectedId }: { sections: ContentSection[]; setSections: (s: ContentSection[]) => void; onSelect: (id: string | null) => void; selectedId: string | null }) {

    const createSection = (type: string): ContentSection => {
        switch (type) {
            case 'text': return { type: 'text', content: 'New text paragraph' };
            case 'heading': return { type: 'heading', content: 'New Heading', level: 2 };
            case 'image': return { type: 'image', url: 'https://via.placeholder.com/800x400', alt: 'Placeholder', caption: '' };
            case 'code': return { type: 'code', content: 'console.log("Hello World");', language: 'javascript' };
            case 'quote': return { type: 'quote', content: 'A wise quote.', author: 'Anonymous' };
            case 'list': return { type: 'list', items: ['Item 1', 'Item 2'], ordered: false };
            case 'table': return { type: 'table', headers: ['Col 1', 'Col 2'], rows: [['Cell 1', 'Cell 2']] };
            case 'alert': return { type: 'alert', content: 'Important alert!', variant: 'info' };
            case 'link': return { type: 'link', content: 'Click me', url: '#' };
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

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Components</h2>
                    <p className="text-xs text-gray-500 mt-1">Click to add</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Canvas</h2>
                    <div className="text-sm text-gray-500">Click components to add them</div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="max-w-2xl mx-auto space-y-4 min-h-[500px]">
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
                            <div className="text-center text-gray-400 py-20 border-2 border-dashed border-gray-300 rounded-xl">
                                Click components from the sidebar to start building your post
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                {selectedSection ? (
                    <PropertiesPanel
                        section={selectedSection}
                        onChange={(updated) => updateSection(selectedIndex, updated)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
                        Select a component on the canvas to edit its properties
                    </div>
                )}
            </div>
        </div>
    );
}
