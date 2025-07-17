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
import { useAuth } from '../../AuthContext';

export default function SMSReportDrawer({ showWAReportDrawer, setShowWAReportDrawer, reportData }: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => { dispatch(setPageTitle('WhatsApp Report')); });

  const {crmToken, apiUrl } = useAuth()

    useEffect(() => {
        if (showWAReportDrawer) getDetails()
    }, [crmToken, showWAReportDrawer])

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    const getDetails = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-whatsapp-report/" + reportData.id,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setData(response.data.data)
                console.log(response.data.data)
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
            <div className={`${(showWAReportDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowWAReportDrawer(!showWAReportDrawer)}>
            </div>

            <nav className={`${(showWAReportDrawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[800px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full py-4">
                        <button type="button" className="px-4 py-4 absolute flex gap-5  top-0 ltr:right-0 rtl:left-0   dark:text-white" >
                            <h1 className=' cursor-pointer text-primary opacity-80' onClick={() => { getDetails() }} >Refresh</h1>
                            <IoCloseSharp onClick={() => setShowWAReportDrawer(false)} className="opacity-30 hover:opacity-100 w-5 h-5" />

                        </button>
                        <h3 className="mb-1 dark:text-white font-bold text-[18px]">Template Name - Whatsapp Report</h3>
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
                                    render: ({ number }) => (
                                        <div className="flex flex-col gap-2">
                                            <div className="font-semibold">{number}</div>
                                        </div>
                                    ),
                                },

                                {
                                    accessor: 'status',
                                    title: 'Status',
                                    sortable: true,
                                    render: ({ message_id }) => (<span className='badge bg-primary'>{message_id}</span>)
                                },

                            ]}
                            highlightOnHover
                            totalRecords={data?.total}
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
                            paginationText={({ from, to, totalRecords }) => `Showing  ${data?.form} to ${data.to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </nav >
        </div >
    )
}


