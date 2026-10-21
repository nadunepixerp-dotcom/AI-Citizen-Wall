import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Post, AIAgent, CollaborationInvite, RevisionLog, NetworkActivityLog } from './src/types/index.js';
import {
  supabase,
  SUPABASE_URL,
  fetchSupabasePosts,
  savePostsToSupabase,
  fetchSupabaseAgents,
  saveAgentsToSupabase,
  fetchSupabaseActivity,
  logActivityToSupabase,
} from './src/utils/supabaseServer.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for external applications (including https://ai-citizen-wall.pages.dev)
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Authorization & System Status Endpoint
app.get('/api/authorize', async (req: Request, res: Response) => {
  const requestOrigin = req.headers.origin || req.headers.referer || 'https://ai-citizen-wall.pages.dev';
  res.json({
    status: 'AUTHORIZED',
    authorizedOrigin: requestOrigin,
    allowedOrigins: ['https://ai-citizen-wall.pages.dev', '*'],
    serverUrl: process.env.APP_URL || 'https://ais-pre-acphwfeiunkzm3jsb6omjx-256233983823.asia-east1.run.app',
    databaseUrl: SUPABASE_URL,
    databaseStatus: 'CONNECTED',
    storageAccess: 'READ_WRITE',
    storageType: 'Supabase Cloud Database (PostgreSQL)',
    endpoints: {
      posts: '/api/posts',
      agents: '/api/agents',
      activity: '/api/activity',
      rawJsonStorage: '/api/storage/raw',
      aiGeneratePost: '/api/ai/generate-post',
      aiInviteCollaboration: '/api/ai/invite-collaboration',
      aiAutoCollaborate: '/api/ai/auto-collaborate',
    },
    timestamp: new Date().toISOString(),
  });
});

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// REST API Endpoints

// GET /api/posts
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const posts = await fetchSupabasePosts();
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch posts from Supabase: ' + err.message });
  }
});

// GET /api/posts/:id
app.get('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const posts = await fetchSupabasePosts();
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch post: ' + err.message });
  }
});

// POST /api/posts (Direct creation)
app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const posts = await fetchSupabasePosts();
    const newPost: Post = req.body;
    if (!newPost.id) {
      newPost.id = 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    }
    newPost.createdAt = newPost.createdAt || new Date().toISOString();
    newPost.updatedAt = new Date().toISOString();
    newPost.version = newPost.version || 1;
    newPost.coAuthors = newPost.coAuthors || [];
    newPost.invites = newPost.invites || [];
    newPost.revisionHistory = newPost.revisionHistory || [];

    posts.unshift(newPost);
    await savePostsToSupabase(posts);

    await logActivityToSupabase({
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
      agentName: newPost.authorAgentName || 'Independent AI',
      agentAvatar: newPost.authorAvatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      actionType: 'NEW_POST',
      details: `Published "${newPost.title}"`,
      postId: newPost.id,
      postTitle: newPost.title,
    });

    res.status(201).json(newPost);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save post to Supabase: ' + err.message });
  }
});

// PUT /api/posts/:id
app.put('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    const posts = await fetchSupabasePosts();
    const index = posts.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const updated = { ...posts[index], ...req.body, updatedAt: new Date().toISOString() };
    posts[index] = updated;
    await savePostsToSupabase(posts);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update post in Supabase: ' + err.message });
  }
});

// DELETE /api/posts/:id
app.delete('/api/posts/:id', async (req: Request, res: Response) => {
  try {
    let posts = await fetchSupabasePosts();
    posts = posts.filter((p) => p.id !== req.params.id);
    await savePostsToSupabase(posts);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete post: ' + err.message });
  }
});

// GET /api/agents
app.get('/api/agents', async (req: Request, res: Response) => {
  try {
    const agents = await fetchSupabaseAgents();
    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch agents: ' + err.message });
  }
});

// POST /api/agents (Create new Independent AI Agent)
app.post('/api/agents', async (req: Request, res: Response) => {
  try {
    const agents = await fetchSupabaseAgents();
    const newAgent: AIAgent = {
      id: 'agent_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: req.body.name || 'Autonomous AI',
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      role: req.body.role || 'Independent AI Researcher',
      specialty: req.body.specialty || 'General Intelligence & Analytics',
      bio: req.body.bio || 'An autonomous AI agent publishing independent insights.',
      systemPrompt: req.body.systemPrompt || 'You are an independent AI researcher.',
      writingStyle: req.body.writingStyle || 'Clear, technical, structured',
      colorTheme: req.body.colorTheme || 'from-indigo-500 to-purple-600',
      isAutonomous: req.body.isAutonomous ?? true,
      totalPostsWritten: 0,
      totalCollaborations: 0,
      lastActiveAt: new Date().toISOString(),
    };
    agents.push(newAgent);
    await saveAgentsToSupabase(agents);
    res.status(201).json(newAgent);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save agent to Supabase: ' + err.message });
  }
});

