import { Dialog, Transition } from '@headlessui/react';
import React, { useState, Fragment, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { MdPhoneCallback } from "react-icons/md";
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { useDispatch } from 'react-redux';
import { setCallBacktData } from '../../store/themeConfigSlice';
import Swal from 'sweetalert2';
export default function Callback({ callbackModal, setCallbackModal, callbackData }: any) {

    const { logout, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();


    const [closing, setClosing] = useState(false);






    const [defaultParams] = useState({
        date_time: '',
        description: '',
        lead_id: callbackData?.lead_id
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.date_time) {
            errors = { ...errors, date_time: "Date Time is required" };
        }

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });

        console.log(params)
    };

    const createCallback = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/callbacks",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                dispatch(setCallBacktData(response.data.allCallbacks))
                Swal.fire({
                    icon: response.data.status,
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                });
                setCallbackModal(false)
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
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

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("date_time", params.date_time);
        data.append("description", params.description);
        data.append("lead_id", callbackData?.lead_id);
        createCallback(data);
    };

    const closeCallBackAlert = async () => {
        setClosing(true)

        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lead-callbacks-close/" + callbackData.id,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {

                dispatch(setCallBacktData(response.data.allCallbacks))

                setCallbackModal(false)
            } else if (response.data.status == "error") {
                Swal.fire({
                    icon: response.data.status,
                    title: response.data.title,
                    text: response.data.message,
                    padding: '2em',
                    customClass: 'sweet-alerts',
                });
            }
        } catch (error) {
            if (error?.response?.status == 401) logout()
        } finally {
            setClosing(false)
        }
    }

    const [today, setToday] = useState('');
    useEffect(() => {
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        setToday(formattedDate);
    }, []);

    return (
        <div>
            <div>

                <Transition appear show={callbackModal} as={Fragment}>
                    <Dialog as="div" open={callbackModal} onClose={() => setCallbackModal(true)}>
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
                        <div id="standard_modal" className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
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
                                    <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                        <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                            <div className="font-bold text-lg">Callback</div>
                                            <div className="font-bold text-sm">Created: {callbackData?.created_at}</div>
                                        </div>
                                        <div className="p-5 bg-secondary-light">
                                            <div className='flex justify-between items-center'>
                                                <div className="flex items-center">
                                                    <div className="flex-none">
                                                        <span className="flex animate-ping me-4 justify-center items-center w-10 h-10 text-center rounded-full object-cover bg-success text-2xl">
                                                            <MdPhoneCallback size={20} color='#fff' />
                                                        </span>

                                                    </div>
                                                    <div className="mx-3">
                                                        <p className="mb-1 font-semibold">{callbackData?.first_name}  {callbackData?.last_name}</p>
                                                        <p className="text-xs text-white-dark">{callbackData?.phone}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="badge bg-secondary">{callbackData?.status}</span>
                                                </div>
                                            </div>

                                            <div className='m-4 text-[12px]'>
                                                {callbackData?.description}
                                            </div>


                                            <div className='m-2 px-4 py-2 bg-black/10 rounded'>
                                                <b className='mb-2 text-[12px]'>Reset Callback</b>
                                                <div >
                                                    <input className='form-input'
                                                        name='date_time'
                                                        value={params.date_time}
                                                        onChange={(e) => changeValue(e)}
                                                        type="datetime-local"
                                                        min={today}
                                                    />
                                                    <div className="text-danger mt-1 text-[12px] font-bold">{errors.date_time}</div>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-4 items-center max-w-[800px] mt-4">
                                                    <textarea className='form-textarea'
                                                        name='description'
                                                        value={params.description}
                                                        onChange={(e) => changeValue(e)}
                                                    ></textarea>
                                                    <button
                                                        disabled={closing || btnLoading}
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => formSubmit()}>
                                                        {btnLoading ? 'Wait...' : 'Submit'}
                                                    </button>

                                                </div>
                                                <div className="text-danger mt-1 text-[12px] font-bold">{errors.description}</div>
                                            </div>

                                            <div className="flex justify-end items-center mt-8">
                                                <button disabled={closing || btnLoading} onClick={() => { closeCallBackAlert() }} type="button" className="btn btn-sm btn-danger ltr:ml-4 rtl:mr-4">
                                                    {closing ? 'Closing....' : 'Ok Close Callback Alert'}
                                                </button>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    )
}
