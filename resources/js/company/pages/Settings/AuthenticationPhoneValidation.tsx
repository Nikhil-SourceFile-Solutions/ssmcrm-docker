import React, { useState, Fragment, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import { auth } from '../../firebase/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function AuthenticationPhoneValidation({ modal, setModal, params, setParams, formSubmit }) {
    const firstInputRef = useRef(null);

    const [erros, setErros] = useState({});
    const [appVerifier, setAppVerifier] = useState<any>(null);
    const changeValue = (e) => {
        const { value, name } = e.target;
        const [fieldName, fieldIndex] = name.split("_");
        const index = parseInt(fieldIndex, 10);

        if (fieldName === "otp") {
            setErros({ ...erros, otp: "" });

            if (value) {
                const nextInput = document.querySelector(`input[name=otp_${index + 1}]`);
                if (nextInput) nextInput.focus();
            }

            const allInputs = document.querySelectorAll(".otp");
            let otp = "";
            allInputs.forEach((input) => {
                otp += input.value;
            });

            setParams({ ...params, otp });


        }

        console.log("otp", params)
    };


    const [isLoading, setIsLoading] = useState(false);
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value) {
            const prevInput = document.querySelector(`input[name=otp_${index - 1}]`);
            if (prevInput) {
                prevInput.focus();
                prevInput.value = "";
            }
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

    const [btnLoading, setBtnLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const handleVerification = async () => {

        if (confirmationResult) {
            setBtnLoading(true);
            try {
                const result = await confirmationResult.confirm(params.otp);
                console.log(result);
                setParams({ ...params, otp: '' });
                setModal(false)
                formSubmit()

            } catch (err) {
                setErros({ otp: err.message });
            } finally {
                setBtnLoading(false);
            }
        } else {
            setBtnLoading(true);
            if (!appVerifier) return;

            try {
                const confirmationResult = await signInWithPhoneNumber(auth, `+91${params.old_phone}`, appVerifier);
                setConfirmationResult(confirmationResult);
                setParams({ ...params, isChecked: true })
                setErros({ otp: 'OTP sent successfully. Please check your SMS.' });
            } catch (error) {
                console.error("Error during OTP send", error);
                let errorMessage = "Failed to send OTP.";
                if (error.code === "auth/invalid-phone-number") {
                    errorMessage = "The phone number is invalid. Please use the format +[country code][number].";
                } else if (error.code === "auth/too-many-requests") {
                    errorMessage = "Too many requests. Please try again later.";
                }
                setErros({ otp: errorMessage });

            } finally {
                setBtnLoading(false);
            }
        }

    }

    return (

        <div>
            <div id="recaptcha-container"></div>
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
                                        <div className="text-lg font-bold">OTP Verification</div>
                                        <button type="button" className="text-white-dark hover:text-dark" disabled={btnLoading} onClick={() => setModal(false)}>
                                            x
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <b>To update your new number, you will receive an OTP on your old number {params.old_phone}</b>

                                        {params.isChecked ? (<>
                                            <div className="flex items-center justify-center gap-3 mt-8">
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <input
                                                        key={i}
                                                        type="password"
                                                        ref={i === 0 ? firstInputRef : null} // Focus on the first input on mount
                                                        value={params.otp.charAt(i)}
                                                        name={`otp_${i}`}
                                                        onChange={changeValue}
                                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-2xl font-extrabold text-slate-900 
           border-4 rounded-md hover:border-slate-200 appearance-none focus:border-success/50
           outline-none focus:bg-white 
           focus:ring-2 focus:ring-success-100 otp"
                                                        maxLength={1}
                                                    />
                                                ))}
                                            </div>

                                            <div className='mt-4 item-centre'>
                                                <b>{erros.otp}</b>
                                            </div>
                                        </>) : null}


                                        <div className="flex justify-end items-center mt-8">
                                            <button disabled={btnLoading} onClick={() => handleVerification()} type="button" className="btn shadow btn-primary ltr:ml-4 rtl:mr-4">
                                                {btnLoading ? 'Please Wait' : params.isChecked ? 'Verify OTP' : 'Get OTP'}
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
    )
}

export default AuthenticationPhoneValidation