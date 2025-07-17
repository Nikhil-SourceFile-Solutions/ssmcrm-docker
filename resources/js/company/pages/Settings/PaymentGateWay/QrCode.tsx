import React, { useEffect, useState, Fragment, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import PageLoader from '../../../components/Layouts/PageLoader';
import { FaEdit } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import { useAuth } from '../../../AuthContext';
import { IoSearchSharp } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';
import { DataTable } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
export default function QrCode() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { logout, crmToken, authUser, apiUrl } = useAuth();

    useEffect(() => {
        dispatch(setPageTitle('Qrcodes'));
    }, []);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [data, setData] = useState<any>([]);

    const [isLoading, setIsLoading] = useState(true);


    const fetchQrcodes = async (a = 0) => {
        console.log("Fetching Banks........", a)
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',

                url: apiUrl + '/api/qrcodes',
                params: {
                    page: page,
                    pageSize: pageSize,
                    filterStatus: filterStatus,
                    search: search
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {
                setData(response.data.data)
            } else setData([]);

        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }

    const [reload, setReload] = useState(false);
    useEffect(() => {
        if (reload) {
            fetchQrcodes()
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
    }, [filterStatus, pageSize]);

    useEffect(() => {
        if (!reload) {
            setReload(true);
        }
    }, [page]);


    const [qrcode, setQrcode] = useState([]);
    const fileLogoRef = useRef<HTMLInputElement>(null);
    const [logoPriview, setLogoPriview] = useState<any>('https://dummyimage.com/600x400/000/fff');

    // const fetchQrcode = async () => {
    //     try {
    //         setIsLoading(true)
    //         const response = await axios({
    //             method: 'get',
    //             url: apiUrl + "/api/get-bank",
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: 'Bearer ' + crmToken,
    //             },
    //         });

    //         if (response.data.status == "success") {
    //             console.log('**** Fetching Qrcode Data ***')
    //             setQrcode(response.data.banks.filter(bank => bank.is_bank_upi === 'upi'))
    //             // console.log("Filtered UPI banks:", response.data.banks.filter(bank => bank.is_bank_upi === 'upi'));

    //         }

    //     } catch (error) {
    //         console.log(error)

    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const [bankModal, setBankModal] = useState(false);
    const [defaultParams] = useState({
        id: '',
        name: '',
        upi: '',
        image: '',
        status: '',
        is_bank_upi: 'is_bank_upi'
    });

    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});

    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.upi) {
            errors = { ...errors, upi: "Upi  is required" };
        }
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const [btnLoading, setBtnLoading] = useState(false);

    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        console.table(params)
    };

    const setImage = (e: any) => {
        const { name } = e.target;
        setErros({ ...errors, [name]: "" });
        if (e.target.files[0]) {
            if (
                e.target.files[0].type &&
                e.target.files[0].type.indexOf("image") === -1
            ) {
                setErros({ ...errors, [name]: "file is not a valid image" });
                return;
            }
            const maxSizeInBytes = 2 * 1024 * 1024;
            if (e.target.files[0].size > maxSizeInBytes) {
                setErros({ ...errors, [name]: "maximum file size is 2 mb" });
                return;
            }
            const reader = new FileReader();
            reader.onload = function (event: any) {
                setLogoPriview(reader.result);

                setParams({ ...params, [name]: e.target.files[0] });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const addOrUpdateBank = async (data: any) => {
        setBtnLoading(true)
        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/qrcodes",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == 'success') {
                showMessage(response.data.message);
                setBankModal(false);
                fetchQrcodes();
                setParams(defaultParams)
            } else { alert("Failed") }

        } catch (error: any) {
            console.log(error)
            if (error.response.status == 401) dispatch(setCrmToken(''))
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
            setBtnLoading(false)
        }
    };

    const storeOrUpdate = (data: any) => {
        setErros({});
        if (data) {
            setParams({
                id: data.id,
                name: data.name,
                upi: data.upi,
                status: data.status,
                image: '',
                is_bank_upi: data.is_bank_upi
            });

            data.image ?
                setLogoPriview(`${apiUrl}${data.image}`) :
                setLogoPriview('https://dummyimage.com/600x400/000/fff');

        }
        else {
            const defaltData = JSON.parse(JSON.stringify(defaultParams));
            setParams(defaltData);
            setLogoPriview('https://dummyimage.com/600x400/000/fff');
        }
        setBankModal(true)
    }
    const formSubmit = () => {
        const isValid = validate();
        if (isValid.totalErrors) return false;
        const data = new FormData();
        data.append("id", params.id);
        data.append("name", params.name);
        data.append("upi", params.upi);
        data.append("image", params.image);
        data.append("status", params.status);
        data.append('is_bank_upi', 'upi')
        addOrUpdateBank(data);
    };

    const deleteBank = (bank: any) => {
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
                        url: apiUrl + '/api/qrcodes/' + bank.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        showMessage(response.data.message);
                        fetchQrcodes()
                    }
                } catch (error: any) {

                } finally {

                }
            }
        });

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


    const updateStatus = async (id: number) => {

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + '/api/qrcode-update-status',
                data: { id: id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {

                Swal.fire({
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 500,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                });
                fetchQrcodes();
            }
        } catch (error) {

        }

    }


    const Upi = ({ upi }) => {
        const name = `${upi}`;
        const trimmedName = name.substring(0, 25);
        const tippyContent = `${upi}`;
        return (
            <Tippy content={tippyContent}>
                <>
                    <b>{trimmedName}</b>
                </>
            </Tippy>
        );
    };


    return (
        <div>
            {isLoading ? (<><PageLoader /></>) : (
                <>
                    <div className='flex justify-between items-center mb-4'>
                        <h2 className='font-bold text-lg'>QR Code</h2>
                        <button className='btn btn-sm btn-dark' onClick={() => storeOrUpdate(null)}>Add New QrCode</button>
                    </div>

                    <div className='flex justify-between gap-4'>
                        <div className='flex gap-3  w-full'>
                            <div className="flex">
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                                <div onClick={() => { page != 1 ? setPage(1) : fetchQrcodes() }} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                    <IoSearchSharp />
                                </div>
                            </div>
                            <div className='w-[150px]'>
                                <select className='form-select ' onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="1">Active</option>
                                    <option value="0">Blocked</option>
                                </select>
                            </div>
                        </div>
                        <div className='flex gap-3 justify-end  w-full'>


                            <button disabled={isLoading ? true : false} onClick={() => fetchQrcodes()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                <IoMdRefresh className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="datatables mt-4">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={data?.data}

                            columns={[
                                {
                                    accessor: 'image',
                                    title: 'Qrcode',
                                    render: ({ image }) => {
                                        return (
                                            <img className="w-20 h-20 rounded-md overflow-hidden object-cover" src={`${apiUrl}${image}`} alt="img" />
                                        )
                                    },
                                },

                                {
                                    accessor: 'name',
                                    title: 'Name',
                                },

                                {
                                    accessor: 'upi',
                                    title: 'UPI',
                                    render: ({ upi }) => {
                                        return (
                                            <Upi upi={upi} />
                                        )
                                    },
                                },



                                {
                                    accessor: 'status',
                                    title: 'Status',

                                    render: ({ status }) => {
                                        return (
                                            <span className={`badge ${status ? 'bg-green-500' : 'bg-red-500'} text-center cursor-pointer py-0.5 w-full`} >{status ? 'Active' : 'Blocked'}</span>
                                        )
                                    },
                                },

                                //
                                {
                                    accessor: 'id',
                                    title: 'Action',
                                    render: (qrcode) => {
                                        return (
                                            <div className='flex justify-between w-[70px]'>
                                                <button onClick={() => storeOrUpdate(qrcode)}><FaEdit size={25} color='purple' /></button>
                                                <button onClick={() => deleteBank(qrcode)}><MdDeleteOutline size={25} color='red' /></button>
                                            </div>
                                        )
                                    },
                                },

                            ]}

                            totalRecords={data.totalItems}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}

                            minHeight={400}
                            fetching={isLoading}
                            loaderSize="xl"
                            loaderColor="green"
                            loaderBackgroundBlur={1}
                            paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                        />
                    </div>


                    <div className="mb-5">

                        <Transition appear show={bankModal} as={Fragment}>
                            <Dialog as="div" open={bankModal} onClose={() => setBankModal(true)}>
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
                                                    <div className="font-bold text-lg">QR Code</div>
                                                    <button type="button" onClick={() => {
                                                        setBankModal(false)
                                                        setParams("")
                                                    }} className="text-white-dark hover:text-dark">
                                                        X
                                                    </button>
                                                </div>
                                                <div className="p-5">



                                                    <form autoComplete="off" className="space-y-5">
                                                        <div>
                                                            <input type="text" name='name' value={params.name} onChange={(e) => changeValue(e)} placeholder="Enter  Name" className="form-input" />
                                                            {errors?.name ? <div className="text-danger mt-1">{errors.name}</div> : ''}
                                                        </div>
                                                        <div>
                                                            <input type="text" name='upi' value={params.upi} onChange={(e) => changeValue(e)} placeholder="Enter Upi" className="form-input" />
                                                            {errors?.upi ? <div className="text-danger mt-1">{errors.upi}</div> : ''}
                                                        </div>


                                                        <div>
                                                            <select name="status" className="form-select" onChange={(e) => changeValue(e)} value={params.status}>
                                                                <option value="">Select Status</option>
                                                                <option value="1">Active</option>
                                                                <option value="0">Inactive</option>
                                                            </select>
                                                            {errors?.status ? <div className="text-danger mt-1">{errors.status}</div> : ''}
                                                        </div>

                                                        <div className="mb-5">
                                                            <label >Image</label>
                                                            <input ref={fileLogoRef} name="image" type="file" onChange={(e) => setImage(e)} className="form-input hidden" accept="image/*" />
                                                            <span className="w-full h-40 relative">
                                                                <img className="w-40 h-40  overflow-hidden object-cover" id="image" onClick={() => {
                                                                    fileLogoRef.current!.click()
                                                                }} src={logoPriview} alt="image" />
                                                            </span>
                                                            {errors?.image ? <div className="text-danger mt-1">{errors.image}</div> : ''}
                                                        </div>
                                                    </form>

                                                    <div className="flex justify-end items-center mt-8">
                                                        <button type="button" onClick={() => setBankModal(false)} className="btn btn-outline-danger">
                                                            Discard
                                                        </button>
                                                        <button type="button" onClick={() => formSubmit()} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </div>

                </>
            )}
        </div>
    )
}
