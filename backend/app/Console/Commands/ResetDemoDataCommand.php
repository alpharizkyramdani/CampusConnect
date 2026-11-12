<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;

class ResetDemoDataCommand extends Command
{
    protected $signature = 'app:reset-demo {--force : Force the operation to run when in production}';
    protected $description = 'Safely reset and reseed realistic CampusConnect demo dataset for live presentation';

    public function handle(): int
    {
        if (App::environment('production') && !$this->option('force')) {
            $this->error('CRITICAL: Resetting demo data is disabled in production environments!');
            return 1;
        }

        $this->info('====================================================');
        $this->info('  CAMPUSCONNECT — DEMO DATASET REFRESH SYSTEM       ');
        $this->info('====================================================');
        $this->newLine();

        $this->info('1. Running database fresh migration and seeders...');
        Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
        $this->line(Artisan::output());

        $this->info('2. Ensuring storage symlink is active...');
        Artisan::call('storage:link');

        $this->newLine();
        $this->info('✅ CampusConnect demo dataset has been successfully reset and initialized!');
        $this->table(
            ['Role Persona', 'Email Account', 'Password', 'Assigned University'],
            [
                ['Super Admin', 'superadmin@campusconnect.id', 'password', 'Platform Headquarters'],
                ['Campus Admin (UIR)', 'admin.uir@campusconnect.id', 'password', 'Universitas Islam Riau (UIR)'],
                ['Campus Admin (ITN)', 'admin.itn@campusconnect.id', 'password', 'Institut Teknologi Nasional (ITN)'],
                ['Department Admin', 'dept.ti@uir.ac.id', 'password', 'Informatics Engineering (UIR)'],
                ['UKM Admin', 'ukm.robotics@uir.ac.id', 'password', 'UKM Robotics Club (UIR)'],
                ['Ormawa Admin', 'bem.ft@uir.ac.id', 'password', 'BEM Fakultas Teknik (UIR)'],
                ['Student (Multi-Role)', 'student.alex@uir.ac.id', 'password', 'Student + UKM Admin (UIR)'],
                ['Student (ITN)', 'student.budi@itn.ac.id', 'password', 'Student (ITN)'],
                ['Lecturer (Dosen)', 'lecturer.sarah@uir.ac.id', 'password', 'Dosen Informatika (UIR)'],
            ]
        );

        $this->info('All services are ready for live demonstration.');
        return 0;
    }
}
