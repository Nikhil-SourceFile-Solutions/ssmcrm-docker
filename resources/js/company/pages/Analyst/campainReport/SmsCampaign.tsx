import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconFile from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import { useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import 'tippy.js/dist/tippy.css';
import axios from 'axios';
import Tippy from '@tippyjs/react';
import SmsCampaignDrawer from './SmsCampaignDrawer'
import SmsUpdatedCampaign from './SmsUpdatedCampaign';
import GetSmsMobileNoDrawer from './GetSmsMobileNoDrawer';
import { useAuth } from '../../../AuthContext';

export default function SMSReport() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { crmToken, apiUrl, logout } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [dropdowns, setDropdown] = useState([])
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            console.log(page)
            dispatch(setPageTitle('Dropdown'));
        }
    }, [page]);

    const [isLoading, setIsLoading] = useState(true)
    const [response, setResponse] = useState(null);

    function handleDownloadExcel() {
        const header = ['#', 'Type', 'Value', 'Status'];
        downloadExcel({
            fileName: 'Dropdowns',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: dropdowns.map((dropdown: any, index) => ({
                    a: index + 1,
                    b: dropdown.type,
                    c: dropdown.value,
                    h: dropdown.status ? 'Active' : 'Blocked',
                })),
            },
        });
    }
    const exportTable = (type: any) => {
        let columns: any = ['#', 'Type', 'Value', 'Status'];;
        let records = dropdowns.map((dropdown: any, index) => ({
            "#": index + 1,
            "Type": dropdown.type,
            "Value": dropdown.value,
            "Status": dropdown.status ? 'Active' : 'Blocked',
        }));
        let filename = 'Dropdowns';
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

    const [showSMSReportDrawer, setShowSMSReportDrawer] = useState(false)
    const [reports, setReports] = useState([]);

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-sms?page=" + page + "&pageSize=" + pageSize + "&search=" + search,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setReports(response.data.data.data)
                setResponse(response.data.data);
                console.log(response.data)
            }
        } catch (error) {
            if (error?.response?.status == 401) logout()
        }
        finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchData();
    }, [page, pageSize, search]);

    const [reportData, setReportData] = useState([]);

    const handleReport = (data) => {
        console.log('sendupdatedss data', data);
        setReportData(data);
        setShowSMSReportDrawer(true)

    }
    const handleUpdatedData = (data) => {
        setReportData(data);
        setShowSmsUpdatedData(data);
    }

    const handleMobileNo = (data) => {
        console.log(data)
        setReportData(data);
        setSmsMobileNoDrawer(data);
    }
    const [showSmsUpdatedData, setShowSmsUpdatedData] = useState(false);
    const [showSmsMobileNoDrawer, setSmsMobileNoDrawer] = useState(false);


    return (
        <div className="flex-1 overflow-x-hidden h-full">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <div className="flex items-center flex-wrap">
                    <button type="button" className="btn btn-primary btn-sm m-1" onClick={handleDownloadExcel}>
                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        EXCEL
                    </button>
                    <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                        Print
                    </button>
                </div>

                <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} />

            </div>

            <div className="datatables">
                <DataTable
                    className="whitespace-nowrap table-hover"
                    records={reports}
                    columns={[
                        {
                            accessor: 'id',
                            title: 'ID',
                            sortable: true,
                            render: ({ id }) => (
                                <div className="flex flex-col gap-2">
                                    <div className="font-semibold">{id}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'campaign_name',
                            sortable: true,
                            render: ({ campaign_name, created_at }) => (
                                <div className="flex flex-col gap-2">
                                    <div className="font-semibold">{campaign_name} <br /> {created_at}</div>
                                </div>
                            ),
                        },

                        {
                            accessor: 'sender_id',
                            sortable: true,
                            render: ({ sender_id }) => (
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold">{sender_id}</div>
                                </div>
                            ),
                        },
                        {
                            accessor: 'campaign_name',
                            title: 'Clients',
                            sortable: true,
                            render: (data) => (<span onClick={() => { handleMobileNo(data) }} className='badge bg-primary'>{data?.total_number_count}</span>)
                        },
                        {
                            accessor: 'template',
                            title: 'Content',
                            sortable: true,
                            render: ({ template, template_name }) => (
                                <div className="flex items-center gap-2">
                                    <Tippy content={template}>
                                        <div>
                                            {/* {
                                                    template.length> 30 ?<div>{template.substring(0, 30) + '...'}</div>:<div>{template}</div>
                                                } */}
                                            {template_name}
                                        </div>
                                    </Tippy>
                                </div>
                            ),
                        },
                        {
                            accessor: 'campaign_name',
                            title: 'Report',
                            sortable: true,
                            render: (data) => (
                                <div className='flex gap-4' >

                                    <button className='badge  bg-success' onClick={() => handleReport(data)}> Send Updates</button>
                                    <button className='badge  badge-outline-primary' onClick={() => handleUpdatedData(data)}>View Updates</button>

                                </div>
                                // <button className='btn btn-sm btn-success' onClick={() => handleReport(data)}> Send Updates</button>
                            )
                        },


                    ]}
                    highlightOnHover
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
                    paginationText={({ from, to, totalRecords }) => `Showing  ${response?.from} to ${response.to} of ${totalRecords} entries`}
                />

                <SmsCampaignDrawer showSMSReportDrawer={showSMSReportDrawer}
                    setShowSMSReportDrawer={setShowSMSReportDrawer} reportData={reportData} />

                <SmsUpdatedCampaign showSmsUpdatedData={showSmsUpdatedData}
                    setShowSmsUpdatedData={setShowSmsUpdatedData} reportData={reportData} fetchData1={fetchData} />

                <GetSmsMobileNoDrawer showSmsMobileNoDrawer={showSmsMobileNoDrawer}
                    setSmsMobileNoDrawer={setSmsMobileNoDrawer} reportData={reportData} fetchData1={fetchData} />
            </div>
        </div>

    )
}
