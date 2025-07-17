import React, { useEffect } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react';
import { useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { IoMdCloseCircle } from "react-icons/io";

function Preview({ params, modal, setModal }) {
    const { crmToken, apiUrl } = useAuth()
    useEffect(() => {
        if (modal) fetchPreview()
    }, [modal])
    const [htmlContent, setHtmlContent] = useState(null);
    const fetchPreview = async () => {

        setHtmlContent(null)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/invoice-preview",
                params,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setHtmlContent(response.data.preview)
            }
        } catch (error) {
            setHtmlContent(null)
        } finally {

        }
    }

    return (


        <Transition appear show={modal} as={Fragment}>
            <Dialog as="div" open={modal} onClose={() => setModal(false)}>
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
                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-[800px] text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="text-lg font-bold">Invoice Preview</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setModal(false)}>
                                        <IoMdCloseCircle size={25} />
                                    </button>
                                </div>
                                <div className="p-1">
                                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Preview






