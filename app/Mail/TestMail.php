<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $fromAddress;
    public $fromName;
    public $pdfContent;
    public $data;
    /**
     * Create a new message instance.
     */
    public function __construct($pdfContent, $data, $fromAddress = 'no-reply@thefinsap.com', $fromName = 'Invoice')
    {
        $this->fromAddress = $fromAddress;
        $this->fromName = $fromName;
        $this->pdfContent = $pdfContent;
        $this->data =  $data;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'company.email.invoice', // Your email view
        );
    }

    /**
     * Build the message and attach the PDF.
     */
    public function build()
    {
        return $this->from($this->fromAddress, $this->fromName)
            ->view('company.email.invoice')
            ->with([
                'data' => $this->data,
            ])
            ->attachData($this->pdfContent, 'invoice.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
