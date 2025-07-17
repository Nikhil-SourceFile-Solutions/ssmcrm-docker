import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { IRootState } from '../../../../store';
import axios from 'axios';
import { IoMdRefresh } from "react-icons/io";
import { FaSearch, FaWhatsapp } from 'react-icons/fa';
import Whatsapp from './Whatsapp';
import Sms from './Sms';
import App from './App';
import { IoInformationCircle } from "react-icons/io5";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../../../AuthContext';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import { FaInfoCircle } from "react-icons/fa";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaLock } from "react-icons/fa6";
export default function Expiredservice() {

    const { logout, crmToken, settingData, authUser, apiUrl } = useAuth();
    const dispatch = useDispatch()
    useEffect(() => { dispatch(setPageTitle('Sales Campaign')); });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [1000, 2500, 5000, 10000, 50000, 100000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [checkedValues, setCheckedValues] = useState<any>([]);
    const [selectedProducts, setSelectedProducts] = useState<any>([]);
    useEffect(() => {
        fetchWhatsappCampaign();
    }, [page, pageSize])
    useEffect(() => {
        if (page != 1) setPage(1);
        else fetchWhatsappCampaign();
    }, [pageSize]);

    const [data, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWhatsappCampaign = async () => {

        const p = [];

        data[5]?.forEach(groups => {
            groups.groups.forEach(product => {
                if (selectedProducts.includes(product.id)) {
                    p.push(...product.products.map(product => product.id));
                }
            });
        });


        console.log("Fetching Whatsapp Campaigns........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/analyst/active-sales",
                params: { page: page, size: pageSize, filter: JSON.stringify(p), search: search },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)


            }
        } catch (error) {

            if (error?.response?.status == 401) logout()
            console.log(error)

        } finally {
            setIsLoading(false)
        }
    }

    const [selectedRecords, setSelectedRecords] = useState<any>([]);
    const [drawer, setDrawer] = useState(false);
    const [showFilter, setShowFilter] = useState(false)

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, groups: any) => {
        const { value, checked } = event.target;
        const ids = groups.map(a => a.id);
        const valueNumber = Number(value);
        setSelectedProducts((prev) => {
            const newProducts = checked
                ? [...prev, ...ids.filter((id) => !prev.includes(id))]
                : prev.filter((id) => !ids.includes(id));

            return [...new Set(newProducts)];
        });

        console.log(valueNumber)
        setCheckedValues((prevValues: number[]) => {
            return checked
                ? [...prevValues, valueNumber]
                : prevValues.filter((item) => item !== valueNumber);
        });
    };

    const handleSelectedProduct = (event: React.ChangeEvent<HTMLInputElement>, ids: number[], pid: number) => {

        const { value, checked: isChecked } = event.target;
        setSelectedProducts((prevValues: number[]) => {
            if (isChecked) {
                return [...prevValues, Number(value)];
            } else {
                return prevValues.filter((item) => item !== Number(value));
            }
        });

        if (!isChecked && !selectedProducts.some(item => ids.includes(item))) {

            console.log("yesss")
            setCheckedValues((prevValues: number[]) => {
                return prevValues.filter((item) => item !== pid);
            });
        }


    };

    useEffect(() => {
        console.log(selectedProducts)
    }, [selectedProducts])

    return (

        <div className="panel p-0 flex-1 overflow-x-hidden h-full">
            <div className="flex flex-col h-full">
                <div className="panel shadow-none ">
                    <div className='flex justify-between gap-4'>
                        <div className='flex gap-3  w-full'>
                            <button type="button" className="btn btn-dark " onClick={() => setShowFilter(true)}>
                                Filter
                                {checkedValues.length ? <span className="badge my-0 bg-white-light text-black ltr:ml-4 rtl:mr-4">{checkedValues.length}</span> : ''}
                            </button>
                        </div>


                        <div className='flex gap-3 justify-end  w-full'>
                            {/* <input type="text" name="search" value={search} id="" className="form-input w-auto" placeholder="Search By Number..." onChange={(e: any) => setSearch(e.target.value)} /> */}
                            <div className="flex min-w-[275px]">
                                <input type="text" placeholder="Search by phone number" className="form-input ltr:rounded-r-none rtl:rounded-l-none" onChange={(e) => setSearch(e.target.value)} />
                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                    onClick={() => page == 1 ? fetchWhatsappCampaign() : setPage(1)
                                    }>
                                    <FaSearch />
                                </div>
                            </div>
                            {selectedRecords.length ? (
                                <div className="flex items-center flex-wrap">
                                    <button type="button" className="btn btn-primary m-1"
                                        onClick={() => setDrawer(!drawer)}
                                    >
                                        <FaWhatsapp className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        Send Advice
                                    </button>
                                    <NotificationBox
                                        drawer={drawer} setDrawer={setDrawer}
                                        selectedRecords={selectedRecords}
                                    />
                                </div>
                            ) : ''}

                            {/* <NavLink to="#" // onClick={() => setDrawer(!drawer)} className="btn btn-secondary m-1">View Advice</NavLink> */}

                            <button
                                disabled={isLoading ? true : false} onClick={() => fetchWhatsappCampaign()}
                                className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                <IoMdRefresh className="w-5 h-5" />
                            </button>
                        </div>

                        <Transition appear show={showFilter} as={Fragment}>
                            <Dialog as="div" open={showFilter} onClose={() => setShowFilter(true)}>
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
                                    <div className="flex items-start justify-center min-h-[screen] px-4">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >



                                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[800px] my-8 text-black dark:text-white-dark">
                                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                                    <div className="font-bold text-lg">Filter By Products</div>
                                                    <button type="button" onClick={() => setShowFilter(false)} className="text-white-dark hover:text-dark">
                                                        x
                                                    </button>
                                                </div>
                                                <div className="p-5">

                                                    {data[5]?.map((product) => (
                                                        <>

                                                            <label key={product.id} className='flex items-center'>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox text-success"
                                                                    value={product.id}
                                                                    onChange={(e) => handleCheckboxChange(e, product.groups)}
                                                                    checked={checkedValues.includes(product.id)}
                                                                />
                                                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                                                    {product.value}
                                                                    {/* <span className='mx-2 badge bg-[#888ea8]'>{product.groups.products.length}</span> */}
                                                                </span>
                                                            </label>

                                                            {checkedValues.includes(product.id) ? (<div className='mx-8'>
                                                                {product?.groups.map((p) => (
                                                                    <label key={p.id} className='flex items-center'>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox  rounded-full text-success"
                                                                            value={p.id}
                                                                            onChange={(e) => handleSelectedProduct(e, product.groups.filter((a) => p.id !== a.id).map((b) => b.id), product.id)}
                                                                            checked={selectedProducts.includes(p.id)}
                                                                        />

                                                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                                                            {p.group_name}


                                                                            {p?.products?.length ? (<Tippy content={
                                                                                <ul>
                                                                                    {p?.products?.map((p) => (
                                                                                        <li>{p.pro_name}</li>
                                                                                    ))}

                                                                                </ul>
                                                                            } placement="right">

                                                                                <span className='mx-2'>
                                                                                    <FaInfoCircle />
                                                                                </span>
                                                                            </Tippy>) : null}


                                                                        </span>


                                                                    </label>
                                                                ))}


                                                            </div >) : null}


                                                            {/* <label key={product.id} className='flex items-center'>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox text-success"
                                                                    value={product.id}
                                                                    onChange={(e) => handleCheckboxChange(e, product.products)}
                                                                    checked={checkedValues.includes(product.id)}
                                                                />
                                                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                                                    {product.value}
                                                                    <span className='mx-2 badge bg-[#888ea8]'>{product.products.length}</span>
                                                                </span>
                                                            </label>

                                                            {checkedValues.includes(product.id) ? (<div className='mx-8'>
                                                                {product.products.map((p) => (
                                                                    <label key={p.id} className='flex items-center'>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox  rounded-full text-success"
                                                                            value={p.id}
                                                                            onChange={(e) => handleSelectedProduct(e, product.products.filter((a) => p.id !== a.id).map((b) => b.id), product.id)}
                                                                            checked={selectedProducts.includes(p.id)}
                                                                        />
                                                                        {p.pro_name} [{p.pro_duration}]
                                                                    </label>
                                                                ))}
                                                            </div>) : null} */}




                                                        </>
                                                    ))}
                                                    <div className="flex justify-end items-center mt-8">

                                                        {checkedValues?.length ? (<button type="button" onClick={() => {
                                                            setCheckedValues([]);
                                                            setSelectedProducts([])

                                                        }} className="btn btn-outline-danger">
                                                            Clear
                                                        </button>) : null}

                                                        <button type="button" onClick={() => {
                                                            fetchWhatsappCampaign()
                                                            setShowFilter(false)
                                                        }} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                            Apply
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
                    {/* Data Table  */}

                    <div className="datatables  mt-4">

                        <DataTable
                            noRecordsText="No results match your search query"
                            highlightOnHover
                            className="whitespace-nowrap table-hover"
                            records={data[0]}
                            columns={[
                                {
                                    accessor: 'owner',
                                    title: 'Owner',
                                    render: ({ owner }) => <b>{owner}</b>,
                                },
                                {
                                    accessor: 'client',
                                    title: 'Client',
                                    sortable: true,
                                    render: ({ first_name, last_name, phone }) => {
                                        const formatPhoneNumber = (number) => {
                                            const numStr = number.toString();
                                            if (numStr.length !== 10) {
                                                throw new Error('Number must be exactly 10 digits long.');
                                            }
                                            const masked = numStr.slice(0, 2) + '****' + numStr.slice(6);
                                            return masked;
                                        };

                                        return (
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold">
                                                    <b>
                                                        {first_name} {last_name} <br />
                                                        {(
                                                            authUser.user_type === 'Analyst' &&
                                                            settingData?.crm_phones && JSON.parse(settingData?.crm_phones).includes('Analyst')) ||
                                                            (
                                                                authUser.user_type === 'Accounts' &&
                                                                settingData?.crm_phones && JSON.parse(settingData?.crm_phones).includes('Accounts'))
                                                            ? formatPhoneNumber(phone)
                                                            : phone}
                                                    </b>
                                                </div>
                                            </div>
                                        );
                                    },
                                },
                                {
                                    accessor: 'sale_service',
                                    title: 'Sale Service',
                                    render: ({ sale_service, is_service_activated }) => (
                                        <div className='flex gap-2'>
                                            {is_service_activated ? (
                                                <FaUnlockKeyhole style={{ color: 'green', fontSize: 20 }} />
                                            ) : (
                                                <FaLock style={{ color: 'red', fontSize: 20 }} />
                                            )}
                                            <div>
                                                {JSON.parse(sale_service || "[]").map((s, index) => (
                                                    <span key={index} className="me-1 badge bg-[black]/60">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'client_type',
                                    title: 'Client Type',
                                    render: ({ client_type, product }) => <span> <b>{client_type}</b> <br /> <small className='font-bold'>{product} apple orange mano grape</small> </span>,
                                },
                                // {
                                //     accessor: 'status',
                                //     title: 'Status',
                                //     render: ({ status }) => <span className="badge bg-success">{status}</span>,
                                // },
                                {
                                    accessor: 'start_date',
                                    title: 'Date',
                                    render: ({ start_date, due_date }) => (
                                        <b>
                                            {start_date} <br /> {due_date}
                                        </b>
                                    ),
                                },
                            ]}
                            fetching={isLoading}
                            loaderColor="blue"
                            loaderBackgroundBlur={4}
                            totalRecords={data[2]}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={(size) => {
                                if (size === 'All') {
                                    // Set the page size to show all records
                                    setPageSize(data[2]); // Setting to total number of records
                                } else {
                                    setPageSize(size);
                                }
                            }}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            minHeight={200}
                            paginationText={({ totalRecords }) => `Showing ${data[3]} to ${data[4]} of ${totalRecords} entries`}
                        />

                    </div>



                </div >
            </div >
        </div >

    )
}

const NotificationBox = ({ drawer, setDrawer, selectedRecords }: any) => {
    const settingData = useSelector((state: IRootState) => state.themeConfig.settingData);

    const [a, b] = useState('s');
    return (

        <div>
            <div className={`${(drawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setDrawer(!drawer)}>
            </div>
            <nav
                className={`${(drawer && 'ltr:!right-0 rtl:!left-0') || ''
                    } bg-white fixed ltr:-right-[900px] rtl:-left-[900px] top-0 bottom-0 w-full max-w-[900px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}
            >
                <div className="flex flex-col h-screen overflow-hidden">
                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar mt-5">
                        <form autoComplete="off" action="" method="post" className='p-0'>
                            <div className="mb-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <h5 className="text-lg font-semibold dark:text-white-light">Campaign</h5>

                                    <div className='flex gap-4'>

                                        {(settingData?.sms_enabled && !settingData?.app_enabled) && <button
                                            className={`${a == "s" && 'text-secondary !outline-none before:!w-full'}
             before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                            onClick={() => b('s')}
                                            type='button'
                                        >
                                            Sms
                                        </button>}

                                        {settingData?.sms_enabled && settingData?.app_enabled ? <button
                                            className={`${a == "s" && 'text-secondary !outline-none before:!w-full'}
             before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                            onClick={() => b('s')}
                                            type='button'
                                        >
                                            Sms/Application
                                        </button> : ''}

                                        {settingData?.whatsapp_enabled ?
                                            <button
                                                className={`${a == "w" && 'text-secondary !outline-none before:!w-full'}
                before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                onClick={() => b('w')} type='button'>
                                                Whatsapp
                                            </button> : ''}

                                        {/* {
                                            settingData?.app_enabled ?
                                                <button
                                                    className={`${a == "a" && 'text-secondary !outline-none before:!w-full'}
                    before:inline-block' relative -mb-[1px] flex items-center p-5 py-3 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:h-[1px] before:w-0 before:bg-secondary before:transition-all before:duration-700 hover:text-secondary hover:before:w-full`}
                                                    onClick={() => b('a')} type='button'>
                                                    Application
                                                </button> : ''
                                        } */}




                                    </div>
                                </div>


                                {
                                    a == 's' && settingData?.sms_enabled ? <Sms drawer={drawer} setDrawer={setDrawer} selectedRecords={selectedRecords} /> :
                                        a == 'w' && settingData?.whatsapp_enabled ? <Whatsapp drawer={drawer} setDrawer={setDrawer} selectedRecords={selectedRecords} /> :
                                            // a == 'a' && settingData?.app_enabled ? <App drawer={drawer} setDrawer={setDrawer} selectedRecords={selectedRecords} /> :
                                            !settingData?.sms_enabled && settingData?.whatsapp_enabled ? <Whatsapp drawer={drawer} setDrawer={setDrawer} selectedRecords={selectedRecords} /> :
                                                !settingData?.sms_enabled || !settingData?.whatsapp_enabled && settingData?.app_enabled ? <App drawer={drawer} setDrawer={setDrawer} selectedRecords={selectedRecords} /> :
                                                    ''



                                }
                            </div>

                        </form>
                    </section>
                </div>
            </nav>
        </div>
    )
}





