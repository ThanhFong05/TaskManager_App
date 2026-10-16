export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: number;
}

export interface Team {
  id: string;
  code?: string; // Short code, e.g. "TF-8492"
  name: string;
  description?: string;
  ownerId: string;
  createdAt: number;
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: TeamRole;
  joinedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // Stored as ISO string
  createdAt: number; // Stored as timestamp
  creatorId?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}
