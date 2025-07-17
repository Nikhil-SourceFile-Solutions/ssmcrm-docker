import React, { Fragment, useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import axios from 'axios';
import { IRootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import PageLoader from '../../components/Layouts/PageLoader';
import { useAuth } from '../../AuthContext';
export default function SalesInvoice({ saleInvoiceModal, setSaleInvoiceModal, sale_id, lead_id }: any) {
    const { crmToken, apiUrl } = useAuth()

    const dispatch = useDispatch();

    const defaultParams = {
        select_address: '',
        name: '',
        email: '',
        mobile: '',
        address: '',
        state: '',
        city: '',
        gst_no: '',
        is_igst: 1
    }
    const [params, setParams] = useState(defaultParams);

    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.name) {
            errors = { ...errors, name: "name is required" };
        }
        if (!params.mobile) {
            errors = { ...errors, mobile: "mobile is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };





    const changeValue = (e) => {
        const { name, value } = e.target;

        if (name === 'select_address') {
            if (value === 'Add Address') {
                // Clear all input fields
                setParams({
                    select_address: value,
                    name: '',
                    email: '',
                    mobile: '',
                    address: '',
                    state: '',
                    city: '',
                    gst_no: '',
                    is_igst: 1
                });
            } else {
                // Populate fields with data based on the selected address
                const selectedAddress = data?.previousInvoices?.find((address) => address.id === parseInt(value));
                if (selectedAddress) {
                    setParams({
                        select_address: value,
                        id: selectedAddress.id,
                        name: selectedAddress.name,
                        email: selectedAddress.email,
                        mobile: selectedAddress.mobile,
                        address: selectedAddress.address,
                        state: selectedAddress.state,
                        city: selectedAddress.city,
                        gst_no: selectedAddress.gst_no,
                        is_igst: selectedAddress.is_igst ? 1 : 0
                    });
                }
            }
        } else {
            setParams((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const validateAddAddress = () => {
        const { name, state, is_igst } = params;
        const existingInvoice = data?.previousInvoices?.find((invoice) =>
            invoice.name === name &&
            invoice.state === state &&
            invoice.is_igst === is_igst
        );

        if (existingInvoice) {
            setErros({
                name: 'Name, State, and IGST combination must be unique.',
            });
            return false;
        }

        return true;
    };

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const AddSaleInvoice = async (data: any) => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/sales-invoice",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                setParams(defaultParams);
                setSaleInvoiceModal(false);

            } else { alert(response.data.message) }

        } catch (error: any) {
            console.log(error)
            // if (error.response.status == 401) dispatch(setCrmToken(''))
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
    };

    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        if (params.select_address === 'Add Address') {
            if (!validateAddAddress()) {
                return; // Stop form submission if validation fails
            }
        }
        const data = new FormData();
        data.append("lead_id", lead_id);
        data.append("sale_id", sale_id);
        data.append("name", params.name);
        data.append("email", params.email);
        data.append("mobile", params.mobile);
        data.append("address", params.address);
        data.append("city", params.city);
        data.append("state", params.state);
        data.append("gst_no", params.gst_no);
        data.append("is_igst", params.is_igst);
        AddSaleInvoice(data);
    };

    const [isLoading, setIsLoading] = useState(false)


    const [data, setData] = useState<any>([]);

    useEffect(() => {
        if (saleInvoiceModal) fetchInvoice()
    }, [saleInvoiceModal])

    const fetchInvoice = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/sale-invoices/create",
                params: { lead_id: lead_id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
            }
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

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




    return (
        <Transition appear show={saleInvoiceModal} as={Fragment}>
            <Dialog as="div" open={saleInvoiceModal} onClose={() => console.log("No outside")}>
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
                                    <div className="text-lg font-bold">Generate Invoice</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => {
                                        setSaleInvoiceModal(false)
                                        setParams(defaultParams)
                                    }}>
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">


                                    {isLoading ? <PageLoader /> : (
                                        <form autoComplete="off" action="">
                                            <div>
                                                {
                                                    data?.previousInvoices?.length ?
                                                        <div>
                                                            <select
                                                                name="select_address"
                                                                className="form-select text-white-dark"
                                                                value={params.select_address}
                                                                onChange={changeValue}
                                                                disabled={params.select_address === "Closed Won"}
                                                            >
                                                                <option value="" disabled>Select Address</option>
                                                                {data?.previousInvoices?.map((address) => (
                                                                    <option key={address.id} value={address.id}>{address.name}-{address.state}-{address.is_igst ? 'IGST' : 'CGST+SGST'}</option>
                                                                ))}
                                                                <option value="Add Address">Add Address</option>
                                                            </select>
                                                            <div className="text-danger mt-1">{errors.select_address}</div>
                                                        </div> : null
                                                }


                                                <div className=' grid grid-cols-2 gap-2' >
                                                    <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='name'
                                                            value={params.name}
                                                            onChange={changeValue}
                                                            placeholder='Name/Company'
                                                        // disabled={params.select_address !=='Add Address'}
                                                        />
                                                        <div className="text-danger mt-1">{errors.name}</div>
                                                    </div>

                                                    {/* <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='id'
                                                            value={params.id}
                                                            onChange={changeValue}
                                                            placeholder='id '
                                                            // disabled={params.select_address !=='Add Address'}

                                                        />
                                                        <div className="text-danger mt-1">{errors.email}</div>
                                                    </div> */}
                                                    <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='email'
                                                            value={params.email}
                                                            onChange={changeValue}
                                                            placeholder='Enter Email '
                                                        // disabled={params.select_address !=='Add Address'}

                                                        />
                                                        <div className="text-danger mt-1">{errors.email}</div>
                                                    </div>

                                                    <div className="relative mb-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='mobile'
                                                            value={params.mobile}
                                                            onChange={changeValue}
                                                            maxLength={10}
                                                            placeholder='Enter Mobile '
                                                        // disabled={params.select_address !=='Add Address'}

                                                        />
                                                        <div className="text-danger mt-1">{errors.mobile}</div>
                                                    </div>
                                                    <div className="relative mb-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='gst_no'
                                                            value={params.gst_no}
                                                            onChange={changeValue}
                                                            placeholder='Enter Gst No '
                                                        // disabled={params.select_address !=='Add Address'}

                                                        />
                                                        <div className="text-danger mt-1">{errors.gst_no}</div>
                                                    </div>
                                                </div>

                                                <div className="relative mb-2">

                                                    <textarea className="form-input"
                                                        name='address'
                                                        value={params.address}
                                                        onChange={changeValue}
                                                        placeholder='Enter Address '
                                                    // disabled={params.select_address !=='Add Address'}

                                                    ></textarea>
                                                    <div className="text-danger mt-1">{errors.address}</div>
                                                </div>

                                                <div className=' grid grid-cols-2 gap-2' >
                                                    <div className="relative mb-2">


                                                        <select name="state" className='form-select'
                                                            // disabled={params.select_address !=='Add Address'}

                                                            value={params.state} onChange={changeValue}>
                                                            <option value="">Select State</option>

                                                            {data?.states?.map((state, index) => (
                                                                <option key={index} value={state}>{state}</option>
                                                            ))}

                                                        </select>
                                                        <div className="text-danger mt-1">{errors.state}</div>
                                                    </div>


                                                    <div className="relative mb-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='city'
                                                            value={params.city}
                                                            onChange={changeValue}
                                                            placeholder='Enter City '
                                                        // disabled={params.select_address !=='Add Address'}
                                                        />
                                                        <div className="text-danger mt-1">{errors.city}</div>



                                                    </div>

                                                    <div className="relative mb-2">


                                                        <select name="is_igst" className='form-select'
                                                            // disabled={params.select_address !=='Add Address'}
                                                            value={params.is_igst}
                                                            onChange={changeValue}>
                                                            <option value="1">IGST</option>
                                                            <option value="0">CGST + SGST</option>


                                                        </select>
                                                        <div className="text-danger mt-1">{errors.is_igst}</div>
                                                    </div>

                                                    <div className="relative mb-2">
                                                        <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-max m-auto">
                                                            {isBtnLoading ? 'Please Wait' : 'Generate'}
                                                        </button>
                                                    </div>


                                                </div>


                                            </div>


                                        </form>
                                    )}





                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
