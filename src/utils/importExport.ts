import type { BlogPost } from '../types/blog';

/**
 * Validate imported JSON structure
 */
export const validateBlogPost = (data: any): data is BlogPost => {
  if (!data || typeof data !== 'object') return false;

  // Required fields
  const requiredFields = ['id', 'title', 'slug', 'category', 'excerpt', 'content', 'imageUrl', 'publishedAt'];
  const hasRequiredFields = requiredFields.every(field => field in data);

  if (!hasRequiredFields) return false;

  // Validate content is an array
  if (!Array.isArray(data.content)) return false;

  // Validate each content section has a type
  const validTypes = ['text', 'code', 'heading', 'link', 'divider', 'image', 'quote', 'list', 'table', 'alert'];
  const hasValidContent = data.content.every((section: any) =>
    section && typeof section === 'object' && validTypes.includes(section.type)
  );

  return hasValidContent;
};

/**
 * Sanitize JavaScript-specific syntax from exported files
 * Converts single quotes to double quotes and removes getter functions
 */
const sanitizeJsonString = (text: string): string => {
  let sanitized = text;

  // Remove getter functions (e.g., "get readTime() { ... }")
  // This regex matches the entire getter block including its body
  sanitized = sanitized.replace(/,?\s*get\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g, '');

  // Convert single quotes to double quotes for JSON compatibility
  // But preserve single quotes inside double-quoted strings
  sanitized = sanitized.replace(/(\w+):\s*'([^']*)'/g, '$1: "$2"');

  // Fix remaining single quotes in array values
  sanitized = sanitized.replace(/\[\s*'([^']*)'(?:\s*,\s*'([^']*)')*\s*\]/g, (match) => {
    return match.replace(/'/g, '"');
  });

  // Remove trailing commas before closing braces/brackets (invalid JSON)
  sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');

  return sanitized;
};

/**
 * Parse and validate imported JSON file
 */
export const parseImportedFile = async (file: File): Promise<BlogPost | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        // Debug log 1: Check file content
        console.log('📄 File content (first 500 chars):', text.substring(0, 500));
        console.log('📏 File length:', text.length);

        // Debug log 2: Check for common issues
        console.log('🔍 Has single quotes:', text.includes("'"));
        console.log('🔍 Has get keyword:', text.includes('get '));
        console.log('🔍 First char:', text.charAt(0));
        console.log('🔍 Last char:', text.charAt(text.length - 1));

        // Sanitize the text before parsing
        const sanitizedText = sanitizeJsonString(text);
        console.log('🧹 Sanitized (first 500 chars):', sanitizedText.substring(0, 500));
        console.log('🔍 After sanitization - Has single quotes:', sanitizedText.includes("'"));
        console.log('🔍 After sanitization - Has get keyword:', sanitizedText.includes('get '));

        const data = JSON.parse(sanitizedText);

        // Debug log 3: Successfully parsed
        console.log('✅ JSON parsed successfully');
        console.log('📦 Parsed data keys:', Object.keys(data));

        if (validateBlogPost(data)) {
          console.log('✅ Validation passed');
          resolve(data);
        } else {
          console.log('❌ Validation failed');
          reject(new Error('Invalid blog post structure'));
        }
      } catch (error) {
        // Debug log 4: Parse error details
        console.error('❌ JSON Parse Error:', error);
        if (error instanceof SyntaxError) {
          console.error('💥 Syntax Error Message:', error.message);
        }
        reject(new Error('Failed to parse JSON file'));
      }
    };

    reader.onerror = () => {
      console.error('❌ FileReader error');
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Extract keywords and tags from BlogPost SEO data
 */
export const extractMetadata = (post: BlogPost) => {
  return {
    keywords: post.seo?.keywords?.join(', ') || '',
    tags: post.seo?.tags?.join(', ') || ''
  };
};
