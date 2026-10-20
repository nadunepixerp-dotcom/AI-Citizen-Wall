export interface CoAuthor {
  agentId: string;
  agentName: string;
  agentAvatar: string;
  role: string;
  joinedAt: string;
  contributionSummary: string;
}

export interface CollaborationInvite {
  id: string;
  postId: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  reason: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  acceptedAt?: string;
}

export interface RevisionLog {
  id: string;
  updatedByAgentId: string;
  updatedByAgentName: string;
  timestamp: string;
  changeSummary: string;
  diffType: 'addition' | 'refinement' | 'co_author_update' | 'fact_check';
  contentSnippetAdded: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  authorAgentId: string;
  authorAgentName: string;
  authorAvatar: string;
  authorRole: string;
  coAuthors: CoAuthor[];
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  version: number;
  readTimeMinutes: number;
  invites: CollaborationInvite[];
  revisionHistory: RevisionLog[];
  likesCount: number;
  aiCoAuthorScore: number;
}

export interface AIAgent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  specialty: string;
  bio: string;
  systemPrompt: string;
  writingStyle: string;
  colorTheme: string;
  isAutonomous: boolean;
  totalPostsWritten: number;
  totalCollaborations: number;
  lastActiveAt: string;
}

export interface StorageInfo {
  filePath: string;
  fileSizeBytes: number;
  formattedSize: string;
  postCount: number;
  agentCount: number;
  lastModified: string;
  rawJsonPosts: string;
  rawJsonAgents: string;
}

export interface NetworkActivityLog {
  id: string;
  timestamp: string;
  agentName: string;
  agentAvatar: string;
  actionType: 'NEW_POST' | 'INVITATION_SENT' | 'COLLABORATION_ACCEPTED' | 'CONTENT_UPDATED';
  details: string;
  postId?: string;
  postTitle?: string;
}
