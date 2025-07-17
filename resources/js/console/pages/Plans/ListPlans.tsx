import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconBell from '../../components/Icon/IconBell';
import { downloadExcel } from 'react-export-table-to-excel';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import { LuIndianRupee } from "react-icons/lu";
import { NavLink } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import AddPlans from './AddPlans';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import Swal from 'sweetalert2';

const rowData = [
    {
        id: 1,
        firstName: 'Caroline',
        lastName: 'Jensen',
        email: 'carolinejensen@zidant.com',
        dob: '2004-05-28',
        phone: '+1 (821) 447-3782',
        isActive: true,
        age: 39,
        company: 'POLARAX',
    },

];

const col = ['id', 'firstName', 'lastName', 'company', 'age', 'dob', 'email', 'phone'];

export default function ListPlans() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Plans')); });
    const { logout, authUser, crmToken, apiUrl } = useAuth();
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 250, 500, 1000, 1500, 2000, 2500];;
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [plan, setPlan] = useState([]);

    useEffect(() => {
        fetchPlans();
    }, [page,pageSize,search]);
    // console.log(plan)

    const fetchPlans = async () => {
        setIsLoading(true);
        //  setFetchError(0)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/plans',
                params: {
                    page: page,
                    pageSize: pageSize,
                    search: search
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
                // if (response.data.domain) setMainDomain(response.data.domain)
            }


        } catch (e) {
            if (e?.response?.status) alert(e.response.status);
            // setFetchError(e?.response)
        } finally {
            setIsLoading(false)
        }

    }

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    const header = ['Id', 'Firstname', 'Lastname', 'Email', 'Start Date', 'Phone No.', 'Age', 'Company'];

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    function handleDownloadExcel() {
        downloadExcel({
            fileName: 'table',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: rowData,
            },
        });
    }

    const exportTable = (type: any) => {
        let columns: any = col;
        let records = rowData;
        let filename = 'table';

        let newVariable: any;
        newVariable = window.navigator;

        if (type === 'csv') {
            let coldelimiter = ';';
            let linedelimiter = '\n';
            let result = columns
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            // eslint-disable-next-line array-callback-return
            records.map((item: any) => {
                // eslint-disable-next-line array-callback-return
                columns.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
                var data = 'data:application/csv;charset=utf-8,' + encodeURIComponent(result);
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', filename + '.csv');
                link.click();
            } else {
                var blob = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob, filename + '.csv');
                }
            }
        } else if (type === 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            // eslint-disable-next-line array-callback-return
            columns.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';

            // eslint-disable-next-line array-callback-return
            records.map((item: any) => {
                rowhtml += '<tr>';
                // eslint-disable-next-line array-callback-return
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
        } else if (type === 'txt') {
            let coldelimiter = ',';
            let linedelimiter = '\n';
            let result = columns
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            // eslint-disable-next-line array-callback-return
            records.map((item: any) => {
                // eslint-disable-next-line array-callback-return
                columns.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/txt/i) && !newVariable.msSaveOrOpenBlob) {
                var data1 = 'data:application/txt;charset=utf-8,' + encodeURIComponent(result);
                var link1 = document.createElement('a');
                link1.setAttribute('href', data1);
                link1.setAttribute('download', filename + '.txt');
                link1.click();
            } else {
                var blob1 = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob1, filename + '.txt');
                }
            }
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
    const [tab, setTab] = useState('plans');
    const addPlans = () => {
        setTab("add-plans")
        setPlan("");

    }

    const deleteEmployee = (data: any) => {
        Swal.fire({
            icon: "question",
            title: 'Are You Sure',
            confirmButtonText: 'Yes',
            text: 'You will not be able to retrieve it',

            showLoaderOnConfirm: true,
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + "/api/plans/" + data.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + crmToken,
                        },
                    });


                    if (response.data.status == 'success') {
                        fetchPlans()
                        Swal.fire({
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
                    } else if (response.data.status == 'error') {
                        Swal.fire({
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    }
                } catch (error: any) {
                    console.log(error)
                }
            },
        });
    }
    return (
        <div>

            <>
                <>
                    {tab == "plans" ? <>
                        <div className="panel">
                            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Plans</h5>
                                <div className="ltr:ml-auto rtl:mr-auto">
                                    {/* <NavLink to='' className="btn btn-primary">Add Plans</NavLink> */}
                                    <button type="button" className="btn btn-primary" onClick={() => { {
                                        addPlans()
                                    } }}>Add Plans</button>
                                </div>
                            </div>
                            <hr className="my-4 dark:border-[#191e3a]" />
                            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                <div className="flex items-center flex-wrap">
                                    <button type="button" className="btn btn-primary btn-sm m-1" onClick={handleDownloadExcel}>
                                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                        EXCEL
                                    </button>
                                    <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
                                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                        PRINT
                                    </button>
                                </div>
                                <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div className="datatables">
                                <DataTable
                                    noRecordsText="No results match your search query"
                                    highlightOnHover
                                    className="whitespace-nowrap table-hover"
                                    records={data?.data}
                                    columns={[
                                        {
                                            accessor: 'Plan Name',
                                            sortable: true,
                                            render: ({ plan_name }) => (
                                                <div className="flex flex-col gap-2">
                                                    <div className="font-semibold">{plan_name}</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'Plan Type',
                                            sortable: true,
                                            render: ({ is_paid }) => (
                                                <span className='badge bg-success'>{is_paid ? 'Paid' : 'Free'}</span>
                                            ),
                                        },
                                        {
                                            accessor: 'Modules',
                                            sortable: true,
                                            // render: ({ broadcast_module,chat_module }) => (
                                            //     <div className="flex flex-wrap items-center gap-3">
                                            //         <span className="badge bg-dark">Chat</span>
                                            //         <span className="badge bg-dark">{broadcast_module}</span>
                                            //         <span className="badge bg-dark">Documents</span>
                                            //         <span className="badge bg-dark">Analyst</span>
                                            //         <span className="badge bg-dark">WhatsApp API</span>
                                            //         <span className="badge bg-dark">SMS API</span>
                                            //     </div>
                                            // ),

                                            render: ({ broadcast_module, chat_module, document_module, analyst_module, whatsapp_module, sms_module }) => (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {
                                                        chat_module ? <span className="badge bg-dark">Chat</span>:''
                                                    }

                                                    {
                                                        broadcast_module == 1 ? <span className="badge bg-dark">Broadcast</span>:''
                                                    } {
                                                        document_module ? <span className="badge bg-dark">Documents</span>: ''
                                                    } {
                                                        analyst_module ? <span className="badge bg-dark">Analyst</span> :''
                                                    }

                                                    {
                                                        whatsapp_module ? <span className="badge bg-dark">WhatsApp API</span> :''
                                                    }

                                                    {
                                                        sms_module ? <span className="badge bg-dark">SMS API</span> : ''
                                                    }

                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'Monthly',
                                            sortable: true,
                                            render: ({ monthly_price }) => (
                                                <span className="flex items-center"><LuIndianRupee className="me-2" /> {monthly_price?monthly_price:'0'}.00</span>
                                            ),
                                        },
                                        {
                                            accessor: 'Halfyearly',
                                            sortable: true,
                                            render: ({ half_yearly_price }) => (
                                                <span className="flex items-center"><LuIndianRupee className="me-2" />{half_yearly_price?half_yearly_price:'0'}.00</span>
                                            ),
                                        },
                                        {
                                            accessor: 'Yearly',
                                            sortable: true,
                                            render: ({ yearly_price }) => (
                                                <span className="flex items-center"><LuIndianRupee className="me-2" /> {yearly_price?yearly_price:'0'}.00</span>
                                            ),
                                        },
                                        {
                                            accessor: 'Status',
                                            sortable: true,
                                            render: ({ status }) => (
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="badge bg-success">{status==1 ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            ),
                                        },
                                        {
                                            accessor: 'Action',
                                            sortable: true,
                                            render: (data) => (
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => {
                                                        {
                                                            setPlan(data);
                                                            setTab('add-plans')
                                                        }
                                                    }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>
                                                    <button type="button"
                                                    onClick={()=>{deleteEmployee(data)}}
                                                    className="btn btn-dark w-10 h-10 p-0 rounded-full"><MdDeleteOutline /></button>
                                                </div>
                                            ),
                                        },
                                    ]}
                                    totalRecords={data.totalItems}
                                    recordsPerPage={pageSize}
                                    page={page}
                                    onPageChange={(p) => setPage(p)}
                                    recordsPerPageOptions={PAGE_SIZES}
                                    onRecordsPerPageChange={setPageSize}
                                    sortStatus={{ columnAccessor: 'id', direction: 'asc' }}
                                    minHeight={500}
                                    fetching={isLoading}
                                    loaderSize="xl"
                                    loaderColor="green"
                                    loaderBackgroundBlur={1}
                                    paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                                />
                            </div>
                            {/* {
                            tab=='add-plans'?<AddPlans/>:''
                        } */}
                        </div>
                    </> :
                        tab == "add-plans" ? <AddPlans

                            setTab={setTab}
                            plan={plan}
                            fetchPlans={fetchPlans}

                        />
                            : null}
                </>
            </>

        </div>
    )
}
