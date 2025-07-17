import React, { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, Tab } from '@headlessui/react';
import IconX from '../../../../components/Icon/IconX';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import axios from 'axios';
import { setCrmToken } from '../../../../store/themeConfigSlice';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../AuthContext';
import PageLoader from '../../../../components/Layouts/PageLoader';

export default function TransferLead({ transferOwnerModal, setTransferOwnerModal, lead_id }: any) {

    const dispatch = useDispatch();
    const { logout, crmToken, authUser, apiUrl } = useAuth();



    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (transferOwnerModal) fetchLeadOwners()
    }, [transferOwnerModal])


    const [owners, setOwners] = useState([]);
    const fetchLeadOwners = async () => {
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-lead-owners",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setOwners(response.data.owners.filter((owner) => owner.id != authUser.id))
            }


        } catch (error) {
            console.log(error)

        } finally {
            setIsLoading(false)
        }
    }

    const [defaultParams] = useState({
        to_id: '',
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.to_id) {
            errors = { ...errors, to_id: "Employee is required" };
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


    const LeadTransfer = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/tranfer-lead",

                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });


            if (response.data.status == 'success') {
                showMessage(response.data.message)
                setParams(defaultParams)
                setTransferOwnerModal(false)
            } else { alert("Failed") }

        } catch (error: any) {
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
        data.append("to_id", params.to_id);
        data.append("lead_id", lead_id);
        LeadTransfer(data);
    };



    return (
        <div>
            <Transition appear show={transferOwnerModal} as={Fragment}>
                <Dialog
                    as="div"
                    open={transferOwnerModal}
                    onClose={() => {
                        setTransferOwnerModal(false);
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
                                        <h5>TransferOwner Client</h5>
                                        <button type="button" onClick={() => setTransferOwnerModal(false)} className="text-white-dark hover:text-dark">
                                            <IconX className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-3">

                                        {isLoading ? <PageLoader /> : (
                                            <form autoComplete="off">
                                                <div className="relative mb-4">
                                                    <select id="dataType" className="form-select text-white-dark" name='to_id' value={params.to_id} onChange={(e) => changeValue(e)}>
                                                        <option value={''}>Select Employee</option>
                                                        {owners.map((user: any, index: number) => (
                                                            <option value={user.id} key={index + 1}>{user.first_name} {user.last_name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="text-danger mt-1">{errors.to_id}</div>
                                                </div>

                                                <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-full">
                                                    {isBtnLoading ? 'Please Wait' : 'Transer'}
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
