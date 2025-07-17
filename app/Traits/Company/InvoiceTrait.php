<?php

namespace App\Traits\Company;

use App\Models\Company\Lead;
use App\Models\Company\SaleInvoice;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Company\Settings\Bank;

trait InvoiceTrait
{
    /**
     *
     * @param object $sale
     * @param object $invoicesetting
     * @param string $logo
     * @param object|null $lead
     * @return \Barryvdh\DomPDF\PDF
     */
    public function getPdfInvoice(object $sale, object $invoicesetting, string $logo, ?object $lead = null)
    {


        $invoiceData = [
            'address' => $invoicesetting->address,
            'email' => $invoicesetting->email,
            'phone' => $invoicesetting->phone,
            'company_name' => $invoicesetting->company_name
        ];


        $bank = Bank::find($sale->bank);
        $view = $invoicesetting->invoice_template == "single-product-invoice"
            ? 'company.invoice.single-product-invoice'
            : ($invoicesetting->invoice_template == "table-product-invoice"
                ? 'company.invoice.table-product-invoice'
                : 'company.invoice.invoice-three');



        if ($invoicesetting->invoice_type === 'Auto Invoice') {


            $userData = [
                'name' => $lead->first_name . ' ' . $lead->last_name,
                'address_one' => null,
                'address_two' => ($lead->city ? $lead->city . ' - ' : '') . $lead->state,
                'email' => $lead->email,
                'phone' => $lead->phone,
            ];

            $invoiceData = [
                ...$invoiceData,
                'invoice_id' => $invoicesetting->invoice_prefix . '-' . $invoicesetting->invoice_start_from + $sale->id,
                'date' => $sale->created_at
            ];
        } else {
            $invoice = SaleInvoice::where('sale_id', $sale->id)->first();

            info($invoice);
            $userData = [
                'name' => $invoice->name,
                'address_one' => $invoice->address,
                'address_two' => ($invoice->city ? $invoice->city . ' - ' : '') . $invoice->state,
                'email' => $invoice->email,
                'phone' => $invoice->mobile,

            ];

            $invoiceData = [
                ...$invoiceData,
                'invoice_id' => $invoicesetting->invoice_prefix . '-' . $invoicesetting->invoice_start_from + $invoice->id,
                'date' => $invoice->created_at
            ];
        }



        return $this->generatePdf($view, [
            'logo' => $logo,
            'sale' => $sale,
            'userData' => $userData,
            'invoiceData' => $invoiceData,
            'bank' => $bank
        ]);
    }

    /**
     * Generate a PDF with the given view and data.
     *
     * @param string $view
     * @param array $data
     * @return \Barryvdh\DomPDF\PDF
     */
    private function generatePdf(string $view, array $data)
    {
        return Pdf::setOption(['isRemoteEnabled' => true])
            ->loadView($view, $data)
            ->setWarnings(true);
    }
}
