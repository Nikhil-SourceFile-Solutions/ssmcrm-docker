<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Fileinfo;
use App\Models\Company\Lead;
use App\Models\Company\Settings\Dropdown;
use App\Models\Company\UploadLead;
use App\Models\Company\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Traits\Company\NotificationTrait;
use Illuminate\Support\Facades\DB;

class UploadController extends Controller
{
    use NotificationTrait;
    public function checkUpload()
    {
        $fileInfo = Fileinfo::where('is_moved', false)->first();

        if ($fileInfo) return response()->json(['status' => 'success', 'action' => 'move', 'fileInfo' => $fileInfo]);

        $statuses = Dropdown::where([['type', 'Lead Status'], ['status', true]])->whereNotIn('value', ['Closed Won', 'Follow Up', 'Free Trial'])
            ->select('id', 'type', 'value')->get();
        $states = Dropdown::where([['type', 'State'], ['status', true]])->select('id', 'type', 'value')->get();

        $employees = User::whereIn('user_type', ['Manager', 'Team Leader', 'BDE'])->select('id', 'first_name', 'last_name', 'user_type')->get();

        return response()->json(['status' => 'success', 'action' => 'upload', 'statuses' => $statuses, 'states' => $states, 'employees' => $employees]);
    }

    public function bulkUpload(Request $request)
    {
        set_time_limit(300);



        if ($request->unique_id) {
            $fileInfo = Fileinfo::create([
                'unique_id' => $request->unique_id,
                'total' => $request->total,
                'is_to_employee' => $request->is_to_employee,
                'user_id' => $request->is_to_employee ? $request->user_id : 1,
            ]);
        }
        $uploaded = UploadLead::insert($request->leads);
        if ($uploaded) return response()->json(['status' => 'success']);
    }


    public function moveLeads()
    {
        set_time_limit(3600);


        $data = [
            "action" => "lead-move",
            "title" => "Started",
            "message" => "Lead Moving Started"
        ];

        $this->sendMessage($data, [1]);


        $this->findDuplicateLeads();

        $this->findInvalidLeads();

        $this->findInvalidPhones();

        return $this->__MOVE_LEDS_TO_LEAD_TABLE();
    }


