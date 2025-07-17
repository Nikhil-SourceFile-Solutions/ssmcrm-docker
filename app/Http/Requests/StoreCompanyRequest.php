<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'domain' => 'required|string|max:100|unique:companies,domain',
            'customer_name' => 'required|string|max:250',
            'customer_email' => 'required|email|max:250',
            'customer_phone' => 'required|digits:10',
            'company_name' => 'required|string|max:250',
            'gstin' => 'nullable|string|nullable',
            'city' => 'required|string|max:250',
            'state' => 'required|string|max:250',
            'company_type' => 'required|integer',
            'status' => 'required|boolean'
        ];
    }
}
