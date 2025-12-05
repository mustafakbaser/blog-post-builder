import type { BlogPost } from '../types/blog';

const STORAGE_KEY = 'blog-post-builder-data';

export interface StorageData {
  post: BlogPost;
  keywordsInput: string;
  tagsInput: string;
  includeReadTime: boolean;
  customCategory: boolean;
  activeTab: 'editor' | 'preview' | 'metadata';
  lastSaved: string;
}

/**
 * Save blog post data to localStorage
 */
export const saveToLocalStorage = (data: StorageData): void => {
  try {
    const dataWithTimestamp = {
      ...data,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

/**
 * Load blog post data from localStorage
 */
export const loadFromLocalStorage = (): StorageData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data) as StorageData;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

/**
 * Clear blog post data from localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

/**
 * Check if there is saved data in localStorage
 */
export const hasSavedData = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
