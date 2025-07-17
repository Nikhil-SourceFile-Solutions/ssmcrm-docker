import React, { useEffect, useState } from 'react'
import { Tab } from '@headlessui/react';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import PageLoader from '../../../components/Layouts/PageLoader';

export default function ProductGroup({ productGroupDrawer, setProductGroupDrawer, dropdowns }) {



    const { logout, crmToken, apiUrl } = useAuth()

    const [isLoading, setIsLoading] = useState(true);
    const [groups, setGroups] = useState([]);

    const fetchProductGroups = async () => {
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/product-groups",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setGroups(response.data.groups)
            }

            console.log(response)

        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {

        if (productGroupDrawer) fetchProductGroups()

    }, [productGroupDrawer])

    const [defaultParams] = useState({
        id: '',
        dropdown_id: '',
        group_name: '',
        status: ''
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        // console.table(params)
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.group_name) {
            errors = { ...errors, group_name: "group name is required" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const addOrUpdateProductprice = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/product-groups",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                fetchProductGroups()
                setAdd(false)
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
                setErros(serverErrors)

            }
        } finally {
            setBtnLoading(false)
        }
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("dropdown_id", params.dropdown_id);
        data.append("group_name", params.group_name);
        data.append("status", params.status);
        addOrUpdateProductprice(data);
    };

    const [add, setAdd] = useState(false);
    const [editGroup, setEditGroup] = useState(null)

    useEffect(() => {
        if (editGroup) setParams({
            id: editGroup.id,
            dropdown_id: editGroup.dropdown_id,
            group_name: editGroup.group_name,
            status: editGroup.status ? 1 : 0
        }); else setParams(defaultParams)
    }, [editGroup, add])


    const distroy = (group: any) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/product-groups/' + group.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        fetchProductGroups()
                    }
                }
                catch (error) {
                    if (error.response && error.response.status === 400) {

                    } else {

                    }
                }
                finally {

                }
            }
        });

    }
    return (
        <>
            <div className={`${(productGroupDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setProductGroupDrawer(!productGroupDrawer)}>
            </div>
            <nav className={`${(productGroupDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[800px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                        <form autoComplete="off" action="" method="post" className='p-0'>
                            <div className="mb-5">
                                <Tab.Group>
                                    <div className='flex justify-between mb-4 ' >
                                        <div className='text-lg bold' >Product Group</div>

                                        <button className='btn btn-sm btn-dark' type="button" onClick={() => {
                                            setEditGroup(null)
                                            setAdd(!add)
                                        }}>{add ? 'Back' : 'Add Group'}</button>
                                    </div>
                                    <hr className='mb-5' />



                                    {
                                        isLoading ? <PageLoader /> :
                                            add ? (
                                                <Tab.Panels>
                                                    <Tab.Panel>
                                                        <div className='mb-5 space-y-5'>

                                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                <div>
                                                                    <label>Product<span className=' text-red-600 text-md' >*</span></label>
                                                                    <select name="dropdown_id" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.dropdown_id ? params.dropdown_id : ''}>
                                                                        <option value={''}>Select Product</option>
                                                                        {dropdowns?.map((product) => (
                                                                            <option value={product.id}>{product.value}</option>
                                                                        ))}
                                                                    </select >
                                                                    {errors?.dropdown_id ? <div className="text-danger mt-1">{errors.dropdown_id}</div> : ''}
                                                                </div >
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                <div>
                                                                    <label>Group Name <span className=' text-red-600 text-md' >*</span></label>
                                                                    <input type="text" placeholder="Enter Product Group Name" className="form-input"
                                                                        name='group_name'
                                                                        value={params.group_name}
                                                                        onChange={(e) => changeValue(e)}
                                                                    />
                                                                    {errors?.group_name ? <div className="text-danger mt-1">{errors.group_name}</div> : ''}
                                                                </div>
                                                            </div>





                                                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                <div>
                                                                    <label >Status <span className=' text-red-600 text-md' >*</span></label>
                                                                    <select name="status" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.status ? params.status : ''}>
                                                                        <option value={''}>Select status</option>
                                                                        <option value={1}>Active</option>
                                                                        <option value={0}>Inactive</option>
                                                                    </select >
                                                                    {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                                                                </div >
                                                            </div>

                                                            <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn bg-[#1d67a7] text-white ltr:ml-4 rtl:mr-4">
                                                                {btnLoading ? 'Please wait' : params.id ? 'Update Group' : 'Add Group'}
                                                            </button>
                                                        </div>
                                                    </Tab.Panel>
                                                </Tab.Panels>) : (<div className="table-responsive mb-5">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Group</th>
                                                                <th>Product</th>
                                                                <th>Status</th>
                                                                <th className="float-right">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {groups?.map((data) => {
                                                                return (
                                                                    <tr key={data.id}>
                                                                        <td>
                                                                            <div className="whitespace-nowrap">{data.group_name}</div>
                                                                        </td>
                                                                        <td>{data.value}</td>
                                                                        <td>
                                                                            <span className={`badge  ${data.status ? 'bg-[#1abc9c]' : 'bg-red-500'}`}>{data.status ? 'Active' : 'Blocked'}</span>
                                                                        </td>

                                                                        <td className="text-center">


                                                                            <div className="flex gap-2 float-right">
                                                                                <button type="button" onClick={() => {
                                                                                    setEditGroup(data)
                                                                                    setAdd(true)
                                                                                }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>
                                                                                <button type="button" onClick={() => { distroy(data) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><MdDelete /></button>
                                                                            </div>

                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>)}





                                </Tab.Group>
                            </div>
                        </form>
                    </section>
                </div>
            </nav>
        </>
    )
}
