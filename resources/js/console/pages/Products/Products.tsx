import React, { Fragment, useRef } from 'react'
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle, setCrmToken } from '../../store/themeConfigSlice';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { downloadExcel } from 'react-export-table-to-excel';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import { IRootState } from '../../store';
import { FaRegEye } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import axios from 'axios';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import { RiLockPasswordLine } from "react-icons/ri";
import { Tab } from '@headlessui/react';
import { MdDeleteOutline } from "react-icons/md";
import { useAuth } from '../../../company/AuthContext';


export default function Products() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Employee')); });


    const { crmToken, apiUrl,authUser,settingData } = useAuth()
    if (settingData?.set_crmnews) {
        console.log(settingData.set_crmnews == 'analyst,account')
    }
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(0);
    const [filterUserType, setFilterUserType] = useState(0);
    const [search, setSearch] = useState('');
    useEffect(() => {
    }, [crmToken])

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [250, 500, 1000, 1500, 2000, 2500];;
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    useEffect(() => {
        fetchProduct();
    }, [filterStatus, filterUserType, search, page])

    const [employees, setEmployee] = useState([])
    const [data, setData] = useState([]);
    const [response, setResponse] = useState(null);
    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/products?page=" + page + "&pageSize=" + pageSize + "&filterStatus=" + filterStatus + "&filterUserType=" + filterUserType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                console.log('**** Fetching Employee Data *****')
                setEmployee(response.data.data.data)
                setData(response.data.data.data)
                setResponse(response.data.data);


            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false);
        }
    }




    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    useEffect(() => { setPage(1); }, [pageSize]);


    /*##### MAIN THINGS #####*/


    useEffect(() => {

        dispatch(setPageTitle('Product'));
    });

    /*##### DATATABLE THINGS #####*/

    /*##### CURD OPERATIONS #####*/
    const [defaultParams] = useState({
        id: '',
        category_type:'',
        pro_img: '',
        pro_name: '',
        pro_per: '',
        pro_mrp: '',
        pro_discount: '',
        pro_price: '',
        pro_status: ''
    });
    const [params, setParams] = useState<any>(defaultParams);
    const [errors, setErros] = useState<any>({});
    const [btnLoading, setBtnLoading] = useState(false);
    const [showProductSalesDrawer, setShowProductSalesDrawer] = useState(false)
    const changeValue = (e: any) => {
        const { value, name } = e.target;
        setErros({ ...errors, [name]: "" });
        setParams({ ...params, [name]: value });
        // console.table(params)
    };
