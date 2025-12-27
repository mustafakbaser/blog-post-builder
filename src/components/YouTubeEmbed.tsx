import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface YouTubeEmbedProps {
    videoId: string;
    title: string;
    posterQuality?: 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
    className?: string;
}

export default function YouTubeEmbed({
    videoId,
    title,
    posterQuality = 'maxresdefault',
    className = '',
}: YouTubeEmbedProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [ref, isInView] = useIntersectionObserver<HTMLDivElement>({
        triggerOnce: true,
        rootMargin: '100px',
    });

    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/${posterQuality}.jpg`;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

    const handlePlayClick = () => {
        setIsLoaded(true);
    };

    return (
        <div
            ref={ref}
            className={`relative w-full aspect-video overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg ${className}`}
        >
            {!isLoaded ? (
                <div className="group relative h-full w-full cursor-pointer" onClick={handlePlayClick}>
                    {/* Thumbnail Image */}
                    {isInView && (
                        <img
                            src={thumbnailUrl}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />

                    {/* Play Button */}
                    <button
                        type="button"
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 p-4 text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                        aria-label={`Play ${title}`}
                    >
                        <svg
                            className="h-8 w-8"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>

                    {/* Title Overlay (SEO & UX) */}
                    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
                        <h3 className="text-sm font-medium text-white line-clamp-1 drop-shadow-md lg:text-base">
                            {title}
                        </h3>
                    </div>
                </div>
            ) : (
                <iframe
                    src={embedUrl}
                    title={title}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    frameBorder="0"
                ></iframe>
            )}
        </div>
    );
}
