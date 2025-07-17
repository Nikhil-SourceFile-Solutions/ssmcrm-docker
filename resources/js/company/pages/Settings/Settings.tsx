import React, { useState, useEffect, useRef } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch } from 'react-redux';
import { setPageTitle, setSettingToggleData } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import axios from 'axios';
import Select from 'react-select';
import IpConfigDrawer from './IpConfigDrawer';
import 'react-loading-skeleton/dist/skeleton.css'
import SettingsLoader from './Loaders/SettingsLoader';
import { useAuth } from '../../AuthContext';
import PerfectScrollbar from 'react-perfect-scrollbar';
import LeftTab from './LeftTab';
import { NavLink } from 'react-router-dom';
import { IoMdRefresh } from 'react-icons/io';
import Index from './Warnings/Index';
const Settings = () => {

    const { logout, crmToken, settingData, apiUrl, authUser } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle("Settings"))
        fetchSettings()
    }, [crmToken])

    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);
    const [data, setData] = useState<any>([]);

    const [warnings, setWarnings] = useState([]);
    const fetchSettings = async () => {
        console.log('Fetching General Setting Data')
        setIsLoading(true);
        setFetchingError(null)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/settings",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == 'success') {
                dispatch(setSettingToggleData(response.data.data.settings))
                setData(response.data.data)
                setWarnings(response.data.data.warnings)


            }
        } catch (error: any) {
            console.log(error)
            setFetchingError(error)
            if (error?.response?.status == 401) logout()

        } finally {
            setIsLoading(false);
        }
    }


    const fileLogoRef = useRef<HTMLInputElement>(null);
    const fileIconRef = useRef<HTMLInputElement>(null);
    const [logoPriview, setLogoPriview] = useState<any>('/assets/images/logo.png');
    const [iconPriview, setIconPriview] = useState<any>('/assets/images/icon.png');

    const [defaultParams] = useState({
        id: "",
        admin_email: "",
        account_email: "",
        compliance_email: "",
        crm_name: "",
        crm_title: "",
        crm_link: "",
        crm_news: "",
        crm_website_details: '',
        crm_phones: [],
        broadcast_permission: [],
        logo: '',
        favicon: '',
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
        security_numbers: '',
    });


    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    useEffect(() => {
        if (data.settings && Object.values(data.settings).length) {

            const s = data.settings;
            setParams({
                id: 1,
                admin_email: s.admin_email ? s.admin_email : '',
                account_email: s.account_email ? s.account_email : '',
                compliance_email: s.compliance_email ? s.compliance_email : '',
                crm_name: s.crm_name ? s.crm_name : '',
                crm_title: s.crm_title ? s.crm_title : '',
                crm_link: s.crm_link ? s.crm_link : '',
                crm_news: s.crm_news ? s.crm_news : '',
                crm_website_details: s.crm_website_details ? s.crm_website_details : '',
                crm_phones: s.crm_phones ? JSON.parse(s.crm_phones) : [],
                broadcast_permission: s.broadcast_permission ? JSON.parse(s.broadcast_permission) : [],
                logo: '',
                favicon: '',
                auto_expiry_enabled: s.auto_expiry_enabled,
                lead_automation_enabled: s.lead_automation_enabled,
                invoice_enabled: s.invoice_enabled,
                has_manager_verification: s.has_manager_verification,
                has_complaince_verification: s.has_complaince_verification,
                has_accounts_verification: s.has_accounts_verification,
                payment_permission: s.payment_permission,
                transfer_permission: s.transfer_permission,
                refer_permission: s.refer_permission,
                security_numbers: s.security_numbers ? s.security_numbers : '',
            });

            if (s.logo) setLogoPriview(apiUrl + '/storage/' + s.logo)
            if (s.favicon) setIconPriview(apiUrl + '/storage/' + s.favicon)
        }
    }, [data])

    const changeValue = (e: any) => {
        const { value, name, type, checked } = e.target;
        setErros({ ...errors, [name]: "" });
        if (type == "checkbox") setParams({ ...params, [name]: checked ? 1 : 0 });
        else setParams({ ...params, [name]: value });
        console.log(params)
    };

    const setImage = (e: any) => {
        const { name } = e.target;
        setErros({ ...errors, [name]: "" });
        if (e.target.files[0]) {
            if (
                e.target.files[0].type &&
                e.target.files[0].type.indexOf("image") === -1
            ) {
                setErros({ ...errors, [name]: "file is not a valid image" });
                return;
            }
            const maxSizeInBytes = 2 * 1024 * 1024;
            if (e.target.files[0].size > maxSizeInBytes) {
                setErros({ ...errors, [name]: "maximum file size is 2 mb" });
                return;
            }
            const reader = new FileReader();
            reader.onload = function (event: any) {
                if (name == "favicon") setIconPriview(reader.result);
                else setLogoPriview(reader.result);

                setParams({ ...params, [name]: e.target.files[0] });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const formattedPhones = (phones: any) => {
        if (phones && phones.length) return phones.map((phone: any) => ({
            value: phone,
            label: phone
        }))
        else return []
    };

    const formattedBroadcastPermission = (broadcasts: any) => {
        if (broadcasts && broadcasts.length) return broadcasts.map((broadcast: any) => ({
            value: broadcast,
            label: broadcast
        }))
        else return []
    };


    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.crm_name) {
            errors = { ...errors, crm_name: " CRM Name is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const UpdateSettingsApi = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/settings",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                dispatch(setSettingToggleData(response.data.settings))
                showMessage(response.data.message)
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
    const [btnLoading, setBtnLoading] = useState(false);
    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("admin_email", params.admin_email);
        data.append("account_email", params.account_email);
        data.append("compliance_email", params.compliance_email);
        data.append("crm_name", params.crm_name);
        data.append("crm_title", params.crm_title);
        data.append("crm_link", params.crm_link);
        data.append("crm_news", params.crm_news);
        data.append("crm_website_details", params.crm_website_details);
        data.append("crm_phones", params.crm_phones.length ? JSON.stringify(params.crm_phones) : JSON.stringify([]));
        data.append("broadcast_permission", params.broadcast_permission.length ? JSON.stringify(params.broadcast_permission) : JSON.stringify([]));
        data.append("logo", params.logo);
        data.append("favicon", params.favicon);
        data.append("auto_expiry_enabled", params.auto_expiry_enabled);
        data.append("lead_automation_enabled", params.lead_automation_enabled);
        data.append("set_companytype", params.set_companytype);
        data.append("invoice_enabled", params.invoice_enabled);
        data.append("has_manager_verification", params.has_manager_verification);
        data.append("has_complaince_verification", params.has_complaince_verification);
        data.append("has_accounts_verification", params.has_accounts_verification);
        data.append("payment_permission", params.payment_permission);
        data.append("transfer_permission", params.transfer_permission);
        data.append("refer_permission", params.refer_permission);
        data.append("security_numbers", params.security_numbers);


        UpdateSettingsApi(data);
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

    const [showIpConfigDrawer, setShowIpConfigDrawer] = useState(false);





    return (
        <>

            <div className="flex gap-5 relative  h-full">
                <div className={`panel w-[280px]`}>
                    <div className="flex flex-col h-full pb-2">
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <LeftTab />
                        </PerfectScrollbar>
                    </div>
                </div>

                <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                    {isLoading ? (<><SettingsLoader /></>) :
                        fetchingError ? (<Error error={fetchingError} fetchSettings={fetchSettings} />) :
                            (
                                <div className="flex flex-col h-full">
                                    <div className='panel'>
                                        <div className='flex items-center justify-between mb-5'>
                                            <h5 className="font-semibold text-lg dark:text-white-light">General Settings</h5>
                                            <div className=' flex gap-3' >
                                                <button type="button" onClick={() => { setShowIpConfigDrawer(true) }} className="btn btn-info shadow" disabled={btnLoading}>
                                                    IP Config
                                                </button>
                                                <button type="button" onClick={() => { formSubmit() }} className="btn btn-primary shadow" disabled={btnLoading}>
                                                    {btnLoading ? 'Please Wait...' : params.id ? 'Update' : 'Add'}
                                                </button>

                                                <button onClick={() => { fetchSettings() }} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                    <IoMdRefresh className="w-5 h-5" />
                                                </button>

                                            </div>
                                        </div>
                                        <hr className="my-4 dark:border-[#191e3a]" />

                                        {warnings.length ? <Index warnings={warnings} /> : null}

                                        <div className='mb-5 space-y-5'>
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label >Admin Email {warnings.title}</label>
                                                    <input type="text" placeholder="Enter Admin Email" className="form-input"
                                                        name='admin_email'
                                                        value={params.admin_email}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.admin_email ? <div className="text-danger mt-1">{errors.admin_email}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >Account Email</label>
                                                    <input type="text" placeholder="Enter Account Email" className="form-input"
                                                        name='account_email'
                                                        value={params.account_email}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.account_email ? <div className="text-danger mt-1">{errors.account_email}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >Compliance Email</label>
                                                    <input type="text" placeholder="Enter Compliance Email" className="form-input"
                                                        name='compliance_email'
                                                        value={params.compliance_email}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.compliance_email ? <div className="text-danger mt-1">{errors.compliance_email}</div> : ''}
                                                </div>
                                            </div>



                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label >CRM Name <span className=' text-red-600 text-md' >*</span> </label>
                                                    <input type="text" placeholder="Enter CRM Name" className="form-input"
                                                        name='crm_name'
                                                        value={params.crm_name}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.crm_name ? <div className="text-danger mt-1">{errors.crm_name}</div> : ''}
                                                </div>

                                                <div>
                                                    <label >CRM Title</label>
                                                    <input type="text" placeholder="Enter CRM Title" className="form-input"
                                                        name='crm_title'
                                                        value={params.crm_title}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.crm_title ? <div className="text-danger mt-1">{errors.crm_title}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >Crm Link</label>
                                                    <input type="text" placeholder="Enter CRM IP Address" className="form-input"
                                                        name='crm_link'
                                                        value={params.crm_link}
                                                        onChange={(e) => changeValue(e)}
                                                    />

                                                    {errors?.crm_link ? <div className="text-danger mt-1">{errors.crm_link}</div> : ''}
                                                </div>

                                            </div>
                                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5' >

                                                <div>
                                                    <label >CRM News</label>
                                                    <textarea name="crm_news" onChange={(e) => changeValue(e)} value={params.crm_news} className="form-textarea"></textarea>
                                                    {errors?.crm_news ? <div className="text-danger mt-1">{errors.crm_news}</div> : ''}
                                                </div>
                                                <div>
                                                    <label >CRM Website Details</label>
                                                    <textarea name="crm_website_details" onChange={(e) => changeValue(e)} value={params.crm_website_details} className="form-textarea"></textarea>
                                                    {errors?.crm_website_details ? <div className="text-danger mt-1">{errors.crm_website_details}</div> : ''}
                                                </div>


                                            </div>

                                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5' >



                                                <div>
                                                    <label >Hide Phone</label>
                                                    <Select
                                                        name='crm_phones'
                                                        onChange={(e) => changeValue({ target: { name: 'crm_phones', value: e.map((a: any) => a.value) } })}
                                                        value={formattedPhones(params.crm_phones)}
                                                        options={data?.phone_hide_users?.map((l) => ({ label: l, value: l }))}
                                                        placeholder="Select User Type"
                                                        isMulti
                                                        className=" text-white-dark"
                                                        isSearchable={false} />
                                                    <div className="text-danger mt-1">{errors.crm_phones}</div>
                                                </div>
                                                <div>
                                                    <label >Broadcast Permission</label>
                                                    <Select
                                                        name='broadcast_permission'
                                                        onChange={(e) => changeValue({ target: { name: 'broadcast_permission', value: e.map((a: any) => a.value) } })}
                                                        value={formattedBroadcastPermission(params.broadcast_permission)}
                                                        options={data?.broadcast_users_permission?.map((l) => ({ label: l, value: l }))}
                                                        placeholder="Select User Type"
                                                        isMulti
                                                        className=" text-white-dark"
                                                        isSearchable={false} />
                                                    <div className="text-danger mt-1">{errors.broadcast_permission}</div>
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5' >
                                                <div>
                                                    <label >Security Numbers</label>


                                                    <input type="text" placeholder="Enter security numbers separated by comma" className="form-input"
                                                        name='security_numbers'
                                                        value={params.security_numbers}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    <div className="text-danger mt-1">{errors.security_numbers}</div>
                                                </div>


                                            </div>







                                            <hr />
                                            <div className='p-2' >
                                                <h1 className='text-lg font-bold py-2 pb-5' >Logo / Icon</h1>
                                                <div className='grid grid-cols-1 lg:grid-cols-3 gap-5' >
                                                    <div className="mb-5">
                                                        <label >Logo</label>
                                                        <input ref={fileLogoRef} name="logo" type="file" onChange={(e) => setImage(e)} className="form-input hidden" accept="image/*" />
                                                        <span className="w-full h-20 relative">
                                                            <img className="w-[200px] overflow-hidden object-cover rounded" id="logo" onClick={() => {
                                                                fileLogoRef.current!.click()
                                                            }} src={logoPriview} alt="logo" />
                                                        </span>
                                                        {errors?.logo ? <div className="text-danger mt-1">{errors.logo}</div> : ''}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label >Fav Icon</label>
                                                        <input ref={fileIconRef} name="favicon" type="file" onChange={(e) => setImage(e)} className="form-input hidden" accept="image/*" />
                                                        <span className=" relative">
                                                            <img className="w-[75px] h-[75px] overflow-hidden object-cover rounded" id="favicon" onClick={() => {
                                                                fileIconRef.current!.click()
                                                            }} src={iconPriview} alt="favicon" />
                                                        </span>
                                                        {errors?.favicon ? <div className="text-danger mt-1">{errors.favicon}</div> : ''}
                                                    </div>
                                                    <div>
                                                        <label >Enable Auto Expiry</label>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="w-12 h-6 relative">
                                                                <input type="checkbox" name='auto_expiry_enabled' value={params.auto_expiry_enabled} onChange={(e) => { changeValue(e) }} checked={params.auto_expiry_enabled == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" />
                                                                <span className={`
                                                     outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            )}
                    <IpConfigDrawer settingData={settingData} setShowIpConfigDrawer={setShowIpConfigDrawer} showIpConfigDrawer={showIpConfigDrawer} />

                </div>
            </div>
        </>
    );
};

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

export default Settings;
