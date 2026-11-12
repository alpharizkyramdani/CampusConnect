export type RoleName =
  | 'super_admin'
  | 'campus_admin'
  | 'department_admin'
  | 'ukm_admin'
  | 'ormawa_admin'
  | 'student'
  | 'lecturer';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  status: 'active' | 'suspended' | 'pending';
  default_university_id?: number;
  student_profile?: StudentProfile;
  lecturer_profile?: LecturerProfile;
  roles?: Role[];
  assignments?: UserRoleAssignment[];
}

export interface Role {
  id: number;
  name: string;
  slug: RoleName;
  scope_level: 'platform' | 'university' | 'department' | 'organization';
  description?: string;
}

export interface University {
  id: number;
  name: string;
  slug: string;
  code: string;
  email: string;
  website?: string;
  address?: string;
  logo?: string;
  description?: string;
  status: 'pending' | 'active' | 'suspended';
  faculties_count?: number;
  departments_count?: number;
  organizations_count?: number;
  events_count?: number;
}

export interface Faculty {
  id: number;
  university_id: number;
  name: string;
  code?: string;
  description?: string;
  departments?: Department[];
}

export interface Department {
  id: number;
  university_id: number;
  faculty_id?: number;
  name: string;
  code?: string;
  description?: string;
}

export interface UserRoleAssignment {
  id: number;
  user_id: number;
  role_id: number;
  university_id?: number;
  department_id?: number;
  organization_id?: number;
  status: 'active' | 'inactive';
  role?: Role;
  university?: University;
  department?: Department;
  organization?: Organization;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  university_id: number;
  faculty_id?: number;
  department_id?: number;
  nim: string;
  study_program?: string;
  enrollment_year?: number;
  bio?: string;
  university?: University;
  department?: Department;
}

export interface LecturerProfile {
  id: number;
  user_id: number;
  university_id: number;
  faculty_id?: number;
  department_id?: number;
  nidn: string;
  title?: string;
  specialization?: string;
  bio?: string;
}

export interface AnnouncementCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Announcement {
  id: number;
  university_id: number;
  user_id: number;
  category_id?: number;
  title: string;
  slug: string;
  content: string;
  image_url?: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'scheduled';
  target_audience: 'all' | 'students' | 'lecturers' | 'staff';
  published_at?: string;
  created_at: string;
  category?: AnnouncementCategory;
  user?: User;
  university?: University;
}

export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface Event {
  id: number;
  university_id: number;
  organization_id?: number;
  department_id?: number;
  category_id?: number;
  created_by: number;
  title: string;
  slug: string;
  description?: string;
  banner_image?: string;
  location?: string;
  event_type: 'online' | 'offline' | 'hybrid';
  start_time: string;
  end_time: string;
  registration_deadline?: string;
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'pending_approval' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
  certificate_enabled: boolean;
  category?: EventCategory;
  organization?: Organization;
  department?: Department;
  university?: University;
  creator?: User;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  ticket_code: string;
  qr_token: string;
  status: 'registered' | 'attended' | 'cancelled';
  registered_at: string;
  checked_in_at?: string;
  event?: Event;
  user?: User;
}

export interface Certificate {
  id: number;
  university_id: number;
  event_id?: number;
  user_id: number;
  certificate_number: string;
  title: string;
  recipient_name: string;
  issue_date: string;
  file_url?: string;
  verify_hash: string;
  event?: Event;
  university?: University;
  issuer?: User;
}

export interface AcademicEvent {
  id: number;
  university_id: number;
  title: string;
  description?: string;
  category: 'academic' | 'holiday' | 'exam' | 'registration' | 'general';
  start_date: string;
  end_date: string;
  color: string;
  is_all_day: boolean;
}

export interface FacilityCategory {
  id: number;
  university_id: number;
  name: string;
  description?: string;
}

export interface Facility {
  id: number;
  university_id: number;
  department_id: number;
  category_id?: number;
  name: string;
  code: string;
  description?: string;
  photo_url?: string;
  condition: 'excellent' | 'good' | 'fair' | 'damaged' | 'in_repair';
  total_quantity: number;
  available_quantity: number;
  location?: string;
  department?: Department;
  category?: FacilityCategory;
  university?: University;
}

