<?php

namespace Database\Seeders;

use App\Models\CampusPost;
use App\Models\CampusPostComment;
use App\Models\CampusPostLike;
use App\Models\DirectMessage;
use App\Models\University;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Database\Seeder;

class SocialFeedSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::take(8)->get();
        if ($users->count() < 2) return;

        $univ = University::first();

        // 1. Initial Sample Posts
        $postsData = [
            [
                'user_index' => 0,
                'content' => "Selamat pagi civitas kampus! Ada yang tahu info pendaftaran lomba karya tulis ilmiah dan robotik tingkat nasional tahun ini? #InfoKuliah #TeknikInformatika",
                'media_url' => null,
                'likes' => 14,
            ],
            [
                'user_index' => 1,
                'content' => "Alhamdulillah! Robot tim riset kampus berhasil meraih Juara 1 Kategori Autonomous Navigation di Kontes Robot Nasional! Terima kasih doa teman-teman semua 🚀🔥 #PNLJuara #LombaRobotik",
                'media_url' => "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
                'likes' => 38,
            ],
            [
                'user_index' => 2,
                'content' => "Open recruitment pengurus UKM dan Himpunan Mahasiswa Jurusan (HIMA) resmi dibuka sampai akhir pekan depan. Yuk asah jiwa kepemimpinanmu di ormawa kampus! #EventKampus #Ormawa",
                'media_url' => "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
                'likes' => 22,
            ],
            [
                'user_index' => 0,
                'content' => "Semangat buat pejuang skripsi dan praktikum minggu ini! Jangan lupa jaga kesehatan dan backup source code di GitHub. #TugasAkhir #MahasiswaAkhir",
                'media_url' => null,
                'likes' => 19,
            ],
        ];

        foreach ($postsData as $p) {
            $author = $users[$p['user_index'] % $users->count()];
            $post = CampusPost::create([
                'user_id' => $author->id,
                'university_id' => $univ?->id,
                'content' => $p['content'],
                'media_url' => $p['media_url'],
                'likes_count' => $p['likes'],
                'comments_count' => 2,
            ]);

            // Add comments
            CampusPostComment::create([
                'post_id' => $post->id,
                'user_id' => $users[($p['user_index'] + 1) % $users->count()]->id,
                'content' => 'Keren banget, selamat ya! Sukses terus buat tim kampus!',
            ]);

            CampusPostComment::create([
                'post_id' => $post->id,
                'user_id' => $users[($p['user_index'] + 2) % $users->count()]->id,
                'content' => 'Info sangat bermanfaat, terima kasih infonya kak!',
            ]);
        }

        // 2. Initial Sample Follows
        for ($i = 0; $i < $users->count() - 1; $i++) {
            UserFollow::firstOrCreate([
                'user_id' => $users[$i]->id,
                'follower_id' => $users[$i + 1]->id,
            ]);
        }

        // 3. Initial Sample Direct Message
        DirectMessage::create([
            'sender_id' => $users[1]->id,
            'receiver_id' => $users[0]->id,
            'message' => 'Halo! Jangan lupa besok kita kumpul bahas materi presentasi praktikum jam 10 pagi ya.',
            'is_read' => false,
        ]);

        // 4. Sample Notifications for users
        foreach ($users as $idx => $target) {
            $follower = $users[($idx + 1) % $users->count()];
            $target->notify(new \App\Notifications\SocialNotification(
                type: 'follow',
                title: 'Pengikut Baru',
                message: "{$follower->name} mulai mengikuti Anda.",
                extraData: [
                    'sender_id' => $follower->id,
                    'sender_name' => $follower->name,
                    'sender_avatar' => $follower->avatar,
                    'action_url' => "/profile/{$follower->id}",
                ]
            ));

            $chatter = $users[($idx + 2) % $users->count()];
            $target->notify(new \App\Notifications\SocialNotification(
                type: 'message',
                title: "Pesan Baru dari {$chatter->name}",
                message: "Hai! Apa kabar? Ada info materi praktikum terbaru?",
                extraData: [
                    'sender_id' => $chatter->id,
                    'sender_name' => $chatter->name,
                    'sender_avatar' => $chatter->avatar,
                    'action_url' => "/messages",
                ]
            ));
        }
    }
}

