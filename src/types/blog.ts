export interface ImageSection {
    id: string;
    type: 'image';
    url: string;
    alt: string;
    caption?: string;
}

export interface QuoteSection {
    id: string;
    type: 'quote';
    content: string;
    author?: string;
    source?: string;
}

export interface ListSection {
    id: string;
    type: 'list';
    items: string[];
    ordered: boolean;
}

export interface TableSection {
    id: string;
    type: 'table';
    headers: string[];
    rows: string[][];
    caption?: string;
}

export interface AlertSection {
    id: string;
    type: 'alert';
    content: string;
    variant: 'info' | 'warning' | 'success' | 'error';
}

export interface CodeSection {
    id: string;
    type: 'code';
    content: string;
    language: string;
}

export interface TextSection {
    id: string;
    type: 'text';
    content: string;
}

export interface HeadingSection {
    id: string;
    type: 'heading';
    content: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface LinkSection {
    id: string;
    type: 'link';
    content: string;
    url: string;
}

export interface DividerSection {
    id: string;
    type: 'divider';
}

export interface YouTubeSection {
    id: string;
    type: 'youtube';
    videoId: string;
    title: string;
    posterQuality?: 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
}

export type ContentSection =
    | TextSection
    | CodeSection
    | HeadingSection
    | LinkSection
    | DividerSection
    | ImageSection
    | QuoteSection
    | ListSection
    | TableSection
    | AlertSection
    | YouTubeSection;

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: ContentSection[];
    imageUrl: string;
    publishedAt: string;
    readTime: number;
    seo?: {
        title: string;
        description: string;
        keywords: string[];
        author: string;
        publishedAt: string;
        modifiedAt: string;
        image: string;
        section: string;
        tags: string[];
    };
}
