import React, { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';

export default function EditLead({ leadModal, setLeadModal, lead, states, setData }) {

    const { logout, crmToken, authUser, apiUrl } = useAuth();



    const [params, setParams] = useState<any>([]);

    useEffect(() => {
        if (lead && leadModal) setParams({
            id: lead.id,
            first_name: lead.first_name ? lead.first_name : '',
            last_name: lead.last_name ? lead.last_name : '',
            email: lead.email ? lead.email : '',
            phone: lead.phone,
            second_phone: lead.second_phone ? lead.second_phone : '',
            state: lead.state ? lead.state : '',
        })
    }, [lead, leadModal])

    const [errors, setErros] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.first_name) {
            errors = { ...errors, first_name: "first name is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const updateLeadApi = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/sale-lead-update",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });


            if (response.data.status == 'success') {
                const lead = response.data.lead;
                setData((old) => ({
                    ...old,
                    lead
                }));
                setLeadModal(false)
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErros(serverErrors);
            }
        } finally {
            setIsBtnLoading(false)
        }
    };



    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("lead_id", params.id);
        data.append("first_name", params.first_name);
        data.append("last_name", params.last_name);
        data.append("email", params.email);
        data.append("second_phone", params.second_phone);
        data.append("state", params.state);
        updateLeadApi(data);
    };

    return (
        <Transition appear show={leadModal} as={Fragment}>
            <Dialog as="div" open={leadModal} onClose={() => setLeadModal(true)}>
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="font-bold text-lg">Edit Lead</div>
                                    <button type="button" onClick={() => setLeadModal(false)} className="text-white-dark hover:text-dark">
                                        X
                                    </button>
                                </div>


                                <div className="p-5">
                                    <form className="space-y-5">
                                        <div>
                                            <label>First Name</label>
                                            <input id="first_name" name="first_name" type="text" value={params.first_name} onChange={(e) => changeValue(e)} placeholder="Enter First Name" className="form-input" />
                                            <div className="text-danger mt-1">{errors.first_name}</div>
                                        </div>

                                        <div>
                                            <label>Last Name</label>
                                            <input id="last_name" name="last_name" type="text" value={params.last_name} onChange={(e) => changeValue(e)} placeholder="Enter Last Name" className="form-input" />
                                            <div className="text-danger mt-1">{errors.last_name}</div>
                                        </div>

                                        <div>
                                            <label>Email address</label>
                                            <input id="email" name="email" type="email" value={params.email} onChange={(e) => changeValue(e)} placeholder="Enter Email Address" className="form-input" />
                                            <div className="text-danger mt-1">{errors.email}</div>
                                        </div>

                                        <div>
                                            <label>Primary Phone</label>
                                            <input id="phone" type="tel" value={params.phone} disabled className="form-input bg-danger-light" />
                                        </div>

                                        <div>
                                            <label>Secondary Phone</label>
                                            <input id="second_phone" name="second_phone" type="tel" value={params.second_phone} onChange={(e) => changeValue(e)} placeholder="Enter Phone number" className="form-input" />
                                            <div className="text-danger mt-1">{errors.second_phone}</div>
                                        </div>

                                        <div>
                                            <label>State</label>
                                            <select className='form-select' name="state" onChange={(e) => changeValue(e)} value={params.state}>
                                                {states?.map((state, index) => (
                                                    <option key={index} value={state.value}>{state.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger mt-1">{errors.state}</div>
                                        </div>
                                    </form>
                                    <div className="flex justify-end items-center mt-8">
                                        <button type="button" disabled={isBtnLoading ? true : false} onClick={() => formSubmit()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                            {isBtnLoading ? "Please Wait..." : "Update"}
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
