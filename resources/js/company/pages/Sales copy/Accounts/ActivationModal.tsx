import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

function ActivationModal({
    activateModal,
    setActivateModal,
    params,
    changeValue,
    validate,
    updateSaleApi,
    isBtnLoading,
    errors
}) {

    // Convert date to string format 'YYYY-MM-DD'
    const convertDateString = (t) => {
        let e = new Date(t), a = e.getFullYear(),
            n = String(e.getMonth() + 1).padStart(2, "0"),
            r = String(e.getDate()).padStart(2, "0");
        return `${a}-${n}-${r}`;
    };

    // Update sale information
    const update = async () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const da = new FormData();
        da.append("id", params.id);
        da.append("bank", params.bank);
        da.append("client_type", params.client_type);
        da.append("sale_service", params.sale_service);
        da.append("sale_upload_reciept", params.sale_upload_reciept);
        da.append("product_id", params.product_id);
        da.append("client_paid", params.client_paid);
        da.append("sale_date", params.sale_date ? convertDateString(params.sale_date) : '');
        da.append("start_date", params.start_date ? convertDateString(params.start_date) : '');
        da.append("due_date", params.due_date ? convertDateString(params.due_date) : '');
        da.append("description", params.description);
        da.append("status", params.status);
        da.append("is_verified", params.is_verified);
        da.append("is_complaince_verified", params.is_complaince_verified);
        da.append("is_account_verified", params.is_account_verified);
        da.append("is_manager_verified", params.is_manager_verified);
        da.append("is_service_activated", params.is_service_activated == 1 ? "0" : "1");
        await updateSaleApi(da);
        setActivateModal(false);
    };



    return (
        <Transition appear show={activateModal} as={Fragment}>
            <Dialog as="div" open={activateModal} onClose={() => { }}>
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
                                    <div className="text-lg font-bold">Sale Services Activation</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setActivateModal(false)}>
                                        x
                                    </button>
                                </div>
                                <div className="p-5">
                                    <p>
                                        Are you sure you want to  {params?.is_service_activated ? 'Block ' : 'Activate '} Services?
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 px-4">
                                        <div>
                                            <label >Start Date</label>
                                            <Flatpickr name="start_date"
                                                className={`form-input  `} value={params.start_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'start_date' } })} options={{ dateFormat: 'Y-m-d', position: "auto left" }} />
                                            <div className="text-danger font-semibold">{errors.start_date}</div>
                                        </div>
                                        <div>
                                            <label >Due Date</label>
                                            <Flatpickr name="due_date" value={params.due_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'due_date' } })} options={{ dateFormat: 'Y-m-d', position: "auto left", minDate: params.start_date }} className={`form-input  `} />
                                            <div className="text-danger font-semibold">{errors.due_date}</div>
                                        </div>
                                    </div>

                                    <div className='mt-2 px-4 flex-1'>
                                        <label>New Description <span className='text-red-600 text-[15px]'>*</span></label>
                                        <textarea name="description" className='form-textarea' onChange={(e) => changeValue(e)} value={params.description} rows={2}></textarea>
                                        <div className="text-danger font-semibold">{errors.description}</div>
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <button type="button" disabled={isBtnLoading} className={`btn  ${params?.is_service_activated ? 'btn-danger' : 'btn-success'} ltr:ml-4 rtl:mr-4`} onClick={() => update()}>
                                            {isBtnLoading ? 'Please Wait....' : params?.is_service_activated ? 'Block Services' : 'Activate Services'}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default ActivationModal;
