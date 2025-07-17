import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import React, { useState, Fragment, useEffect } from 'react';
import { AiFillCloseCircle } from "react-icons/ai";
import { useAuth } from '../../AuthContext';


interface Script {
    id: string;
    name: string;
    script: string;
    status: number;
}

interface AddOrUpdateProps {
    modal: boolean;
    setModal: (value: boolean) => void;
    script?: Script;
    fetchScripts: () => void;
}

export default function AddOrUpdate({ modal, setModal, script, fetchScripts }: AddOrUpdateProps) {

    const { logout, crmToken, apiUrl } = useAuth();
    const defaultParams: Script = {
        id: '',
        name: '',
        script: '',
        status: 1,
    };

    const [params, setParams] = useState<Script>(defaultParams);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {
        if (modal) {
            setParams(script ? {
                id: script.id,
                name: script.name,
                script: script.script,
                status: script.status ? 1 : 0,
            } : defaultParams);
            setErrors({});
        }
    }, [modal, script]);



    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!params.name) newErrors.name = "Name is required";
        if (!params.script) newErrors.script = "Script is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setParams(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleApiResponse = (response: any) => {
        if (response.data.status === 'success') {
            setModal(false);
            fetchScripts()
        } else {
            alert("Failed");
        }
    };

    const AddDropdown = async (data: FormData) => {
        setBtnLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/scripts`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${crmToken}`,
                },
            });
            handleApiResponse(response);
        } catch (error: any) {
            if (error.response?.status === 401) logout();
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;
                const newErrors: Record<string, string> = {};
                for (const key in serverErrors) {
                    newErrors[key] = serverErrors[key][0];
                }
                setErrors(newErrors);
            }
        } finally {
            setBtnLoading(false);
        }
    };

    const formSubmit = () => {
        if (!validate()) return;
        const data = new FormData();
        data.append("id", params.id);
        data.append("name", params.name);
        data.append("script", params.script);
        data.append("status", String(params.status));
        AddDropdown(data);
    };

    return (
        <Transition appear show={modal} as={Fragment}>
            <Dialog as="div" open={modal} onClose={() => setModal(false)}>
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
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[999]">
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
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-5xl my-8 text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <h5 className="font-bold text-lg">{params?.id ? 'Update' : 'Add'} Scripts</h5>
                                    <button onClick={() => setModal(false)} type="button" aria-label="Close modal" className="text-white-dark hover:text-dark">
                                        <AiFillCloseCircle size={30} color='red' />
                                    </button>
                                </div>



                                <div className="p-5">
                                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); formSubmit(); }}>
                                        <div>
                                            <label htmlFor="name">Script Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter Script Name"
                                                className="form-input"
                                                name='name'
                                                value={params.name}
                                                onChange={changeValue}
                                                required
                                            />
                                            {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                                        </div>
                                        <div>
                                            <label htmlFor="status">Status</label>
                                            <select
                                                className="form-select text-white-dark"
                                                name='status'
                                                value={params.status}
                                                onChange={changeValue}
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Blocked</option>
                                            </select>
                                            {errors.status && <div className="text-danger mt-1">{errors.status}</div>}
                                        </div>
                                        <div>
                                            <label htmlFor="script">Script</label>
                                            <textarea
                                                rows={10}
                                                className="form-textarea"
                                                placeholder="Enter Script"
                                                name='script'
                                                value={params.script}
                                                onChange={changeValue}
                                                required
                                            />
                                            {errors.script && <div className="text-danger mt-1">{errors.script}</div>}
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" onClick={formSubmit} disabled={btnLoading} className="btn btn-primary">
                                                {btnLoading ? 'Please Wait...' : params.id ? "Update Script" : 'Add Script'}
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
    );
}