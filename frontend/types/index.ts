export interface User {
  id: string
  email: string | null
  phone: string | null
  referrer: string | null
  created_at: string
  notified: boolean
  reminders_sent: number
  active: boolean
  last_active: string | null
  name: string | null
  password: string | null
  magic_token: string | null
  magic_token_expires: string | null
  last_reminder_at: string | null
}

export interface PostQueue {
  id: string
  platform: string
  media_url: string | null
  caption: string | null
  priority: number
  scheduled_at: string | null
  status: "pending" | "posted" | "failed"
  retries: number
  last_attempt_at: string | null
}

export interface GeneratedPost {
  id: string
  platform: string
  caption: string
  media_prompt: string
  generated_by: string
  queued: boolean
  created_at: string
}

export interface Engagement {
  id: string
  post_id: string
  platform: string
  likes: number
  shares: number
  comments: number
  views: number
  user_id: string | null
  reward_triggered: boolean
  created_at: string
}

export interface Blog {
  id: string
  title: string | null
  content: string | null
  image_urls: string[]
  tags: string[]
  created_at: string
  published: boolean
  slug: string | null
  content_markdown: string | null
  content_html: string | null
  image_prompts: string[]
  published_at: string | null
  medium_url: string | null
  substack_url: string | null
  reddit_url: string | null
  gmb_url: string | null
  syndication_status: Record<string, unknown>
}

export interface Log {
  id: string
  level: string
  message: string
  meta: Record<string, unknown>
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "reward" | "engagement" | "system" | "custom"
  title: string
  message: string
  data: Record<string, unknown>
  read: boolean
  delivered: boolean
  created_at: string
}

export interface Reward {
  id: string
  user_id: string | null
  post_id: string
  reward_type: "silver" | "gold" | "viral"
  amount: number
  issued_at: string
  metadata: Record<string, unknown>
  notified: boolean
}

// Bot status can come as a list of items or a nested object keyed by platform name:
// { twitter: { lastRun: string, status: string, lastError: string|null, updatedAt: string }, ... }
export interface BotStatus {
  id?: string
  bot_name?: string // optional when data is keyed by platform
  last_run?: string | null
  status: string
  last_error?: string | null
  updated_at?: string
}

// When the API returns a nested object keyed by platform, use this mapping type
export type BotStatusMap = Record<
  string,
  {
    lastRun?: string | null
    status: string
    lastError?: string | null
    updatedAt?: string
  }
>

export interface Setting {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface AIOutput {
  id: string
  platform: string
  prompt: string
  output: string
  created_at: string
}

export interface PlatformEngagementStats {
  platform: string
  total_likes: number
  total_shares: number
  total_views: number
  total_comments: number
}

export interface RewardStatsByType {
  reward_type: string
  total_rewards: number
  total_amount: number
}

export interface TopEngagedUser {
  id: string
  user_id: string
  total_likes: number
  total_shares: number
  total_comments: number
  total_views: number
  total_engagement: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface DashboardStats {
  totalUsers: number
  posts: number
  engagements: number
  rewards: number
  activeBots: number
  trapTriggers: number
  cronJobs: number
}

export type UserRole = "admin" | "partner" | "visitor"

export interface Role {
  id: string
  name: string
  created_at?: string
  description?: string
}

export interface UserWithRole extends User {
  role: UserRole
  badge?: string
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  points: number
  position: number
  week_start: string
  week_end: string
  user: {
    id: string
    name: string
    email: string
    badge: string
  }
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
}

export interface PartnerStats {
  totalTraps: number
  usersCaptured: number
  scheduledPosts: number
  rewardPoints: number
  postPerformance: {
    post_id: string
    platform: string
    likes: number
    shares: number
    views: number
    comments: number
  }[]
}

export interface VisitorRewards {
  points: number
  badge: string
  position: number
  referrals: number
  shares: number
}
