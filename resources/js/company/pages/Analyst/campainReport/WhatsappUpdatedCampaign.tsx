import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import { useAuth } from '../../../AuthContext';

export default function WhatsappUpdatedCampaign({ showWAUpdatedData, setShowWAUpdatedData, reportData, fetchData1 }: any) {

    console.log('reportDatareportDatareportData', reportData?.update_data);
    const upateddata = reportData?.update_data
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const { crmToken, apiUrl, logout } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterType, setFilterType] = useState('');
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

    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
    }, [page, pageSize, search, filterType])

    const [response, setResponse] = useState(null);
    const [reports, setReports] = useState([]);

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',

                url: apiUrl + "/api/get-whatsapp?page=" + page + "&pageSize=" + pageSize + "&search=" + search,

                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setReports(response.data.data.data)
                setResponse(response.data.data);
                // console.log('smsdata', response.data.whatsappdata)
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

    // const [reportData, setReportData] = useState([]);
    const [showWACampaignDrawer, setShowWACampaignDrawer] = useState(false);
    // const[showWAUpdatedData,setShowWAUpdatedData]=useState(false);


    return (
        <div>
            <div className={`${(showWAUpdatedData && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setShowWAUpdatedData(!showWAUpdatedData)}>
            </div>
            <nav className={`${(showWAUpdatedData && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[600px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full py-4">
                        <div>
                            <h3 className="mb-1 dark:text-white font-bold text-[18px]">{reportData.campaign_name} - Updates </h3>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar ">
                        <div className="datatables">
                            <DataTable
                                className="whitespace-nowrap table-hover"
                                records={upateddata}
                                columns={[

                                    {
                                        accessor: 'campaign_name',
                                        sortable: true,
                                        render: ({ campaign_name, created_at, update_data }) => (
                                            <div className="flex flex-col gap-2">
                                                <div className="font-semibold">{campaign_name}</div>


                                            </div>
                                        ),
                                    },


                                    {
                                        accessor: 'template',
                                        title: 'Content',
                                        sortable: true,
                                        render: ({ t2, template }) => (
                                            <Tippy content={template}>
                                                <div>
                                                    {/* {template} */}
                                                    {
                                                        template.length > 20 ? <div>{template.substring(0, 20) + '...'}</div> : <div>{template}</div>
                                                    }
                                                </div>
                                            </Tippy>
                                        ),
                                    },
                                    {
                                        accessor: 'created_at',
                                        title: 'DateTime',
                                        sortable: true,
                                        render: ({ created_at }) => (<span >{created_at}</span>)
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
                    </section>
                </div>
            </nav>
        </div >
    )
}

