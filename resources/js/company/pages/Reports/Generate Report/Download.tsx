import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import PageLoader from '../../../components/Layouts/PageLoader';
import { BsInfoCircleFill } from "react-icons/bs";
import { auth } from '../../../firebase/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function Download({ downloadModal, setDownloadModal, downloadData }) {
    const { logout, crmToken, apiUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [phones, setPhones] = useState(null);
    const [verified, setVerified] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [selectableFields, setSelectableFields] = useState([]);
    const [isBtnLoading, setIsBtnLoading] = useState(false);
    const [error, setError] = useState<any>('');
    const [fetchingError, setFetchingError] = useState<any>(null);
    const [appVerifier, setAppVerifier] = useState<any>(null);

    const [params, setParams] = useState({
        phone: '',
        action: "otp",
        recive_otp: 'sms',
        is_verified: false,
        otp: '',
        selectFields: [],
        selectedFields: []
    });

    useEffect(() => {
        setParams({
            phone: '',
            action: "otp",
            recive_otp: 'sms',
            is_verified: false,
            otp: '',
            selectFields: [],
            selectedFields: []
        })
    }, [downloadData])

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (downloadModal) fetchDataForDownloadReport();
    }, [downloadModal]);

    const fetchDataForDownloadReport = async () => {
        setIsLoading(true);
        setVerified(false);
        setConfirmationResult(null);
        setError('')
        try {
            const response = await axios.get(`${apiUrl}/api/get-data-for-download-report`, {
                params: { type: downloadData.type },
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${crmToken}` },
            });
            if (response.data.status === "success") {

                console.log(response.data.phones)
                setPhones(response.data.phones);
                setSelectableFields(response.data.selectFields);
            } else {
                setPhones(null);
            }
        } catch (error) {
            console.error("Error fetching data for download report", error);

        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const appVerifie = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
                console.log('recaptcha resolved..');
            }
        });
        setAppVerifier(appVerifie);
        return () => appVerifie.clear();
    }, []);

    const validate = () => {
        const errors = {};
        if (!params.otp) {
            errors.otp = "OTP is required";
        } else if (params.otp.length !== 6) {
            errors.otp = "OTP must be 6 digits";
        }
        setErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    };

    const handleSendOtp = async () => {
        setIsBtnLoading(true);
        if (!appVerifier) return;

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, `+91${phones?.sms_phone}`, appVerifier);
            setConfirmationResult(confirmationResult);
            setError('OTP sent successfully. Please check your SMS.');
        } catch (error) {
            console.error("Error during OTP send", error);
            let errorMessage = "Failed to send OTP.";
            if (error.code === "auth/invalid-phone-number") {
                errorMessage = "The phone number is invalid. Please use the format +[country code][number].";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many requests. Please try again later.";
            }
            setError(errorMessage);
        } finally {
            setIsBtnLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsBtnLoading(true);
        try {
            const result = await confirmationResult.confirm(params.otp);
            console.log(result);
            setVerified(true);
            setParams({ ...params, otp: '' }); // Clear OTP input
        } catch (err) {
            setError(err.message);
        } finally {
            setIsBtnLoading(false);
        }
    };

    const downloadReportApi = async (data) => {

        setIsBtnLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/reports-download`, data, {
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${crmToken}` },
                responseType: 'blob',
            });
            const disposition = response.headers['content-disposition'];
            let filename = 'default_filename.csv';
            if (disposition && disposition.includes('filename=')) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloadModal(false);
        } catch (error) {
            if (error.response?.status === 401) logout();
            if (error.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                const serverErrors = {};
                for (const key in serveErrors) {
                    serverErrors[key] = serveErrors[key][0];
                }
                setErrors(serverErrors);
            }
        } finally {
            setIsBtnLoading(false);
        }
    };

    const downloadReport = () => {
        if (!params.selectedFields.length) return;
        const data = new FormData();
        data.append("record_id", downloadData.id);
        data.append("selected_fields", JSON.stringify(params.selectedFields));
        downloadReportApi(data);
    };

    const changeValue = (e) => {
        const { name, value, checked } = e.target;
        const { selectedFields } = params;

        // Clear any existing errors for the field being updated
        setErrors((prev) => ({ ...prev, [name]: "" }));

        if (name === "select_fields") {
            const updatedFields = checked
                ? [...selectedFields, value].filter((item, index, self) => self.indexOf(item) === index) // Ensure no duplicates
                : selectedFields.filter((item) => item !== value);

            setParams((prev) => ({ ...prev, selectedFields: updatedFields }));
        } else if (name == "select_all") {
            setParams((prev) => ({ ...prev, selectedFields: checked ? selectableFields : [] }))
        } else {

            setParams((prev) => ({ ...prev, [name]: value }));
        }
    };
    return (
        <div className="mb-5">
            <div id="recaptcha-container"></div>
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
                                <Dialog.Panel className={`panel border-0 p-0 rounded-lg overflow-hidden w-full ${verified ? 'max-w-5xl' : 'max-w-lg'} my-8 text-black dark:text-white-dark`}>
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <div className="font-bold text-lg">Download Report - {downloadData?.report_name}</div>
                                        <button type="button" onClick={() => setDownloadModal(false)} className="text-white-dark hover:text-dark">x</button>
                                    </div>
                                    <div className="p-5 pb-5">
                                        {isLoading ? <PageLoader /> : fetchingError ? <div>Error: {fetchingError}</div> : (
                                            <div>
                                                {verified ? (
                                                    <div>
                                                        <div className='text-center font-bold text-[18px] text-black/75 flex justify-start'>
                                                            <h1>Select Required Fields</h1>

                                                            <label className="inline-flex mx-4 items-center" >
                                                                <input
                                                                    type="checkbox"
                                                                    name='select_all'
                                                                    onChange={(e) => changeValue(e)}
                                                                    className="form-checkbox text-success"

                                                                />
                                                                <span className="ml-2">Select All</span>
                                                            </label>

                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                                            {selectableFields.map((field) => (
                                                                <label className="inline-flex mx-4 items-center" key={field}>
                                                                    <input
                                                                        type="checkbox"
                                                                        name='select_fields'
                                                                        onChange={(e) => changeValue(e)}
                                                                        className="form-checkbox text-success"
                                                                        value={field}
                                                                        checked={params.selectedFields.includes(field)}
                                                                    />
                                                                    <span className="ml-2">{field}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <div>
                                                            <button
                                                                className='my-4 btn btn-info btn-lg m-auto'
                                                                disabled={isBtnLoading || !params.selectedFields.length}
                                                                onClick={downloadReport}
                                                            >
                                                                {isBtnLoading ? 'Downloading...' : 'Download Report'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className='text-[#f8538d] font-bold'>Download requires OTP verification</p>
                                                        {params.recive_otp === "sms" && (
                                                            <div className='mt-2 flex gap-2 items-center justify-between bg-[#ece7f7] rounded p-2'>
                                                                <span className='mx-2'><BsInfoCircleFill size={20} /></span>
                                                                <span className='text-[#506690] font-semibold text-[15px]'>You will receive an OTP via SMS on the number ending in <b>******{phones?.sms_phone?.slice(-4)}</b></span>
                                                            </div>
                                                        )}
                                                        {confirmationResult ? (
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
                                                                <button type="button" disabled={isBtnLoading} onClick={handleVerifyOtp} className="btn btn-dark shadow m-auto">
                                                                    {isBtnLoading ? 'Please Wait' : 'Verify OTP'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={handleSendOtp}
                                                                disabled={isBtnLoading}
                                                                className='mt-4 btn btn-dark shadow m-auto'
                                                            >
                                                                {isBtnLoading ? 'Please Wait...' : 'Get OTP'}
                                                            </button>
                                                        )}
                                                        {error && <p className='mt-4 text-[#009688] font-extrabold'>{error}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
