<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\DB;

class CleanupExpiredTokens extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup expired tokens from database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting token cleanup...');

        // Hapus token yang sudah expired
        $deletedCount = PersonalAccessToken::where('expires_at', '<', now())
            ->delete();

        $this->info("Deleted {$deletedCount} expired tokens.");

        // Hapus session yang sudah expired (older than 7 days)
        $deletedSessions = DB::table('sessions')
            ->where('last_activity', '<', now()->subDays(7)->timestamp)
            ->delete();

        $this->info("Deleted {$deletedSessions} expired sessions.");

        $this->info('Token cleanup completed successfully!');

        return Command::SUCCESS;
    }
}
