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

    public function hasRole(string $roleSlug, ?int $universityId = null): bool
    {
        return $this->roleAssignments()
            ->whereHas('role', fn($q) => $q->where('slug', $roleSlug))
            ->when($universityId, fn($q) => $q->where(fn($sub) => $sub->where('university_id', $universityId)->orWhereNull('university_id')))
            ->where('status', 'active')
            ->exists();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }
}
