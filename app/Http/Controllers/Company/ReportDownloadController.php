<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company\Report;
use App\Models\Company\Settings\AuthPhone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use League\Csv\Writer;
use League\Csv\Reader;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportDownloadController extends Controller
{
    public function downloadReports(Request $request): StreamedResponse
    {
        // downloadReports
        $validated = $request->validate([
            'record_id' => 'required|integer',
            'selected_fields' => 'required|string'
        ]);

        $report = Report::findOrFail($validated['record_id']);
        $selectedFields = json_decode($validated['selected_fields']);

        if ($report->type == "Sales") $fieldMapping = $this->getSaleFieldMapping();

        else if ($report->type == "Leads") $fieldMapping = $this->getLeadFieldMapping();

        info($fieldMapping);
        $mappedField = array_map(function ($field) use ($fieldMapping) {
            return $fieldMapping[$field] ?? $field;
        }, $selectedFields);



        if (!Storage::exists($report->file)) {
            return response()->json(['status' => 'error', 'message' => 'File not found'], 404);
        }


        $csv = Reader::createFromPath(Storage::path($report->file), 'r');
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();


        $newCsv = Writer::createFromString('');
        $newCsv->insertOne($selectedFields);


        if ($report->type == "Sales") {

            foreach ($records as $record) {
                $filteredRow = $this->filterSaleRecord($record, $selectedFields, $fieldMapping);
                $newCsv->insertOne(array_values($filteredRow));
            }
        } else {
            foreach ($records as $record) {
                $filteredRow = $this->filterLeadRecord($record, $selectedFields, $fieldMapping);
                $newCsv->insertOne(array_values($filteredRow));
            }
        }




        $response = new StreamedResponse(function () use ($newCsv) {
            echo $newCsv->getContent();
        });
        $newFileName = $report->type . '-' . $report->report_name . '.csv';
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment;  filename="' . $newFileName . '"');
        return $response;
    }

    private function filterSaleRecord(array $record, array $selectedFields, array $fieldMapping): array
    {
        $filteredRow = [];
        foreach ($selectedFields as $field) {
            if (array_key_exists($field, $fieldMapping)) {
                $mappedField = $fieldMapping[$field];
                if (is_array($mappedField)) {
                    $filteredRow[$field] = $this->mergeFields($record, $mappedField);
                } elseif ($mappedField === 'is_custom_price') {
                    $filteredRow[$field] = $record[$mappedField] ? 'Yes' : 'No';
                } elseif ($mappedField === 'bank') {
                    $filteredRow[$field] = $this->formatBankInfo($record);
                } else {
                    $filteredRow[$field] = $record[$mappedField] ?? null; // Directly use the mapped field
                }
            }
        }
        return $filteredRow;
    }


    private function filterLeadRecord(array $record, array $selectedFields, array $fieldMapping): array
    {
        $filteredRow = [];
        foreach ($selectedFields as $field) {
            if (array_key_exists($field, $fieldMapping)) {
                $mappedField = $fieldMapping[$field];
                if (is_array($mappedField)) {
                    $filteredRow[$field] = $this->mergeFields($record, $mappedField);
                } elseif ($mappedField === 'is_dialed') {
                    $filteredRow[$field] = $record[$mappedField] ? 'Yes' : 'No';
                } else {
                    $filteredRow[$field] = $record[$mappedField] ?? null; // Directly use the mapped field
                }
            }
        }
        return $filteredRow;
    }

    private function mergeFields(array $record, array $fields): string
    {
        return trim(implode(' ', array_map(fn($field) => $record[$field] ?? '', $fields)));
    }

    private function formatBankInfo(array $record): string
    {
        return $record["is_bank_upi"] === 'bank'
            ? "Bank" . '-' . $record['bank_name']
            : 'UPI-' . $record['upi'];
    }

    private function getSaleFieldMapping(): array
    {
        return [
            'Lead Id' => 'lead_id',
            'Sale Id' => 'id',
            'Status' => 'status',
            'State' => 'state',
            'Start Date' => 'start_date',
            'Bank' => 'bank',
            'Client Type' => 'client_type',
            'Sale Service' => 'sale_service',
            'Sale Date' => 'sale_date',
            'Product' => 'product',
            'Product Duration' => 'product_duration',
            'Product Price' => 'product_price',
            'Due Date' => 'due_date',
            'Custom Price or Not' => 'is_custom_price',
            'Sale Price' => 'sale_price',
            'Offer Price' => 'offer_price',
            'Created At' => 'created_at',
            'Client Paid' => 'client_paid',
            'Client Name' => ['first_name', 'last_name'],
            'Owner Name' => ['owner_first_name', 'owner_last_name'],
            'Phone' => 'phone',
            'Second Phone' => 'second_phone',
            'Email' => 'email'

        ];
    }

    private function getLeadFieldMapping(): array
    {
        return [
            'Lead Id' => 'id',
            'Lead Name' => ['first_name', 'last_name'],
            'Owner Name' => ['owner_first_name', 'owner_last_name'],
            'Email' => 'email',
            'Phone' => 'phone',
            'Second Phone' => 'second_phone',
            'Lead Status' => 'status',
            'Investment' => 'invest',
            'Free Trial' => 'free_trial',
            'Followup' => 'followup',
            'Source' => 'source',
            'DND' => 'dnd',
            'City' => 'city',
            'State' => 'state',
            'Products' => 'products',
            'Lot Size' => 'lot_size',
            'Called' => 'is_dialed',
            'Moved At' => 'moved_at',
            'Created At' => 'created_at',

        ];
    }
}
