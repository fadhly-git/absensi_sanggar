<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * @method \Illuminate\Database\Eloquent\Relations\MorphMany tokens()
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array $abilities = ['*'], \DateTimeInterface $expiresAt = null)
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nis',
        'email',
        'password',
        'role',
        'qr_token',
        'pin',
        'pin_attempts',
        'pin_locked_until',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'qr_token',
        'pin',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function siswas()
    {
        return $this->hasOne(Siswa::class, 'user_id');
    }

    public function rotateToken()
    {
        $this->tokens()->delete(); // Delete existing tokens
        return $this->createToken('auth_token')->plainTextToken; // Generate new token
    }
}
