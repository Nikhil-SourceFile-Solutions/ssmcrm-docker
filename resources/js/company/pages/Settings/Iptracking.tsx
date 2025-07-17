import React from 'react'
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { downloadExcel } from 'react-export-table-to-excel';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import axios from 'axios';
import LeftTab from './LeftTab';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';

export default function Iptracking() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('IP Tracking')); });
    const { crmToken, apiUrl, authUser } = useAuth()
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterUser, setFilterUser] = useState('');
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchIpData();
    }, [page, pageSize, filterUser, search, users])

    const [ipData, setIpData] = useState([])
    const [response, setResponse] = useState<any>(null);
    const [fetchingError, setFetchingError] = useState(null);


    const fetchIpData = async () => {
        setIsLoading(true);
        setFetchingError(null);
        const u = users.length;
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/ip-tracks?page=" + page + "&pageSize=" + pageSize + "&filterUser=" + filterUser + "&search=" + search + "&users=" + u,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            console.log("*** Fetching IPTracking Data ***");
            if (response.data.status == 'success') {
                setIpData(response.data.data.data)
                setResponse(response.data.data);

                if (response.data.users) setUsers(response.data.users)
            }

        } catch (error: any) {
            console.log(error)
            setFetchingError(error);
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsLoading(false);
        }
    }
    function handleDownloadExcel() {
        const header = ['#', 'Action', 'User', 'Email', 'IP Address', 'Browser', 'Device', 'Platform', 'Is robot', 'Date time'];
        downloadExcel({
            fileName: 'Last Login',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: ipData.map((automation: any, index) => ({
                    a: index + 1,
                    j: automation.action,
                    b: automation.first_name + ' ' + automation.last_name,
                    i: automation.email,
                    c: automation.ip_address,
                    d: automation.browser,
                    e: automation.device,
                    f: automation.platform,
                    g: automation.is_robot ? 'Robot' : 'Human',
                    h: automation.created_at,
                })),
            },
        });
    }
    const exportTable = (type: any) => {
        let columns: any = ['#', 'Action', 'User', 'Email', 'IP Address', 'Browser', 'Device', 'Platform', 'Is Robot', 'Date time'];
        let records = ipData.map((automation: any, index) => ({
            "#": index + 1,
            "Action": automation.action,
            "User": automation.first_name + ' ' + automation.last_name,
            "Email": automation.email,
            "IP Address": automation.ip_address,
            "Browser": automation.browser,
            "Device": automation.device,
            "Platform": automation.platform,
            "Is Robot": automation.is_robot ? 'Robot' : 'Human',
            "Date time": automation.created_at,
        }));
        let filename = 'Last Login';
        let newVariable: any;
        newVariable = window.navigator;
        if (type === 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            columns.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';
            records.map((item: any) => {
                rowhtml += '<tr>';
                columns.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
        }
    };
    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };


    return (
        <div className="flex gap-5 relative  h-full">

           {
            authUser?.user_type=='HR'?'':
            <div className={`panel w-[280px]`}>
            <div className="flex flex-col h-full pb-2">
                <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                    <LeftTab />
                </PerfectScrollbar>
            </div>
        </div>
           }

            {
                fetchingError ? <Error error={fetchingError} fetchIpData={fetchIpData} /> : (
                    <div className="p-0 flex-1 overflow-x-hidden h-full">
                        <div className="flex flex-col h-full">
                            <div className='panel'>

                                <div className='flex items-center justify-between mb-1'>
                                    <h5 className="font-semibold text-lg dark:text-white-light">Logs</h5>
                                    <div className='flex gap-4'>
                                        <select className='form-select w-[150px]' onChange={(e: any) => setFilterUser(e.target.value)}>
                                            <option value="">All</option>

                                            {users.map((user: any) => (
                                                <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
                                            ))}
                                        </select>
                                        <div className="flex">
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Username" className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                        <div  className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <IoSearchSharp />
                        </div>
                    </div>
                                        {/* <input type="text" className="form-input w-auto" placeholder="Search By Username..." value={search} onChange={(e: any) => setSearch(e.target.value)} /> */}
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        <button type="button" className="btn btn-primary btn-sm m-1"
                                            onClick={handleDownloadExcel}
                                        >
                                            <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                            EXCEL
                                        </button>
                                        <button type="button"
                                            onClick={() => exportTable('print')}
                                            className="btn btn-primary btn-sm m-1">
                                            <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                            PRINT
                                        </button>
                                        <button onClick={() => { fetchIpData() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                            <IoMdRefresh className="w-5 h-5" />
                                        </button>
                                    </div>

                                </div>

                                <hr className="my-4 dark:border-[#191e3a]" />
                                <div className="datatables">
                                    <DataTable
                                        highlightOnHover
                                        className="whitespace-nowrap table-hover"
                                        records={ipData}
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
                                                accessor: 'Action',
                                                sortable: true,
                                                render: ({ action }) => (
                                                    <div className="flex flex-col gap-2">
                                                        {action == "Log In" ? <span className='badge badge-outline-success text-center'>Log In</span> : <span className='badge badge-outline-danger text-center'>Log Out</span>}

                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'User',
                                                sortable: true,
                                                render: ({ first_name, last_name }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{first_name} {last_name}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'IP Address',
                                                sortable: true,
                                                render: ({ ip_address }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{ip_address}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Browser',
                                                sortable: true,
                                                render: ({ browser, browser_version }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{browser} <br /> {browser_version}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'device',
                                                sortable: true,
                                                render: ({ device, device_type }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{device} <br />{device_type}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'platform',
                                                sortable: true,
                                                render: ({ platform }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{platform}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'is_robot',
                                                sortable: true,
                                                render: ({ is_robot }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{is_robot ? 'Robot' : 'Human'}</div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                accessor: 'Date Time',
                                                sortable: true,
                                                render: ({ created_at }) => (
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">{created_at}</div>
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
                                        // selectedRecords={selectedRecords}
                                        // onSelectedRecordsChange={setSelectedRecords}
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
                )
            }
        </div>
    )
}


const Error = ({ error, fetchIpData }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetchIpData()}>Re Try</button>
            </div>
        </div>
    </>)
}
