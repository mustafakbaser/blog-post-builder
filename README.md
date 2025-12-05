# Blog Post Builder

A visual editor for creating structured blog posts with real-time preview. Build rich content with headings, code blocks, images, tables, quotes, and more, then export to JSON for your blog platform.

<p align="center">
  <img src="https://res.cloudinary.com/mustafakbaser/image/upload/v1764964904/Blog-Builder-App-Screenshot_rtx7ao.webp" alt="Blog Post Builder Screenshot" width="100%" style="max-width: 800px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.05);">
</p>

## Features

- **Visual Block Editor**: Drag-and-drop sections with an intuitive canvas interface
- **Advanced Properties Panel**: Customize every aspect of your blocks (style, content, variants)
- **Live Preview**: Real-time responsive preview (Desktop & Mobile views)
- **Rich Content Types**: Text, Headings, Code (50+ langs), Images, Quotes, Lists, Tables, Alerts, Dividers
- **History Management**: Robust Undo/Redo support with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`)
- **Productivity Tools**: Duplicate sections, reorder with ease, and safe delete confirmation
- **JSON Export & Import**: Save your work and continue later, or export for your CMS
- **Dark Mode**: System-aware dark/light theme support


## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mustafakbaser/blog-post-builder.git
cd blog-post-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Add Content** — Click the "+" button or use the section panel to add new content blocks
2. **Edit Sections** — Select any block to edit its content and properties
3. **Reorder** — Drag sections to rearrange your content
4. **Preview** — Toggle to preview mode to see the final result
5. **Export** — Click the download icon to export your post as JSON

### Supported Content Types

| Type | Description |
|------|-------------|
| Text | Paragraph content with markdown link support |
| Heading | H1-H6 with auto-generated anchor IDs |
| Code | Syntax-highlighted code blocks |
| Image | Images with optional captions |
| Quote | Blockquotes with author attribution |
| List | Ordered and unordered lists |
| Table | Data tables with headers |
| Alert | Info, warning, success, and error callouts |
| Divider | Horizontal separators |
| Link | Styled external links |

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **dnd-kit** — Drag and drop functionality
- **Lucide React** — Icon library
- **date-fns** — Date formatting

## Project Structure

```
src/
├── components/
│   ├── Editor.tsx      # Main editor with section management
│   └── PreviewPost.tsx # Blog post preview renderer
├── types/
│   └── blog.ts         # TypeScript interfaces
├── App.tsx             # Root component with metadata form
├── index.css           # Global styles and CSS variables
└── main.tsx            # Entry point
```

## Export Format

The exported JSON follows this structure:

```json
{
  "title": "Your Post Title",
  "slug": "your-post-title",
  "excerpt": "Brief description...",
  "category": "Technology",
  "tags": ["react", "typescript"],
  "imageUrl": "https://...",
  "readTime": 5,
  "publishedAt": "2024-01-15T10:00:00.000Z",
  "content": [
    { "type": "heading", "level": 2, "content": "Introduction" },
    { "type": "text", "content": "Your paragraph..." },
    { "type": "code", "language": "typescript", "content": "..." }
  ]
}
```

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
