import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import IconX from '../../../../components/Icon/IconX';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../AuthContext';
import { setCallBacktData } from '../../../../store/themeConfigSlice';
export default function Callback({ callbackModal, setCallbackModal, lead_id }) {

    const { logout, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();

    const [callbacks, setCallbacks] = useState([]);


    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (callbackModal) fetchCallbacks()
    }, [callbackModal])


    const fetchCallbacks = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/lead-callbacks/" + lead_id,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setCallbacks(response.data.callbacks)
            }
        } catch (error) {
            if (error?.response?.status == 401) logout()

        } finally {
            setIsLoading(false);
        }
    }



    const [callbackDescription, setCallbackDescription] = useState('');
    const [callbackDate, setCallbackDate] = useState<any>('');

    const closeCallbacks = async (id: number) => {
        Swal.fire({
            icon: 'question',
            title: 'Are You Sure',
            confirmButtonText: 'Yes',
            text: 'Once closed, then never get alert',
            showLoaderOnConfirm: true,
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'get',
                        url: apiUrl + "/api/lead-callbacks-close/" + id,
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + crmToken,
                        },
                    });

                    if (response.data.status == "success") {


                        dispatch(setCallBacktData(response.data.allCallbacks))

                        const nc = response.data.callback;
                        const i = callbacks.findIndex((l: any) => l.id == id);
                        const uc = [...callbacks];
                        uc[i] = nc;
                        setCallbacks(uc);
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
                }
            },
        });
    }


    const createCallback = async () => {

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/callbacks",
                data: {
                    lead_id: lead_id,
                    description: callbackDescription,
                    date_time: callbackDate
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {

                dispatch(setCallBacktData(response.data.allCallbacks))
                setCallbacks(response.data.callBacks)

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
            }

        } catch (error) {
            console.log(error)
        } finally {

        }
    }


    const [today, setToday] = useState('');

    useEffect(() => {

        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 16);
        setToday(formattedDate);
    }, []);


    return (
        <div> <Transition appear show={callbackModal} as={Fragment}>
            <Dialog as="div" open={callbackModal} onClose={() => setCallbackModal(false)}>
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
                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="text-lg font-bold">Lead Call Back</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setCallbackModal(false)}>
                                        <IconX />
                                    </button>
                                </div>
                                {isLoading ? (<>
                                    <div className='h-[calc(50vh-80px)] text-center p-4'>
                                        <span>Loading</span>
                                    </div>
                                </>) : (
                                    <div className="p-5">

                                        {callbacks.filter((call: any) => call.status == 0).length ? '' : (

                                            <div>
                                                <div className="flex flex-col md:flex-row gap-4 items-center max-w-[900px] mx-auto mb-4">
                                                    <input className='form-input'
                                                        type="datetime-local"
                                                        onChange={(e) => setCallbackDate(e.target.value)}
                                                        name="birthdaytime" min={today} />
                                                    <button type="button" onClick={() => createCallback()} className="btn btn-primary">
                                                        Submit
                                                    </button>
                                                </div>

                                                <div className=''>
                                                    <textarea rows={2} onChange={(e) => setCallbackDescription(e.target.value)} className="form-textarea" placeholder="Enter description" ></textarea>
                                                </div>
                                            </div>
                                        )}

                                        {callbacks.length ? (
                                            <PerfectScrollbar className="h-[calc(50vh-80px)] relative bg-gray-100 p-2 rounded-md">
                                                {callbacks?.map((history: any) => (
                                                    <div className='bg-white p-2 rounded mb-2'>
                                                        <div className='flex justify-between items-center'>
                                                            <p className="mb-1 font-semibold">
                                                                {new Date(history.date_time).toLocaleDateString()}{" "}
                                                                {new Date(history.date_time).toLocaleTimeString()}
                                                                {/* {history.date_time}  */}
                                                            </p>
                                                            <div>
                                                                <span className={`badge ${history.status ? 'bg-danger' : 'bg-success'}`}>{history.status ? 'Closed' : 'Opened'}</span>
                                                                {!history.status ? (<span className={`cursor-pointer badge mx-2 btn-primary`} onClick={() => closeCallbacks(history.id)}>Close Now</span>) : ''}

                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-white-dark">{history.description}</p>
                                                    </div>
                                                ))}
                                            </PerfectScrollbar>
                                        ) : (<>
                                            <div className=" w-full justify-center mb-5">
                                                <div className="rounded-md bg-danger-light p-4 ">

                                                    <h5 className="text-dark text-lg font-semibold mb-3.5 dark:text-white-light">No Calls</h5>
                                                    <p className="text-white-dark text-[15px]  mb-3.5">No previous call found!</p>
                                                </div>
                                            </div>

                                        </>)}

                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setCallbackModal(false)}>
                                                Discard
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition></div>
    )
}
