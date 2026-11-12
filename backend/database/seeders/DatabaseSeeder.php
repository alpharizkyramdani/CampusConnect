<?php

namespace Database\Seeders;

use App\Models\AcademicEvent;
use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\AnnouncementCategory;
use App\Models\Certificate;
use App\Models\Department;
use App\Models\DiscussionCategory;
use App\Models\DiscussionComment;
use App\Models\DiscussionPost;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventRegistration;
use App\Models\Facility;
use App\Models\FacilityBorrowing;
use App\Models\FacilityCategory;
use App\Models\Faculty;
use App\Models\InventoryMovement;
use App\Models\ItemClaim;
use App\Models\LecturerProfile;
use App\Models\LostFoundItem;
use App\Models\MaintenanceReport;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Permission;
use App\Models\Role;
use App\Models\ServiceRequest;
use App\Models\ServiceType;
use App\Models\StudentActivity;
use App\Models\StudentProfile;
use App\Models\University;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Models\WorkProgram;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ROLES
        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'slug' => 'super_admin',
            'scope_level' => 'platform',
            'description' => 'Platform-wide administrator with total control over all universities and platform settings.',
        ]);

        $campusAdminRole = Role::create([
            'name' => 'Campus Admin',
            'slug' => 'campus_admin',
            'scope_level' => 'university',
            'description' => 'University administrator responsible for faculties, departments, campus announcements and moderation.',
        ]);

        $deptAdminRole = Role::create([
            'name' => 'Department Admin',
            'slug' => 'department_admin',
            'scope_level' => 'department',
            'description' => 'Department administrator in charge of lab equipment inventory and borrowing approvals.',
        ]);

        $ukmAdminRole = Role::create([
            'name' => 'UKM Admin',
            'slug' => 'ukm_admin',
            'scope_level' => 'organization',
            'description' => 'Administrator for a Unit Kegiatan Mahasiswa (student activity unit).',
        ]);

        $ormawaAdminRole = Role::create([
            'name' => 'Ormawa Admin',
            'slug' => 'ormawa_admin',
            'scope_level' => 'organization',
            'description' => 'Administrator for student organizations like BEM, HIMA, or DPM.',
        ]);

        $studentRole = Role::create([
            'name' => 'Student',
            'slug' => 'student',
            'scope_level' => 'university',
            'description' => 'Enrolled student with access to campus events, borrowing, services, and portfolio.',
        ]);

        $lecturerRole = Role::create([
            'name' => 'Lecturer',
            'slug' => 'lecturer',
            'scope_level' => 'university',
            'description' => 'Academic lecturer with permission to publish academic announcements and review events.',
        ]);

        // 2. UNIVERSITIES
        $uir = University::create([
            'name' => 'Universitas Islam Riau',
            'slug' => 'uir',
            'code' => 'UIR',
            'email' => 'info@uir.ac.id',
            'website' => 'https://uir.ac.id',
            'address' => 'Jl. Kaharuddin Nasution No. 113, Pekanbaru, Riau',
            'logo' => 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
            'description' => 'Universitas unggul yang berkomitmen mencetak generasi profesional, berdaya saing, dan berakhlak mulia.',
            'status' => 'active',
        ]);

        $itn = University::create([
            'name' => 'Institut Teknologi Nasional',
            'slug' => 'itn',
            'code' => 'ITN',
            'email' => 'contact@itn.ac.id',
            'website' => 'https://itn.ac.id',
            'address' => 'Jl. Bendungan Sigura-gura No. 2, Malang, Jawa Timur',
            'logo' => 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80',
            'description' => 'Institut teknologi terkemuka berfokus pada rekayasa teknologi, kecerdasan buatan, dan sains terapan.',
            'status' => 'active',
        ]);

        // 3. FACULTIES & DEPARTMENTS
        // UIR
        $ftUir = Faculty::create([
            'university_id' => $uir->id,
            'name' => 'Faculty of Engineering',
            'code' => 'FT-UIR',
            'description' => 'Excellence in engineering, robotics, and applied science.',
        ]);

        $feUir = Faculty::create([
            'university_id' => $uir->id,
            'name' => 'Faculty of Economics & Business',
            'code' => 'FEB-UIR',
            'description' => 'Leadership in financial markets, management, and digital commerce.',
        ]);

        $deptTiUir = Department::create([
            'university_id' => $uir->id,
            'faculty_id' => $ftUir->id,
            'name' => 'Informatics Department',
            'code' => 'IF-UIR',
            'description' => 'Software engineering, AI, and distributed systems laboratory.',
        ]);

        $deptElUir = Department::create([
            'university_id' => $uir->id,
            'faculty_id' => $ftUir->id,
            'name' => 'Electrical Engineering',
            'code' => 'EE-UIR',
            'description' => 'Power systems, telecommunications, and IoT laboratory.',
        ]);

        $deptMgtUir = Department::create([
            'university_id' => $uir->id,
            'faculty_id' => $feUir->id,
            'name' => 'Management Department',
            'code' => 'MGT-UIR',
            'description' => 'Strategic management, entrepreneurship, and digital marketing.',
        ]);

        // ITN
        $fasilkomItn = Faculty::create([
            'university_id' => $itn->id,
            'name' => 'Faculty of Computer Science',
            'code' => 'FASILKOM-ITN',
            'description' => 'Cybernetics, artificial intelligence, and cloud engineering.',
        ]);

        $deptSeItn = Department::create([
            'university_id' => $itn->id,
            'faculty_id' => $fasilkomItn->id,
            'name' => 'Software Engineering',
            'code' => 'SE-ITN',
            'description' => 'Enterprise application development and distributed computing.',
        ]);

        // 4. USERS & ROLES
        $password = Hash::make('password');

        // Super Admin
        $superAdmin = User::create([
            'name' => 'Platform Super Admin',
            'email' => 'superadmin@campusconnect.id',
            'password' => $password,
            'phone' => '+62811000001',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $superAdmin->id,
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        // Campus Admin (UIR)
        $adminUir = User::create([
            'name' => 'Dr. Hendra Gunawan (Admin UIR)',
            'email' => 'admin.uir@campusconnect.id',
            'password' => $password,
            'phone' => '+62811000002',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $uir->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $adminUir->id,
            'role_id' => $campusAdminRole->id,
            'university_id' => $uir->id,
            'status' => 'active',
        ]);

        // Campus Admin (ITN)
        $adminItn = User::create([
            'name' => 'Prof. Ratna Kusuma (Admin ITN)',
            'email' => 'admin.itn@campusconnect.id',
            'password' => $password,
            'phone' => '+62811000003',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $itn->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $adminItn->id,
            'role_id' => $campusAdminRole->id,
            'university_id' => $itn->id,
            'status' => 'active',
        ]);

        // Department Admin (Informatics - UIR)
        $deptAdminTi = User::create([
            'name' => 'Agus Wicaksono, M.T.',
            'email' => 'dept.ti@uir.ac.id',
            'password' => $password,
            'phone' => '+62811000004',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $uir->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $deptAdminTi->id,
            'role_id' => $deptAdminRole->id,
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'status' => 'active',
        ]);

        // Organizations (UIR)
        $ukmRobotics = Organization::create([
            'university_id' => $uir->id,
            'name' => 'UIR Robotics & Autonomous Club',
            'slug' => 'uir-robotics',
            'type' => 'ukm',
            'category' => 'Technology',
            'logo' => 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80',
            'description' => 'Pioneering intelligent autonomous systems, micro-controllers, and competitive robotics team.',
            'vision' => 'Becoming national champions in automated aerial and ground robotics.',
            'mission' => 'Hands-on workshops, hardware sprints, and inter-university competitions.',
            'recruitment_open' => true,
            'status' => 'active',
        ]);

        $bemFt = Organization::create([
            'university_id' => $uir->id,
            'name' => 'BEM Fakultas Teknik UIR',
            'slug' => 'bem-ft-uir',
            'type' => 'bem',
            'category' => 'Executive',
            'logo' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
            'description' => 'Badan Eksekutif Mahasiswa Engineering Faculty advocating student welfare and leadership.',
            'vision' => 'A synergistic and impactful engineering student body.',
            'mission' => 'Advocacy, public symposiums, engineering sports week, and community development.',
            'recruitment_open' => true,
            'status' => 'active',
        ]);

        // UKM Admin User
        $ukmAdminUser = User::create([
            'name' => 'Fauzan Ramadhan',
            'email' => 'ukm.robotics@uir.ac.id',
            'password' => $password,
            'phone' => '+62811000005',
            'avatar' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $uir->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $ukmAdminUser->id,
            'role_id' => $ukmAdminRole->id,
            'university_id' => $uir->id,
            'organization_id' => $ukmRobotics->id,
            'status' => 'active',
        ]);
        OrganizationMember::create([
            'organization_id' => $ukmRobotics->id,
            'user_id' => $ukmAdminUser->id,
            'role_title' => 'Club President',
            'division' => 'Executive Board',
            'joined_at' => '2024-01-10',
            'status' => 'active',
        ]);

        // Ormawa Admin User
        $ormawaAdminUser = User::create([
            'name' => 'Dian Sastro Pratama',
            'email' => 'bem.ft@uir.ac.id',
            'password' => $password,
            'phone' => '+62811000006',
            'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $uir->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $ormawaAdminUser->id,
            'role_id' => $ormawaAdminRole->id,
            'university_id' => $uir->id,
            'organization_id' => $bemFt->id,
            'status' => 'active',
        ]);
        OrganizationMember::create([
            'organization_id' => $bemFt->id,
            'user_id' => $ormawaAdminUser->id,
            'role_title' => 'Governor',
            'division' => 'Cabinet Executive',
            'joined_at' => '2023-12-01',
            'status' => 'active',
        ]);

        // Student with Multi-Role (Student + UKM Admin committee member)
        $studentAlex = User::create([
            'name' => 'Alex Chandra',
            'email' => 'student.alex@uir.ac.id',
            'password' => $password,
            'phone' => '+62811000007',
            'avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $uir->id,
            'status' => 'active',
        ]);
        // Role 1: Student
        UserRoleAssignment::create([
            'user_id' => $studentAlex->id,
            'role_id' => $studentRole->id,
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'status' => 'active',
        ]);
        // Role 2: UKM Admin (Head of Media at Robotics)
        UserRoleAssignment::create([
            'user_id' => $studentAlex->id,
            'role_id' => $ukmAdminRole->id,
            'university_id' => $uir->id,
            'organization_id' => $ukmRobotics->id,
            'status' => 'active',
        ]);
        StudentProfile::create([
            'user_id' => $studentAlex->id,
            'university_id' => $uir->id,
            'faculty_id' => $ftUir->id,
            'department_id' => $deptTiUir->id,
            'nim' => '21051204001',
            'study_program' => 'Informatics Engineering S1',
            'enrollment_year' => 2022,
            'bio' => 'Passionate full-stack developer and robotics enthusiast.',
        ]);
        OrganizationMember::create([
            'organization_id' => $ukmRobotics->id,
            'user_id' => $studentAlex->id,
            'role_title' => 'Head of Creative Media',
            'division' => 'Media & IT',
            'joined_at' => '2024-02-15',
            'status' => 'active',
        ]);

        // Student ITN
        $studentBudi = User::create([
            'name' => 'Budi Santoso',
            'email' => 'student.budi@itn.ac.id',
            'password' => $password,
            'phone' => '+62811000008',
            'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $itn->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $studentBudi->id,
            'role_id' => $studentRole->id,
            'university_id' => $itn->id,
            'department_id' => $deptSeItn->id,
            'status' => 'active',
        ]);
        StudentProfile::create([
            'user_id' => $studentBudi->id,
            'university_id' => $itn->id,
            'faculty_id' => $fasilkomItn->id,
            'department_id' => $deptSeItn->id,
            'nim' => '22110045',
            'study_program' => 'Software Engineering S1',
            'enrollment_year' => 2023,
            'bio' => 'Aspiring cloud engineer and open source contributor.',
        ]);

        // Lecturer UIR
        $lecturerSarah = User::create([
            'name' => 'Dr. Sarah Nurhaliza, M.Cs.',
            'email' => 'lecturer.sarah@uir.ac.id',
            'password' => $password,
            'phone' => '+62811000009',
            'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
            'default_university_id' => $uir->id,
            'status' => 'active',
        ]);
        UserRoleAssignment::create([
            'user_id' => $lecturerSarah->id,
            'role_id' => $lecturerRole->id,
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'status' => 'active',
        ]);
        LecturerProfile::create([
            'user_id' => $lecturerSarah->id,
            'university_id' => $uir->id,
            'faculty_id' => $ftUir->id,
            'department_id' => $deptTiUir->id,
            'nidn' => '0015088501',
            'title' => 'Dr., M.Cs.',
            'specialization' => 'Machine Learning & Cyber-Physical Systems',
            'bio' => 'Senior researcher at UIR AI Center and coordinator for Informatics capstone projects.',
        ]);

        // 5. ANNOUNCEMENTS
        $catAcademic = AnnouncementCategory::create([
            'university_id' => $uir->id,
            'name' => 'Academic Notice',
            'slug' => 'academic-notice',
            'color' => '#2563EB',
        ]);
        $catScholarship = AnnouncementCategory::create([
            'university_id' => $uir->id,
            'name' => 'Scholarship & Grants',
            'slug' => 'scholarship',
            'color' => '#10B981',
        ]);
        $catEvents = AnnouncementCategory::create([
            'university_id' => $uir->id,
            'name' => 'Campus Activities',
            'slug' => 'campus-activities',
            'color' => '#8B5CF6',
        ]);

        Announcement::create([
            'university_id' => $uir->id,
            'user_id' => $adminUir->id,
            'category_id' => $catAcademic->id,
            'title' => 'Semester Examination Schedule & Regulations 2026/2027',
            'slug' => 'semester-exam-schedule-2026',
            'content' => 'All students are required to verify their exam attendance cards through CampusConnect. Please adhere to the dress code and bring valid student ID.',
            'image_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
            'priority' => 'high',
            'status' => 'published',
            'target_audience' => 'students',
            'published_at' => now()->subDays(2),
        ]);

        Announcement::create([
            'university_id' => $uir->id,
            'user_id' => $adminUir->id,
            'category_id' => $catScholarship->id,
            'title' => 'CampusConnect Merit & Research Fellowship 2026',
            'slug' => 'merit-research-fellowship-2026',
            'content' => 'Full tuition coverage and monthly stipend available for high-achieving undergraduate students with demonstrable research projects.',
            'image_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80',
            'priority' => 'urgent',
            'status' => 'published',
            'target_audience' => 'students',
            'published_at' => now()->subDay(),
        ]);

        // 6. EVENT CATEGORIES & EVENTS
        $catWorkshop = EventCategory::create([
            'university_id' => $uir->id,
            'name' => 'Workshops & Seminars',
            'slug' => 'workshops',
            'icon' => 'BookOpen',
        ]);
        $catCompetition = EventCategory::create([
            'university_id' => $uir->id,
            'name' => 'Competitions & Hackathons',
            'slug' => 'competitions',
            'icon' => 'Trophy',
        ]);

        $hackathonEvent = Event::create([
            'university_id' => $uir->id,
            'organization_id' => $ukmRobotics->id,
            'category_id' => $catCompetition->id,
            'created_by' => $ukmAdminUser->id,
            'title' => 'National AI & Autonomous Robotics Hackathon 2026',
            'slug' => 'national-ai-robotics-hackathon-2026',
            'description' => 'A 48-hour competitive engineering hackathon where teams construct computer vision and robotics solutions for smart campus environments.',
            'banner_image' => 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
            'location' => 'UIR Innovation Hall, Building B Level 3',
            'event_type' => 'hybrid',
            'start_time' => now()->addDays(7)->setTime(9, 0),
            'end_time' => now()->addDays(9)->setTime(18, 0),
            'registration_deadline' => now()->addDays(5),
            'max_participants' => 150,
            'current_participants' => 45,
            'status' => 'registration_open',
            'certificate_enabled' => true,
        ]);

        $symposiumEvent = Event::create([
            'university_id' => $uir->id,
            'organization_id' => $bemFt->id,
            'category_id' => $catWorkshop->id,
            'created_by' => $ormawaAdminUser->id,
            'title' => 'Future of Green Technology: Annual Engineering Symposium',
            'slug' => 'future-green-tech-symposium-2026',
            'description' => 'Keynote speeches from energy industry leaders discussing decarbonization, micro-grids, and sustainable infrastructure.',
            'banner_image' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
            'location' => 'Main Auditorium Dr. Soetomo',
            'event_type' => 'offline',
            'start_time' => now()->addDays(14)->setTime(13, 0),
            'end_time' => now()->addDays(14)->setTime(17, 30),
            'registration_deadline' => now()->addDays(12),
            'max_participants' => 250,
            'current_participants' => 110,
            'status' => 'registration_open',
            'certificate_enabled' => true,
        ]);

        // Event Registration for Alex
        $regAlex = EventRegistration::create([
            'event_id' => $hackathonEvent->id,
            'user_id' => $studentAlex->id,
            'ticket_code' => 'TCK-HACK-' . strtoupper(Str::random(6)),
            'qr_token' => hash('sha256', 'TCK-ALEX-' . $hackathonEvent->id . '-UIR'),
            'status' => 'registered',
            'registered_at' => now()->subDay(),
        ]);

        // 7. ACADEMIC CALENDAR
        AcademicEvent::create([
            'university_id' => $uir->id,
            'title' => 'Midterm Examination Period',
            'description' => 'Centralized examinations across all faculties.',
            'category' => 'exam',
            'start_date' => now()->addDays(20)->toDateString(),
            'end_date' => now()->addDays(27)->toDateString(),
            'color' => '#EF4444',
            'is_all_day' => true,
        ]);
        AcademicEvent::create([
            'university_id' => $uir->id,
            'title' => 'Course Registration & Advising (KRS)',
            'description' => 'Online study plan submission for next academic term.',
            'category' => 'registration',
            'start_date' => now()->addDays(35)->toDateString(),
            'end_date' => now()->addDays(40)->toDateString(),
            'color' => '#2563EB',
            'is_all_day' => true,
        ]);
        AcademicEvent::create([
            'university_id' => $uir->id,
            'title' => 'University Dies Natalis & Innovation Expo',
            'description' => 'Annual anniversary celebration and showcase.',
            'category' => 'academic',
            'start_date' => now()->addDays(50)->toDateString(),
            'end_date' => now()->addDays(52)->toDateString(),
            'color' => '#10B981',
            'is_all_day' => true,
        ]);

        // 8. FACILITIES & BORROWING (Informatics Department - UIR)
        $catLab = FacilityCategory::create([
            'university_id' => $uir->id,
            'name' => 'Lab Hardware & Computers',
            'description' => 'Workstations, servers, and specialty embedded boards.',
        ]);
        $catMultimedia = FacilityCategory::create([
            'university_id' => $uir->id,
            'name' => 'Audiovisual & Presentation',
            'description' => 'High-lumen projectors, wireless audio, and camera units.',
        ]);

        $facilityProjector = Facility::create([
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'category_id' => $catMultimedia->id,
            'name' => 'Epson Laser 4K Presentation Projector',
            'code' => 'TI-PRJ-01',
            'description' => 'Ultra high lumen 4K projector with wireless casting receiver and HDMI accessories.',
            'photo_url' => 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80',
            'condition' => 'excellent',
            'total_quantity' => 5,
            'available_quantity' => 4,
            'location' => 'Informatics Lab Building 3, Room 302',
        ]);

        $facilityDrone = Facility::create([
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'category_id' => $catLab->id,
            'name' => 'DJI Matrice 300 RTK Industrial Drone Kit',
            'code' => 'TI-DRN-02',
            'description' => 'Autonomous survey drone equipped with LiDAR and thermal imaging for computer vision research.',
            'photo_url' => 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80',
            'condition' => 'good',
            'total_quantity' => 2,
            'available_quantity' => 2,
            'location' => 'Robotics & Embedded Systems Research Lab',
        ]);

        $facilityOscilloscope = Facility::create([
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'category_id' => $catLab->id,
            'name' => 'Rigol 4-Channel Digital Storage Oscilloscope',
            'code' => 'TI-OSC-03',
            'description' => '100 MHz bandwidth oscilloscope with real-time waveform capture for circuit analysis.',
            'photo_url' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
            'condition' => 'good',
            'total_quantity' => 8,
            'available_quantity' => 7,
            'location' => 'Hardware Lab 1',
        ]);

        // Active Borrowing Request by Alex
        FacilityBorrowing::create([
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'facility_id' => $facilityProjector->id,
            'user_id' => $studentAlex->id,
            'quantity' => 1,
            'purpose' => 'Robotics club weekly design showcase and sponsor presentation.',
            'borrow_date' => now()->addDay()->setTime(10, 0),
            'return_due_date' => now()->addDays(2)->setTime(16, 0),
            'status' => 'pending',
            'admin_notes' => 'Awaiting department head approval.',
        ]);

        // 9. MAINTENANCE REPORTS
        MaintenanceReport::create([
            'university_id' => $uir->id,
            'department_id' => $deptTiUir->id,
            'user_id' => $studentAlex->id,
            'title' => 'Air Conditioning Malfunction in Software Engineering Lab 304',
            'location' => 'Building FT 3rd Floor, Lab 304',
            'category' => 'hvac',
            'description' => 'The central AC is leaking water and not cooling, endangering multiple server racks.',
            'photo_url' => 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&auto=format&fit=crop&q=80',
            'priority' => 'high',
            'status' => 'under_review',
        ]);

        // 10. LOST & FOUND
        $lostItem = LostFoundItem::create([
            'university_id' => $uir->id,
            'user_id' => $studentAlex->id,
            'type' => 'lost',
            'title' => 'Blue Lenovo ThinkPad Laptop with Tech Stickers',
            'category' => 'electronics',
            'description' => 'Left on the wooden bench outside Library 2nd floor after study session. Has GitHub and Docker stickers.',
            'location' => 'Central Library 2nd Floor Garden Terrace',
            'event_date' => now()->subDay()->toDateString(),
            'photo_url' => 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80',
            'status' => 'open',
            'contact_info' => 'Telegram: @alexchandra_uir',
        ]);

        $foundItem = LostFoundItem::create([
            'university_id' => $uir->id,
            'user_id' => $lecturerSarah->id,
            'type' => 'found',
            'title' => 'Brown Leather Wallet containing Student Card',
            'category' => 'documents',
            'description' => 'Found under chair in Lecture Hall B1. Safe and handed to campus security front desk.',
            'location' => 'Lecture Hall B1, FT Building',
            'event_date' => now()->toDateString(),
            'photo_url' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80',
            'status' => 'open',
            'contact_info' => 'FT Security Post 1',
        ]);

        // 11. STUDENT SERVICES
        $srvTranscript = ServiceType::create([
            'university_id' => $uir->id,
            'name' => 'Official Academic Transcript Request (Bilingual)',
            'code' => 'SRV-TRN',
            'description' => 'Stamped physical and cryptographically signed PDF transcript for scholarships or job applications.',
            'requirements' => '1. No outstanding tuition fee\n2. Completed academic advising',
            'processing_days' => 2,
            'is_active' => true,
        ]);

        $srvCertificate = ServiceType::create([
            'university_id' => $uir->id,
            'name' => 'Certificate of Active Student Status (Surat Keterangan Aktif)',
            'code' => 'SRV-SKA',
            'description' => 'Official letter confirming active enrollment status for visa, health insurance, or parent allowances.',
            'requirements' => '1. Active semester status in KRS',
            'processing_days' => 1,
            'is_active' => true,
        ]);

        ServiceRequest::create([
            'university_id' => $uir->id,
            'service_type_id' => $srvCertificate->id,
            'user_id' => $studentAlex->id,
            'request_number' => 'REQ-SKA-' . date('Ymd') . '-001',
            'notes' => 'Required for International Exchange Visa Application at Japanese Embassy.',
            'status' => 'processing',
            'admin_notes' => 'Verified student record. Seal pending.',
        ]);

        // 12. DIGITAL CERTIFICATES
        Certificate::create([
            'university_id' => $uir->id,
            'user_id' => $studentAlex->id,
            'certificate_number' => 'CERT-UIR-2025-0892',
            'title' => 'Outstanding Delegate: Java Robotics Championship 2025',
            'recipient_name' => 'Alex Chandra',
            'issue_date' => '2025-11-20',
            'file_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            'verify_hash' => hash('sha256', 'CERT-UIR-2025-0892-VERIFIED-ALEX'),
            'issued_by' => $adminUir->id,
        ]);

        // 13. STUDENT ACTIVITY & ACHIEVEMENTS
        StudentActivity::create([
            'user_id' => $studentAlex->id,
            'title' => 'Head of Technology at Engineering Tech Expo 2025',
            'activity_type' => 'organization',
            'role' => 'Lead Web & Mobile Engineer',
            'organizer' => 'BEM FT Universitas Indonesia Raya',
            'start_date' => '2025-08-01',
            'end_date' => '2025-10-15',
            'description' => 'Designed digital ticketing and live leaderboard viewed by 4,000+ attendees.',
            'is_verified' => true,
            'verified_by' => $adminUir->id,
        ]);

        Achievement::create([
            'user_id' => $studentAlex->id,
            'title' => '1st Winner — National Smart City IoT Competition',
            'level' => 'national',
            'rank' => 'Champion (1st Place)',
            'year' => 2025,
            'description' => 'Built an AI-driven smart flood detection mesh sensor array.',
            'is_verified' => true,
        ]);

        // 14. DISCUSSIONS
        $discTech = DiscussionCategory::create([
            'university_id' => $uir->id,
            'name' => 'Tech & Coding Hub',
            'slug' => 'tech-coding',
            'description' => 'Discussions about algorithms, software architecture, open source and development tips.',
            'color' => '#2563EB',
        ]);
        $discCampusLife = DiscussionCategory::create([
            'university_id' => $uir->id,
            'name' => 'Campus Life & Advice',
            'slug' => 'campus-life',
            'description' => 'General questions, study tips, dormitory recommendations, and campus navigation.',
            'color' => '#10B981',
        ]);

        $post1 = DiscussionPost::create([
            'university_id' => $uir->id,
            'category_id' => $discTech->id,
            'user_id' => $studentAlex->id,
            'title' => 'Tips for setting up high-performance Docker containers on Windows for university projects',
            'content' => 'For those working on multi-service capstone projects with Laravel and React, make sure to enable WSL2 backend and store files inside the Linux filesystem for 10x faster I/O response times!',
            'views_count' => 84,
            'is_pinned' => true,
        ]);

        DiscussionComment::create([
            'post_id' => $post1->id,
            'user_id' => $lecturerSarah->id,
            'content' => 'Excellent tip Alex! We will be recommending this for our Advanced Database and Distributed Systems course next week.',
        ]);

        // 15. AUDIT LOGS
        ActivityLog::create([
            'university_id' => $uir->id,
            'user_id' => $superAdmin->id,
            'action' => 'university.activate',
            'entity_type' => 'University',
            'entity_id' => $uir->id,
            'ip_address' => '127.0.0.1',
            'details' => ['university_name' => $uir->name, 'status' => 'active'],
        ]);
        ActivityLog::create([
            'university_id' => $uir->id,
            'user_id' => $adminUir->id,
            'action' => 'announcement.create',
            'entity_type' => 'Announcement',
            'entity_id' => 1,
            'ip_address' => '127.0.0.1',
            'details' => ['title' => 'Semester Examination Schedule & Regulations 2026/2027'],
        ]);
    }
}
