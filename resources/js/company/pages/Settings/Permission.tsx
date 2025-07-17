import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import LeftTab from './LeftTab';
import PageLoader from '../../components/Layouts/PageLoader';
import { IoMdRefresh } from 'react-icons/io';
import Select from 'react-select';
import { useToast } from '../../ToastContext ';
import { setSettingToggleData } from '../../store/themeConfigSlice';
import { RiErrorWarningFill } from "react-icons/ri";
export default function Permission() {
    const dispatch = useDispatch();
    const { addToast } = useToast();
    const { crmToken, apiUrl, settingData } = useAuth()

    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);

    const userTypes = ['Admin', 'Accounts', 'Branch Admin', 'Manager', 'Floor Manager', 'HR', 'Complaince', 'BDE', 'Team Leader'];

    const [defaultParams] = useState({
        auto_expiry_enabled: 0,
        lead_automation_enabled: 0,
        invoice_enabled: 0,
        has_manager_verification: 0,
        has_complaince_verification: 0,
        has_accounts_verification: 0,
        payment_permission: 0,
        transfer_permission: 0,
        refer_permission: 0,
        website_permission: 0,
        marketing_permission: 0,
        broadcast_permission: [],
        sales_verification_enabled: 0,
        who_can_verify_sales: [],
        who_can_verify_complaince_verification: [],
        who_can_approve_expire_pause_sales: [],
        allowed_to_send_links: []
    });
    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [permissions, setPermissions] = useState<any>([]);

    useEffect(() => {
        if (permissions && Object.values(permissions).length) {
            const s = permissions;
            setParams({
                broadcast_permission: s.broadcast_permission ? JSON.parse(s.broadcast_permission) : [],
                sales_verification_enabled: s.sales_verification_enabled,
                who_can_verify_sales: s.who_can_verify_sales ? JSON.parse(s.who_can_verify_sales) : [],
                who_can_verify_complaince_verification: s.who_can_verify_complaince_verification ? JSON.parse(s.who_can_verify_complaince_verification) : [],
                who_can_approve_expire_pause_sales: s.who_can_approve_expire_pause_sales ? JSON.parse(s.who_can_approve_expire_pause_sales) : [],
                allowed_to_send_links: s.allowed_to_send_links ? JSON.parse(s.allowed_to_send_links) : [],
                auto_expiry_enabled: s.auto_expiry_enabled,
                whatsapp_enabled: s.whatsapp_enabled,
                sms_enabled: s.sms_enabled,
                email_enabled: s.email_enabled,
                lead_automation_enabled: s.lead_automation_enabled,
                invoice_enabled: s.invoice_enabled,
                has_manager_verification: s.has_manager_verification,
                has_complaince_verification: s.has_complaince_verification,
                has_accounts_verification: s.has_accounts_verification,
                payment_permission: s.payment_permission,
                transfer_permission: s.transfer_permission,
                refer_permission: s.refer_permission,
                website_permission: s.website_permission,
                marketing_permission: s.marketing_permission,
                security_numbers: s.security_numbers ? s.security_numbers : '',
            });
        }
    }, [permissions])


    const [alerts, setAlerts] = useState([]);
    const fetchPermissions = async () => {
        setIsLoading(true)
        setAlerts([]);
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/permissions-and-verifications",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {

                setPermissions(response.data.data)
                setAlerts(response.data.alerts)
            }

        } catch (error) {

            console.log(error)
            setAlerts([]);
        } finally {
            setIsLoading(false)
        }


    }

    useEffect(() => {
        fetchPermissions();
    }, [])

    const formattedSelected = (data: any) => {
        if (data && data.length) return data.map((value: any) => ({
            value: value,
            label: value
        }))
        else return []
    };


    const changeValue = (e: any) => {
        const { value, name, type, checked } = e.target;
        setErros({ ...errors, [name]: "" });
        if (type == "checkbox") setParams({ ...params, [name]: checked ? 1 : 0 });
        else setParams({ ...params, [name]: value });
        console.log(params)
    };

    const validate = () => {
        setErros({});
        let errors = {};


        console.log(errors)
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("auto_expiry_enabled", params.auto_expiry_enabled);
        data.append("lead_automation_enabled", params.lead_automation_enabled);
        data.append("invoice_enabled", params.invoice_enabled);
        data.append("has_manager_verification", params.has_manager_verification);
        data.append("has_complaince_verification", params.has_complaince_verification);
        data.append("has_accounts_verification", params.has_accounts_verification);
        data.append("payment_permission", params.payment_permission);
        data.append("transfer_permission", params.transfer_permission);
        data.append("refer_permission", params.refer_permission);
        data.append("sales_verification_enabled", params.sales_verification_enabled);
        data.append("broadcast_permission", params.broadcast_permission.length ? JSON.stringify(params.broadcast_permission) : JSON.stringify([]));
        data.append("who_can_verify_sales", params.who_can_verify_sales.length ? JSON.stringify(params.who_can_verify_sales) : JSON.stringify([]));
        data.append("who_can_verify_complaince_verification", params.who_can_verify_complaince_verification.length ? JSON.stringify(params.who_can_verify_complaince_verification) : JSON.stringify([]));
        data.append("who_can_approve_expire_pause_sales", params.who_can_approve_expire_pause_sales.length ? JSON.stringify(params.who_can_approve_expire_pause_sales) : JSON.stringify([]));
        data.append("allowed_to_send_links", params.allowed_to_send_links.length ? JSON.stringify(params.allowed_to_send_links) : JSON.stringify([]));

        updatePermissionApi(data);
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const updatePermissionApi = async (data) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/permissions-and-verifications",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            console.log(response)
            if (response.data.status == 'success') {
                dispatch(setSettingToggleData(response.data.settings))
                addToast({
                    variant: 'success',
                    title: response.data.message,
                });
                setAlerts(response.data.alerts)
            } else {

                addToast({
                    variant: 'error',
                    title: response.data.message,
                });
            }

        } catch (error) {
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);

                addToast({
                    variant: 'error',
                    title: error.response.data.message,
                });
            }
        } finally {
            setIsBtnLoading(false)
        }

    }

    return (
        <div className="flex gap-5 relative  h-full">
            <div className={`panel w-[280px]`}>
                <div className="flex flex-col h-full pb-2">
                    <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                        <LeftTab />
                    </PerfectScrollbar>
                </div>
            </div>

            <div className="panel p-0 flex-1 overflow-x-hidden h-full">

                {isLoading ? (<><PageLoader /></>) :
                    fetchingError ? (<Error error={fetchingError} fetchSettings={fetchPermissions} />) :
                        (
                            <div className="flex flex-col h-full">
                                <div className='panel'>
                                    <div className='flex items-center justify-between mb-5'>
                                        <h5 className="font-semibold text-lg dark:text-white-light">Permissions & Verifications</h5>
                                        <div className='flex gap-3' >



                                            <div className='flex gap-4 items-center'>
                                                <button type="button" onClick={() => { formSubmit() }} className="btn btn-primary shadow" disabled={isBtnLoading}>
                                                    {isBtnLoading ? 'Please Wait...' : 'Update'}
                                                </button>

                                                <button onClick={() => { fetchPermissions() }} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                    <IoMdRefresh className="w-5 h-5" />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                    <hr className="my-4 dark:border-[#191e3a]" />


                                    <div className='p-2'>


                                        <div>
                                            {alerts?.map((alert) => (


                                                <div className="flex items-center dark:bg-[#1b2e4b]  bg-black  rounded-lg">
                                                    <div className="w-[50px] flex items-center justify-center p-2">
                                                        <RiErrorWarningFill size={30} color='white' />
                                                    </div>
                                                    <div className="flex-1  p-3 text-white rounded-md">
                                                        <h5 className='text-[16px] font-bold mb-2'>{alert.title}</h5>
                                                        <p>{alert?.message}</p>
                                                        {/* {JSON.stringify(alert)} */}
                                                        <div className='float-right'>
                                                            {alert.action == "link" ? (
                                                                <NavLink className="btn btn-sm shadow btn-dark" to={alert.link}>{alert.linkText}</NavLink>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>

                                            ))}
                                        </div>

                                        <h1 className='text-lg font-bold py-2 pb-5' >Permissions</h1>



                                        <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>

                                            <div>
                                                <label >Invoice</label>
                                                <div className="flex flex-col gap-2">
                                                    <label className="w-12 h-6 relative">
                                                        <input type="checkbox" name='invoice_enabled' onChange={(e) => { changeValue(e) }} value={params.invoice_enabled ? params.invoice_enabled : ''} checked={params.invoice_enabled == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                        <span className={`
outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                    </label>
                                                </div>
                                            </div>


                                            <div>
                                                <label >Payment</label>
                                                <div className="flex flex-col gap-2">
                                                    <label className="w-12 h-6 relative">
                                                        <input type="checkbox" name='payment_permission' onChange={(e) => { changeValue(e) }} value={params.payment_permission ? params.payment_permission : ''} checked={params.payment_permission == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                        <span className={`
 outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label >Transfer</label>
                                                <div className="flex flex-col gap-2">
                                                    <label className="w-12 h-6 relative">
                                                        <input type="checkbox" name='transfer_permission' onChange={(e) => { changeValue(e) }} value={params.transfer_permission ? params.transfer_permission : ''} checked={params.transfer_permission == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                        <span className={`
 outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label >Refer</label>
                                                <div className="flex flex-col gap-2">
                                                    <label className="w-12 h-6 relative">
                                                        <input type="checkbox" name='refer_permission' onChange={(e) => { changeValue(e) }} value={params.refer_permission ? params.refer_permission : ''} checked={params.refer_permission == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                        <span className={`
 outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>






                                    </div>








                                    <div className='p-2 ' >

                                        <h1 className='text-lg font-bold pb-5'>Sales Approvel</h1>


                                        <div className='pb-5'>
                                            <label>Who Can Approve, Expire and Pause Sales (Updating Sales Status)</label>
                                            <Select
                                                name='who_can_approve_expire_pause_sales'
                                                onChange={(e) => changeValue({ target: { name: 'who_can_approve_expire_pause_sales', value: e.map((a: any) => a.value) } })}
                                                value={formattedSelected(params.who_can_approve_expire_pause_sales)}
                                                options={userTypes?.map((l) => ({ label: l, value: l }))}
                                                placeholder="Select User Type"
                                                isMulti
                                                className=" text-white-dark"
                                                isSearchable={false} />
                                            <div className='mt-1'>
                                                {errors?.who_can_approve_expire_pause_sales ? <b className="text-danger">{errors.who_can_approve_expire_pause_sales}</b> : <b className='text-[#08735e]' >Services (App notifications, SMS, WhatsApp services) will work only if the sale status is <span className='badge bg-[#075E54]'>Approved</span></b>}
                                            </div>
                                        </div>





                                        <h1 className='text-lg font-bold pb-4  mt-5'>Sales Verifications</h1>

                                        <p className='font-bold text-[#2196F3]'>Sales verification is optional, not mandatory. If enabled, you can monitor each verification to see who verified it, at what time, and the description they provided during the verification</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-2">

                                            <div>
                                                <label>Sales Verification</label>
                                                <div className="flex flex-col gap-2">
                                                    <label className="w-12 h-6 relative">
                                                        <input type="checkbox" name='sales_verification_enabled' value={params.sales_verification_enabled ? params.sales_verification_enabled : ''} onChange={(e) => { changeValue(e) }} checked={params.sales_verification_enabled == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                        <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                    </label>
                                                </div>
                                            </div>

                                            {settingData?.company_type == 1 ? (<>
                                                {params.sales_verification_enabled ? (<>

                                                    <div>
                                                        <label >Manager Verification</label>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="w-12 h-6 relative">
                                                                <input type="checkbox" name='has_manager_verification' value={params.has_manager_verification ? params.has_manager_verification : ''} onChange={(e) => { changeValue(e) }} checked={params.has_manager_verification == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                                <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label >Complaince Verification</label>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="w-12 h-6 relative">
                                                                <input type="checkbox" name='has_complaince_verification' value={params.has_complaince_verification ? params.has_complaince_verification : ''} onChange={(e) => { changeValue(e) }} checked={params.has_complaince_verification == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                                <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label >Accounts Verification</label>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="w-12 h-6 relative">
                                                                <input type="checkbox" name='has_accounts_verification' value={params.has_accounts_verification ? params.has_accounts_verification : ''} onChange={(e) => { changeValue(e) }} checked={params.has_accounts_verification == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                                <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </>) : null}


                                            </>) : null}









                                        </div>

                                        {params.sales_verification_enabled ? (<>
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4'>

                                                <div >
                                                    <label>Who Can Verify Sales</label>
                                                    <Select
                                                        name='who_can_verify_sales'
                                                        onChange={(e) => changeValue({ target: { name: 'who_can_verify_sales', value: e.map((a: any) => a.value) } })}
                                                        value={formattedSelected(params.who_can_verify_sales)}
                                                        options={userTypes?.map((l) => ({ label: l, value: l }))}
                                                        placeholder="Select User Type"
                                                        isMulti
                                                        className=" text-white-dark"
                                                        isSearchable={false} />
                                                    {errors?.who_can_verify_sales ? <b className="text-danger mt-1">{errors.who_can_verify_sales}</b> : ''}
                                                </div>


                                                {params.has_complaince_verification ? (<div>
                                                    <label>Who Can Verify Complaince Verification</label>
                                                    <Select
                                                        name='who_can_verify_complaince_verification'
                                                        onChange={(e) => changeValue({ target: { name: 'who_can_verify_complaince_verification', value: e.map((a: any) => a.value) } })}
                                                        value={formattedSelected(params.who_can_verify_complaince_verification)}
                                                        options={userTypes?.map((l) => ({ label: l, value: l }))}
                                                        placeholder="Select User Type"
                                                        isMulti
                                                        className=" text-white-dark"
                                                        isSearchable={false} />
                                                    {errors?.who_can_verify_complaince_verification ? <b className="text-danger mt-1">{errors.who_can_verify_complaince_verification}</b> : ''}
                                                </div>) : null}
                                            </div>
                                        </>) : null}



                                    </div>
                                </div>
                            </div>

                        )}
            </div>
        </div>
    )
}




const Error = ({ error, fetchSettings }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetchSettings()}>Re Try</button>
            </div>
        </div>
    </>)
}
