import React, { useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment } from 'react';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import PageLoader from '../../../components/Layouts/PageLoader';
import { BsInfoCircleFill } from "react-icons/bs";

import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
export default function Download({ downloadModal, setDownloadModal, downloadData }) {

    const { logout, crmToken, settingData, apiUrl } = useAuth();



    // const phones = settingData?.security_numbers.split(",");



    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (downloadModal) fetchDataForDownloadReport()
    }, [downloadModal])


    const [phones, setPhones] = useState(null);

    const fetchDataForDownloadReport = async () => {

        setIsLoading(true);
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-data-for-download-report",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setPhones(response.data.phones);

                console.log(response.data.phones.whatsapp_phone)
            }
            else setPhones(null)

        } catch (error) {

        } finally {

            setIsLoading(false);
        }
    }

    const [defaultParams] = useState({
        phone: '',
        action: "otp",
        recive_otp: 'sms',
        is_verified: false,
        otp: '',
        selectFields: [],
        selectedFields: []

    });

    const [params, setParams] = useState<any>([]);
    const [errors, setErrors] = useState<any>({});
    useEffect(() => {
        if (downloadModal) {
            setParams(defaultParams)
        }
    }, [downloadModal])


    const changeValue = (e: any) => {
        const { value, name, checked } = e.target;
        const { selectedFields } = params;
        setErrors({ ...errors, [name]: "" });
        if (name === "select_fields") {
            const updatedFields = checked
                ? [...selectedFields, value].filter((item, index, self) => self.indexOf(item) === index) // Ensure no duplicates
                : selectedFields.filter(item => item !== value);
            setParams({ ...params, selectedFields: updatedFields });
        } else setParams({ ...params, [name]: value });
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const [fetchingError, setFetchingError] = useState(null);

    const validate = () => {
        setErrors({});
        let errors = {};
        // if (!params.phone) {
        //     errors = { ...errors, type: "phone is required" };
        // }

        // if (!params.recive_otp) {
        //     errors = { ...errors, recive_otp: "recive otp is required" };
        // }

        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const downloadReportApi = async (data) => {


        setIsBtnLoading(true)
        try {

            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/reports-otp-generate",
                data,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });



            if (response.data.status == "success") {
                if (response.data.action === 'selectFields') {
                    setParams({ ...params, selectFields: response.data.selectFields, action: response.data.action })
                } else setParams({ ...params, action: response.data.action })

            }

        } catch (error) {

            if (error.response.status == 401) logout();
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErrors(serverErrors);

            }

        } finally {
            setIsBtnLoading(false)
        }
    }

    const formSubmit = async () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("action", params.action);
        data.append("record_id", downloadData.id)
        data.append("recive_otp", params.recive_otp)
        data.append("otp", params.otp)
        downloadReportApi(data);
    }




    const downloadReportApi2 = async (data) => {
        setIsBtnLoading(true);
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/reports-download",
                data,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
                responseType: 'blob', // Important: Set response type to 'blob'
            });

            // Get the filename from the response headers
            const disposition = response.headers['content-disposition'];
            let filename = 'default_filename.csv'; // Fallback filename

            if (disposition && disposition.indexOf('filename=') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, ''); // Remove quotes
                }
            }

            // Create a URL for the file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Use the filename from the response
            document.body.appendChild(link);
            link.click(); // Trigger download
            document.body.removeChild(link); // Clean up

            setDownloadModal(false);
        } catch (error) {
            if (error.response.status === 401) logout();
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0]);
                }
                setErrors(serverErrors);
            }
        } finally {
            setIsBtnLoading(false);
        }
    }

    const downloadReport = () => {
        if (!params.selectedFields.length) return false;
        const data = new FormData();
        data.append("record_id", downloadData.id)
        data.append("selected_fields", JSON.stringify(params.selectedFields));
        downloadReportApi2(data);
    }

    const setupRecaptcha = () => {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
    };

    const handleSendOtp = (e) => {
        e.preventDefault();
        setupRecaptcha();

        const appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                setConfirmationResult(confirmationResult);
                alert('OTP sent!');
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    return (
        <div className="mb-5">

            <Transition appear show={downloadModal} as={Fragment}>
                <Dialog as="div" open={downloadModal} onClose={() => setDownloadModal(true)}>
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
                                <Dialog.Panel className={`panel border-0 p-0 rounded-lg overflow-hidden w-full ${params.action == "selectFields" ? 'max-w-5xl' : 'max-w-lg'}  my-8 text-black dark:text-white-dark`}>
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <div className="font-bold text-lg">Download Report-{downloadData?.report_name}</div>
                                        <button type="button" onClick={() => setDownloadModal(false)} className="text-white-dark hover:text-dark">
                                            x
                                        </button>
                                    </div>
                                    <div className="p-5 pb-5">



                                        {isLoading ? <PageLoader /> : fetchingError ? <>Error</> : (<div>


                                            {params.action == "selectFields" ? (
                                                <>

                                                    <div>
                                                        <div className='text-center font-bold text-[18px] text-black/75'>
                                                            <h1>Select Required Fields</h1>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                            {params?.selectFields?.map((field) => (
                                                                <label className="inline-flex mx-4 items-center">
                                                                    <input type="checkbox" name='select_fields'
                                                                        onChange={(e) => changeValue(e)}
                                                                        className="form-checkbox text-success" value={field} checked={params.selectedFields.includes(field)} />
                                                                    <span className="ml-2">{field}</span>
                                                                </label>
                                                            ))}
                                                        </div>

                                                        <div>

                                                            <button className='my-4 btn btn-info btn-lg m-auto'
                                                                disabled={params.selectedFields.length || isBtnLoading ? false : true}

                                                                onClick={() => downloadReport()}
                                                            >
                                                                {isBtnLoading ? 'Downloading...' : 'Download Report'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (<div>
                                                <p>
                                                    Download Require OTP Verification
                                                </p>

                                                {/* <p>Please Select Where You Want To Recive OTP.</p> */}

                                                {/* <div className='mt-4'>
                                                    <label className="inline-flex mx-4">
                                                        <input
                                                            type="radio"
                                                            value={'whatsapp'}
                                                            checked={"whatsapp" == params.recive_otp}
                                                            name="recive_otp"
                                                            className="form-radio text-success"
                                                            onChange={(e) => changeValue(e)}
                                                            disabled={phones?.whatsapp_phone ? false : true}
                                                        />
                                                        <span>WhatsApp</span>
                                                    </label>

                                                    <label className="inline-flex mx-4">
                                                        <input
                                                            type="radio"
                                                            value={'sms'}
                                                            checked={"sms" == params.recive_otp}
                                                            name="recive_otp"
                                                            className="form-radio text-success"
                                                            onChange={(e) => changeValue(e)}
                                                            disabled={phones?.sms_phone ? false : true}
                                                        />
                                                        <span>SMS</span>
                                                    </label>
                                                </div> */}



                                                {params.recive_otp == "whatsapp" || params.recive_otp == "sms" ? (<>
                                                    <div className='mt-2 flex gap-2 items-center justify-between bg-[#ece7f7] rounded p-2'>
                                                        <span className='mx-2'><BsInfoCircleFill size={20} /></span>
                                                        <span className=' text-[#506690]  font-semibold text-[15px]'>You will receive an OTP via {params.recive_otp == "whatsapp" ? "WhatsApp" : "SMS"}  on the number ending in <b>******
                                                            {params.recive_otp == "whatsapp" ? phones?.whatsapp_phone?.slice(-4) : phones?.sms_phone?.slice(-4)}
                                                        </b></span>
                                                    </div>


                                                    {params.action == "otp" ? (<>
                                                        <div>
                                                            <button
                                                                onClick={() => handleSendOtp()}
                                                                disabled={isBtnLoading}
                                                                className='mt-4 btn btn-dark shadow m-auto '>
                                                                {params.action == 'otp' ? 'Get OTP' : 'Veryfy OTP & Download'}
                                                            </button>
                                                        </div>
                                                    </>) : null}

                                                </>) : null}


                                                {params.action == "verify" ? (<>
                                                    <div className="flex justify-end items-center mt-8">
                                                        <div>

                                                            <input
                                                                className='form-input w-fit'
                                                                type="tel"
                                                                onChange={(e) => changeValue(e)}
                                                                name='otp'
                                                                placeholder='Enter OTP'
                                                            />
                                                            <div className="text-danger font-semibold text-sm">{errors.otp}</div>
                                                        </div>

                                                        <button type="button" disabled={isBtnLoading} onClick={() => formSubmit()} className="btn btn-dark shadow m-auto">
                                                            Veryfy OTP
                                                        </button>
                                                    </div>
                                                </>) : null}
                                            </div>
                                            )}


                                        </div>)}





                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
