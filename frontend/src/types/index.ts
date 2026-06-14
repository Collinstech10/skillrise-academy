export interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  referral_code: string;
  referred_by?: string;
  balance: number;
  status: 'pending' | 'active' | 'suspended';
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  category: string;
  video_url?: string;
  pdf_url?: string;
  instructor?: string;
  duration?: string;
  level?: string;
  created_at: string;
  purchased?: boolean;
}

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  created_at: string;
  course?: Course;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  reward: number;
  created_at: string;
  referred_user?: Pick<User, 'fullname' | 'username' | 'email' | 'status'>;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  payment_reference: string;
  status: 'pending' | 'success' | 'failed';
  type: 'membership' | 'course';
  created_at: string;
  user?: Pick<User, 'fullname' | 'email'>;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export interface DashboardStats {
  balance: number;
  total_referrals: number;
  referral_earnings: number;
  courses_purchased: number;
  recent_activity: ActivityItem[];
  announcements: Announcement[];
}

export interface ActivityItem {
  id: string;
  type: 'referral' | 'course' | 'payment' | 'withdrawal';
  description: string;
  amount?: number;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_revenue: number;
  total_course_sales: number;
  recent_payments: Payment[];
  recent_users: User[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  instructor: string;
  thumbnail?: string;
  youtube_url: string;
  youtube_id: string | null;
  start_time: string;
  status: 'upcoming' | 'live' | 'ended';
  created_at: string;
  updated_at?: string;
}
