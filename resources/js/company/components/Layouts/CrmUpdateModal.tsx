import React, { useState, Fragment, useEffect } from 'react';

import { Dialog, Transition } from '@headlessui/react';
import { Hourglass } from 'react-loader-spinner';



function CrmUpdateModal({ updateModal, setUpdateModal }) {

    useEffect(() => {
        if (updateModal) setTimeout(() => {
            setUpdateModal(false)
            window.location.href = window.location.href + "?update-reload=" + new Date().getTime();
        }, 10000)
    }, [updateModal])
    return (
        <Transition appear show={updateModal} as={Fragment}>
            <Dialog as="div" open={updateModal} onClose={() => { }}>
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
                <div className="fixed inset-0 bg-[url(/assets/images/auth/map.png)] backdrop-blur-[5px] z-[999] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className=" border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                <div className="flex bg-opacity-50 bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <h5 className="font-bold text-lg animate-pulse">CRM Updating...</h5>

                                </div>
                                <div className="p-5 min-h-[200px] flex justify-center items-center ">
                                    <div>
                                        <Hourglass
                                            visible={true}
                                            height="80"
                                            width="80"
                                            ariaLabel="hourglass-loading"
                                            wrapperStyle={{}}
                                            wrapperClass=""
                                            colors={['#ee1362', '#f44336']}

                                        />
                                    </div>


                                </div>
                                <div className="flex justify-center items-center">
                                    <b>Please don't close this window</b>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default CrmUpdateModal