import React, { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react';

import { IoCloseCircleSharp } from "react-icons/io5";
import axios from 'axios';
import { useToast } from '../../ToastContext ';
import { useAuth } from '../../AuthContext';
function SendSelection({ sendModal, setSendModal, lead, link, activeLinks, kyc_id, setVerification }) {


    const { addToast } = useToast();
    const { logout, crmToken, apiUrl } = useAuth();

    const [defaultParams] = useState({
        send_sms: false,
        send_email: false,
        send_whatsapp: false,
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const changeValue = (e: any) => {
        const { checked, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: checked });
        setError(null)
    }
    const [error, setError] = useState<any>(null);
    const validate = () => {
        setErros({});
        let errors = {};
        if (params.send_sms && !lead.phone) {
            errors = { ...errors, send_sms: "please update lead phone number" };
        }

        if (params.send_whatsapp && !lead.phone) {
            errors = { ...errors, send_whatsapp: "please update lead phone number" };
        }

        if (params.send_email && !lead.email) {
            errors = { ...errors, send_email: "please update lead email address" };
        }

        if (!params.send_sms && !params.send_whatsapp && !params.send_email) {
            setError('Please select any one option');
            errors = { ...errors, error: "Please select any one option" };
        }

        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [response, setResponse] = useState([]);

    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const sendLinkApi = async (data) => {
        setResponse([])
        setIsBtnLoading(true)
        setError(null)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/send-kyc-link",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {
                setVerification((prevVerifications) => ({
                    ...prevVerifications,
                    kycVerification: { ...prevVerifications.kycVerification, kyc: response.data.kyc }
                }));

                setResponse(response.data?.response)
                setParams(defaultParams)
                addToast({
                    variant: 'success',
                    title: response.data.message,
                })
            } else if (response.data.status == "info") {
                setVerification((prevVerifications) => ({
                    ...prevVerifications,
                    kycVerification: { ...prevVerifications.kycVerification, kyc: response.data.kyc }

                }));
                setError(response.data.message)
            }

            else if (response.data.status == 'error') {
                setError(response.data.message)
                setResponse(response.data?.response)

            }
        } catch (error) {
            setResponse([])
            if (error?.response?.status == 401) logout()

        } finally {
            setIsBtnLoading(false)

        }
    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append('id', kyc_id);
        data.append("send_sms", params.send_sms ? 1 : 0);
        data.append("send_email", params.send_email ? 1 : 0);
        data.append("send_whatsapp", params.send_whatsapp ? 1 : 0);
        sendLinkApi(data);
    };

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
        });
    };
    return (
        <Transition appear show={sendModal} as={Fragment}>
            <Dialog as="div" open={sendModal} onClose={() => setSendModal(true)}>
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
                <div className="fixed inset-0 bg-[black]/70 z-[999] overflow-y-auto">
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
                                <div className="flex bg-[#ece7f7] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="font-bold">Send KYC Link</div>
                                    <button type="button" onClick={() => setSendModal(false)} className="text-white-dark hover:text-dark">
                                        <IoCloseCircleSharp size={25} />
                                    </button>
                                </div>
                                <div className="p-5">
                                    {error && <div className='mb-2'>
                                        <small><b className='text-[#ff1e1e]'>{error}</b></small>
                                    </div>}


                                    <div>

                                        {activeLinks.has_sms_link && <div className='mb-5'>
                                            <label className="inline-flex">
                                                <input type="checkbox" name="send_sms" onChange={(e) => changeValue(e)} checked={params.send_sms} className="form-checkbox outline-success" />
                                                <span>Send by SMS</span>
                                            </label>
                                            {params.send_sms && <input type="tel" maxLength={10} placeholder="Enter Phone Number" value={lead?.phone} className="form-input bg-[#dbe7ff38]" disabled />}

                                            {errors.send_sms && <div>
                                                <small className='text-[#ff1e1e]'><b>{errors.send_sms}</b></small>
                                            </div>}
                                        </div>}


                                        {activeLinks.has_whatsapp_link && <div className='mb-5'>
                                            <label className="inline-flex">
                                                <input type="checkbox" name="send_whatsapp" onChange={(e) => changeValue(e)} checked={params.send_whatsapp} className="form-checkbox outline-success" />
                                                <span>Send by Whatsapp</span>
                                            </label>
                                            {params.send_whatsapp && <input type="tel" maxLength={10} placeholder="Enter Phone Number" value={lead?.phone} className="form-input bg-[#dbe7ff38]" disabled />}

                                            {errors.send_whatsapp && <div>
                                                <small className='text-[#ff1e1e]'><b>{errors.send_whatsapp}</b></small>
                                            </div>}
                                        </div>}

                                        {activeLinks.has_email_link && <div className='mb-5'>
                                            <label className="inline-flex">
                                                <input type="checkbox" name="send_email" onChange={(e) => changeValue(e)} checked={params.send_email} className="form-checkbox outline-success" />
                                                <span>Send by Email</span>
                                            </label>
                                            {params.send_email && <input type="email" placeholder="Enter Email Address" value={lead?.email} className="form-input bg-[#dbe7ff38]" disabled />}
                                            {errors.send_email && <div>
                                                <small className='text-[#ff1e1e]'><b>{errors.send_email}</b></small>
                                            </div>}
                                        </div>}


                                    </div>
                                    {response?.map((r) => (
                                        <div className={` ${r[0] ? 'bg-success-light' : 'bg-[#fbe5e6]'}  p-1 rounded mb-1`}>
                                            <small ><b>{r[1]}</b></small>
                                        </div>
                                    ))}



                                    <div className="flex justify-between items-center mt-4">

                                        <div className="flex items-center gap-1 bg-[#DBE7FF] rounded justify-between w-[70%]">
                                            <p className="text-gray-800 font-bold italic truncate max-w-[70%] px-2" title={link}>
                                                {link}
                                            </p>
                                            <button
                                                className={` px-4 py-1 text-sm font-medium text-white rounded-md ${copied ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
                                                    }`}
                                                onClick={handleCopy}
                                            >
                                                {copied ? "Copied!" : "Copy"}
                                            </button>
                                        </div>

                                        <button type="button" disabled={isBtnLoading} onClick={() => formSubmit()} className="btn btn-sm shadow btn-gradient ltr:ml-4 rtl:mr-4">
                                            {isBtnLoading ? 'Sending...' : 'Send Now'}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default SendSelection