<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone',
        'status',
        'is_verified',
        'verification_status',
        'verified_at',
        'verified_by',
        'default_university_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'is_verified' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function roleAssignments()
    {
        return $this->hasMany(UserRoleAssignment::class);
    }

    public function assignments()
    {
        return $this->hasMany(UserRoleAssignment::class);
    }

    public function activeRoleAssignments()
    {
        return $this->hasMany(UserRoleAssignment::class)->where('status', 'active')->with(['role', 'university', 'department']);
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function lecturerProfile()
    {
        return $this->hasOne(LecturerProfile::class);
    }

    public function eventRegistrations()
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function facilityBorrowings()
    {
        return $this->hasMany(FacilityBorrowing::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function defaultUniversity()
    {
        return $this->belongsTo(University::class, 'default_university_id');
    }

    public function followers()
    {
        return $this->hasMany(UserFollow::class, 'user_id');
    }

    public function following()
    {
        return $this->hasMany(UserFollow::class, 'follower_id');
    }

    public function campusPosts()
    {
        return $this->hasMany(CampusPost::class, 'user_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(DirectMessage::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(DirectMessage::class, 'receiver_id');
    }

    public function privacySettings()
    {
        return $this->hasOne(UserPrivacySetting::class);
    }

    public function blockedUsers()
    {
        return $this->hasMany(UserBlock::class, 'blocker_id');
    }

    public function mutedUsers()
    {
        return $this->hasMany(UserMute::class, 'user_id');
    }

    public function savedPosts()
    {
        return $this->hasMany(SavedPost::class);
    }

    public function careerApplications()
    {
        return $this->hasMany(CareerApplication::class);
    }

    public function libraryLoans()
    {
        return $this->hasMany(LibraryLoan::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function hasRole(string $roleSlug, ?int $universityId = null): bool
    {
        $aliases = match ($roleSlug) {
            'mahasiswa' => ['mahasiswa', 'student'],
            'student' => ['student', 'mahasiswa'],
            'dosen' => ['dosen', 'lecturer'],
            'lecturer' => ['lecturer', 'dosen'],
            'ormawa_admin' => ['ormawa_admin', 'ukm_admin'],
            'ukm_admin' => ['ukm_admin', 'ormawa_admin'],
            'sarpras_admin' => ['sarpras_admin'],
            'alumni' => ['alumni'],
            default => [$roleSlug],
        };

        return $this->roleAssignments()
            ->whereHas('role', fn($q) => $q->whereIn('slug', $aliases))
            ->when($universityId, fn($q) => $q->where(fn($sub) => $sub->where('university_id', $universityId)->orWhereNull('university_id')))
            ->where('status', 'active')
            ->exists();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function isCampusAdmin(): bool
    {
        return $this->hasRole('campus_admin');
    }

    public function isDeptAdmin(): bool
    {
        return $this->hasRole('department_admin');
    }

    public function isSarprasAdmin(): bool
    {
        return $this->hasRole('sarpras_admin');
    }

    public function isOrmawaAdmin(): bool
    {
        return $this->hasRole('ormawa_admin');
    }

    public function isLecturer(): bool
    {
        return $this->hasRole('lecturer');
    }

    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    public function isAlumni(): bool
    {
        return $this->hasRole('alumni');
    }

    public function isVerified(): bool
    {
        return (bool) $this->is_verified;
    }
}
