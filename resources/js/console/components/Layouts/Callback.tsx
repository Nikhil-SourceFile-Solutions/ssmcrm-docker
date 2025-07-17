import { Dialog, Transition } from '@headlessui/react';
import React,{ useState, Fragment } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { MdPhoneCallback } from "react-icons/md";

export default function Callback({ callbackModal, setCallbackModal, callbackData }: any) {


    const closeCallback = async () => {

        try {

        } catch (error) {

        } finally {

        }
    }

    return (
        <div>
            <div>

                <Transition appear show={callbackModal} as={Fragment}>
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
                                                        <span className="flex justify-center items-center w-10 h-10 text-center rounded-full object-cover bg-success text-2xl">
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
                                                    <input className='form-input' type="datetime-local" name="birthdaytime" />
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-4 items-center max-w-[800px] mt-4">
                                                    <textarea className='form-textarea' name="" id=""></textarea>
                                                    <button type="button" className="btn btn-primary">
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-sm btn-danger ltr:ml-4 rtl:mr-4">
                                                    Ok Close Callback Alert
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
