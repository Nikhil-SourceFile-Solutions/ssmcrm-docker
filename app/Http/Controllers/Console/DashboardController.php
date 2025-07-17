<?php

namespace App\Http\Controllers\Console;

use Google\Client;
use Google\Service\AnalyticsData;
use Google\Service\AnalyticsData\RunReportRequest;
use Google\Service\AnalyticsData\DateRange;
use Google\Service\AnalyticsData\Metric;
use Google\Service\AnalyticsData\Dimension;
use App\Http\Controllers\Controller;
use Google\Service\AnalyticsData\RunRealtimeReportRequest;

class DashboardController extends Controller
{
    public function index()
    {
        $client = new Client();
        $client->setAuthConfig(storage_path('app/google-analytics.json'));
        $client->addScope(AnalyticsData::ANALYTICS_READONLY);

        $analytics = new AnalyticsData($client);
        $propertyId = '449135553'; // Replace with your GA4 Property ID

        // $request = new RunReportRequest([
        //     'dateRanges' => [new DateRange(['startDate' => '7daysAgo', 'endDate' => 'today'])],
        //     'metrics' => [new Metric(['name' => 'activeUsers'])],
        //     'dimensions' => [new Dimension(['name' => 'pagePath'])],
        // ]);

        // $request = new RunReportRequest([
        //     'dateRanges' => [
        //         new DateRange(['startDate' => '2024-02-10', 'endDate' => 'today'])
        //     ],
        //     'metrics' => [new Metric(['name' => 'activeUsers'])],
        //     'dimensions' => [new Dimension(['name' => 'month'])], // Group by month
        //     'orderBys' => [
        //         ['dimension' => ['dimensionName' => 'month'], 'desc' => false] // Order by month ascending
        //     ]
        // ]);

        $request = new RunRealtimeReportRequest([
            'metrics' => [new Metric(['name' => 'activeUsers'])]
        ]);

        $response = $analytics->properties->runRealtimeReport("properties/{$propertyId}", $request);

        // Extract total active users count
        $totalUsers = isset($response->getRows()[0]) ? (int) $response->getRows()[0]->getMetricValues()[0]->value : 0;

        return response()->json(['total_active_users' => $totalUsers, 'response' => $response]);
    }
}
