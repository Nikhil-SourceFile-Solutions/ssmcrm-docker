import React, { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react';
import IconX from '../../../components/Icon/IconX';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import axios from 'axios';

import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';
export default function ChangePassword({ selectedData, fetchEmployee, model, setModel }: any) {
    const dispatch = useDispatch();



    const { crmToken, apiUrl } = useAuth()


    const [defaultParams] = useState({

        password: '',
        password_confirmation: '',
        pin: '',
        pin_confirmation: ''

    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        // if (!params.password) {
        //     errors = { ...errors, password: "password is required" };
        // }
        // if (!params.pin) {
        //     errors = { ...errors, pin: "pin is required" };
        // }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const changePasswords = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/update-password",

                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage('Updated Successfully')
                setParams(defaultParams)
                setModel(false)
                fetchEmployee();

            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            // if (error.response.status == 401) dispatch(setCrmToken(''))
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
    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", selectedData.id);
        data.append("password", params.password);
        data.append("password_confirmation", params.password_confirmation);
        data.append("pin", params.pin);
        data.append("pin_confirmation", params.pin_confirmation);
        changePasswords(data);

    };

    const [changePassword, setChangePassword] = useState(true)

    return (
        <div>
            <Transition appear show={model} as={Fragment}>
                <Dialog
                    as="div"
                    open={model}
                    onClose={() => {
                        setModel(false);
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
                                        <h5 onClick={() => { setChangePassword(true) }} className=' cursor-pointer btn btn-primary btn-sm' >Change Password</h5>
                                        <h5 onClick={() => { setChangePassword(false) }} className=' cursor-pointer btn btn-primary btn-sm' >Change Pin</h5>

                                        {/* <button type="button" onClick={() => setChangePasswordModel(false)} className="text-white-dark hover:text-dark">
                                            <IconX className="w-5 h-5" />
                                        </button> */}
                                    </div>
                                    <div className="p-3">
                                        <form autoComplete="off">
                                            {
                                                changePassword ? <div>
                                                    <div className="relative mb-4">
                                                        <input className="form-input" type="text" name='password' onChange={(e) => { changeValue(e) }} placeholder='Enter New Password' />
                                                        <div className="text-danger mt-1">{errors.password}</div>
                                                    </div>
                                                    <div className="relative mb-4">
                                                        <input className="form-input" type="text" name='password_confirmation' onChange={(e) => { changeValue(e) }} placeholder='Enter Confirm Password ' />
                                                        <div className="text-danger mt-1">{errors.password_confirmation}</div>
                                                    </div>
                                                </div> : <div>
                                                    <div className="relative mb-4">
                                                        <input className="form-input" type="text" name='pin' onChange={(e) => { changeValue(e) }} placeholder='Enter New Pin' />
                                                        <div className="text-danger mt-1">{errors.pin}</div>
                                                    </div>
                                                    <div className="relative mb-4">
                                                        <input className="form-input" type="text" name='pin_confirmation' onChange={(e) => { changeValue(e) }} placeholder='Enter Confirm Pin ' />
                                                        <div className="text-danger mt-1">{errors.pin_confirmation}</div>
                                                    </div>
                                                </div>

                                            }

                                            <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-full">
                                                {isBtnLoading ? 'Please Wait' : 'Submit & Logout from all device'}
                                            </button>
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
