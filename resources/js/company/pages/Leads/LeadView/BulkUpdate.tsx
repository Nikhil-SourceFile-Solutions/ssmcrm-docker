import React, { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react';
import IconX from '../../../components/Icon/IconX';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { IRootState } from '../../../store';
import Swal from 'sweetalert2';
import { setCrmToken } from '../../../store/themeConfigSlice';
import { useAuth } from '../../../AuthContext';
export default function BulkUpdate({ bulkUpdateModal, setBulkUpdateModal, leadOwners, leadStatuses, leadSources, selectedRecords, fetchLeads, setSelectedRecords, setFirstTime }: any) {

    const { logout, crmToken, apiUrl } = useAuth();

    const dispatch = useDispatch();


    const [defaultParams] = useState({
        action: '',
        value: '',
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};

        if (!params.action) {
            errors = { ...errors, action: "action is required" };
        }
        if (!params.value) {
            errors = { ...errors, value: "value is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        if (name == 'action') setParams({ ...params, value: '' });
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const handleBulkUpdate = async (data: any) => {

        setIsBtnLoading(true)
        try {

            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/lead-bulk-update",
                data,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });



            if (response.data.status == "success") {


                setBulkUpdateModal(false)
                setSelectedRecords([])
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
                fetchLeads(1)
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
            if (error.response.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
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
        data.append("action", params.action);
        data.append("leads", JSON.stringify(selectedRecords.map((row: any) => row.id)));
        data.append("value", params.value);
        handleBulkUpdate(data);
    };
    return (
        <div className='mr-1'>

            <Transition appear show={bulkUpdateModal} as={Fragment}>
                <Dialog
                    as="div"
                    open={bulkUpdateModal}
                    onClose={() => {
                        setBulkUpdateModal(false);
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
                                        <h5>Bulk Lead Update ({selectedRecords.length} Leads)</h5>
                                        <button type="button" onClick={() => setBulkUpdateModal(false)} className="text-white-dark hover:text-dark">
                                            <IconX className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-3">
                                        <form autoComplete="off">
                                            <div className="relative mb-4">
                                                <select className="form-select text-white-dark" name="action" onChange={(e) => changeValue(e)}>
                                                    <option value={''}>Select DataType</option>
                                                    <option value={'owner'}>Lead Owner</option>
                                                    <option value={'status'}>Lead Status</option>
                                                    <option value={'source'}>Lead Source</option>
                                                </select>
                                            </div>

                                            {params.action == "owner" ? (<>
                                                <div className="relative mb-4">
                                                    <select id="dataType" className="form-select text-white-dark" name="value" onChange={(e) => changeValue(e)} value={params.value}>
                                                        <option value={''}>Select Owner</option>
                                                        {leadOwners?.slice(1).map((owner: any) => (
                                                            <option value={owner.value}>{owner.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </>) :
                                                params.action == "status" ? (<>
                                                    <div className="relative mb-4">
                                                        <select className="form-select text-white-dark" name="value" onChange={(e) => changeValue(e)} value={params.value}>
                                                            <option>Select Status</option>
                                                            {leadStatuses?.map((status: any) => (
                                                                <option value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </>) :
                                                    params.action == "source" ? (<>
                                                        <div className="relative mb-4">
                                                            <select className="form-select text-white-dark" name="value" onChange={(e) => changeValue(e)} value={params.value}>
                                                                <option value={""}>Select Source</option>
                                                                {leadSources?.map((source: any) => (
                                                                    <option value={source.value}>{source.value}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>) : null
                                            }

                                            <button type="button" onClick={() => formSubmit()} className="btn btn-primary w-full mt-6 mb-3" disabled={isBtnLoading ? true : !params.action ? true : false} >
                                                {isBtnLoading ? 'Please Wait...' : 'Update'}
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
