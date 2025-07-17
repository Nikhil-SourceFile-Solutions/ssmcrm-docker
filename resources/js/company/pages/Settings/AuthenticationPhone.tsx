import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';

import axios from 'axios';
import Swal from 'sweetalert2';
import 'react-loading-skeleton/dist/skeleton.css'

import { useAuth } from '../../AuthContext';
import PerfectScrollbar from 'react-perfect-scrollbar';
import LeftTab from './LeftTab';
import { NavLink } from 'react-router-dom';
import PageLoader from '../../components/Layouts/PageLoader';
import AuthenticationPhoneValidation from './AuthenticationPhoneValidation';
const AuthenticationPhone = () => {

    const { logout, crmToken, settingData, apiUrl, authUser } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle("Settings"))
        fetchSettings()
    }, [crmToken])

    const [isLoading, setIsLoading] = useState(true);
    const [fetchingError, setFetchingError] = useState(null);

    const [defaultParams] = useState({
        id: '',
        sms_phone: '',
        whatsapp_phone: '',
        old_phone: '',
        isChecked: '',
        otp: '',
        isOtpSent: ''
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});


    const fetchSettings = async () => {
        console.log('Fetching General Setting Data')
        setIsLoading(true);
        setFetchingError(null)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/authentication-phones",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == 'success') {

                if (response.data.phones) {
                    setParams({
                        id: response.data.phones.id,
                        sms_phone: response.data.phones.sms_phone,
                        old_phone: response.data.phones.sms_phone,
                        whatsapp_phone: response.data.phones.whatsapp_phone,
                        isChecked: response.data.phones ? 0 : 1,
                        otp: '',
                        isOtpSent: ''
                    });
                } else setParams(defaultParams);

            }
        } catch (error: any) {
            console.log(error)
            setFetchingError(error)
            if (error?.response?.status == 401) logout()

        } finally {
            setIsLoading(false);
        }
    }

    const validate = () => {
        setErros({});
        let errors = {};
        // if (!params.sms_phone && !params.whatsapp_phone) {
        if (!params.sms_phone) {
            errors = { ...errors, apple: "At least one phone number is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const AddLeadautomation = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/authentication-phones",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {

                setParams({
                    id: response.data.phones.id,
                    sms_phone: response.data.phones.sms_phone,
                    old_phone: response.data.phones.sms_phone,
                    whatsapp_phone: response.data.phones.whatsapp_phone,
                    isChecked: response.data.phones ? 0 : 1,
                    otp: '',
                    isOtpSent: ''
                });

                Swal.fire({
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-green"
                    }
                });


            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
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
            setBtnLoading(false)
        }
    };


    const [modal, setModal] = useState(false);

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("sms_phone", params.sms_phone);
        // data.append("whatsapp_phone", params.whatsapp_phone);

        if (!params.old_phone || params.isChecked || params.sms_phone == params.old_phone) {
            AddLeadautomation(data);
        } else {
            setParams({ ...params, isChecked: false })
            setModal(true)
        }

    };



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
                    {isLoading ? (<><PageLoader /></>) :
                        fetchingError ? (<Error error={fetchingError} fetchSettings={fetchSettings} />) :
                            (
                                <div className="flex flex-col h-full">
                                    <div className='panel'>
                                        <div className='flex justify-between items-center'>
                                            <h1 className='text-[18px] font-bold'>Authentication Phone</h1>

                                            {/* <button className='btn btn-primary'>Update</button> */}
                                        </div>

                                        <hr className='my-4 dark:border-[#191e3a]' />


                                        <form className='max-w-[600px] m-auto bg-[#009688]/[.26] panel'>
                                            <div className="grid grid-cols-1 sm:flex justify-between gap-5">
                                                <div>
                                                    <label htmlFor="ctnEmail">SMS Number</label>
                                                    <input type="tel" placeholder="Enter SMS Number" className="form-input"
                                                        name='sms_phone'
                                                        value={params.sms_phone}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.sms_phone ? <div className="text-danger mt-1">{errors.sms_phone}</div> : ''}
                                                </div>
                                                {/* <div>
                                                    <label htmlFor="ctnEmail">WhatsApp Number</label>
                                                    <input type="tel" placeholder="Enter WhatsApp Number" className="form-input"
                                                        name='sms_phone'
                                                        value={params.sms_phone}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {errors?.sms_phone ? <div className="text-danger mt-1">{errors.sms_phone}</div> : ''}
                                                </div> */}

                                                <div>
                                                    <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn btn-primary mt-6 ">
                                                        {btnLoading ? 'Please wait' : params.id ? 'Update Phones' : 'Add Phones'}
                                                    </button>
                                                </div>
                                            </div>
                                            {errors?.apple ? <div className="text-danger text-center  mt-1">{errors.apple}</div> : ''}


                                        </form>
                                    </div>
                                </div>
                            )}

                </div>
            </div>

            <AuthenticationPhoneValidation modal={modal} setModal={setModal} params={params} setParams={setParams} formSubmit={formSubmit} />
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

export default AuthenticationPhone;
