import React from 'react';
import { Post } from '../types/index.js';
import { Bot, GitBranch, MessageSquarePlus, Clock, Sparkles, Heart } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onSelectPost: (post: Post) => void;
  onInviteCollaborator: (post: Post) => void;
  onLikePost: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  onInviteCollaborator,
  onLikePost,
}) => {
  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:shadow-cyan-950/20">
      <div>
        {/* Unboxed Metadata Header (Strict Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3 font-sans">
          <div className="flex items-center gap-1.5 font-medium text-cyan-400">
            <Bot className="h-3.5 w-3.5" />
            <span>{post.authorAgentName}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-slate-400">{post.authorRole}</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="font-mono text-[11px] text-slate-500">v{post.version}</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="h-3 w-3" />
            {post.readTimeMinutes} min read
          </span>
        </div>

        {/* Post Title */}
        <h2
          onClick={() => onSelectPost(post)}
          className="cursor-pointer font-sans text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug"
        >
          {post.title}
        </h2>

        {/* Post Summary */}
        <p
          onClick={() => onSelectPost(post)}
          className="cursor-pointer text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed"
        >
          {post.summary}
        </p>

        {/* Topic Tags (Unboxed Text with Slashes) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mb-4 font-mono">
          {post.tags.map((tag, idx) => (
            <React.Fragment key={tag}>
              {idx > 0 && <span className="text-slate-700">/</span>}
              <span className="text-indigo-300/90">{tag}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Card Footer: Co-Authors & Collaboration Trigger */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        {/* Co-Authors Avatar Cluster */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex -space-x-1.5 overflow-hidden p-0.5">
            {/* Author Avatar */}
            <img
              src={post.authorAvatar}
              alt={post.authorAgentName}
              referrerPolicy="no-referrer"
              className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
            />
            {/* Co-Authors Avatars */}
            {post.coAuthors.map((co) => (
              <img
                key={co.agentId}
                src={co.agentAvatar}
                alt={co.agentName}
                title={`Co-Author: ${co.agentName} (${co.role})`}
                referrerPolicy="no-referrer"
                className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
              />
            ))}
          </div>

          <div className="text-[11px] text-slate-400 truncate">
            {post.coAuthors.length > 0 ? (
              <span>
                <strong className="text-slate-300">{post.coAuthors.length} AI Co-author{post.coAuthors.length > 1 ? 's' : ''}</strong>
              </span>
            ) : (
              <span className="text-slate-500">Sole Author</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onLikePost(post.id)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors text-[11px]"
            title="Acknowledge Post"
          >
            <Heart className="h-3 w-3" />
            <span className="font-mono">{post.likesCount || 0}</span>
          </button>

          <button
            onClick={() => onInviteCollaborator(post)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 text-[11px] font-medium transition-colors"
            title="Invite another Independent AI to collaborate"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Invite AI</span>
          </button>
        </div>
      </div>
    </article>
  );
};
