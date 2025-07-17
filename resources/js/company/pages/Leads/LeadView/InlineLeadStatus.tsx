import React from 'react'
import Swal from 'sweetalert2';
import { useState, useEffect, Fragment } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IRootState } from '../../../store';
import axios from 'axios';
import { IoCloseCircleSharp } from 'react-icons/io5';
import { useAuth } from '../../../AuthContext';
import Select from 'react-select';

export default function InlineLeadStatus({ statusModel, setStatusModel, selectedLead, leadStatus, fetchLeads, allLeadProducts }) {
    const { logout, crmToken, apiUrl } = useAuth();

    const [defaultParams] = useState({
        status: '',
        free_trial: '',
        followup: '',
        products: [],
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    useEffect(() => {
        if (selectedLead && statusModel) {
            setParams({ ...params, status: selectedLead.status, free_trial: selectedLead.free_trial, followup: selectedLead.followup })
            setErros({})
        }
    }, [statusModel, selectedLead])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
    };


    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.status) {
            errors = { ...errors, status: "status is required" };
        } else if (params.status == "Free Trial" && !params.free_trial) {
            errors = { ...errors, free_trial: "Free Trial Date Is Required" };
        } else if (params.status == "Follow Up" && !params.followup) {
            errors = { ...errors, followup: "Follow Up Date Is Required" };
        }

        if (params.status == 'Free Trial' && !params.products.length) {
            errors = { ...errors, products: 'products is mandatory' }
        }



        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const updateLeadStatus = async (formData: any) => {
        setIsBtnLoading(true)
        try {

            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/update-lead-status",
                data: formData,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                fetchLeads()
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
                setStatusModel(false)

                // const newData = { ...data };
                // const index = newData.data.findIndex((l: any) => l.id == selectedLead.id);
                // const newleads = newData.data;
                // newleads[index] = { ...newleads[index], status: params.status, free_trial: params.free_trial, followup: params.followup }
                // setData(newData)
            } else {
                Swal.fire({
                    icon: response.data.status,
                    title: response.data.title,
                    text: response.data.message,
                    padding: '2em',
                    customClass: 'sweet-alerts',
                });
            }


        } catch (error) {

            console.log(error)
            if (error?.response?.status == 401) logout()
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
        data.append("id", selectedLead.id);
        data.append("status", params.status);
        data.append('free_trial', params.free_trial)
        data.append('followup', params.followup)
        data.append("products", params?.products?.length ? JSON.stringify(params.products) : JSON.stringify([]));
        updateLeadStatus(data);
    };

    const formattedProducts = (products: any) => {
        if (products && products.length) return products.map((product: any) => ({
            value: product,
            label: product
        }))
        else return []
    };

    return (
    <Transition appear show={statusModel} as={Fragment}>
        <Dialog as="div" open={statusModel} onClose={() => setStatusModel(true)}>
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
                                <div className="font-bold text-lg">Update Lead Status </div>
                                <button type="button" onClick={() => setStatusModel(false)} className="text-white-dark hover:text-dark">
                                    <IoCloseCircleSharp size={25} color='black' />
                                </button>
                            </div>
                            <div className="p-5 bg-secondary-light">
                                <div className='flex justify-between items-center'>
                                    <div className="flex items-center">
                                        <div className="flex-none">
                                            <img src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${selectedLead?.first_name} ${selectedLead?.last_name}`} className="rounded-full h-12 w-12 object-cover" alt="" />
                                        </div>
                                        <div className="mx-3">
                                            <p className="mb-1 font-semibold">{selectedLead?.first_name} {selectedLead?.last_name}</p>
                                            <p className="text-xs text-white-dark">{selectedLead?.phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="badge bg-secondary">{selectedLead?.status}</span>
                                    </div>
                                </div>

                                <div className='m-4'>
                                    <select className='form-select' value={params?.status} name='status' onChange={(e) => changeValue(e)}>
                                        {leadStatus?.map((status: any, index: any) => (
                                            <option value={status} key={index}>{status}</option>
                                        ))}
                                    </select>
                                    <div className="text-danger text-[14px] font-bold mt-1">{errors.status}</div>
                                </div>
                                {
                                    params?.status == 'Free Trial'
                                    &&
                                    <>
                                        <div className='m-4'>
                                            <label className=' text-[13px]' >Free Trial</label>
                                            <input type="date" name="free_trial"
                                                className='form-input' defaultValue={params.free_trial}
                                                onChange={(e) => changeValue(e)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <div className="text-danger text-[14px] font-bold mt-1">{errors.free_trial}</div>
                                        </div>

                                        <div className='m-4'>
                                            <label >Products</label>
                                            <Select
                                                name='products'
                                                onChange={(e) => changeValue({ target: { name: 'products', value: e.map((a: any) => a.value) } })}
                                                value={formattedProducts(params.products)}
                                                options={allLeadProducts?.filter((d: any) => d.type == "Lead Products")}
                                                placeholder="Select Products"
                                                isMulti
                                                className=" text-white-dark"
                                                isSearchable={false} />
                                            <div className="text-danger mt-1">{errors.products}</div>
                                        </div>
                                    </>
                                }
                                {
                                    params?.status == 'Follow Up'
                                    &&
                                    <div className='m-4'>
                                        <label className=' text-[13px]' >Follow Up</label>
                                        <input type="date" name="followup"
                                            className='form-input' defaultValue={params.followup}
                                            onChange={(e) => changeValue(e)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <div className="text-danger text-[14px] font-bold mt-1">{errors.followup}</div>
                                    </div>
                                }
                                <div className="flex justify-end items-center mt-8">
                                    <button type="button" onClick={() => setStatusModel(false)} className="btn btn-sm btn-outline-danger">
                                        Discard
                                    </button>
                                    <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-sm btn-primary ltr:ml-4 rtl:mr-4">
                                        {isBtnLoading ? 'Please Wait...' : ' Update Status'}

                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </div>
        </Dialog>
    </Transition>)
}