    protected function findDuplicateLeads()
    {
        try {

            $data = [
                "action" => "lead-move",
                "title" => "Duplicate Finding",
                "message" => "Lead Moving Started"
            ];

            $this->sendMessage($data, [1]);


            $duplicatePhoneNumbers =   DB::select("
            SELECT phone
            FROM (
                SELECT phone FROM upload_leads
                UNION ALL
                SELECT phone FROM leads
            ) AS combined_tables
            GROUP BY phone
            HAVING COUNT(*) > 1
        ");

            $leadChunk = array_chunk($duplicatePhoneNumbers, 2500);
            foreach ($leadChunk as $chunk) {
                $phoneNumbers = array_map(function ($item) {
                    return $item->phone;
                }, $chunk);
                UploadLead::whereIn('Phone', $phoneNumbers)->update(['is_duplicte' => true]);
            }
        } catch (\Exception $e) {

            Log::debug($e->getMessage());
        }
    }

    protected function findInvalidLeads()
    {
        try {

            $data = [
                "action" => "lead-move",
                "title" => "Invalid Finding",
                "message" => "Lead Moving Started"
            ];

            $this->sendMessage($data, [1]);

            $invalid = UploadLead::where([['is_duplicte', false], ['is_invalid', false]])
                ->where(
                    function ($query) {
                        return $query->orWhereNull('source')->orWhereNull('phone');
                    }
                )
                ->pluck('upload_leads.id')
                ->toarray();
            if (count($invalid)) {

                $leadChunk = array_chunk($invalid, 2500);
                foreach ($leadChunk as $chunk) {
                    UploadLead::whereIn('id', $chunk)->update(['is_invalid' => true]);
                }
            }
        } catch (\Exception $e) {

            Log::debug($e->getMessage());
        }
    }

    protected function findInvalidPhones()
    {

        try {

            $data = [
                "action" => "lead-move",
                "title" => "Invalid Phone Finding",
                "message" => "Lead Moving Started"
            ];
            $this->sendMessage($data, [1]);

            $invalidPhone = UploadLead::whereNot('phone', 'REGEXP', '^[0-9]{10}$')->where([['is_duplicte', false], ['is_invalid', false]])
                ->pluck('upload_leads.id')
                ->toarray();
            if (count($invalidPhone)) {

                $leadChunk = array_chunk($invalidPhone, 2500);
                foreach ($leadChunk as $chunk) {
                    UploadLead::whereIn('id', $chunk)->update(['is_invalid' => true]);
                }
            }
        } catch (\Exception $e) {

            Log::debug($e->getMessage());
        }
    }

    // protected function removeSameTableDuplicate()
    // {
    //     $duplicatePhones = DB::table('upload_leads')
    //         ->select('phone', DB::raw('COUNT(*) as count'))
    //         ->groupBy('phone')
    //         ->having('count', '>', 1)
    //         ->get()
    //         ->pluck('phone');

    //     foreach ($duplicatePhones as $phone) {
    //         $duplicateRecords = UploadLead::where('phone', $phone)->get();
    //         $duplicateRecords->slice(1)->each(function ($record) {
    //             $record->delete();
    //         });
    //     }
    // }


    protected function __MOVE_LEDS_TO_LEAD_TABLE()
    {


        $leads = UploadLead::where([['is_duplicte', false], ['is_invalid', false]])
            ->select('name as first_name', 'phone', 'email', 'status', 'state', 'source', 'city', 'user_id', 'created_at', 'created_at as moved_at')->get()->toarray();


        $totalLead = count($leads);


        if ($totalLead) {
            $chunkSize = $this->findChunkSize($totalLead);
            $times = $totalLead / $chunkSize;
            $eachPercentage = 100 / $times;



            try {

                $leadChunk = array_chunk($leads, $chunkSize);
                foreach ($leadChunk as $index => $chunk) {


                    Lead::insert($chunk);

                    if ($index + 1 == ceil($times)) $per = ceil(100);
                    else $per = ceil(($index + 1) * $eachPercentage);
                    $data = [
                        "action" => "lead-move",
                        "value" => "$per",
                        "title" => "$per"
                    ];

                    $this->sendMessage($data, [1]);
                }
                $data = [
                    "action" => "lead-move",
                    "value" => "100",
                    "title" => "100"
                ];

                $this->sendMessage($data, [1]);

                $file = Fileinfo::where('is_moved', false)->first();
                $file->duplicate = UploadLead::where('is_duplicte', true)->count();
                $file->invalid = UploadLead::where('is_invalid', true)->count();
                $file->inserted = $file->total - ($file->duplicate + $file->invalid);
                $file->is_moved = true;
                if ($file->save()) {
                    UploadLead::truncate();
                    return response()->json(['status' => 'success', 'message' => 'Leads Uploaded Successfully!', 'data' => $file]);
                }
            } catch (\Exception $e) {

                Log::debug($e->getMessage());
            }
        } else {

            $data = [
                "action" => "lead-move",
                "value" => "100",
                "title" => "100"
            ];
            $this->sendMessage($data, [1]);

            $file = Fileinfo::where('is_moved', false)->first();
            $file->duplicate = UploadLead::where('is_duplicte', true)->count();
            $file->invalid = UploadLead::where('is_invalid', true)->count();
            $file->inserted = $file->total - ($file->duplicate + $file->invalid);
            $file->is_moved = true;
            if ($file->save()) {
                UploadLead::truncate();;
                return response()->json(['status' => 'success', 'message' => 'Leads Uploaded Successfully!', 'data' => $file]);
            }
        }
    }


    protected function findChunksize($number)
    {
        $n = 0;
        if ($number <= 4999) {
            $n = 200;
        } elseif ($number >= 5000 && $number <= 9999) {
            $n = 250;
        } elseif ($number >= 10000 && $number <= 24999) {
            $n = 500;
        } elseif ($number >= 25000 && $number <= 49999) {
            $n = 1000;
        } elseif ($number >= 50000 && $number <= 99999) {
            $n = 2000;
        } elseif ($number >= 100000 && $number <= 249999) {
            $n = 2500;
        } elseif ($number >= 250000 && $number <= 499999) {
            $n = 5000;
        } else  $n = 5000;
        return $n;
    }
}
