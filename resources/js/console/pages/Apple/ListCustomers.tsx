import { DataTable } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { downloadExcel } from 'react-export-table-to-excel';
import IconFile from '../../components/Icon/IconFile';
import IconPrinter from '../../components/Icon/IconPrinter';
import { FaEdit } from "react-icons/fa";
import Customer from './Customer';
import { useAuth } from '../../AuthContext';
import axios from 'axios';
import { FaEye } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

export default function ListCustomers() {
    const { logout, authUser, crmToken, apiUrl } = useAuth();

    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('List Plans')); });
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [250, 500, 1000, 1500, 2000, 2500];;
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [data, setData] = useState<any>([]);
    const [search, setSearch] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(1);

    useEffect(() => {
        fetchCustomers()
    }, [page, pageSize])


    useEffect(() => {
        if (page == 1) fetchCustomers()
        else setPage(1)
    }, [search])




    const [mainDomain, setMainDomain] = useState('localhost:8000');
    const fetchCustomers = async () => {

        setIsLoading(true); setFetchError(0)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/companies',
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
                if (response.data.domain) setMainDomain(response.data.domain)


            }


        } catch (e) {
            if (e?.response?.status) setFetchError(e?.response)
        } finally {
            setIsLoading(false)
        }

    }

    // Lead View

    const [company, setCompany] = useState<any>(null);
    const [showCustomerViewDrawer, setCustomerViewShowDrawer] = useState(false)

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


    return (

        <div>
            <div className="panel">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Customers </h5>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        {/* Add Customers */}
                        <button onClick={() => {
                            setCompany(null)
                            setCustomerViewShowDrawer(!showCustomerViewDrawer)
                        }

                        } className="btn btn-primary">New Customer </button>

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
                    <div className="flex gap-4 justify-between items-center">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />

                        <button className="btn btn-sm btn-dark shadow" disabled={isLoading} onClick={() => fetchCustomers()} >Reload</button>
                    </div>
                </div>

                <div className="datatables">
                    <DataTable
                        noRecordsText="No results match your search query"
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={data?.data}
                        columns={[

                            {
                                accessor: 'id',
                                title: '#',
                                cellsClassName: "font-bold"
                            },
                            {
                                accessor: 'Full Name',
                                sortable: true,
                                render: ({ customer_name, company_name }) => (
                                    <div className="flex items-center gap-2">


                                        <img src={`https://ui-avatars.com/api/?name=${customer_name}&background=random`} className="w-10 h-10 rounded-full max-w-none" alt="user-profile" />
                                        <div className='flex flex-col'>
                                            <b>{customer_name}</b>
                                            <small className='font-bold'>{company_name}</small>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'Mobile Number',
                                sortable: true,
                                render: ({ customer_phone }) => (
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold">{customer_phone}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'Email ID',
                                sortable: true,
                                render: ({ customer_email }) => (
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold">{customer_email}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'State',
                                sortable: true,
                                render: ({ state, city }) => (
                                    <div className="flex flex-col gap-2">
                                        <div className="font-semibold">{city}, {state}</div>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'Status',
                                sortable: true,
                                render: ({ status }) => (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`badge ${status ? 'bg-success' : 'bg-danger'} `}>{status ? 'Active' : 'Blocked'}</span>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'Action',
                                sortable: true,
                                render: (data) => (
                                    <div className="flex gap-2">
                                        <NavLink to={`/customers/${data.domain}`} className="btn btn-info w-10 h-10 p-0 rounded-full"><FaEye size={20} /></NavLink>
                                        <button type="button" className="btn btn-secondary w-10 h-10 p-0 rounded-full"
                                            onClick={() => {
                                                setCompany(data)
                                                setCustomerViewShowDrawer(true)
                                            }}
                                        ><FaEdit size={20} /></button>
                                        <button type="button" className="btn btn-gradient w-10 h-10 p-0 rounded-full"
                                            onClick={() => window.open('http://' + data.domain + '.' + mainDomain, '_blank')}
                                        ><FaExternalLinkAlt size={20} /></button>
                                    </div>
                                ),
                            },
                        ]}


                        // onCellClick={({ record }) => {
                        //                     setSelectedLead(record)
                        //                 }}
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
            </div>

            <Customer showCustomerViewDrawer={showCustomerViewDrawer} setCustomerViewShowDrawer={setCustomerViewShowDrawer} fetchCustomers={fetchCustomers} company={company} />
        </div >
    )
}
