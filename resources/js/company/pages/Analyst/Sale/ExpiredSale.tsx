import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { DataTable } from 'mantine-datatable';
import axios from 'axios';
import { IoMdRefresh } from "react-icons/io";
import { useAuth } from '../../../AuthContext';
import { FaSearch } from 'react-icons/fa';

const PAGE_SIZES = [50, 100, 250, 500, 1000, 2500];

const Index = () => {
    const { logout, crmToken, apiUrl, authUser, settingData } = useAuth();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [filterProducts, setFilterProducts] = useState('');
    const [data, setData] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPausedSales = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/expired-sales`, {
                params: {
                    page,
                    pageSize,
                    filterProducts,
                    search
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${crmToken}`
                }
            });
            if (response.data.status === 'success') {
                setData(response.data.data);
                if (!products.length) setProducts(response.data.products);
            }
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPausedSales();
    }, [page, pageSize]);

    useEffect(() => {
        if (filterProducts)
            if (page == 1) fetchPausedSales()
            else setPage(1);
    }, [filterProducts]);

    const formatPhoneNumber = (number) => {
        const numStr = number.toString();
        if (numStr.length !== 10) {
            throw new Error('Number must be exactly 10 digits long.');
        }
        return `${numStr.slice(0, 2)}****${numStr.slice(6)}`;
    };

    return (
        <div className="panel p-0 flex-1 overflow-x-hidden h-full">
            <div className="flex flex-col h-[calc(100vh-200px)]">
                <div className="panel shadow-none">
                    <div className='flex justify-between gap-4'>
                        <div className='flex gap-3 '>
                            <select
                                className='form-select min-w-[220px]'
                                onChange={(e) => setFilterProducts(e.target.value)}
                                aria-label="Filter Products"
                            >
                                <option value="0">All</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.pro_name}</option>
                                ))}
                            </select>
                            <div className="flex min-w-[275px]">
                                <input type="text" placeholder="Search by phone number" value={search} className="form-input ltr:rounded-r-none rtl:rounded-l-none" onChange={(e) => setSearch(e.target.value)} />
                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                                    onClick={() => fetchPausedSales()
                                    }>
                                    <FaSearch />
                                </div>
                            </div>
                        </div>
                        <button
                            disabled={isLoading}
                            onClick={fetchPausedSales}
                            className="bg-[#f4f4f4] rounded-md p-2 disabled:opacity-60"
                            aria-label="Refresh"
                        >
                            <IoMdRefresh className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="datatables mt-4">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={data?.data}
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
                                    render: ({ sale_service }) => (
                                        JSON.parse(sale_service).map((s, index) => (
                                            <span key={index} className="me-1 badge bg-[black]/60">{s}</span>
                                        ))
                                    ),
                                },
                                {
                                    accessor: 'client_type',
                                    title: 'Client Type',
                                },
                                {
                                    accessor: 'status',
                                    title: 'Status',
                                    render: ({ status }) => (
                                        status === "Closed Won" ?
                                            <button type="button" className="btn btn-success btn-sm">Create Sale</button> :
                                            <span className="badge bg-[#3b3f5c] cursor-pointer">{status}</span>
                                    ),
                                },
                                {
                                    accessor: 'start_date',
                                    title: 'Date',
                                    render: ({ start_date, due_date }) => <b>{start_date} <br /> {due_date}</b>,
                                },
                            ]}
                            highlightOnHover
                            fetching={isLoading}
                            loaderColor="blue"
                            loaderBackgroundBlur={4}
                            totalRecords={data?.totalItems}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPageOptions={PAGE_SIZES}
                            minHeight={200}
                            paginationText={({ totalRecords }) => `Showing ${data?.from} to ${data?.to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
