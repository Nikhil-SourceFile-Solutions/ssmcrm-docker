

import React, { useState, useEffect, useRef } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser, setPageTitle, setSettingToggleData } from '../../../store/themeConfigSlice';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import SebiLoader from '../Loaders/SebiLoader';
import PerfectScrollbar from 'react-perfect-scrollbar';
import LeftTab from '../LeftTab';
import ManageAddress from './ManageAddress';
import { IoMdRefresh } from 'react-icons/io';
import { useAuth } from '../../../AuthContext';
import Preview from './Preview';
import { FaEye } from "react-icons/fa";

const InvoiceSetting = () => {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('InvoiceSetting')); });
    const { crmToken, apiUrl } = useAuth()
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState('')

    useEffect(() => {

    }, [crmToken])

    useEffect(() => { fetchSettings(); }, [])

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/invoicesettings",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success' && response.data.invoicesetting) {
                console.log('***** Fetching Invoice Setting Data ******');
                setSettings(response.data.invoicesetting);
                // setInvoiceSettingData(response.data.invoiceSettingData);
                const data = response.data.invoicesetting;

                setParams({
                    id: data.id ? data.id : '',
                    invoice_start_from: data.invoice_start_from ? data.invoice_start_from : '',
                    invoice_prefix: data.invoice_prefix ? data.invoice_prefix : '',
                    invoice_type: data.invoice_type ? data.invoice_type : '',

                    invoice_template: data.invoice_template ? data.invoice_template : '',

                    company_name: data.company_name ? data.company_name : '',
                    address: data.address ? data.address : '',
                    email: data.email ? data.email : '',
                    phone: data.phone ? data.phone : '',
                    gst_no: data.gst_no ? data.gst_no : '',
                    sebi_no: data.sebi_no ? data.sebi_no : '',
                    is_send_invoice: data.is_send_invoice ? 1 : 0,
                    send_invoice_via_sms: data.send_invoice_via_sms ? 1 : 0,
                    send_invoice_via_whatsapp: data.send_invoice_via_whatsapp ? 1 : 0,
                    send_invoice_via_email: data.send_invoice_via_email ? 1 : 0,
                    enabled_send_auto_invoice: data.enabled_send_auto_invoice ? 1 : 0,
                    enabled_send_sms_invoice: data.enabled_send_sms_invoice ? 1 : 0,
                    enabled_send_whatsapp_invoice: data.enabled_send_whatsapp_invoice ? 1 : 0,
                    enabled_send_email_invoice: data.enabled_send_email_invoice ? 1 : 0,
                });
            }
        } catch (error) {
            console.log(error)

        } finally {
            setIsLoading(false);
        }
    }
    const [defaultParams] = useState({
        id: '',
        invoice_start_from: "",
        invoice_prefix: "",
        invoice_type: '',
        invoice_template: '',
        company_name: '',
        address: '',
        email: '',
        phone: '',
        gst_no: '',
        sebi_no: '',
        is_send_invoice: 0,
        send_invoice_via_sms: 0,
        send_invoice_via_whatsapp: 0,
        send_invoice_via_email: 0,
        enabled_send_auto_invoice: 0,
        enabled_send_sms_invoice: 0,
        enabled_send_whatsapp_invoice: 0,
        enabled_send_email_invoice: 0,
    });

    const [params, setParams] = useState<any>(
        JSON.parse(JSON.stringify(defaultParams))
    );
    const [errors, setErros] = useState<any>({});

    const changeValue = (e: any) => {
        const { value, name, type, checked } = e.target;
        setErros({ ...errors, [name]: "" });
        if (type == "checkbox") setParams({ ...params, [name]: checked ? 1 : 0 });
        else setParams({ ...params, [name]: value });
        console.table(params)
    };
    const validate = () => {
        setErros({});
        let errors = {};

        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };
    const [btnLoading, setBtnLoading] = useState(false);

    const UpdateInvoiceSettings = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/invoicesettings",

                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                fetchSettings();
                setSettings(settings);
                setParams(response.data.invoicesetting)
                showMessage(response.data.message)
                // dispatch(setInvoiceSettingData(response.data.invoicesetting))

                console.log(response.data.invoicesetting)
            } else {

                alert("Failed")
            }

        } catch (error: any) {
            console.log(error)

            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
                Swal.fire({
                    title: "Server Validation Error! Please solve",
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
            setBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("invoice_start_from", params.invoice_start_from);
        data.append("invoice_prefix", params.invoice_prefix);
        data.append('invoice_type', params.invoice_type);
        data.append('invoice_template', params.invoice_template);
        data.append('company_name', params.company_name);
        data.append('address', params.address);
        data.append('email', params.email);
        data.append('phone', params.phone);
        data.append('gst_no', params.gst_no);
        data.append('sebi_no', params.sebi_no);
        data.append('is_send_invoice', params.is_send_invoice);
        data.append('send_invoice_via_sms', params.send_invoice_via_sms);
        data.append('send_invoice_via_whatsapp', params.send_invoice_via_whatsapp);
        data.append('send_invoice_via_email', params.send_invoice_via_email);
        data.append('enabled_send_auto_invoice', params.enabled_send_auto_invoice);
        data.append('enabled_send_sms_invoice', params.enabled_send_sms_invoice);
        data.append('enabled_send_whatsapp_invoice', params.enabled_send_whatsapp_invoice);
        data.append('enabled_send_email_invoice', params.enabled_send_email_invoice);
        UpdateInvoiceSettings(data);
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };
    const [tab, setTab] = useState('invoice')

    const [modal, setModal] = useState(false);
    return (

        <div className="flex gap-5 relative  h-full">
            <div className={`panel w-[280px]`}>
                <div className="flex flex-col h-full pb-2">
                    <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                        <LeftTab />
                    </PerfectScrollbar>
                </div>
            </div>
            <div className=" p-0 flex-1 overflow-x-hidden ">
                {isLoading ? (<><SebiLoader /></>) : (

                    <>
                        <div className="flex flex-col panel">
                            <div className='p-5'>
                                <div className='flex items-center justify-between mb-5'>
                                    <h5 className="font-semibold text-lg dark:text-white-light">Invoice Settings</h5>
                                    <div className=' flex gap-3' >
                                        {
                                            tab == 'manage-address' && <button type="button" onClick={() => { setTab('invoice') }} className="btn btn-primary shadow" disabled={btnLoading}>
                                                Back
                                            </button>
                                        }

                                        {
                                            tab == 'invoice' && <button type="button" onClick={() => { formSubmit() }} className="btn btn-primary shadow" disabled={btnLoading}>
                                                {btnLoading ? 'Please Wait...' : params.id ? 'Update' : 'Add'}
                                            </button>
                                        }


                                        <button type="button"
                                            className="btn btn-info shadow"
                                            disabled={btnLoading}
                                            onClick={() => { setTab('manage-address') }}
                                        >Manage Addresses</button>

                                        <button onClick={() => { fetchSettings() }} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                            <IoMdRefresh className="w-5 h-5" />
                                        </button>

                                    </div>
                                </div>

                                <hr className="my-4 dark:border-[#191e3a]" />
                                {
                                    tab == 'invoice' ?
                                        <div className='mb-5 space-y-5'>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="flex justify-between"><span>Invoice Template</span> {params.invoice_template ? <span onClick={() => setModal(true)}><FaEye size={20} /></span> : null} </label>
                                                    <select className='form-select' name='invoice_template' onChange={(e) => changeValue(e)} value={params.invoice_template ? params.invoice_template : ''}>
                                                        <option>Select Invoice Template</option>
                                                        <option value='single-product-invoice'>Single Product Invoice</option>
                                                        <option value='table-product-invoice'>Table Product Invoice</option>
                                                        <option value='invoice-three'>Invoice 3</option>
                                                    </select>
                                                    {errors?.invoice_template ? <div className="text-danger mt-1">{errors.invoice_template}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >Invoice Start From <b className=' text-red-600 text-[15px]' >*</b></label>
                                                    <input type="text" placeholder="Enter Invoice Start From" className="form-input"
                                                        name='invoice_start_from'
                                                        value={params?.invoice_start_from}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.invoice_start_from ? <div className="text-danger mt-1">{errors.invoice_start_from}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >Invoice Prefix <b className=' text-red-600 text-[15px]' >*</b></label>
                                                    <input type="text" placeholder="Enter  Invoice Prefix" className="form-input"
                                                        name='invoice_prefix'
                                                        value={params.invoice_prefix}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.invoice_prefix ? <div className="text-danger mt-1">{errors.invoice_prefix}</div> : ''}
                                                </div>

                                                <div>
                                                    <label>Invoice Type</label>
                                                    <select className='form-select' name='invoice_type' onChange={(e) => changeValue(e)} value={params.invoice_type ? params.invoice_type : ''}>
                                                        <option  >Select Invoice Type</option>
                                                        <option value='Manual Invoice' >Manual Invoice</option>
                                                        <option value='Auto Invoice'>Auto Invoice</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label >Email<b className=' text-red-600 text-[15px]' >*</b></label>
                                                    <input type="email" placeholder="Enter Email" className="form-input"
                                                        name='email'
                                                        value={params.email}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.email ? <div className="text-danger mt-1">{errors.email}</div> : ''}
                                                </div>

                                                <div>
                                                    <label >Phone<b className=' text-red-600 text-[15px]' >*</b></label>
                                                    <input type="tel" placeholder="Enter phone numbers" className="form-input"
                                                        name='phone'
                                                        value={params.phone}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.phone ? <div className="text-danger mt-1">{errors.phone}</div> : ''}
                                                </div>

                                                <div>
                                                    <label >GST Number<b className=' text-red-600 text-[15px]' >*</b></label>
                                                    <input type="text" placeholder="Enter GST number" className="form-input"
                                                        name='gst_no'
                                                        value={params.gst_no}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.gst_no ? <div className="text-danger mt-1">{errors.gst_no}</div> : ''}
                                                </div>


                                            </div>

                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                                <div>
                                                    <label >Company Name<b className=' text-red-600 text-[15px]' >*</b></label>
                                                    <input type="text" placeholder="Enter company name" className="form-input"
                                                        name='company_name'
                                                        value={params.company_name}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.company_name ? <div className="text-danger mt-1">{errors.company_name}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >SEBI Number</label>
                                                    <input type="text" placeholder="Enter sebi number" className="form-input"
                                                        name='sebi_no'
                                                        value={params.sebi_no}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.sebi_no ? <div className="text-danger mt-1">{errors.sebi_no}</div> : ''}
                                                </div>
                                            </div>

                                            <div>
                                                <label >Address<b className=' text-red-600 text-[15px]' >*</b></label>

                                                <textarea className="form-textarea"
                                                    placeholder="Enter Address"
                                                    name='address' onChange={(e) => changeValue(e)} value={params.address}>

                                                </textarea>

                                                {errors?.address ? <div className="text-danger mt-1">{errors.address}</div> : ''}
                                            </div>

                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>



                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-center'>
                                                    <div>
                                                        <label >Send Invoice</label>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="w-12 h-6 relative">
                                                                <input type="checkbox" name='is_send_invoice' value={params.is_send_invoice ? params.is_send_invoice : ""} onChange={(e) => { changeValue(e) }} checked={params.is_send_invoice == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                                <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {params?.is_send_invoice ? (<div>
                                                        <label >Send Auto Invoice</label>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="w-12 h-6 relative">
                                                                <input type="checkbox" name='enabled_send_auto_invoice' value={params.enabled_send_auto_invoice ? params.enabled_send_auto_invoice : ""} onChange={(e) => { changeValue(e) }} checked={params.enabled_send_auto_invoice == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                                <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                            </label>
                                                        </div>
                                                    </div>) : null}


                                                </div>
                                            </div>

                                            {params?.is_send_invoice ? (<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                                <div>
                                                    <label >Send Invoice Via SMS</label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" name='send_invoice_via_sms' value={params.send_invoice_via_sms ? params.send_invoice_via_sms : ""} onChange={(e) => { changeValue(e) }} checked={params.send_invoice_via_sms == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label >Send Invoice Via Whatsapp</label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" name='send_invoice_via_whatsapp' value={params.send_invoice_via_whatsapp ? params.send_invoice_via_whatsapp : ""} onChange={(e) => { changeValue(e) }} checked={params.send_invoice_via_whatsapp == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label >Send Invoice Via Email</label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" name='send_invoice_via_email' value={params.send_invoice_via_email ? params.send_invoice_via_email : ""} onChange={(e) => { changeValue(e) }} checked={params.send_invoice_via_email == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>
                                            ) : null}

                                            {params?.enabled_send_auto_invoice ? (<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                                <div>
                                                    <label >Send Auto SMS Invoice</label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" name='enabled_send_sms_invoice' value={params.enabled_send_sms_invoice ? params.enabled_send_sms_invoice : ""} onChange={(e) => { changeValue(e) }} checked={params.enabled_send_sms_invoice == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                </div>



                                                <div>
                                                    <label >Send Auto Whatsapp Invoice</label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" name='enabled_send_whatsapp_invoice' value={params.enabled_send_whatsapp_invoice ? params.enabled_send_whatsapp_invoice : ""} onChange={(e) => { changeValue(e) }} checked={params.enabled_send_whatsapp_invoice == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label >Send Auto Email Invoice</label>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" name='enabled_send_email_invoice' value={params.enabled_send_email_invoice ? params.enabled_send_email_invoice : ""} onChange={(e) => { changeValue(e) }} checked={params.enabled_send_email_invoice == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>) : null}




                                        </div>
                                        :
                                        <div>
                                            <ManageAddress />
                                        </div>
                                }




                            </div>
                        </div>

                        <Preview params={params} modal={modal} setModal={setModal} />
                    </>
                )}
            </div>
        </div>
    );
};

export default InvoiceSetting;
