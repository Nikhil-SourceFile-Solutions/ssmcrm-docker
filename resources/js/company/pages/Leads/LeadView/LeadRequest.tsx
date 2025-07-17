import React, { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react';
import IconX from '../../../components/Icon/IconX';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import axios from 'axios';
import { setCrmToken } from '../../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';
export default function LeadRequest({ requestModal, setRequestModal }: any) {

    const { logout, crmToken, apiUrl } = useAuth();

    const dispatch = useDispatch();


    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (requestModal) fetchStates()
    }, [requestModal])

    const [states, setStates] = useState([]);
    const fetchStates = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/state-for-lead-request",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") setStates(response.data.states)
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }

    const [defaultParams] = useState({
        state: '',
        count: '',
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        const a: any = states[params.state - 1]
        if (!params.state) {
            errors = { ...errors, state: "state is required" };
        } else {
            if (!params.count) {
                errors = { ...errors, count: "count is required" };
            }
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
    const sendLeadRequest = async (data: any) => {
        try {
            setIsBtnLoading(true)
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/lead-request",
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setRequestModal(false)
                Swal.fire({
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 450,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                });
            } else if (response.data.status == "error") {
                Swal.fire({
                    icon: response.data.status,
                    title: response.data.title,
                    text: response.data.message,
                    padding: '2em',
                    customClass: 'sweet-alerts',
                });
            }
        } catch (error: any) {
            console.log(error)
            if (error?.response?.status == 401) logout()
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

    }

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        const a: any = states[params.state - 1]
        data.append("state", a.state);
        data.append("count", params.count);
        sendLeadRequest(data);
    };


    return (
        <div>

            <Transition appear show={requestModal} as={Fragment}>
                <Dialog
                    as="div"
                    open={requestModal}
                    onClose={() => {
                        setRequestModal(false);
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
                                        <h5>Lead Request</h5>
                                        <button type="button" onClick={() => setRequestModal(false)} className="text-white-dark hover:text-dark">
                                            <IconX className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-3">

                                        {isLoading ? <>Loading...</> : (
                                            <form autoComplete="off">
                                                <div className="relative mb-4">
                                                    <select id="dataType" className="form-select text-white-dark" name='state' value={params.state} onChange={(e) => changeValue(e)}>
                                                        <option value={''}>Select State</option>
                                                        {states?.map((state: any, index: number) => (
                                                            <option value={index + 1} key={index + 1}>{state.state}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.state}</div>
                                                </div>

                                                <div className="relative mb-4">
                                                    <input name='count' onChange={(e: any) => changeValue(e)} value={params.count} type="text" placeholder="Enter Count" className="form-input" disabled={params.state ? false : true} />
                                                    <div className="text-danger mt-1">{errors.count}</div>
                                                </div>

                                                <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-full">
                                                    {isBtnLoading ? 'Please Wait' : 'Request'}
                                                </button>
                                            </form>
                                        )}

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