export interface FacilityBorrowing {
  id: number;
  university_id: number;
  department_id: number;
  facility_id: number;
  user_id: number;
  quantity: number;
  purpose: string;
  borrow_date: string;
  return_due_date: string;
  actual_return_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'ready_for_pickup' | 'borrowed' | 'returned' | 'overdue' | 'cancelled';
  admin_notes?: string;
  return_condition?: 'excellent' | 'good' | 'fair' | 'damaged';
  facility?: Facility;
  department?: Department;
  user?: User;
  approver?: User;
}

export interface MaintenanceReport {
  id: number;
  university_id: number;
  department_id?: number;
  user_id: number;
  title: string;
  location: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'furniture' | 'structural' | 'it_equipment' | 'other';
  description: string;
  photo_url?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
  assigned_to?: number;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  user?: User;
  assignedTo?: User;
  department?: Department;
}

export interface LostFoundItem {
  id: number;
  university_id: number;
  user_id: number;
  type: 'lost' | 'found';
  title: string;
  category: 'electronics' | 'documents' | 'clothing' | 'keys' | 'bags' | 'other';
  description: string;
  location: string;
  event_date: string;
  photo_url?: string;
  status: 'open' | 'claimed' | 'resolved' | 'cancelled';
  contact_info?: string;
  user?: User;
  claims_count?: number;
}

export interface ItemClaim {
  id: number;
  lost_found_item_id: number;
  user_id: number;
  proof_description: string;
  proof_photo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  user?: User;
}

export interface Organization {
  id: number;
  university_id: number;
  name: string;
  slug: string;
  type: 'ukm' | 'bem' | 'hima' | 'dpm' | 'other';
  category?: string;
  logo?: string;
  description?: string;
  vision?: string;
  mission?: string;
  status: 'active' | 'inactive' | 'pending_approval';
  recruitment_open: boolean;
  members_count?: number;
  events_count?: number;
  members?: OrganizationMember[];
  workPrograms?: WorkProgram[];
  events?: Event[];
  university?: University;
}

export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role_title: string;
  division?: string;
  joined_at?: string;
  status: 'active' | 'alumni' | 'inactive';
  user?: User;
  organization?: Organization;
}

export interface OrganizationApplication {
  id: number;
  organization_id: number;
  user_id: number;
  motivation?: string;
  department_interest?: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  user?: User;
}

export interface WorkProgram {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface ServiceType {
  id: number;
  university_id: number;
  name: string;
  code: string;
  description?: string;
  requirements?: string;
  processing_days: number;
  is_active: boolean;
}

export interface ServiceRequest {
  id: number;
  university_id: number;
  service_type_id: number;
  user_id: number;
  request_number: string;
  notes?: string;
  attachment_url?: string;
  status: 'submitted' | 'processing' | 'completed' | 'rejected';
  admin_notes?: string;
  result_document_url?: string;
  completed_at?: string;
  created_at: string;
  serviceType?: ServiceType;
  user?: User;
}

export interface Document {
  id: number;
  university_id: number;
  department_id?: number;
  category_id?: number;
  user_id: number;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  access_level: 'public' | 'campus' | 'staff' | 'private';
  download_count: number;
  created_at: string;
  uploader?: User;
  category?: { id: number; name: string };
  department?: Department;
}

export interface DiscussionCategory {
  id: number;
  university_id: number;
  name: string;
  slug: string;
  color?: string;
  description?: string;
}

export interface DiscussionPost {
  id: number;
  university_id: number;
  category_id: number;
  user_id: number;
  title: string;
  content: string;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  comments_count?: number;
  created_at: string;
  author?: User;
  category?: { id: number; name: string; color: string };
  university?: University;
  comments?: DiscussionComment[];
}

export interface DiscussionComment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  created_at: string;
  author?: User;
  replies?: DiscussionComment[];
}

export interface StudentActivity {
  id: number;
  user_id: number;
  title: string;
  activity_type: 'event' | 'organization' | 'competition' | 'volunteering' | 'achievement';
  role?: string;
  organizer?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  proof_url?: string;
  is_verified: boolean;
}

export interface Achievement {
  id: number;
  user_id: number;
  title: string;
  level: 'campus' | 'regional' | 'national' | 'international';
  rank?: string;
  year: number;
  certificate_url?: string;
  description?: string;
  is_verified: boolean;
}

export interface ActivityLog {
  id: number;
  university_id?: number;
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  ip_address?: string;
  details?: any;
  created_at: string;
  user?: User;
  university?: University;
}