const [categories,setCategories]=useState([])
    useEffect(()=>{
        fetchCategory();
    },[]);
    const fetchCategory = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/categories?page=" + page + "&pageSize=" + pageSize + "&filterStatus=" + filterStatus + "&filterUserType=" + filterUserType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                console.log('**** Fetching Employee Data *****')
                setCategories(response.data.data.data)


            }

        } catch (error: any) {
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false);
        }
    }
    const validate = () => {
        setErros({});
        let errors = {};
        if (!params.category_type) {
            errors = { ...errors, category_type: "Select category" };
        }
        console.log(errors);
        setErros(errors);
        return { totalErrors: Object.keys(errors).length };
    };

    const fileLogoRef = useRef<HTMLInputElement>(null);
    const [logoPriview, setLogoPriview] = useState<any>('https://dummyimage.com/600x400/000/fff');

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
    const addOrUpdateProuct = async (data: any) => {
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
                fetchProduct()
                setShowProductSalesDrawer(false);
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
                showMessage('Server Validation Error! Please Solve')
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
        data.append("category_type", params.category_type);
        data.append("pro_img", params.pro_img);
        data.append("pro_name", params.pro_name);
        data.append("pro_per", params.pro_per);
        data.append("pro_mrp", params.pro_mrp);
        data.append("pro_discount", params.pro_discount);
        data.append("pro_price", params.pro_price);
        data.append("pro_status", params.pro_status);
        addOrUpdateProuct(data);
    };

    const UpdateProuct = (userAllData: any) => {
        setErros({});
        if (userAllData) {
            setParams({
                id: userAllData.id,
                category_type: userAllData.category_type,
                pro_img: '',
                pro_name: userAllData.pro_name,
                pro_per: userAllData.pro_per,
                pro_mrp: userAllData.pro_mrp,
                pro_discount: userAllData.pro_discount,
                pro_price: userAllData.pro_price,
                pro_status: userAllData.pro_status ? "1" : "0"
            });
            if (userAllData.pro_img) setLogoPriview(apiUrl + userAllData.pro_img)
            if (userAllData.pro_img) setLogoPriview(apiUrl + '/storage/' + userAllData.pro_img)

                // if (kyc?.kyc_photo) setPhotoPriview(apiUrl + kyc.kyc_photo)
            setShowProductSalesDrawer(true)
        }
    }

    const distroy = (userAllData: any) => {
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
                        url: apiUrl + '/api/products/' + userAllData.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        showMessage(response.data.message)
                        fetchProduct()
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



  return (
    <div>
        <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                        <div className="flex flex-col h-full">
                            <div className='panel'>
                                <div className='flex items-center justify-between mb-5'>
                                    <h5 className="font-semibold text-lg dark:text-white-light">Products List</h5>


                                        <button type="submit" onClick={() => setShowProductSalesDrawer(!showProductSalesDrawer)} className="btn btn-primary"
                                            >Add Product</button>

                                </div>
                                <hr className="my-4 dark:border-[#191e3a]" />
                                <div className={`${(showProductSalesDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowProductSalesDrawer(!showProductSalesDrawer)}>
                                </div>
                                <nav className={`${(showProductSalesDrawer && 'ltr:!right-0 rtl:!left-0') || ''
                                    } bg-white fixed ltr:-right-[500px] rtl:-left-[500px] top-0 bottom-0 w-full max-w-[500px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                                    <div className="flex flex-col h-screen overflow-hidden">
                                        <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                                            <form autoComplete="off" action="" method="post" className='p-0'>
                                                <div className="mb-5">
                                                    <Tab.Group>
                                                        <div className='flex justify-between mb-4 ' >
                                                            <div className='text-lg bold' >Product</div>
                                                        </div>
                                                        <hr className='mb-5' />
                                                        <Tab.Panels>
                                                            <Tab.Panel>
                                                                <div className='mb-5 space-y-5'>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                        <div>
                                                                            <select name="category_type" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.category_type ? params.category_type : ''}>
                                                                                <option value={''}>Select Category</option>


                                                                                {categories.map((category) => (<option value={category.category_name}>{category.category_name}</option>
                                                                                ))}
                                                                            </select>
                                                                            {errors?.category_type ? <div className="text-danger mt-1">{errors.category_type}</div> : ''}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                        <div>
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
                                                                            <input type="text" placeholder="Enter Per Kg/pkd" className="form-input"
                                                                                name='pro_per'
                                                                                value={params.pro_per}
                                                                                onChange={(e) => changeValue(e)}
                                                                            />
                                                                            {errors?.pro_per ? <div className="text-danger mt-1">{errors.pro_per}</div> : ''}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                        <div>
                                                                            <input type="text" placeholder="Enter Product MRP" className="form-input"
                                                                                name='pro_mrp'
                                                                                value={params.pro_mrp}
                                                                                onChange={(e) => changeValue(e)}
                                                                            />
                                                                            {errors?.pro_mrp ? <div className="text-danger mt-1">{errors.pro_mrp}</div> : ''}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                        <div>
                                                                            <input type="text" placeholder="Enter Discount" className="form-input"
                                                                                name='pro_discount'
                                                                                value={params.pro_discount}
                                                                                onChange={(e) => changeValue(e)}
                                                                            />
                                                                            {errors?.pro_discount ? <div className="text-danger mt-1">{errors.pro_discount}</div> : ''}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                                                        <div>
                                                                            <input type="text" placeholder="Enter Our Price" className="form-input"
                                                                                name='pro_price'
                                                                                value={params.pro_price}
                                                                                onChange={(e) => changeValue(e)}
                                                                            />
                                                                            {errors?.pro_price ? <div className="text-danger mt-1">{errors.pro_price}</div> : ''}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">

                                                                        <div>
                                                                            {/* <label >Status</label> */}
                                                                            <select name="pro_status" className="form-select text-white-dark" onChange={(e) => changeValue(e)} value={params.pro_status ? params.pro_status : ''}>
                                                                                <option value={''}>Select status</option>
                                                                                <option value={1}>Active</option>
                                                                                <option value={0}>Inactive</option>
                                                                            </select >
                                                                            {errors?.pro_status ? <div className="text-danger mt-1">{errors.pro_status}</div> : ''}
                                                                        </div >

                                                                    </div>

                                                                    <div className="mb-5">
                                                                {/* <label >Image</label> */}
                                                                <input ref={fileLogoRef} name="pro_img" type="file" onChange={(e) => setImage(e)} className="form-input hidden" accept="image/*" />
                                                                <span className="w-full h-20 relative">
                                                                    <img className="w-40 h-20  overflow-hidden object-cover" id="pro_img" onClick={() => {
                                                                        fileLogoRef.current!.click()
                                                                    }} src={logoPriview} alt="pro_img" />
                                                                </span>
                                                                {errors?.pro_img ? <div className="text-danger mt-1">{errors.pro_img}</div> : ''}
                                                            </div>
                                                                    <button type="button" onClick={() => formSubmit()} disabled={btnLoading} className="btn bg-[#1d67a7] text-white ltr:ml-4 rtl:mr-4">
                                                                        {btnLoading ? 'Please wait' : params.id ? 'Update Product' : 'Add Product '}
                                                                    </button>
                                                                </div>
                                                            </Tab.Panel>
                                                        </Tab.Panels>
                                                    </Tab.Group>
                                                </div>
                                            </form>
                                        </section>
                                    </div>
                                </nav>
                                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">

                                    <input type="text" name="search" value={search} id="" className="form-input w-auto" placeholder="Search..." onChange={(e: any) => setSearch(e.target.value)} />

                                </div>
                                <div className="datatables">
                                    <DataTable
                                        highlightOnHover
                                        className="whitespace-nowrap table-hover"
                                        records={employees}
                                        columns={[
                                            {
                                                accessor: 'ID',
                                                sortable: true,
                                                render: ({ id }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="font-semibold">{id}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Image',
                                                sortable: true,
                                                render: (userFullData) => (
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                    {/* <img className='w-10 h-10 rounded-md' src={`${apiUrl}/${data?.pro_img}`} alt="" /> */}
                                                    <img className='w-10 h-10 rounded-md' src={apiUrl+'/storage/'+userFullData.pro_img} alt="" />

                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Name',
                                                sortable: true,
                                                render: ({pro_name }) => (
                                                    <div>
                                                        <div className="flex items-center gap-2">

                                                            <div>
                                                                <div className="font-semibold">{pro_name}</div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Category',
                                                sortable: true,
                                                render: ({category_type }) => (
                                                                <div className="font-semibold">{category_type}</div>
                                                ),
                                            },
                                            {
                                                accessor: 'Per',
                                                sortable: true,
                                                render: ({pro_per }) => (
                                                    <div>
                                                        <div className="flex items-center gap-2">

                                                            <div>
                                                                <div className="font-semibold">{pro_per}</div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'MRP',
                                                sortable: true,
                                                render: ({pro_mrp }) => (
                                                    <div>
                                                        <div className="flex items-center gap-2">

                                                            <div>
                                                                <div className="font-semibold">{pro_mrp}</div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Discount',
                                                sortable: true,
                                                render: ({pro_discount }) => (

                                                                <div className="font-semibold">{pro_discount}</div>
                                                ),
                                            },
                                            {
                                                accessor: 'Our Price',
                                                sortable: true,
                                                render: ({pro_price }) => (
                                               <div className="font-semibold">{pro_price}</div>
                                                ),
                                            },

                                            {
                                                accessor: 'Status',
                                                sortable: true,
                                                render: ({ pro_status, id, user_type }) => (
                                                    <div className="flex flex-col gap-2">


                                                        <label className="w-12 h-6 relative">
                                                            <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" checked={pro_status == 1 ? true : false} />
                                                            <span className={`
                                                            outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                        </label>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Action',
                                                sortable: true,
                                                render: (userAllData) => (
                                                    <div className="flex gap-2">
                                                           <Tippy content="Edit" placement="bottom">
                                                    <button
                                                        className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                        onClick={() => { UpdateProuct(userAllData) }}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                </Tippy>
                                                <Tippy content="Delete" placement="bottom">
                                                    <button
                                                        className="btn btn-dark w-10 h-10 p-0 rounded-full"
                                                        onClick={() => { distroy(userAllData) }}
                                                    >
                                                        <MdDeleteOutline />
                                                    </button>
                                                </Tippy>
                                                    </div>
                                                ),
                                            },
                                        ]}
                                        totalRecords={response?.total}
                                        recordsPerPage={pageSize}
                                        page={page}
                                        onPageChange={(p) => setPage(p)}
                                        recordsPerPageOptions={PAGE_SIZES}
                                        onRecordsPerPageChange={setPageSize}
                                        sortStatus={sortStatus}
                                        onSortStatusChange={setSortStatus}
                                        minHeight={200}
                                        fetching={isLoading}
                                        loaderColor="blue"
                                        loaderBackgroundBlur={4}
                                        paginationText={({ from, to, totalRecords }) => `Showing  ${response?.form} to ${response.to} of ${totalRecords} entries`}
                                    />
                                </div>
                            </div>
                        </div>



                    </div>
    </div>
  )
}
