import React, { useEffect, useState } from 'react'
import { Tab } from '@headlessui/react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import Swal from 'sweetalert2';
import PageLoader from '../../../components/Layouts/PageLoader';
export default function CreateOrUpdate({ showProductSalesDrawer, setShowProductSalesDrawer, fetchProductprice, editProduct }) {

    const { apiUrl, crmToken, logout } = useAuth();


    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState<any>([]);

    const fetchData = async () => {

        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/products/create",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") setData(response.data.data)
        } catch (error) {

        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {
        if (showProductSalesDrawer) fetchData()
    }, [showProductSalesDrawer])

    const [defaultParams] = useState({
        id: '',
        dropdown_id: '',
        product_group_id: '',
        pro_name: '',
        pro_price: '',
        pro_duration: '',
        pro_status: ''
    });
    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {

        if (editProduct) setParams({
            id: editProduct.id,
            dropdown_id: editProduct.dropdown_id,
            product_group_id: editProduct.product_group_id,
            pro_name: editProduct.pro_name,
            pro_price: editProduct.pro_price,
            pro_duration: editProduct.pro_duration,
            pro_status: editProduct.pro_status ? 1 : 0
        }); else setParams(defaultParams)

    }, [editProduct])

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        // console.table(params)
    };

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.dropdown_id) {
            errors = { ...errors, dropdown_id: "Product Type is required" };
        }

        if (!params.product_group_id) {
            errors = { ...errors, product_group_id: "Product Group is required" };
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
                url: apiUrl + "/api/products",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message)

                setParams(defaultParams)
                fetchProductprice()
                setShowProductSalesDrawer(false);
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
                showMessage('Server Validation Error! Please Solve')
            }
        } finally {
            setBtnLoading(false)
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
        data.append("id", params.id);
        data.append("dropdown_id", params.dropdown_id);
        data.append("pro_name", params.pro_name);
        data.append("pro_price", params.pro_price);
        data.append("pro_duration", params.pro_duration);
        data.append("pro_status", params.pro_status);
        data.append("product_group_id", params.product_group_id);
        addOrUpdateProductprice(data);
    };

    const UpdateProductprice = (data: any) => {
        setErros({});
        if (data) {
            setParams({
                id: data.id,
                dropdown_id: data.dropdown_id,
                pro_name: data.pro_name,
                pro_price: data.pro_price,
                pro_duration: data.pro_duration,
                product_group_id: data.product_group_id,
                pro_status: data.pro_status ? "1" : "0"
            });
            setShowProductSalesDrawer(true)
        }
    }
    return (
        <>
            <div className={`${(showProductSalesDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowProductSalesDrawer(!showProductSalesDrawer)}>
            </div>
            <nav className={`${(showProductSalesDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                } bg-white fixed ltr:-right-[500px] rtl:-left-[500px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                        {isLoading ? <PageLoader /> : (
                            <form autoComplete="off" action="" method="post" className='p-0'>
                                <div className="mb-5">
                                    <Tab.Group>
                                        <div className='flex justify-between mb-4 ' >
                                            <div className='text-lg bold' >Product Sales</div>
                                            {params.id ? <button className='btn btn-sm btn-primary'>Add Product Sales</button> : ''}
                                        </div>
                                        <hr className='mb-5' />
                                        <Tab.Panels>
                                            <Tab.Panel>
                                                <div className='mb-5 space-y-5'>
                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                        <div>
                                                            <label >Products <span className=' text-red-600 text-md' >*</span></label>
                                                            <select name="dropdown_id" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.dropdown_id ? params.dropdown_id : ''}>
                                                                <option value={''}>Select Product</option>
                                                                {data?.dropdowns?.map((dropdown) => (<option value={dropdown.id}>{dropdown.value}</option>
                                                                ))}
                                                            </select>
                                                            {errors?.dropdown_id ? <div className="text-danger mt-1">{errors.dropdown_id}</div> : ''}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                        <div>
                                                            <label >Product Group <span className=' text-red-600 text-md' >*</span></label>
                                                            <select name="product_group_id" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.product_group_id ? params.product_group_id : ''}>
                                                                <option value={''}>Select Group</option>
                                                                {data?.groups?.filter((a) => a.dropdown_id == params.dropdown_id).map((dropdown) => (<option value={dropdown.id}>{dropdown.group_name}</option>
                                                                ))}
                                                            </select>
                                                            {errors?.product_group_id ? <div className="text-danger mt-1">{errors.product_group_id}</div> : ''}
                                                        </div>
                                                    </div>


                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                        <div>
                                                            <label >Product Name <span className=' text-red-600 text-md' >*</span></label>
                                                            <input type="text" placeholder="Enter Product Name" className="form-input"
                                                                name='pro_name'
                                                                value={params.pro_name}
                                                                onChange={(e) => changeValue(e)}
                                                            />
                                                            {errors?.pro_name ? <div className="text-danger mt-1">{errors.pro_name}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                        <div>
                                                            <label >Product Price <span className=' text-red-600 text-md' >*</span></label>
                                                            <input type="text" placeholder="Enter Product Price" className="form-input"
                                                                name='pro_price'
                                                                value={params.pro_price}
                                                                onChange={(e) => changeValue(e)}
                                                            />
                                                            {errors?.pro_price ? <div className="text-danger mt-1">{errors.pro_price}</div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                        <div>
                                                            <label >Product Duration</label>
                                                            <input type="text" placeholder="Enter Product Duration" className="form-input"
                                                                name='pro_duration'
                                                                value={params.pro_duration}
                                                                onChange={(e) => changeValue(e)}
                                                            />
                                                            {errors?.pro_duration ? <div className="text-danger mt-1">{errors.pro_duration}</div> : ''}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                        <div>
                                                            <label >Status <span className=' text-red-600 text-md' >*</span></label>
                                                            <select name="pro_status" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.pro_status ? params.pro_status : ''}>
                                                                <option value={''}>Select status</option>
                                                                <option value={1}>Active</option>
                                                                <option value={0}>Inactive</option>
                                                            </select >
                                                            {errors?.pro_status ? <div className="text-danger mt-1">{errors.pro_status}</div> : ''}
                                                        </div >
                                                    </div>
                                                    <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn bg-[#1d67a7] text-white ltr:ml-4 rtl:mr-4">
                                                        {btnLoading ? 'Please wait' : params.id ? 'Update Product Price' : 'Add Product Price'}
                                                    </button>
                                                </div>
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </nav>
        </>
    )
}
