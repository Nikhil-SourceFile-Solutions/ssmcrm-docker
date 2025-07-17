import React, { useCallback, useEffect, useRef, useState } from 'react'
import { IoMdClose, IoMdRefresh } from 'react-icons/io'
import PageLoader from '../../../components/Layouts/PageLoader';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Swal from 'sweetalert2';
import Log from './Log';
import { GoTrash } from 'react-icons/go';
import IconCaretDown from '../../../components/Icon/IconCaretDown';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SalesHistory from '../../Leads/LeadView/Show/SalesHistory';
import SalesInvoice from '../SalesInvoice';
import EditLead from '../EditLead';
import { MdVerified } from "react-icons/md";
import ActivationModal from './ActivationModal';
export default function Show({ selectedLead, setSelectedLead, fL }) {

    const location = useLocation();
    const navigate = useNavigate();



    const { sale_id, filterOwner, filterStatus,team} = location.state || {};

    const { logout, crmToken, authUser, apiUrl, settingData } = useAuth();

    const [isLoading, setIsLoading] = useState(true);



    const safeJSONParse = (data) => {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            return null; // Return a fallback value (e.g., null or empty object/array)
        }
    };


    const whoCanApprove = safeJSONParse(settingData?.who_can_approve_expire_pause_sales);
    const whoCanVerify = safeJSONParse(settingData?.who_can_verify_sales);
    const whoCanVerifyCompliance = safeJSONParse(settingData?.who_can_verify_complaince_verification);

    // console.log("whoCanApprove", whoCanApprove)

    // console.log("whoCanVerify", whoCanVerify)

    // console.log("whoCanVerifyCompliance", whoCanVerifyCompliance)

    // console.log("authUser", authUser.user_type)



    const [id, setId] = useState(sale_id);

    useEffect(() => {
        if (id) fetchSalesData(id)
    }, [sale_id])

    const defaultParams = {
        bank: '',
        client_type: '',
        sale_service: '',
        sale_date: '',
        start_date: '',
        due_date: '',
        sale_upload_reciept: '',
        product_id: '',
        sale_price: '',
        client_paid: '',
        offer_price: '',

        description: '',
        is_custom_price: 0,
        is_verified: 0,
        is_complaince_verified: 0,
        is_account_verified: 0,
        is_manager_verified: 0
    };

    const [params, setParams] = useState<any>([]);
    const [data, setData] = useState<any>([]);
    const [logoPriview, setLogoPriview] = useState<any>('https://dummyimage.com/600x400/000/fff');


    useEffect(() => {
        if (data && Object.keys(data).length) {
            setParams({
                ...data.sale,
                sale_date: data?.sale?.sale_date ? new Date(data?.sale?.sale_date) : '',
                start_date: data?.sale?.start_date ? new Date(data?.sale?.start_date) : '',
                due_date: data?.sale?.due_date ? new Date(data?.sale?.due_date) : '',
                sale_upload_reciept: '',

                description: ''
            })


            convertImageToBase64(apiUrl + '/storage/' + data?.sale?.sale_upload_reciept ? apiUrl + '/storage/' + data?.sale?.sale_upload_reciept : '')
                .then((base64String) => {
                    setDownloadUrl(base64String)
                })
                .catch((error) => console.error(error));
            setLogoPriview(apiUrl + '/storage/' + data?.sale?.sale_upload_reciept ? apiUrl + '/storage/' + data?.sale?.sale_upload_reciept : '')

        }
        else setParams(defaultParams)
    }, [data])


    const [fetchingError, setFetchingError] = useState(null);
    const [invoice, setInvoice] = useState([]);

    const [verification, setVerification] = useState([]);
    const fetchSalesData = async (sale_id, action = null) => {
        setData([]);
        setParams([]);
        setIsLoading(true)
        setFetchingError(null)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/sales/' + sale_id,
                params: { action: action, filterOwner, filterStatus },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
                setVerification(response.data.data.verification)
                setId(response.data.data.id)
                setInvoice(response.data.invoiceSetting);
            } else setData(null)
        } catch (error) {

            console.log(error)
            setFetchingError(error)
            if (error?.response?.status == 401) logout()

        } finally {
            setIsLoading(false)
        }
    }

    const [errors, setErrors] = useState<any>({});
    const [isBtnLoading, setIsBtnLoading] = useState(false);




    const changeValue = (e: any) => {
        const { value, files, name } = e.target;
        setErrors({ ...errors, [name]: "" });
        if (name == 'bank') {
            const selectedOption = e.target.options[e.target.selectedIndex];

            const a = selectedOption.dataset.is_bank;
            setParams({ ...params, is_bank: a, [name]: value });
        }
        setParams({ ...params, [name]: value });
    };


    const fileLogoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (params.sale_price && params.client_paid) {
            let offerPrice: any = '', is_custom_price: any = 0;
            if (Number(params.client_paid)) {

                if (Number(params.client_paid) <= Number(params.sale_price)) offerPrice = params.sale_price - params.client_paid
                else offerPrice = 0;
            } else offerPrice = '';

            is_custom_price = (parseFloat(params.client_paid) > parseFloat(params.sale_price)) ? 1 : 0;

            setErrors({ ...errors, offer_price: "", client_paid: "" });
            setParams({ ...params, offer_price: offerPrice, is_custom_price: is_custom_price });
        }
    }, [params.sale_price, params.client_paid])

    useEffect(() => {
        if (params.product_id) {
            const product: any = data?.products.find((p: any) => p.id == params.product_id);
            setErrors({ ...errors, product_id: "" });
            setParams({ ...params, product_id: product.id, product_pricr: product.pro_price, sale_price: product.pro_price });

        }
    }, [params.product_id])


    function validatePositiveNumber(value: any) {
        const positiveNumberPattern = /^[0-9]+(\.[0-9]+)?$/;
        if (positiveNumberPattern.test(value) && parseFloat(value) > 0)
            return true;
        else
            return false;
    }

    const validate = () => {
        setErrors({});
        let errors = {};
        if (!params.product_id) {
            errors = { ...errors, product_id: "product is required" };
        }
        if (!params.bank) {
            errors = { ...errors, bank: "bank is required" };
        }
        if (!params.client_type) {
            errors = { ...errors, client_type: "client type is required" };
        }



        if (!params.description) {
            errors = { ...errors, description: "new description is required" };
        }

        if (!params.client_paid) {
            errors = { ...errors, client_paid: "client paid is required" };
        } else if (!validatePositiveNumber(params.client_paid)) {
            errors = { ...errors, client_paid: "invalid amount" };
        }

        if (params.due_date && params.start_date > params.due_date) {
            errors = { ...errors, due_date: "Due Date can not be less than start date" };
        }



        if (!params.sale_service) {
            errors = { ...errors, sale_service: "sale service is required" };
        } else if (!JSON.parse(params.sale_service).length) {
            errors = { ...errors, sale_service: "sale service is required" };
        }
        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const updateSaleApi = async (da: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/sales",
                data: da,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                Swal.fire({
                    icon: response.data.status,
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
                const newData = data;
                newData.sale = response.data.sale


                setData({
                    ...data,
                    sale: response.data.sale,
                });

                setVerification((prevVerifications) => ({
                    ...prevVerifications,
                    employeeVerification: response.data.employeeVerification
                }));


                return response.data

            }
            else {
                alert("Failed")

            }

        } catch (error: any) {

            if (error.response.status == 401) logout()
            if (error?.response?.status === 422) {
                const serveErrors = error.response.data.errors;
                let serverErrors = {};
                for (var key in serveErrors) {
                    serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                    console.log(serveErrors[key][0])
                }
                setErrors(serverErrors);
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

            return 1;
        }
    }

    const formSubmit = () => {
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




        updateSaleApi(da);
    }



    function convertDateString(t) {
        let e = new Date(t), a = e.getFullYear(),
            n = String(e.getMonth() + 1).padStart(2, "0"),
            r = String(e.getDate()).padStart(2, "0");
        return `${a}-${n}-${r}`
    }

    const deleteSale = async () => {
        Swal.fire({
            title: 'Are you sure?',
            icon: "question",
            confirmButtonText: 'Yes Delete',
            text: '',
            showLoaderOnConfirm: true,
            showCancelButton: true,
            cancelButtonText: "Nope",
            customClass: 'sweet-alerts',
            allowOutsideClick: false,
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/sales/' + sale_id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + crmToken
                        }
                    })
                    if (response.data.status == "success") {


                        navigate('/sales')
                        Swal.fire({
                            icon: response.data.status,
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
                            title: response.data.title,
                            text: response.data.message,
                            footer: response.data.description,
                            confirmButtonText: 'Ok',
                            customClass: 'sweet-alerts',
                            allowOutsideClick: false,
                        });
                    }
                } catch (error) {
                    console.log(error)
                }
            },
        });
    }


    //###################################################

    const [salesHistoryDrawer, setSalesHistoryDrawer] = useState(false);
    const [logDrawer, setLogDrawer] = useState(false);
    const [saleInvoiceModal, setSaleInvoiceModal] = useState(false);
    const [leadModal, setLeadModal] = useState(false);

    const [downloadUrl, setDownloadUrl] = useState(''); // Stores uploaded file URL for download

    const setImage = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setErrors({ ...errors, sale_upload_reciept: 'Please select a file.' });
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const maxSizeInBytes = 3 * 1024 * 1024; // 2MB

        // Validate file type
        if (!validTypes.includes(file.type)) {
            setErrors({ ...errors, sale_upload_reciept: 'Invalid file type. Only JPG, PNG, and PDF allowed.' });
            return;
        }

        // Validate file size
        if (file.size > maxSizeInBytes) {
            setErrors({ ...errors, sale_upload_reciept: 'File size must not exceed 2 MB.' });
            return;
        }
        setErrors({ ...errors, sale_upload_reciept: '' }); // Clear errors
        setParams({ ...params, sale_upload_reciept: file }); // Store the file in state

        // Generate preview for images or set a PDF icon
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPriview(reader.result); // Set image preview
                setDownloadUrl(reader.result); // Set download URL for the image
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPriview(''); // PDF icon
            setDownloadUrl(URL.createObjectURL(file)); // Set download URL for PDF
        }
    };


    const convertImageToBase64 = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error('Failed to load image.');

            const blob = await response.blob();
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result); // Base64 string
                reader.onerror = (error) => reject('Error reading image: ' + error);
                reader.readAsDataURL(blob); // Convert Blob to Base64
            });
        } catch (error) {
            console.error('Error converting image to Base64:', error);
            throw error;
        }
    };

    const [fileName, setFileName] = useState(""); // Initial text

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFileName(uploadedFile.name); // Update with file name
        }
        setImage(e)
    };

    const handleClick = (e) => {
        fileLogoRef.current.click(); // Trigger file input click
        setImage(e)

    };

    const [isDownloading, setIsDownloading] = useState(false);


    const downloadInvoice = async () => {

        setIsDownloading(true)
        try {

            const response = await
                axios({
                    url: apiUrl + '/api/download-invoice',
                    method: 'GET',
                    params: { id: sale_id },
                    responseType: 'blob',
                    headers: {
                        Authorization: 'Bearer ' + crmToken,
                    }
                }).then((response) => {
                    const href = URL.createObjectURL(response.data);

                    const link = document.createElement('a');
                    link.href = href;
                    link.setAttribute('download', 'invoice-' + sale_id + '-.pdf');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(href);
                });
            console.log(response)

        } catch (error) {

        } finally {
            setIsDownloading(false)
        }
    }


    const [activateModal, setActivateModal] = useState(false);
    const activateService = async (e) => {
        setActivateModal(true)
    }



    return (
        <>
            <div className='panel'>
                {fetchingError ? <Error error={fetchingError} fetch={fetchSalesData} id={id} /> : (
                    !data ? (
                        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
                            <h1 className='text-5xl font-extrabold'>No More Sales</h1>

                            <div className='space-x-4'>
                                <NavLink to={team ? '/team-sales' : '/sales'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Sales Table</NavLink>
                            </div>
                        </div>
                    ) : (<>
                        <div className='flex justify-between gap-4 items-center'>


                            <b className='text-[20px] font-extrabold'>Sale #{data?.sale?.id}</b>

                            <div className='flex gap-3 justify-end '>


                                {settingData.invoice_enabled ? invoice?.invoice_type == 'Auto Invoice' ?
                                    <>
                                        {data?.sale?.status == 'Approved' && (authUser.user_type === 'Admin' || authUser.user_type === 'Accounts') ?
                                            <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => downloadInvoice()}>Download Invoice</button> : null

                                        }
                                    </>
                                    : <>
                                        {data?.sale?.status == 'Approved' && (authUser.user_type === 'Admin' || authUser.user_type === 'Accounts') ?
                                            <button className='btn btn-outline-primary mr-[15px] btn-sm' onClick={() => setSaleInvoiceModal(true)}>Generate Invoice</button> : null

                                        }
                                    </> : null}






                                <button className='btn btn-info shadow' onClick={() => setSalesHistoryDrawer(true)}>Sales History</button>
                                <button className='btn btn-info shadow' onClick={() => setLogDrawer(true)}>Status History</button>

                                {authUser?.user_type == "Admin" || authUser.user_type == "Accounts" ? (<button onClick={() => deleteSale()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                    <GoTrash className="w-5 h-5" />
                                </button>) : null}


                                <button type="button" onClick={() => fetchSalesData(id, 'prv')}
                                    className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                                </button>
                                <button type="button" onClick={() => fetchSalesData(id, 'nxt')}
                                    className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                                </button>


                                <button onClick={() => fetchSalesData(id)} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IoMdRefresh className="w-5 h-5" />
                                </button>

                                  <button onClick={() =>
                                                                   navigate(team ? '/team-sales' : '/sales')}
                                                                   className="bg-[red]/50 rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                                   <IoMdClose className="w-5 h-5" />
                                                               </button>
                            </div>


                        </div>
                        <hr className='my-4 dark:border-[#3b3f5c]' />
                        {isLoading ? <PageLoader /> : (
                            <>
                                <div className='mt-4 rounded bg-[#fafafa] dark:bg-[#060818]'>
                                    <div className=' p-4 flex justify-between'>
                                        <span ><b>Sales Details</b></span>
                                        <div className='flex gap-5'>
                                            {settingData?.sales_verification_enabled ? <span className={`badge ${data?.sale?.is_verified ? 'bg-[#075E54]' : 'bg-[#ef4444]'}`}>Sale {data?.sale?.is_verified ? 'Verified' : 'Not Verified'}</span> : null}
                                            <span className={`badge ${data?.sale?.is_approved ? 'bg-[#075E54]' : 'bg-[#ef4444]'}`}>Sale {data?.sale?.is_approved ? 'Approved' : 'Not Approved'}</span>

                                            {data?.sale?.is_approved && whoCanApprove.includes(authUser.user_type) ? (<div className='flex gap-4 items-center bg-[#ece7f7] dark:!bg-[#191e3a] px-4 rounded-lg'>
                                                <b >Activate Service</b>
                                                <div className="flex flex-col gap-2">
                                                    <label className="w-12 h-6 relative m-0">
                                                        <input type="checkbox" name='is_service_activated' value={data?.sale?.is_service_activated ? data?.sale?.is_service_activated : ''} onChange={(e) => { activateService(e) }} checked={data?.sale?.is_service_activated == 1 ? true : false} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" />
                                                        <span className={` outline_checkbox border-2 border-[#d15553]  block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553]  before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                    </label>
                                                </div>
                                            </div>) : null}


                                        </div>
                                        <span> <b>Created At : {data?.sale?.created_at}</b></span>
                                    </div>

                                    <div className='flex justify-around gap-5 mx-5 mb-4'>


                                        <div className="flex items-center panel p-3 w-full">
                                            <img className="w-[60px] rounded-md ltr:mr-3 rtl:ml-3 object-cover" src={`https://ui-avatars.com/api/?background=random&name=${data?.owner?.first_name + data?.owner?.last_name}`} alt="avatar" />
                                            <div>
                                                <p> <b>{data?.owner?.employee_id} | {data?.owner?.first_name}  {data?.owner?.last_name}</b></p>
                                                <p> <b>{data?.owner?.user_type}</b></p>
                                                <b>{data?.owner?.email}</b>
                                            </div>
                                        </div>





                                        <div className="flex items-center panel p-3 w-full">
                                            <img className="w-[60px] rounded-md ltr:mr-3 rtl:ml-3 object-cover" src={`https://ui-avatars.com/api/?background=random&name=${data?.lead?.first_name + data?.lead?.last_name}`} alt="avatar" />
                                            <div className="flex-grow">
                                                <p> <b>#{data?.lead?.id} | {data?.lead?.first_name} {data?.lead?.last_name}</b></p>
                                                <p> <b>{data?.lead?.phone} | {data?.lead?.second_phone}</b></p>
                                                <b>{data?.lead?.state}</b>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <button className="btn btn-sm btn-warning shadow"
                                                    onClick={() => setLeadModal(true)}>Edit Lead</button>
                                            </div>
                                        </div>

                                        <div className='items-center panel p-3 w-full'>
                                            <label >Current Status</label>
                                            <select name="status" className="form-select text-white-dark"
                                                value={params.status} onChange={(e) => changeValue(e)}
                                                disabled={whoCanApprove.includes(authUser.user_type) ? false : true}
                                            >
                                                {data?.dropdowns?.filter((d: any) => d.type == 'Sale Status')?.map((status: any) => (
                                                    <option key={status.id}>{status.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger font-semibold">{errors.status}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-2 px-4">

                                        <div>
                                            <label>Bank Details </label>
                                            <select name="bank" className="form-select text-white-dark" value={params.bank} onChange={(e) => changeValue(e)}
                                                disabled={
                                                    !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && data?.sale?.status !== "Pending" ? true : false
                                                }>
                                                <option value="" disabled >Select Bank Details</option>
                                                {data?.banks?.map((address, index) => (
                                                    <option key={index + 1} value={address.id}>{address.is_bank_upi == 'bank' ? 'Bank - ' + address.bank_name : 'Upi - ' + address.upi}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger font-semibold"></div>
                                        </div>
                                        <div>
                                            <label >Client Type</label>
                                            <select name="client_type" className="form-select text-white-dark"
                                                value={params.client_type} onChange={(e) => changeValue(e)}

                                                disabled={
                                                    !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && data.sale?.status !== "Pending" ? true : false
                                                }
                                            >
                                                <option value="" disabled >Select Client Type</option>
                                                {data?.dropdowns?.filter((d: any) => d.type == 'Client Type')?.map((client: any) => (
                                                    <option key={client.id}>{client.value}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger font-semibold"></div>
                                        </div>
                                        <div >
                                            <label >Product</label>
                                            <select name="product_id" className="form-select text-white-dark" value={params.product_id} onChange={(e: any) => changeValue(e)}
                                                disabled={
                                                    !(authUser.user_type === "Admin" || authUser.user_type === "Accounts") && data.sale?.status !== "Pending" ? true : false
                                                }
                                            >
                                                <option value="" disabled >Select Product</option>
                                                {data?.products?.map((product: any) => (
                                                    <option key={product.id} value={product.id}>{product.pro_name}</option>
                                                ))}
                                            </select>
                                            <div className="text-danger font-semibold">{errors.product_id}</div>
                                        </div>
                                        <div>
                                            <label>Sale Price</label>
                                            <input
                                                name='sale_price'
                                                type="text"
                                                value={params.sale_price}
                                                onChange={(e) => changeValue(e)}
                                                placeholder=""
                                                className="form-input bg-info-light"
                                                disabled={true}
                                            />
                                            <div className="text-danger mt-1">{errors.sale_price}</div>
                                        </div>


                                        <div>
                                            <label >Client Paid <span className='text-red-600 text-[15px]'>*</span>
                                                {params.is_custom_price ? (<span className="mx-2 badge bg-[#ef4444]">Custom Price</span>) : null}
                                            </label>
                                            <input
                                                name='client_paid'
                                                className={`form-input ${!params.sale_price || data?.sale?.status == "Approved" ? 'bg-[#ece7f7]' : ''} `}
                                                type="tel"
                                                value={params.client_paid}
                                                onChange={(e) => changeValue(e)}
                                                placeholder="Enter Amount"

                                                disabled={!params.sale_price || data?.sale?.status === "Approved"} />
                                            <div className="text-danger mt-1">{errors.client_paid}</div>
                                        </div>


                                        <div>
                                            <label>Offer Price</label>
                                            <input
                                                name='offer_price'
                                                type="text"
                                                value={params.offer_price}
                                                className="form-input bg-info-light"
                                                disabled
                                            />
                                            <div className="text-danger mt-1">{errors.offer_price}</div>
                                        </div>

                                        <div>
                                            <label >Sale Date</label>
                                            <Flatpickr
                                                name="sale_date"
                                                className={`form-input ${data?.sale?.status == "Approved" ? 'bg-[#ece7f7]' : ''} `}
                                                value={params.sale_date}
                                                onChange={(e) => changeValue({ target: { value: e[0], name: 'sale_date' } })}
                                                options={{ dateFormat: 'Y-m-d', position: "auto left" }}
                                            // disabled={data?.sale?.status == "Approved"}
                                            />
                                            <div className="text-danger font-semibold">{errors.sale_date}</div>
                                        </div>
                                        <div>
                                            <label >Start Date</label>
                                            <Flatpickr name="start_date"
                                                className={`form-input ${data?.sale?.status == "Approved" ? 'bg-[#ece7f7]' : ''} `} value={params.start_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'start_date' } })} options={{ dateFormat: 'Y-m-d', position: "auto left" }}
                                                disabled={
                                                    !(authUser.user_type === "Admin" || authUser.user_type === "Accounts")
                                                    // ||
                                                    // data?.sale?.status === "Approved"
                                                }
                                            />
                                            <div className="text-danger font-semibold">{errors.start_date}</div>
                                        </div>
                                        <div>
                                            <label >Due Date</label>
                                            <Flatpickr name="due_date" value={params.due_date} onChange={(e) => changeValue({ target: { value: e[0], name: 'due_date' } })} options={{ dateFormat: 'Y-m-d', position: "auto left", minDate: params.start_date }}
                                                disabled={
                                                    !(authUser.user_type === "Admin" || authUser.user_type === "Accounts")
                                                    //  ||
                                                    // data?.sale?.status === "Approved"
                                                }
                                                className={`form-input ${data?.sale?.status == "Approved" ? 'bg-[#ece7f7]' : ''} `} />
                                            <div className="text-danger font-semibold">{errors.due_date}</div>
                                        </div>

                                        <div className="mb-5">
                                            <div className="flex items-center space-x-4">
                                                <label htmlFor="file-upload" className="custom-file-upload">
                                                    Upload Receipt
                                                </label>

                                                {/* Download Button */}
                                                {
                                                    (fileName || data?.sale?.sale_upload_reciept) && (<>
                                                        {downloadUrl && (
                                                            <a
                                                                href={downloadUrl}
                                                                download={params.sale_upload_reciept?.name || 'download'}
                                                                className=" badge   bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                Download
                                                            </a>
                                                        )}
                                                    </>)
                                                }


                                            </div>



                                            <div>


                                                <button type="button" onClick={handleClick} className="upload-receipt flex justify-start pl-2">
                                                    {fileName ? (
                                                        fileName
                                                    ) : data?.sale?.sale_upload_reciept ? (
                                                        <a
                                                            href={data?.sale?.sale_upload_reciept}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                                        >
                                                            Uploaded! Download to view
                                                        </a>
                                                    ) : (
                                                        "Upload Receipt"
                                                    )}
                                                </button>
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    onChange={handleFileChange}
                                                    accept="*"
                                                    className="upload-receipt"
                                                    ref={fileLogoRef}
                                                    style={{ display: 'none' }} // Hide the default input
                                                />
                                            </div>


                                            {/* Error Message */}
                                            {errors?.sale_upload_reciept && (
                                                <div className="text-danger mt-1">{errors.sale_upload_reciept}</div>
                                            )}
                                        </div>


                                    </div>

                                    <div className='px-4'>
                                        <label >Sale Description</label>
                                        <textarea name="description" disabled className='form-textarea bg-[#e4e4e4]' value={data?.sale?.description} rows={2}></textarea>
                                    </div>


                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-2 px-4 ">


                                        {data?.sale?.is_approved ? (
                                            <EmployeeVerification title="Sale Approved" data={data?.verification?.employeeVerification?.find(verification => verification.verification_type === "Approved")} />)
                                            :
                                            null}

                                        {settingData?.sales_verification_enabled ? (<>

                                            {settingData?.sales_verification_enabled ? data?.sale?.is_verified ? (
                                                <EmployeeVerification title="Sale Verified" data={data?.verification?.employeeVerification?.find(verification => verification.verification_type === "Verified")} />)
                                                :
                                                whoCanVerify.includes(authUser?.user_type) ? (<div >
                                                    <label >Sale Verification</label>
                                                    <select name="is_verified" className="form-select text-white-dark"
                                                        value={params.is_verified} onChange={(e) => changeValue(e)}
                                                    >
                                                        <option value="0" >Pending</option>
                                                        <option value="1" >Verified</option>
                                                    </select>
                                                    <div className="text-danger font-semibold">{errors.is_verified}</div>
                                                </div>)
                                                    : null : null}



                                            {settingData?.sales_verification_enabled && settingData?.has_manager_verification ? data?.sale?.is_manager_verified ? (<EmployeeVerification title="Manager Verified" data={data?.verification?.employeeVerification?.find(verification => verification.verification_type === "Manager")} />)
                                                :
                                                authUser?.user_type == "Manager" ? (<div >
                                                    <label >Manager Verification</label>
                                                    <select name="is_manager_verified" className="form-select text-white-dark"
                                                        value={params.is_manager_verified} onChange={(e) => changeValue(e)}

                                                    >
                                                        <option value="0" >Pending</option>
                                                        <option value="1" >Verified</option>
                                                    </select>
                                                    <div className="text-danger font-semibold">{errors.is_manager_verified}</div>
                                                </div>) : null : null}

                                            {settingData?.sales_verification_enabled && settingData?.has_accounts_verification ? data?.sale?.is_account_verified ? (<EmployeeVerification title="Accounts Verified" data={data?.verification?.employeeVerification?.find(verification => verification.verification_type === "Accounts")} />)
                                                :
                                                authUser?.user_type == "Accounts" ? (<div >
                                                    <label >Accounts Verification</label>
                                                    <select name="is_account_verified" className="form-select text-white-dark"
                                                        value={params.is_account_verified} onChange={(e) => changeValue(e)}

                                                    >
                                                        <option value="0" >Pending</option>
                                                        <option value="1" >Verified</option>
                                                    </select>
                                                    <div className="text-danger font-semibold">{errors.is_account_verified}</div>
                                                </div>) : null : null}


                                            {settingData?.sales_verification_enabled && settingData?.has_complaince_verification ? data?.sale?.is_complaince_verified ? (<EmployeeVerification title="Complaince Verified" data={data?.verification?.employeeVerification?.find(verification => verification.verification_type === "Compliance")} />)
                                                :
                                                whoCanVerifyCompliance.includes(authUser?.user_type) ? (<div >
                                                    <label >Complaince Verification</label>
                                                    <select name="is_complaince_verified" className="form-select text-white-dark"
                                                        value={params.is_complaince_verified} onChange={(e) => changeValue(e)}

                                                    >
                                                        <option value="0" >Pending</option>
                                                        <option value="1" >Verified</option>
                                                    </select>
                                                    <div className="text-danger font-semibold">{errors.is_complaince_verified}</div>
                                                </div>) : null : null}
                                        </>) : null}
                                    </div>




                                    <div className='flex justify-between mt-2 px-4 gap-5 items-center'>
                                        <div className=' flex-1'>
                                            <label>New Description <span className='text-red-600 text-[15px]'>*</span></label>
                                            <textarea name="description" className='form-textarea' onChange={(e) => changeValue(e)} value={params.description} rows={2}
                                            ></textarea>
                                            <div className="text-danger font-semibold">{errors.description}</div>
                                        </div>

                                        <div>
                                            <button className='btn btn-success shadow btn-lg' disabled={isBtnLoading} onClick={() => formSubmit()} >
                                                {isBtnLoading ? 'Please Wait...' : 'Update Sale'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}



                    </>)

                )}




            </div>
            <SalesHistory salesHistoryDrawer={salesHistoryDrawer} setSalesHistoryDrawer={setSalesHistoryDrawer} lead_id={data?.lead?.id} />
            <Log logDrawer={logDrawer} setLogDrawer={setLogDrawer} sale_id={id} lead_id={data?.lead?.id} />
            {data?.sale?.status == 'Approved' && (authUser.user_type === 'Admin' || authUser.user_type === 'Accounts') && <SalesInvoice saleInvoiceModal={saleInvoiceModal} setSaleInvoiceModal={setSaleInvoiceModal} sale_id={id} lead_id={data?.lead?.id} />}
            {leadModal && <EditLead leadModal={leadModal} setLeadModal={setLeadModal} lead={data?.lead} states={data?.dropdowns?.filter((data) => data.type == "State")} setData={setData} />}
            {activateModal && (<ActivationModal
                activateModal={activateModal}
                setActivateModal={setActivateModal}
                params={params}
                changeValue={changeValue}
                validate={validate}
                updateSaleApi={updateSaleApi}
                isBtnLoading={isBtnLoading}
                errors={errors}
            />)}
        </>
    )
}


const EmployeeVerification = ({ title, data }) => {

    return (
        <div className='flex gap-3 bg-[#DCF8C6] flex gap-3 p-2.5 rounded-lg shadow dark:bg-success-dark-light'>
            <div className='flex-shrink-0'>

                <MdVerified size={30} color='#009664f7' />
            </div>
            <div className='w-full'>
                <div className='flex justify-between items-center'>
                    <div> <b className='text-[#009688]'>{title}</b></div>
                    <div className='font-bold text-[#000]/50'>
                        <i className='dark:text-dark-light/60'>{data?.created_at}</i>
                    </div>
                </div>
                <i>
                    Verified By {
                        data?.first_name ?? "Unknown"
                    } {
                        data?.last_name ?? "Unknown"
                    } - {
                        data?.user_type ?? "Unknown"
                    }
                </i>
                <p>{data?.description ?? "N/A"}</p>
            </div>
        </div>
    )
}


const Error = ({ error, fetch, id }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetch(id)}>Re Try</button>
            </div>
        </div>
    </>)
}
