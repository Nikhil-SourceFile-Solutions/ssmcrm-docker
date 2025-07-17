import React from 'react'
import Swal from 'sweetalert2';
import { useState, useEffect, Fragment } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { Dialog, Transition } from '@headlessui/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { useAuth } from '../../../AuthContext';

export default function SendInvoiceModel({ invoiceModel, setInvoiceModel, invoiceData, invoiceSetting }) {
    const { logout, crmToken, settingData, apiUrl } = useAuth();

    const [defaultParams] = useState({
        is_email: 1,
        is_whatsapp: 1,
        is_sms: 0,
        email: '',
        mobile: '',
        sale_id: ''
    })

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    useEffect(() => {
        if (invoiceData && invoiceModel) {
            setParams({
                ...defaultParams,
                email: invoiceData?.email ? invoiceData.email : '',
                mobile: invoiceData?.mobile ? invoiceData.mobile : '',
                sale_id: invoiceData.sale_id
            })
        }
    }, [invoiceData, invoiceModel]);

    const changeValue = (e: any) => {
        const { value, name, type, checked } = e.target;
        setErros({ ...errors, [name]: '' });
        if (type === 'checkbox') setParams({ ...params, [name]: checked ? 1 : 0 });
        else setParams({ ...params, [name]: value });
    };

    const validate = () => {
        setErros({});





        let errors = {};
        // if (!params.is_email && !params.is_whatsapp && !params.is_sms) {
        //     errors = { ...errors, is_email: 'Please Select Checkbox to Continue' }
        // }
        // if (params.is_email) {
        //     if (!params.email) {
        //         errors = { ...errors, email: " Email  required" };
        //     }
        // }
        // if (params.is_whatsapp) {
        //     if (!params.mobile) {
        //         errors = { ...errors, mobile: "Mobile number is required" };
        //     } else if (!/^\d{10}$/.test(params.mobile)) {
        //         // Assuming a 10-digit mobile number is required
        //         errors = { ...errors, mobile: "Enter a valid 10-digit mobile number" };
        //     }
        // }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };


    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const [response, setResponse] = useState(null);
    const sendInvoice = async (data) => {

        setIsBtnLoading(true)
        setResponse(null)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/email/send-invoice",
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == 'success') {
                setResponse(response.data)
            }

            if (response.data.status == 'error') {
                setResponse(response.data)
            }


        } catch (error) {

            console.log(error)
            if (error?.response?.status == 401) logout()

            else if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                }
                setErros(serverErrors);
            }

        } finally {

            setIsBtnLoading(false)
        }

    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("sale_id", params.sale_id);
        data.append("email", params.email);
        data.append("mobile", params.mobile);
        data.append("is_email", params.is_email);
        data.append("is_whatsapp", params.is_whatsapp);
        data.append("is_sms", params.is_sms);

        sendInvoice(data);
    };



    return (
        <>
            {
                (settingData?.email_enabled || settingData?.whatsapp_enabled || settingData?.sms_enabled) ?
                    <Transition appear show={invoiceModel} as={Fragment}>
                        <Dialog as="div" open={invoiceModel} onClose={() => setInvoiceModel(true)}>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0" />
                            </Transition.Child>
                            <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                                <div className="flex items-start justify-center min-h-screen px-4">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >



                                        <Dialog.Panel className="panel border-0 p-1 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                            <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                <div className="font-bold text-lg">Send Invoice  </div>
                                                <button type="button" onClick={() => {
                                                    {
                                                        setInvoiceModel(false)
                                                        setParams(defaultParams)
                                                    }
                                                }} className="text-white-dark hover:text-dark">
                                                    <IoCloseCircleSharp size={25} color='black' />
                                                </button>
                                            </div>

                                            <h1 className='font-bold p-5'>Where You would like to share Sale Invoice ?</h1>

                                            <div>
                                                {
                                                    settingData?.email_enabled && invoiceSetting?.send_invoice_via_email ?
                                                        <>
                                                            <label className="py-3 px-5 inline-flex">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox border-[#000]/25"
                                                                    onChange={(e) => changeValue(e)}
                                                                    name="is_email"
                                                                    checked={params.is_email ? true : false}
                                                                />
                                                                <span>Email</span>
                                                            </label>

                                                            {params.is_email ? (
                                                                <div>
                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        value={params.email}
                                                                        onChange={(e) => changeValue(e)}
                                                                        placeholder="Enter email"
                                                                        className="form-input mb-3 "
                                                                    />
                                                                    <div className="text-danger mt-1">{errors.email}</div>

                                                                </div>
                                                            ) : null}
                                                        </> : null
                                                }




                                                {
                                                    settingData?.whatsapp_enabled && invoiceSetting?.send_invoice_via_whatsapp ?
                                                        <>
                                                            <label className="py-3 px-5 inline-flex">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox border-[#000]/25"
                                                                    onChange={(e) => changeValue(e)}
                                                                    name="is_whatsapp"
                                                                    checked={params.is_whatsapp ? true : false}
                                                                />
                                                                <span>Whatsapp</span>
                                                            </label>

                                                            {params.is_whatsapp ? (
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        name="mobile"
                                                                        value={params.mobile}
                                                                        onChange={(e) => changeValue(e)}
                                                                        placeholder="Enter Whatsapp number"
                                                                        className="form-input"
                                                                    />
                                                                    <div className="text-danger mt-1">{errors.mobile}</div>

                                                                </div>
                                                            ) : null}

                                                        </> : null
                                                }




                                                {
                                                    settingData?.sms_enabled && invoiceSetting?.send_invoice_via_sms ?
                                                        <>
                                                            <label className="py-3 px-5 mt-5 inline-flex">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox border-[#000]/25"
                                                                    onChange={(e) => changeValue(e)}
                                                                    name="is_sms"
                                                                    checked={params.is_sms ? true : false}
                                                                />
                                                                <span>SMS</span>
                                                            </label>

                                                            {params.is_sms ? (
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        name="sms"
                                                                        value={params.sms}
                                                                        onChange={(e) => changeValue(e)}
                                                                        placeholder="Enter SMS number"
                                                                        className="form-input"
                                                                    />
                                                                    {/* <div className="text-danger mt-1">{errors.mobile}</div> */}

                                                                </div>
                                                            ) : null}
                                                        </> : null

                                                }


                                                {response?.emailResponse ? (<div className='badge bg-[#1d67a7] mx-4'>
                                                    <p>{response?.emailResponse}</p>
                                                </div>) : null}

                                                {response?.whatsAppResponse ? (<div className='badge bg-[#1d67a7] mx-4'>
                                                    <p>{response?.whatsAppResponse}</p>
                                                </div>) : null}




                                            </div>

                                            <div className='text-danger mt-1 py-3 px-3' >{errors.is_email}</div>
                                            <div className="flex justify-between items-center p-5 mt-8">
                                                <button type="button" onClick={() => setInvoiceModel(false)} className="btn btn-sm btn-outline-danger">
                                                    Discard
                                                </button>
                                                <button type="button" onClick={() => { formSubmit() }} disabled={isBtnLoading} className="btn btn-sm btn-primary ltr:ml-4 rtl:mr-4">
                                                    {isBtnLoading ? 'Please Wait...' : ' Send Invoice'}
                                                </button>
                                            </div>



                                            {/* {
                               tab == 'Email' ? <div className="p-5 bg-secondary-light">
                                   <div>
                                       <label>Email ID</label>
                                       <input
                                           name='email'
                                           type="text"
                                           value={params.email}
                                           onChange={(e) => changeValue(e)}
                                           placeholder="Please Enter Email Id"
                                           className="form-input"
                                       />
                                       <div className="text-danger mt-1">{errors.email}</div>
                                   </div>

                                   <div className="flex justify-end items-center mt-8">
                                       <button type="button" onClick={() => {
                                           {
                                               setInvoiceModel(false)
                                               setParams("")
                                               setErros("")
                                           }
                                       }} className="btn btn-sm btn-outline-danger">
                                           Discard
                                       </button>
                                       <button type="button" onClick={() => { formSubmit() }} disabled={isBtnLoading} className="btn btn-sm btn-primary ltr:ml-4 rtl:mr-4">
                                           {isBtnLoading ? 'Please Wait...' : ' Send Invoice'}

                                       </button>
                                   </div>
                               </div> :
                                   tab == 'Whatsapp' ? <div className="p-5 bg-secondary-light">
                                       <div>
                                           <label>Mobile No</label>
                                           <input
                                               name='mobile'
                                               type="text"
                                               value={params.mobile}
                                               onChange={(e) => changeValue(e)}
                                               placeholder="Please Enter mobile number"
                                               className="form-input"
                                           />
                                           <div className="text-danger mt-1">{errors.mobile}</div>
                                       </div>

                                       <div className="flex justify-end items-center mt-8">
                                           <button type="button" onClick={() => setInvoiceModel(false)} className="btn btn-sm btn-outline-danger">
                                               Discard
                                           </button>
                                           <button type="button" onClick={() => { formSubmit() }} disabled={isBtnLoading} className="btn btn-sm btn-primary ltr:ml-4 rtl:mr-4">
                                               {isBtnLoading ? 'Please Wait...' : ' Send Invoice'}

                                           </button>
                                       </div>
                                   </div> : ''
                           } */}

                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition> : ''
            }
        </>
    )
}
