import React,{ useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import axios from 'axios';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { IoCloseSharp } from 'react-icons/io5';
import Tippy from '@tippyjs/react';
import { useAuth } from '../../AuthContext';

const col = ['Id', 'Mobile Number', 'Status'];
export default function SMSReportDrawer({ showSMSReportDrawer, setShowSMSReportDrawer, reportData }: any) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => { dispatch(setPageTitle('SMS Report')); });
    const { crmToken, apiUrl} = useAuth()

    useEffect(() => {
        if (showSMSReportDrawer) getDetails()
    }, [crmToken, showSMSReportDrawer])



    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [response, setResponse] = useState(null);


    const getDetails = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',


                url: apiUrl + "/api/get_sms_reports/" + reportData.id + "?page=" + page + "&pageSize=" + pageSize,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setData(response.data.data)
                console.log(response.data.data)
                setResponse(response.data);
            }
            console.log(response)
        } catch (error) {

        }

        finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className={`${(showSMSReportDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowSMSReportDrawer(!showSMSReportDrawer)}>
            </div>

            <nav className={`${(showSMSReportDrawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[800px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full py-4">
                        <div>

                            <button type="button" className="px-4 py-4 absolute flex gap-5  top-0 ltr:right-0 rtl:left-0   dark:text-white" >
                                <h1 className=' cursor-pointer text-primary opacity-80' onClick={() => { getDetails() }} >Refresh</h1>
                                <IoCloseSharp onClick={() => setShowSMSReportDrawer(false)} className="opacity-30 hover:opacity-100 w-5 h-5" />

                            </button>
                            <h3 className="mb-1 dark:text-white font-bold text-[18px]">Template Name - SMS Report </h3>

                        </div>


                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>


                    <div className="datatables">
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={data}
                            columns={[
                                {
                                    accessor: 'MobileNumber',
                                    sortable: true,
                                    render: ({ MobileNumber }) => (
                                        <div className="flex flex-col gap-2">
                                            <div className="font-semibold">{MobileNumber}</div>
                                        </div>
                                    ),
                                },

                                {
                                    accessor: 'SenderId',
                                    sortable: true,
                                    render: ({ SenderId }) => (
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold">{SenderId}</div>
                                        </div>
                                    ),
                                },

                                {
                                    accessor: 'DoneDate',
                                    title: 'Date Date',
                                    sortable: true,
                                    render: (data) => (
                                        <div className="flex items-center gap-2">
                                            <div className="font-semibold">
                                                <Tippy content="Done Date">
                                                    <div> {data?.DoneDate}</div>
                                                </Tippy>
                                                <Tippy content="Submit Date">
                                                    <div> {data?.SubmitDate}</div>
                                                </Tippy>
                                            </div>
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'Status',
                                    title: 'Status',
                                    sortable: true,
                                    render: ({ Status }) => (<span className='badge bg-primary'>{Status}</span>)
                                },
                                {
                                    accessor: 'ErrorCode',
                                    title: 'ErrorCode',
                                    sortable: true,
                                    render: ({ ErrorCode }) => (<span className='badge bg-primary'>{ErrorCode}</span>)
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
                            paginationText={({ from, to, totalRecords }) => `Showing  ${response?.form} to ${response.to} of ${totalRecords} entries`}
                        />


                    </div>

                </div>
            </nav>
        </div >
    )
}

