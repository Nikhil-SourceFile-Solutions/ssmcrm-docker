import React, { useEffect, useState } from 'react'
import BankDetailsPreview from '../BankDetailsPreview'
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../../../../../AuthContext';

export default function Sms({ lead_id, templates,payments, setBankModel }) {
    console.log("SMS-templates", templates)

    const defaultParams = {
        lead_id: lead_id,
        is_bank: true,
        bank: '',
        is_upi: true,
        bank_template_id: '',
        upi_template_id: '',
        bank_final_template: "",
        upi_final_template: "",
        bankfields: [],
        upifields: [],
    };


    const [errors, setErrors] = useState<any>({});
    const [params, setParams] = useState<any>(defaultParams);

    const changeValue = (e: any) => {
        const { value, name, type, checked } = e.target;
        setErrors({ ...errors, [name]: '' });
        if (type == "checkbox") {
            setParams({ ...params, [name]: checked ? true : false })
        } else setParams({ ...params, [name]: value });
    };

    useEffect(() => {
        if (!params.is_bank) {
            setParams({ ...params, bank: '', bankfields: [], bank_final_template: '', bank_template_id: '' })
        }
    }, [params.is_bank])

    useEffect(() => {
        if (!params.is_upi) {
            setParams({ ...params, upi: '', upifields: [], upi_final_template: '', upi_template_id: '' })
        }
    }, [params.is_upi])


    const validate = () => {
        setErrors({});
        let errors = {};
        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    useEffect(() => {
        if (params.bank) {
            const bank: any = payments.find((t: any) => t.id == params.bank);
            const template = templates.find((temp) => temp.template_type == "Bank Details");
            const { bank_name, account_holder_name, account_type, account_number, branch, ifsc_code } = bank;
            const fields = [bank_name, account_holder_name, account_type, account_number, branch, ifsc_code];
            let replacedStr = template.template.replace(/{{(\d+)}}/g, (match, index) => {
                return fields[parseInt(index) - 1] || match;
            });
            setParams({ ...params, bankfields: fields, bank_final_template: replacedStr, bank_template_id: template.id });
        }
    }, [params.bank])


    useEffect(() => {
        if (params.upi) {
            const upi: any = payments.find((t: any) => t.id == params.upi);
            const template = templates.find((temp) => temp.template_type == "Upi Details");
            const fields = [upi.upi];
            let replacedStr = template?.template.replace(/{{(\d+)}}/g, (match, index) => {
                return fields[parseInt(index) - 1] || match;
            });
            setParams({ ...params, upifields: fields, upi_final_template: replacedStr, upi_template_id: template.id });
        }
    }, [params.upi])


    const {crmToken, apiUrl} = useAuth()

    const sendBankDetails = async (data: any) => {
        try {
            setBtnLoading(true);
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/bank-details",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status === 'success') {
                Swal.fire({
                    title: "Campaign Updated successfully",
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                })
                setBankModel(false)
            }
        } catch (error: any) {
            console.log(error);
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0]);
                }
                setErrors(serverErrors);
                Swal.fire({
                    title: "Server Validation Error! Please Solve",
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-danger"
                    }
                });
            }

        } finally {
            setBtnLoading(false);
        }
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("lead_id", lead_id);
        data.append("is_bank", params.is_bank);
        data.append("bank",  params.bank);
        data.append("is_upi", params.is_upi);
        data.append(" bank_template_id",  params.bank_template_id);
        data.append("upi_template_id",  params.upi_template_id);
        data.append("bank_final_template",  params.bank_final_template);
        data.append("upi_final_template",  params.upi_final_template);
        data.append("bankfields",  params.bankfields);
        data.append("upifields",  params.upifields);
        // data.append("selected_upi_details", JSON.stringify(upiPayment));

        console.log(params)


        sendBankDetails(data);
    };

    const [btnLoading, setBtnLoading] = useState(false);
    const [tab,setTab]=useState('bank');
    return (
        <div>
            {/* <section className="flex gap-2 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                <form autoComplete="off" action="" method="post" className='flex-1 bg-[#e3e7fc] p-4 rounded h-fit'>

                <div className='flex gap-4 justify-end'>
                                                    <button
                                                        className={`${tab == "bank" && 'text-secondary !outline-none before:!w-full'}
                            before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                        onClick={() => setTab('bank')} type='button'>
                                                        Send Bank
                                                    </button>
                                                    <button
                                                        className={`${tab == "upi" && 'text-secondary !outline-none before:!w-full'}
                            before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                        onClick={() => setTab('upi')}
                                                        type='button'
                                                    >
                                                      Send Upi
                                                    </button>

                                                </div>
                    <h1 className=' mb-3 font-bold text-lg' >Bank Details 9999</h1>

                    <div className='mb-4 flex gap-4 ' >
                        {
                            tab=='bank' &&
                            <label className="inline-flex">
                            <input type="checkbox" className="form-checkbox border-[#000]/25"
                                onChange={(e) => changeValue(e)}
                                name='is_bank'
                                checked={params.is_bank ? true : false}
                            />
                            <span>Bank</span>
                        </label>
                        }

                        {
                            tab=='upi' &&
                            <label className="inline-flex">
                            <input type="checkbox" className="form-checkbox  border-[#000]/25"
                                onChange={(e) => changeValue(e)}
                                name='is_upi'
                                checked={params.is_upi ? true : false}
                            />
                            <span>Upi</span>
                        </label>
                        }



                    </div>

                    {
                      tab=='bank' &&  params.is_bank ?
                            <div className='mb-4'>
                                <select onChange={(e) => changeValue(e)} value={params.bank}
                                    name="bank"
                                    className="form-select text-white-dark  py-2 text-sm ">
                                    <option value={''} aria-readonly >Select Bank</option>
                                    {payments?.filter((bank) => bank.is_bank_upi == "bank").map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.bank_name}</option>
                                    ))}
                                </select>
                                <div className="text-danger font-semibold text-sm">{errors.bank}</div>
                            </div>
                            : null
                    }
                    {
                        tab=='bank'&& <div>{params.bank_final_template}</div>
                    }


                    {
                       tab=='upi' && params.is_upi ?
                            <div className='mb-4'>
                                <select onChange={(e) => changeValue(e)} value={params.upi}
                                    name="upi"
                                    className="form-select text-white-dark  py-2 text-sm ">
                                    <option value={''} aria-readonly >Select Upi</option>
                                    {payments?.filter((bank) => bank.is_bank_upi == "upi").map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.upi}</option>
                                    ))}
                                </select>
                                <div className="text-danger font-semibold text-sm">{errors.upi}</div>
                            </div>
                            : null
                    }
                    {
                        tab=='upi'&&
                        <div>{params.upi_final_template}</div>
                    }




                    {params.bank_template_id || params.upi_final_template ? (<div className='flex justify-end gap-5 py-2'>
                        <button type="button" className='btn btn-danger shadow' onClick={() => setBankModel(false)}>Cancel</button>
                        <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn  btn-dark shadow bg-black">
                            {btnLoading ? 'Please Wait...' : 'Send'}
                        </button>
                    </div>) : null}



                </form>


            </section> */}
            sms is in progress

        </div>
    )
}