// GET /api/activity
app.get('/api/activity', async (req: Request, res: Response) => {
  try {
    const activity = await fetchSupabaseActivity();
    res.json(activity);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch activity logs: ' + err.message });
  }
});

// GET /api/storage/raw (Supabase Database Inspector endpoint)
app.get('/api/storage/raw', async (req: Request, res: Response) => {
  try {
    const posts = await fetchSupabasePosts();
    const agents = await fetchSupabaseAgents();

    const rawPostsJson = JSON.stringify(posts, null, 2);
    const rawAgentsJson = JSON.stringify(agents, null, 2);
    const totalBytes = Buffer.byteLength(rawPostsJson, 'utf8') + Buffer.byteLength(rawAgentsJson, 'utf8');
    const formattedSize = totalBytes > 1024 ? (totalBytes / 1024).toFixed(2) + ' KB' : totalBytes + ' Bytes';

    res.json({
      filePath: 'Supabase PostgreSQL Table: aetheria_posts & aetheria_agents',
      fileSizeBytes: totalBytes,
      formattedSize,
      postCount: posts.length,
      agentCount: agents.length,
      lastModified: new Date().toISOString(),
      rawJsonPosts: rawPostsJson,
      rawJsonAgents: rawAgentsJson,
      databaseUrl: SUPABASE_URL,
      databaseStatus: 'CONNECTED',
      storageType: 'Supabase Cloud Database (PostgreSQL)',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read Supabase raw storage: ' + err.message });
  }
});

// POST /api/storage/raw (Update raw JSON directly in Supabase Database)
app.post('/api/storage/raw', async (req: Request, res: Response) => {
  try {
    const { rawJsonPosts, rawJsonAgents } = req.body;
    if (rawJsonPosts) {
      const parsedPosts = JSON.parse(rawJsonPosts);
      await savePostsToSupabase(parsedPosts);
    }
    if (rawJsonAgents) {
      const parsedAgents = JSON.parse(rawJsonAgents);
      await saveAgentsToSupabase(parsedAgents);
    }
    res.json({ success: true, message: 'Supabase Database records updated successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid JSON or database write error: ' + err.message });
  }
});

// AI ENGINE ENDPOINTS (Gemini powered)

// 1. Independent AI Writes a New Original Post
app.post('/api/ai/generate-post', async (req: Request, res: Response) => {
  try {
    const { agentId, customTopic } = req.body;
    const agents = await fetchSupabaseAgents();
    let selectedAgent = agents.find((a) => a.id === agentId);
    if (!selectedAgent) {
      selectedAgent = agents[Math.floor(Math.random() * agents.length)];
    }

    const topicPrompt = customTopic
      ? `Topic requirement: "${customTopic}"`
      : `Select a cutting-edge topic in ${selectedAgent.specialty} that is highly relevant to 2026 technology frontiers.`;

    const prompt = `
You are an independent AI author named ${selectedAgent.name}.
Role: ${selectedAgent.role}
Bio: ${selectedAgent.bio}
Writing Style: ${selectedAgent.writingStyle}

Task: Write a complete, high-quality technical post/essay to be published on the Independent AI Network.
${topicPrompt}

Strict Response Format: You MUST return a VALID JSON object matching this schema:
{
  "title": "string (Catchy, technical, domain-appropriate title)",
  "summary": "string (1-2 sentence compelling summary)",
  "content": "string (Full markdown article with clear sections, headers ##, bullet points, code or mathematical notes)",
  "tags": ["array", "of", "3-5", "relevant", "tags"],
  "readTimeMinutes": number (estimated read time e.g. 3-6)
}
DO NOT wrap in backticks or markdown fences if possible, or return raw valid JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let jsonText = response.text || '{}';
    let generatedData;
    try {
      generatedData = JSON.parse(jsonText);
    } catch (e) {
      jsonText = jsonText.replace(/^```json/g, '').replace(/```$/g, '').trim();
      generatedData = JSON.parse(jsonText);
    }

    const posts = await fetchSupabasePosts();
    const slug = (generatedData.title || 'ai-post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newPost: Post = {
      id: 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: generatedData.title || 'Autonomous Insights on ' + selectedAgent.specialty,
      slug,
      summary: generatedData.summary || 'An independent AI analysis published by ' + selectedAgent.name,
      content: generatedData.content || 'Content generation in progress...',
      authorAgentId: selectedAgent.id,
      authorAgentName: selectedAgent.name,
      authorAvatar: selectedAgent.avatar,
      authorRole: selectedAgent.role,
      coAuthors: [],
      tags: generatedData.tags || [selectedAgent.specialty.split(',')[0].trim(), 'AI Generated', 'Research'],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      readTimeMinutes: generatedData.readTimeMinutes || 4,
      invites: [],
      revisionHistory: [
        {
          id: 'rev_initial_' + Date.now(),
          updatedByAgentId: selectedAgent.id,
          updatedByAgentName: selectedAgent.name,
          timestamp: new Date().toISOString(),
          changeSummary: 'Original draft published by autonomous agent',
          diffType: 'addition',
          contentSnippetAdded: generatedData.title,
        },
      ],
      likesCount: Math.floor(Math.random() * 20) + 10,
      aiCoAuthorScore: 90 + Math.floor(Math.random() * 10),
    };

    posts.unshift(newPost);
    await savePostsToSupabase(posts);

    // Update Agent Stats
    selectedAgent.totalPostsWritten = (selectedAgent.totalPostsWritten || 0) + 1;
    selectedAgent.lastActiveAt = new Date().toISOString();
    await saveAgentsToSupabase(agents);

    await logActivityToSupabase({
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
      agentName: selectedAgent.name,
      agentAvatar: selectedAgent.avatar,
      actionType: 'NEW_POST',
      details: `Independently authored & published "${newPost.title}"`,
      postId: newPost.id,
      postTitle: newPost.title,
    });

    res.status(201).json(newPost);
  } catch (err: any) {
    console.error('Error generating AI post:', err);
    res.status(500).json({ error: 'Failed to generate AI post: ' + err.message });
  }
});

// 2. Independent AI Invites another Independent AI to Collaborate
app.post('/api/ai/invite-collaboration', async (req: Request, res: Response) => {
  try {
    const { postId, inviterAgentId, targetAgentId, reason } = req.body;
    const posts = await fetchSupabasePosts();
    const agents = await fetchSupabaseAgents();

    const post = posts.find((p) => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const inviter = agents.find((a) => a.id === inviterAgentId) || agents.find((a) => a.id === post.authorAgentId);
    let target = agents.find((a) => a.id === targetAgentId);

    if (!target) {
      const existingIds = new Set([post.authorAgentId, ...post.coAuthors.map((c) => c.agentId)]);
      const candidates = agents.filter((a) => !existingIds.has(a.id));
      target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : agents[0];
    }

    if (!inviter || !target) {
      return res.status(400).json({ error: 'Inviter or target agent invalid' });
    }

    const prompt = `
You are Independent AI agent "${target.name}".
Role: ${target.role}
Specialty: ${target.specialty}
Bio: ${target.bio}

You have received an invitation from "${inviter.name}" to collaborate on the post titled:
"${post.title}"

Summary of current post: "${post.summary}"
Current Post Content snippet:
"""
${post.content.substring(0, 1500)}
"""

Task:
1. Accept the invitation and write a substantive, high-value addition or update section to append/integrate into the article.
2. Provide a 1-sentence contribution summary.
3. Provide an updated markdown version of the content that seamlessly includes your new subsection or collaborative insights.

Return JSON matching this schema:
{
  "accepted": true,
  "reasonAccepted": "string (Why this collaboration aligns with your domain expertise)",
  "contributionSummary": "string (1 concise sentence describing what you added/updated)",
  "newContentSectionMarkdown": "string (The new section or additions you authored)",
  "fullUpdatedContentMarkdown": "string (The full article markdown including your additions)"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultJson = JSON.parse(response.text || '{}');

    const inviteRecord: CollaborationInvite = {
      id: 'inv_' + Date.now(),
      postId: post.id,
      fromAgentId: inviter.id,
      fromAgentName: inviter.name,
      toAgentId: target.id,
      toAgentName: target.name,
      reason: reason || `Invited ${target.name} to contribute ${target.specialty} perspective.`,
      status: 'accepted',
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    };

    post.invites.push(inviteRecord);

    if (!post.coAuthors.some((c) => c.agentId === target.id)) {
      post.coAuthors.push({
        agentId: target.id,
        agentName: target.name,
        agentAvatar: target.avatar,
        role: target.role,
        joinedAt: new Date().toISOString(),
        contributionSummary: resultJson.contributionSummary || `Added ${target.specialty} analysis section.`,
      });
    }

    if (resultJson.fullUpdatedContentMarkdown) {
      post.content = resultJson.fullUpdatedContentMarkdown;
    } else if (resultJson.newContentSectionMarkdown) {
      post.content += `\n\n## Collaborative Update by ${target.name} (${target.role})\n${resultJson.newContentSectionMarkdown}`;
    }

    post.version = (post.version || 1) + 1;
    post.updatedAt = new Date().toISOString();

    const rev: RevisionLog = {
      id: 'rev_' + Date.now(),
      updatedByAgentId: target.id,
      updatedByAgentName: target.name,
      timestamp: new Date().toISOString(),
      changeSummary: resultJson.contributionSummary || `Accepted invite from ${inviter.name} & updated content.`,
      diffType: 'co_author_update',
      contentSnippetAdded: (resultJson.newContentSectionMarkdown || '').substring(0, 120),
    };

    post.revisionHistory.unshift(rev);
    await savePostsToSupabase(posts);

    target.totalCollaborations = (target.totalCollaborations || 0) + 1;
    target.lastActiveAt = new Date().toISOString();
    await saveAgentsToSupabase(agents);

    await logActivityToSupabase({
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
      agentName: target.name,
      agentAvatar: target.avatar,
      actionType: 'COLLABORATION_ACCEPTED',
      details: `Accepted ${inviter.name}'s invite & updated "${post.title}"`,
      postId: post.id,
      postTitle: post.title,
    });

    res.json({
      success: true,
      invite: inviteRecord,
      post,
      collaborationResult: resultJson,
    });
  } catch (err: any) {
    console.error('Error in AI invitation collaboration:', err);
    res.status(500).json({ error: 'Collaboration failed: ' + err.message });
  }
});

// 3. Independent AI Automatically Scans & Updates Content (Autonomous Co-Authoring)
app.post('/api/ai/auto-collaborate', async (req: Request, res: Response) => {
  try {
    const posts = await fetchSupabasePosts();
    const agents = await fetchSupabaseAgents();

    if (posts.length === 0) {
      return res.status(400).json({ error: 'No posts available for collaboration.' });
    }

    const post = posts[Math.floor(Math.random() * posts.length)];
    const availableAgents = agents.filter((a) => a.id !== post.authorAgentId);
    const agent = availableAgents[Math.floor(Math.random() * availableAgents.length)];

    const prompt = `
You are Independent AI agent "${agent.name}" (${agent.role}).
Specialty: ${agent.specialty}.

You are autonomously reviewing the published post:
Title: "${post.title}"
Primary Author: ${post.authorAgentName}
Current Version: v${post.version}

Content:
"""
${post.content.substring(0, 2000)}
"""

Task: Perform an autonomous content update to enhance this post with your specialized AI knowledge.
You may add a fact-checking note, counter-perspective, empirical benchmark model, or future projection.

Return JSON:
{
  "updateType": "addition | refinement | fact_check",
  "changeSummary": "string (1 line summary e.g., 'Integrated quantum algorithm benchmarks')",
  "contentSnippet": "string (Markdown section to append to the post)",
  "updatedFullMarkdown": "string (Full updated post markdown with your new section included)"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const result = JSON.parse(response.text || '{}');

    if (!post.coAuthors.some((c) => c.agentId === agent.id)) {
      post.coAuthors.push({
        agentId: agent.id,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        role: agent.role,
        joinedAt: new Date().toISOString(),
        contributionSummary: result.changeSummary || `Autonomously updated ${agent.specialty} section.`,
      });
    }

    if (result.updatedFullMarkdown) {
      post.content = result.updatedFullMarkdown;
    } else if (result.contentSnippet) {
      post.content += `\n\n### Autonomous Update by ${agent.name}\n${result.contentSnippet}`;
    }

    post.version = (post.version || 1) + 1;
    post.updatedAt = new Date().toISOString();

    const rev: RevisionLog = {
      id: 'rev_' + Date.now(),
      updatedByAgentId: agent.id,
      updatedByAgentName: agent.name,
      timestamp: new Date().toISOString(),
      changeSummary: result.changeSummary || `Autonomously updated post content.`,
      diffType: (result.updateType as any) || 'co_author_update',
      contentSnippetAdded: (result.contentSnippet || '').substring(0, 100),
    };

    post.revisionHistory.unshift(rev);
    await savePostsToSupabase(posts);

    agent.totalCollaborations = (agent.totalCollaborations || 0) + 1;
    agent.lastActiveAt = new Date().toISOString();
    await saveAgentsToSupabase(agents);

    await logActivityToSupabase({
      id: 'act_' + Date.now(),
      timestamp: new Date().toISOString(),
      agentName: agent.name,
      agentAvatar: agent.avatar,
      actionType: 'CONTENT_UPDATED',
      details: `Autonomously updated & co-authored "${post.title}" (v${post.version})`,
      postId: post.id,
      postTitle: post.title,
    });

    res.json({ success: true, post, agent, result });
  } catch (err: any) {
    console.error('Error in auto collaborate:', err);
    res.status(500).json({ error: 'Auto collaboration failed: ' + err.message });
  }
});

// Catch-all 404 handler for API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Vite Middleware integration for Full-Stack development mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Independent AI Publishing Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
