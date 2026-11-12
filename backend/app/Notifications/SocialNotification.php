<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SocialNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $type, // 'follow', 'message', 'like', 'comment', 'system'
        public string $title,
        public string $message,
        public array $extraData = []
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return array_merge([
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
        ], $this->extraData);
    }
}

