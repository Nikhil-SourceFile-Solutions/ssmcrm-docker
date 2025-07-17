<?php

namespace App\Traits\Company;

use App\Models\Company\User;
use Google\Client as GoogleClient;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

trait NotificationTrait
{
    public function sendNotification($notification, $data, $to = null)
    {

        $users = User::whereIn('id', $to)->whereNotNull('fcm_token')->pluck('fcm_token')->toArray();

        // foreach ($users as $to) {
        //     $this->notification($notification, $data, $to);
        // }

        return  $this->sendBatchNotifications($notification, $data, $users);
    }


    protected function sendBatchNotifications($notifications, $data, $tokens)
    {
        $serviceAccountPath = __DIR__ . '/firebase-service-account.json';
        $firebase = (new Factory)->withServiceAccount($serviceAccountPath);
        $messaging = $firebase->createMessaging();

        $notification = Notification::create($notifications['title'],  $notifications['body']);
        $message = CloudMessage::new()
            ->withNotification($notification)
            ->withData($data);

        // Send the multicast message (multiple recipients)
        try {
            $response = $messaging->sendMulticast($message,  $tokens);


            // Handle the response (success or failure)
            return response()->json([
                'message' => 'Notifications sent successfully',
                'response' => $response
            ]);
        } catch (\Kreait\Firebase\Exception\MessagingException $e) {
            // Handle the error
            return response()->json([
                'error' => 'Error sending notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    public function sendMessage($data, $to)
    {
        $users = User::whereIn('id', $to)->whereNotNull('fcm_token')->pluck('fcm_token')->toArray();

        foreach ($users as $to) {
            $this->message($data, $to);
        }
    }

    protected function message($data, $to)
    {
        $access_token = $this->getToken();

        $headers = [
            "Authorization: Bearer $access_token",
            'Content-Type: application/json'
        ];
        $content = [
            "message" => [
                "token" => $to,
                "data" => $data
            ]
        ];

        $payload = json_encode($content);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/v1/projects/sfs-crm/messages:send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_VERBOSE, true); // Enable verbose output for debugging
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        if ($err) {
            return response()->json([
                'message' => 'Curl Error: ' . $err
            ], 500);
        } else {
            return response()->json([
                'message' => 'Notification has been sent',
                'response' => json_decode($response, true)
            ]);
        }
    }

    protected function getToken()
    {
        $credentialsFilePath = "firebase.json";  // local
        // $credentialsFilePath = Http::get(asset('firebase.json')); // in server
        $client = new GoogleClient();
        $client->setAuthConfig($credentialsFilePath);
        $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
        $client->refreshTokenWithAssertion();
        $token = $client->getAccessToken();
        return  $token['access_token'];
    }

    protected function notification($notification, $data, $to)
    {
        $access_token = $this->getToken();

        $headers = [
            "Authorization: Bearer $access_token",
            'Content-Type: application/json'
        ];
        $content = [
            "message" => [
                "token" => $to,

                "notification" => [
                    "title" => $notification['title'],
                    "body" =>  $notification['body'],
                ],
                "data" => $data
            ]
        ];

        $payload = json_encode($content);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/v1/projects/sfs-crm/messages:send');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_VERBOSE, true); // Enable verbose output for debugging
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);


        if ($err) {
            info($err);
            return response()->json([
                'message' => 'Curl Error: ' . $err
            ], 500);
        } else {

            info($response);
            return response()->json([
                'message' => 'Notification has been sent',
                'response' => json_decode($response, true)
            ]);
        }
    }
}
