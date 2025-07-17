import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react';
import { useAuth } from '../../AuthContext';
import { setAuthUser } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import IconX from '../../components/Icon/IconX';
import { useToast } from '../../ToastContext ';
export default function SetCrmPin() {
    const { logout, crmToken, authUser, apiUrl } = useAuth();
    const dispatch = useDispatch();
    const [showPinModel, setShowPinModel] = useState(false);
    const { addToast } = useToast();
    useEffect(() => {
        if (!authUser?.pin) setShowPinModel(true)
        else setShowPinModel(false)
    }, [authUser?.pin])

    const [defaultParams] = useState({
        id: '',
        pin: '',
        pin_confirmation: '',

    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.pin) {
            errors = { ...errors, pin: "pin is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });

    };
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const SetCrmPin = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/user-update-pin",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                setParams(defaultParams)
                setShowPinModel(false)
                dispatch(setAuthUser({ ...authUser, pin: true }));
                addToast({
                    variant: 'success',
                    title: response.data.message,
                });
            } else { alert("Failed") }

        } catch (error: any) {

            if (error.response.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
                addToast({
                    variant: 'error',
                    title: error.response.message,
                });
            }
        } finally {
            setIsBtnLoading(false)
        }
    };


    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) {
            addToast({
                variant: 'error',
                title: 'Validation Error! Please Solve',
            });
            return false;
        }
        const data = new FormData();
        data.append("id", params.id);
        data.append("pin", params.pin);
        data.append("pin_confirmation", params.pin_confirmation);
        SetCrmPin(data);

    };


    return (
        <div>
            <Transition appear show={showPinModel} as={Fragment}>
                <Dialog
                    as="div"
                    open={showPinModel}
                    onClose={() => {
                        setShowPinModel(false);
                    }}
                >
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
                    <div id="register_modal" className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
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
                                <Dialog.Panel className="panel border-0 py-1 px-4 rounded-lg overflow-hidden w-full max-w-sm my-8 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between p-5 font-semibold text-lg dark:text-white">
                                        <h5>Set Pin</h5>
                                        <button type="button" onClick={() => setShowPinModel(false)} className="text-white-dark hover:text-dark">
                                            <IconX className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        <form autoComplete="off">
                                            <div className="relative mb-4">
                                                <label >Pin</label>
                                                <input className="form-input" type="text" maxLength={4} name='pin' onChange={(e) => { changeValue(e) }} placeholder='Enter New Pin' />
                                                <div className="text-danger mt-1">{errors.pin}</div>
                                            </div>
                                            <div className="relative mb-4">
                                                <label >Confirm Pin</label>
                                                <input className="form-input" type="text" maxLength={4} name='pin_confirmation' onChange={(e) => { changeValue(e) }} placeholder='Enter Confirm Pin ' />
                                                <div className="text-danger mt-1">{errors.pin_confirmation}</div>
                                            </div>
                                            <div className='flex justify-between gap-5' >
                                                <button type="button" onClick={() => dispatch(setAuthUser({ ...authUser, pin: true }))} className="btn btn-outline-primary w-full">
                                                    Skip
                                                </button>
                                                <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-full">
                                                    {isBtnLoading ? 'Please Wait' : 'Submit'}
                                                </button>
                                            </div>

                                        </form>
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
