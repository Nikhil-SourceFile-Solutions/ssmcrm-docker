import React, { Fragment, useEffect, useRef, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../../../components/Icon/IconX';
import axios from 'axios';
import { IRootState } from '../../../../store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../AuthContext';

export default function WebsiteLink({ websiteLinkModal, setWebsiteLinkModel, lead_id,selectedLead }: any) {

    const { settingData, crmToken, apiUrl,authUser } = useAuth()

    const dispatch = useDispatch();
    const defaultParams = {
        id: '',
        lead_id: '',
        message: '',
        phone: '',
    }
    const [params, setParams] = useState<any>(defaultParams);

    const [errors, setErros] = useState<any>({});

    // const validate = () => {
    //     setErros({});
    //     let errors = {};
    //     if (!params.bank_qrcode_id) {
    //         errors = { ...errors, bank_qrcode_id: "bank or qrcode is required" };
    //     }
    //     if (params.send_whatsapp==0) {
    //         errors = { ...errors, send_whatsapp: "Please Select" };
    //     }

    //     setErros(errors);
    //     return { totalErrors: Object.keys(errors).length };
    // };

    // const [banks, setBanks] = useState<any>([]);
    // const [selectedPayment, setSelectedPaymnet] = useState('');


    // const changeValue = (e: any) => {
    //     let { value, name, type } = e.target;
    //     setErros({ ...errors, [name]: "" });
    //         setParams({ ...params, [name]: value });
    //     console.table(params)
    // };




    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const addBankDetails = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/save-website-details",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage('Website Details Saved Successfully');
                setParams(defaultParams);
                setWebsiteLinkModel(false);

            } else { alert("Failed") }

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
            setIsBtnLoading(false)
        }
    };
    const formSubmit = () => {
        // const isValid = validate();
        // if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("lead_id", lead_id);
        data.append('message', settingData?.crm_news);
        data.append("phone",selectedLead?.phone);

        addBankDetails(data);
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




    return (
        <Transition appear show={websiteLinkModal} as={Fragment}>
            <Dialog as="div" open={websiteLinkModal} onClose={() => setWebsiteLinkModel(false)}>
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
                                    <div className="text-lg font-bold">Website Link Details</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setWebsiteLinkModel(false)}>
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">
                                    <form autoComplete="off" action="">
                                     <h1>Your Website Details:: {settingData?.crm_news}</h1>
                                        <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-full">
                                            {isBtnLoading ? 'Please Wait' : 'Send'}
                                        </button>
                                    </form>


                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
