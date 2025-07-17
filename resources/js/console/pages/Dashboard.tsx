import React, { useEffect, useState } from 'react'
import Dropdown from '../components/Dropdown'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setPageTitle } from '../store/themeConfigSlice'
import { IRootState } from '../store';

import IconEye from '../components/Icon/IconEye'
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import IconCaretDown from '../components/Icon/IconCaretDown'
import { useAuth } from '../AuthContext'
import axios from 'axios'
const rowData = [
    {
        id: 1,
        Name: 'Caroline',
        PhoneNumber: 'Jensen',
        email: 'carolinejensen@zidant.com',
        Amount: '2004-05-28',
        PaymentMethod: '+1 (821) 447-3782',
        Status: 'true',
        CreatedAt: '39',
    },

];

export default function Dashboard() {

    const { logout, authUser, crmToken, apiUrl } = useAuth();



    useEffect(() => {

        fetchDashboard()
    }, [])

    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboard = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            console.log(response)

        } catch (error) {

            if (error?.response?.status === 401) logout();

        } finally {
            setIsLoading(false)
        }
    }

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Analytics Admin'));
    });

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [250, 500, 1000, 1500, 2000, 2500];;
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>(['age', 'dob', 'isActive']);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const cols = [
        { accessor: 'id', title: 'ID' },
        { accessor: 'firstName', title: 'First Name' },
        { accessor: 'lastName', title: 'Last Name' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'company', title: 'Company' },
        { accessor: 'address.street', title: 'Address' },
        { accessor: 'age', title: 'Age' },
        { accessor: 'dob', title: 'Birthdate' },
        { accessor: 'isActive', title: 'Active' },
    ];

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return rowData.filter((item) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    item.Name.toLowerCase().includes(search.toLowerCase()) ||
                    item.PhoneNumber.toLowerCase().includes(search.toLowerCase()) ||
                    item.email.toLowerCase().includes(search.toLowerCase()) ||
                    item.Amount.toString().toLowerCase().includes(search.toLowerCase()) ||
                    item.PaymentMethod.toLowerCase().includes(search.toLowerCase()) ||
                    item.Status.toLowerCase().includes(search.toLowerCase()) ||
                    item.CreatedAt.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortStatus]);
    return (
        <div>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
            <li>
                <Link to="/" className="text-primary hover:underline">
                    Dashboard
                </Link>
            </li>
            <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                <span>Analytics</span>
            </li>
        </ul> */}
            <div className="pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                    {/* Total Revenue */}
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Revenue</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> ₹ 170.46 </div>
                            <div className="badge bg-white/30">July Month </div>
                        </div>
                        <div className="flex items-center font-semibold mt-5">
                            <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                            View More
                        </div>
                    </div>

                    {/* Total Customer */}
                    <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Customer's</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 137 </div>
                            <div className="badge bg-white/30">July Month </div>
                        </div>
                        <div className="flex items-center font-semibold mt-5">
                            <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                            View More
                        </div>
                    </div>

                    {/*  Active Subscriptions */}
                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Active Subscriptions</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 38 </div>
                        </div>
                        <div className="flex items-center font-semibold mt-5">
                            <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                            View More
                        </div>
                    </div>

                    {/* Active Plans */}
                    <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
                        <div className="flex justify-between">
                            <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Active Plans</div>
                        </div>
                        <div className="flex items-center mt-5">
                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> 49 </div>
                        </div>
                        <div className="flex items-center font-semibold mt-5">
                            <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                            View More
                        </div>
                    </div>
                </div>
            </div>
            <div className='pt-5'>
                <div className="panel mt-6">
                    <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Recent Transactions</h5>
                        <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                            <div className="flex md:items-center md:flex-row flex-col gap-5">
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                        btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                        button={
                                            <>
                                                <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                                <IconCaretDown className="w-5 h-5" />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[140px]">
                                            {cols.map((col, i) => {
                                                return (
                                                    <li
                                                        key={i}
                                                        className="flex flex-col"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <div className="flex items-center px-4 py-1">
                                                            <label className="cursor-pointer mb-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!hideCols.includes(col.accessor)}
                                                                    className="form-checkbox"
                                                                    defaultValue={col.accessor}
                                                                    onChange={(event: any) => {
                                                                        setHideCols(event.target.value);
                                                                        showHideColumns(col.accessor, event.target.checked);
                                                                    }}
                                                                />
                                                                <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                            </label>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="text-right">
                                <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={recordsData}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true, hidden: hideCols.includes('id') },
                                {
                                    accessor: 'Name',
                                    title: 'Name',
                                    sortable: true,
                                    hidden: hideCols.includes('Name'),
                                },
                                {
                                    accessor: 'PhoneNumber',
                                    title: 'Phone Number',
                                    sortable: true,
                                    hidden: hideCols.includes('PhoneNumber'),
                                },
                                { accessor: 'email', title: 'Email', sortable: true, hidden: hideCols.includes('email') },
                                { accessor: 'Amount', title: 'Amount', sortable: true, hidden: hideCols.includes('Amount') },
                                {
                                    accessor: 'PaymentMethod',
                                    title: 'Payment Method',
                                    sortable: true,
                                    hidden: hideCols.includes('PaymentMethod'),
                                },
                                {
                                    accessor: 'Status',
                                    title: 'Status',
                                    sortable: true,
                                    hidden: hideCols.includes('Status'),
                                },
                                {
                                    accessor: 'CreatedAt',
                                    title: 'Created At',
                                    sortable: true,
                                    hidden: hideCols.includes('CreatedAt'),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </div>
            <div className='pt-5'>
                <div className="panel mt-6">
                    <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Customers</h5>
                        <div className="flex items-center gap-5 ltr:ml-auto rtl:mr-auto">
                            <div className="flex md:items-center md:flex-row flex-col gap-5">
                                <div className="dropdown">
                                    <Dropdown
                                        placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                        btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                        button={
                                            <>
                                                <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                                <IconCaretDown className="w-5 h-5" />
                                            </>
                                        }
                                    >
                                        <ul className="!min-w-[140px]">
                                            {cols.map((col, i) => {
                                                return (
                                                    <li
                                                        key={i}
                                                        className="flex flex-col"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <div className="flex items-center px-4 py-1">
                                                            <label className="cursor-pointer mb-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!hideCols.includes(col.accessor)}
                                                                    className="form-checkbox"
                                                                    defaultValue={col.accessor}
                                                                    onChange={(event: any) => {
                                                                        setHideCols(event.target.value);
                                                                        showHideColumns(col.accessor, event.target.checked);
                                                                    }}
                                                                />
                                                                <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                            </label>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="text-right">
                                <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={recordsData}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true, hidden: hideCols.includes('id') },
                                {
                                    accessor: 'Name',
                                    title: 'Name',
                                    sortable: true,
                                    hidden: hideCols.includes('Name'),
                                },
                                {
                                    accessor: 'PhoneNumber',
                                    title: 'Phone Number',
                                    sortable: true,
                                    hidden: hideCols.includes('PhoneNumber'),
                                },
                                { accessor: 'email', title: 'Email', sortable: true, hidden: hideCols.includes('email') },
                                { accessor: 'TotalEarnings', title: 'Total Earnings', sortable: true, hidden: hideCols.includes('TotalEarnings') },
                            ]}
                            highlightOnHover
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
