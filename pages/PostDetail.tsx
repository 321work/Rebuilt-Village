import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { Section } from '../components/Section';
import { Button } from '../components/Button';
import { getPostBySlug, SanityPost } from '../services/sanityService';
import { urlFor } from '../services/sanityClient';

export const PostDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<SanityPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPost() {
            if (!slug) return;
            try {
                const data = await getPostBySlug(slug);
                setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [slug]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-film-black">
                <div className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse italic">
                    Loading Reel...
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-film-black px-4">
                <h2 className="text-3xl font-serif italic text-white mb-6">Scene Not Found</h2>
                <p className="text-slate-400 mb-8 font-mono text-xs uppercase tracking-widest">The requested post could not be retrieved from the archives.</p>
                <Link to="/blog">
                    <Button variant="outline">
                        <ArrowLeft size={16} className="mr-2" /> Back to Journal
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <article className="bg-film-black min-h-screen">
            {/* Hero Image Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img
                    src={post.mainImage ? urlFor(post.mainImage).width(1920).height(1080).format('webp').url() : 'https://picsum.photos/seed/post/1920/1080'}
                    alt={post.title}
                    width={1920}
                    height={1080}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover grayscale opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-film-black via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="container mx-auto">
                        <Link to="/blog" className="inline-flex items-center text-primary text-xs font-mono uppercase tracking-[0.2em] mb-8 hover:text-white transition-colors group">
                            <ArrowLeft size={14} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                            Back to Journal
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-6 leading-tight max-w-4xl">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                            <div className="flex items-center">
                                <User size={14} className="mr-2 text-primary" />
                                {post.author}
                            </div>
                            <div className="flex items-center">
                                <Calendar size={14} className="mr-2 text-primary" />
                                {formatDate(post.publishedAt)}
                            </div>
                            <div className="flex items-center">
                                <Clock size={14} className="mr-2 text-primary" />
                                {Math.ceil((post.body || '').length / 1000)} min read
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <Section className="pb-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="prose prose-invert prose-slate lg:prose-lg font-light leading-relaxed 
                                      prose-headings:font-serif prose-headings:italic prose-headings:font-normal
                                      prose-a:text-primary prose-strong:text-white prose-blockquote:border-primary
                                      prose-blockquote:bg-slate-900/50 prose-blockquote:p-6 prose-blockquote:rounded-lg
                                      prose-img:rounded-xl prose-img:border prose-img:border-slate-800">
                            {post.body ? (
                                // Blog body is markdown authored by trusted CMS editors (admin/editor
                                // roles), rendered to HTML by marked. The surrounding .prose classes style it.
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(post.body, { async: false }) as string }} />
                            ) : (
                                <p className="italic text-slate-500">The content of this post is currently in production.</p>
                            )}
                        </div>

                        <div className="mt-20 pt-10 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                                    End of Sequence
                                </div>
                                <div className="flex space-x-4">
                                    <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                        Back to Top
                                    </Button>
                                    <Link to="/blog">
                                        <Button variant="secondary" size="sm">
                                            More Stories
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </article>
    );
};
