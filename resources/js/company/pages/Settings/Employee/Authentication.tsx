import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import React, { useState, Fragment, useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { IoCloseCircleSharp } from 'react-icons/io5';
import PageLoader from '../../../components/Layouts/PageLoader';





function Authentication({ user, modal, setModal }) {

    const [isLoading, setIsLoading] = useState(true);
    const { crmToken, apiUrl } = useAuth()
    const [qrCode, setQrCode] = useState(null);
    const [lastLogin, setLastLogin] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [users, setUsers] = useState(null);

    const defaultParams = {
        id: '',
        is_2fa_enabled: 0,
        otp_expiry_time: 5,
    }

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const fetchAuthenticationQr = async () => {
        setIsLoading(true)
        setQrCode(null)
        setLastLogin(null)
        setRemainingSeconds(0)
        setTimeLeft(0)
        setUsers(null)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/users-mfa",
                params: {
                    id: user.id,
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });


            if (response.data.status == "success") {
                const user = response.data.user;
                setUsers(user)
                setQrCode(response.data.qrCode)
                setLastLogin(response.data.lastLogin)
                const remainingSeconds = Math.floor(response.data.remainingSeconds)
                setRemainingSeconds(remainingSeconds)
                setParams({ ...params, is_2fa_enabled: user.is_2fa_enabled })
            }
            console.log(response)

        } catch (error) {

            console.log(error)

        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (remainingSeconds <= 0) {
            setTimeLeft(0)
            return;
        }
        setTimeLeft(remainingSeconds)
        console.log("timeLeft", timeLeft, remainingSeconds)
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingSeconds]);

    useEffect(() => {
        if (modal) fetchAuthenticationQr()
    }, [modal, user])



    const changeValue = (e: any) => {
        const { value, name, checked } = e.target;
        setErros({ ...errors, [name]: "" });
        if (name == "is_2fa_enabled") setParams({ ...params, [name]: checked ? 1 : 0 });
        else setParams({ ...params, [name]: value });
    };


    const validate = () => {
        setErros({});
        let errors = {};
        if (params.is_2fa_enabled && !params.otp_expiry_time) {
            errors = {
                ...errors, otp_expiry_time: "duration is required"
            };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);
    const UpdateApi = async (data) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/users-mfa",
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setRemainingSeconds(Math.floor(response.data.remainingSeconds))
            }
            console.log(response)
        } catch (error) {
            console.log(error)
        } finally {
            setBtnLoading(false)
        }
    }
    const formSubmit = () => {

        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", user.id);
        data.append("is_2fa_enabled", params.is_2fa_enabled);
        data.append("otp_expiry_time", params.otp_expiry_time);
        UpdateApi(data);

    };

    return (
        <Transition appear show={modal} as={Fragment}>
            <Dialog as="div" open={modal} onClose={() => { }}>
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
                <div className="fixed inset-0 bg-[black]/60 z-[999]">
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[400px] my-8 text-black dark:text-white-dark">
                                <div className="flex bg-[#009688]/[.26] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <h5 className="font-bold text-lg">Two-Factor Authentication</h5>
                                    <button onClick={() => setModal(false)} type="button" disabled={btnLoading} className="text-white-dark hover:text-dark">
                                        <IoCloseCircleSharp size={25} />
                                    </button>
                                </div>

                                <div className='min-h-[400px]'>
                                    {isLoading ? <PageLoader /> : (<div className="p-5">

                                        {qrCode ? (
                                            <div>
                                                <img src={qrCode} alt="" className='m-auto border-4 border-[#000] p-1' />
                                            </div>
                                        ) : null}

                                        {lastLogin ? (<div className='mt-2'>
                                            <h6 className='font-bold'>Last Login Details</h6>
                                            <p><b><small className='min-w-[100px] inline-block'>Date Time</small> <small>{lastLogin.created_at}</small></b></p>
                                            <p><b><small className='min-w-[100px] inline-block'>Browser</small> <small>{lastLogin.browser}</small></b></p>
                                            <p><b><small className='min-w-[100px] inline-block'>Device Type</small> <small>{lastLogin.device_type}</small></b></p>
                                            <p><b><small className='min-w-[100px] inline-block'>IP Address</small> <small>{lastLogin.ip_address}</small></b></p>
                                            <p><b><small className='min-w-[100px] inline-block'>Platform</small> <small>{lastLogin.platform}</small></b></p>
                                        </div>) : null}
                                        <hr className='my-2' />

                                        {params.is_2fa_enabled ? (timeLeft ? (<div>
                                            <b className='text-[#009688]'>OTP Will Expiry in {timeLeft} seconds</b>
                                        </div>) : (<><b className='text-[#ff0303]'>No active OTP expiration time</b></>)) : null}

                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2 mt-2">
                                            {/* 2FA Enable Toggle */}

                                            <div className="flex flex-col">
                                                <label htmlFor="gridCity" className='text-[14px]'>2F Enable</label>
                                                <label className="w-12 h-6 relative">
                                                    <input
                                                        type="checkbox"
                                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                        id="custom_switch_checkbox1"
                                                        name='is_2fa_enabled'
                                                        checked={params.is_2fa_enabled}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                </label>
                                            </div>

                                            {/* Duration Input */}
                                            <div className="flex flex-col">
                                                <label htmlFor="gridZip" className='text-[14px]'>Duration</label>
                                                <input min={5} type="number"
                                                    name='otp_expiry_time'
                                                    placeholder="Duration"
                                                    onChange={(e) => changeValue(e)}
                                                    value={params.otp_expiry_time}
                                                    className="form-input" />
                                            </div>

                                            {/* Save Button - Aligned Right */}
                                            <div className="flex items-end justify-end">
                                                <button
                                                    onClick={() => formSubmit()}
                                                    type="button"
                                                    className="btn shadow btn-primary"
                                                    disabled={btnLoading}
                                                >
                                                    {btnLoading ? 'Wait...' : 'Update'}
                                                </button>
                                            </div>
                                        </div>


                                    </div>)}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Authentication