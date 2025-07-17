import { useState, useEffect } from 'react';
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

export default function GetMobileNoDrawer({ showWAMobileNoDrawer, setWAMobileNoDrawer, reportData, fetchData1 }: any) {

    console.log('reportDatareportDatareportData', reportData);
    // const upateddata = reportData?.update_data
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const { settingData, crmToken, apiUrl, authUser, logout } = useAuth()
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [dropdowns, setDropdown] = useState([])
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    // useEffect(() => {
    //     if (!crmToken) navigate('/')
    //     else {
    //         console.log(page)
    //         dispatch(setPageTitle('Dropdown'));
    //     }
    // }, [page]);


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


    const formatArrayString = (arrayString) => {
        console.log('arrayString', arrayString)
        try {
            const array = JSON.parse(arrayString);
            return array.join(', ');
        } catch (error) {
            return arrayString; // In case of parsing error, return the original string
        }
    };

    const heloo = reportData.contact_details
    return (
        <div>
            <div className={`${(showWAMobileNoDrawer && '!block') || ''} fixed inset-0 bg-[black]/60 z-[51] px-4 hidden transition-[display]`} onClick={() => setWAMobileNoDrawer(!showWAMobileNoDrawer)}>
            </div>
            <nav className={`${(showWAMobileNoDrawer && 'ltr:!right-0 rtl:!left-0') || ''} bg-white fixed ltr:-right-[800px] rtl:-left-[800px] top-0 bottom-0 w-full max-w-[600px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-1000 z-[51] dark:bg-black p-4 pt-0`}>
                <div className="flex flex-col h-screen overflow-hidden">
                    <div className="w-full py-4">
                        <div>
                            <h3 className="mb-1 dark:text-white font-bold text-[18px]">{reportData.campaign_name} - Updates </h3>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                    </div>

                    <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar ">
                        <div>

                            {reportData.contact_details}
                        </div>

                        {/* <div className="datatables">
                            <DataTable
                                className="whitespace-nowrap table-hover"
                                records={reportData}
                                columns={[

                                    {
                                        accessor: 'contact_details',
                                        sortable: true,
                                        render: ({ contact_details}) => (
                                            <div className="flex flex-col gap-2">
                                                <div className="font-semibold">{contact_details}</div>
                                            </div>
                                        ),
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
                                loaderColor="blue"
                                loaderBackgroundBlur={4}
                                paginationText={({ from, to, totalRecords }) => `Showing  ${response?.form} to ${response.to} of ${totalRecords} entries`}
                            />



                        </div> */}
                    </section>
                </div>
            </nav>
        </div>
    )
}

