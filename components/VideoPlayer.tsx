import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
    aspectRatio?: 'video' | 'square' | 'portrait';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    src,
    poster,
    title = "Film Screening",
    aspectRatio = 'video'
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [progress, setProgress] = useState(0);
    const prefersReduced = useReducedMotion();

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgress = () => {
        if (videoRef.current) {
            const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(current);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current?.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
    };

    return (
        <div
            className={`relative group bg-black border border-border overflow-hidden ${aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]'
                }`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                aria-label={title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                onTimeUpdate={handleProgress}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onCanPlay={() => setIsLoading(false)}
                onClick={togglePlay}
                muted={isMuted}
                loop
                playsInline
            />

            {/* Cinematic Overlays */}
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Title Tag */}
            <div className="absolute top-4 left-4 z-10">
                <div className="font-serif italic text-white text-sm tracking-wide">{title}</div>
            </div>

            {/* Center Play Button (Visible when paused) */}
            <AnimatePresence>
                {!isPlaying && !isLoading && (
                    <motion.button
                        initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.9 }}
                        onClick={togglePlay}
                        aria-label="Play video"
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-sm group-hover:border-primary/50 transition-colors z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Play fill="white" className="text-white ml-1" size={24} aria-hidden="true" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-30"
                    >
                        <Loader2 className="text-primary animate-spin" size={32} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls Overlay */}
            <motion.div
                animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                className="absolute bottom-0 left-0 right-0 p-4 z-40 space-y-3"
            >
                {/* Progress Bar */}
                <div className="h-0.5 bg-white/10 w-full overflow-hidden relative cursor-pointer group/progress">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-primary"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            className="text-white hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                            {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                        </button>
                        <button
                            onClick={toggleMute}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                            className="text-white hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                            {isMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleFullscreen}
                            aria-label="Enter fullscreen"
                            className="text-white hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                            <Maximize size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
