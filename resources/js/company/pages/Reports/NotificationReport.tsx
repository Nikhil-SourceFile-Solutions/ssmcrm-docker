import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { IoSearchSharp } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';
import { useAuth } from '../../AuthContext';
import { setPageTitle } from '../../store/themeConfigSlice';

export default function NotificationReport() {
    const dispatch = useDispatch();
    useEffect(() => { dispatch(setPageTitle('Application Report')); });

    const { settingData, crmToken, apiUrl } = useAuth()
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [data, setData] = useState<any>([]);

    const fetchApplication = async () => {

        console.log('*** Fetching Application data ***')

        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/reports/application",
                params: {
                    page: page,
                    pageSize: pageSize,
                    search: search,
                },

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == "success") {
                setData(response.data.data);
                console.log(response.data.data);
            }
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }
    const [reload, setReload] = useState(false);


    useEffect(() => {
        if (reload) {
            fetchApplication()
            setReload(false);
        }
    }, [reload]);

    useEffect(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
    }, [pageSize]);

    useEffect(() => {
        if (!reload) {
            setReload(true);
        }
    }, [page]);

    const [isLoading, setIsLoading] = useState(false)

    const searchSetting = () => {
        if (page !== 1) {
            setPage(1);
        } else {
            setReload(true);
        }
        setSearch(search)
    }

    return (
       <>
        <div className="panel flex-1 overflow-x-hidden h-full">
        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
            <div className="flex items-center flex-wrap justify-between gap-2 ">

                <div className="flex">
                    <input type="text" value={search} onChange={(e) => { setSearch(e.target.value) }} placeholder="Search by Name" className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                    <div onClick={() => { searchSetting() }} className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                        <IoSearchSharp />
                    </div>
                </div>
                <button onClick={() => { fetchApplication() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                    <IoMdRefresh className="w-5 h-5" />
                </button>
            </div>

        </div>
        <div className="datatables">
            <DataTable
                highlightOnHover
                className="whitespace-nowrap table-hover"
                records={data?.data}
                columns={[
                    {
                        accessor: 'Campaign Name',
                        sortable: true,
                        render: ({ campaign_name }) => (
                            <div className="flex items-center font-semibold">
                                <div>{campaign_name}</div>
                            </div>
                        ),
                    },

                    {
                        accessor: 'Application Content',
                        sortable: true,
                        render: ({ campaign }) => (
                            <div className='max-w-[400px]' style={{ textWrap: "wrap" }}>
                            <h1><b>{campaign}</b></h1>
                        </div>

                        ),
                    },

                    {
                        accessor: 'Date',
                        sortable: true,
                        render: ({ created_at }) => (<p>
                            {created_at}</p>),
                    },

                    {
                        accessor: 'Status',
                        sortable: true,
                        render: () => (
                            <div className="flex gap-2">
                                <span className="badge bg-success">success</span>
                            </div>
                        ),
                    },


                ]}



                totalRecords={data?.totalItems}
                recordsPerPage={data?.pageSize}
                page={page}
                fetching={isLoading}
                onPageChange={(p) => setPage(p)}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={setPageSize}
                minHeight={200}
                paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data?.to} of ${totalRecords} entries`}

            />
        </div>

        </div>

       </>

    )
}


