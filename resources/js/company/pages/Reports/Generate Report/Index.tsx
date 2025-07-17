import React from 'react';
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';



import Create from './Create';
import { DataTable } from 'mantine-datatable';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import { GoTrash } from 'react-icons/go';
import Swal from 'sweetalert2';
import Download from './Download';
import { IoMdRefresh } from 'react-icons/io';


const Index = () => {
    const { logout, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Generate Report')); });


    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');

    const [data, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);




    useEffect(() => {
        fetchReports()
    }, [page, search])
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const fetchReports = async () => {
        console.log("Fetching Reports........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/reports",
                params: { page: page, size: pageSize },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
            }
        } catch (error) {

            console.log(error)

        } finally {
            setIsLoading(false)
        }
    }



    const deleteReport = (data) => {
        Swal.fire({
            icon: 'question',
            title: 'Are You Sure',
            confirmButtonText: 'Yes',
            text: 'You cant able to retrive this lead again!',
            showLoaderOnConfirm: true,
            customClass: 'sweet-alerts',
            preConfirm: async () => {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + "/api/reports/" + data.id,
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + crmToken,
                        },
                    });

                    if (response.data.status == "success") {
                        fetchReports()
                        Swal.fire({
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    } else if (response.data.status == "error") {
                        Swal.fire({
                            icon: response.data.status,
                            title: response.data.title,
                            text: response.data.message,
                            padding: '2em',
                            customClass: 'sweet-alerts',
                        });
                    }
                } catch (error) {
                    if (error?.response?.status == 401) logout()
                    console.log(error)

                }
            },
        });
    }

    const [downloadData, setDownloadData] = useState(null);
    const [downloadModal, setDownloadModal] = useState(false);

    const [showGReportDrawer, setShowGReportDrawer] = useState(false)


    return (

        <>
            <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                <div className="flex flex-col h-full">
                    <div className='panel'>
                        <div className='flex items-center justify-between mb-5'>
                            <h5 className="font-semibold text-lg dark:text-white-light">Report List</h5>
                            <div className='flex gap-4'>

                                <button className='btn btn-sm btn-primary' onClick={() => setShowGReportDrawer(!showGReportDrawer)}>Generate Lead Report</button>
                                <button onClick={() => { fetchReports() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                    <IoMdRefresh className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* <hr className="my-4 dark:border-[#191e3a]" /> */}



                        <div className="datatables">
                            <DataTable
                                noRecordsText="No results match your search query"
                                highlightOnHover
                                className="whitespace-nowrap table-hover"
                                records={data?.data}
                                columns={[

                                    {
                                        accessor: 'report_name', title: 'Report Name', render: ({ report_name }: any) => {
                                            return (
                                                <b>{report_name}</b>
                                            )
                                        },
                                    },

                                    {
                                        accessor: 'type', title: 'Type', render: ({ type }: any) => {
                                            return (
                                                <b>{type}</b>
                                            )
                                        },
                                    },

                                    {
                                        accessor: 'status', title: 'Status',
                                        render: (data: any) => {
                                            return (
                                                <b>{data.status}</b>
                                            )
                                        },
                                    },

                                    {
                                        accessor: 'date_range', title: 'Date Range',
                                        render: (data: any) => {
                                            return (
                                                <b>{JSON.parse(data?.date_range)?.map((date, i) => (i > 0 ? ' to ' : '') + date).join('')}</b>
                                            )
                                        },
                                    },

                                    {
                                        accessor: 'id', title: 'Download', render: (data: any) => {
                                            return (
                                                <div>
                                                    <span className='badge bg-[#1d67a7] cursor-pointer me-2' onClick={() => {
                                                        setDownloadData(data)
                                                        setDownloadModal(true);
                                                    }}>Download</span>
                                                </div>

                                            )
                                        },
                                    },

                                    {
                                        accessor: 'first_name', title: 'Created By',
                                        render: (data: any) => {
                                            return (
                                                <b>{data.first_name} {data.last_name}</b>
                                            )
                                        },
                                    },

                                    {
                                        accessor: 'created_at', title: 'Created At',
                                        render: (data: any) => {
                                            return (
                                                <b>{data.created_at} </b>
                                            )
                                        },
                                    },

                                    {
                                        accessor: 'last_name', title: 'Delete', render: (data: any) => {
                                            return (
                                                <div>
                                                    <button onClick={() => deleteReport(data)}>
                                                        <GoTrash className="w-5 h-5 text-danger" />
                                                    </button>
                                                </div>

                                            )
                                        },
                                    },
                                ]}
                                fetching={isLoading}
                                loaderColor="blue"
                                loaderBackgroundBlur={4}
                                totalRecords={data?.totalItems}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={setPageSize}
                                minHeight={200}
                                paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data?.to} of ${totalRecords} entries`}
                            />
                        </div>

                    </div>
                </div>

            </div>

            <Create showGReportDrawer={showGReportDrawer} setShowGReportDrawer={setShowGReportDrawer} fetchReports={fetchReports} />

            {downloadData && <Download downloadModal={downloadModal} setDownloadModal={setDownloadModal} downloadData={downloadData} />}
        </>

    );
};

export default Index;
