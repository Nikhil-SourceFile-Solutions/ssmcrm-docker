import React, { useEffect, useState } from 'react'
import { IRootState } from '../../store';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'mantine-datatable';
import { useAuth } from '../../AuthContext';

export default function ViewWhatsappReport({ selectedData, drawer }: any) {

  const { settingData, crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [data, setData] = useState([]);
    useEffect(() => {
        if (drawer) {
            setData([])
            fetchReport();
        }
    }, [page, search, selectedData, drawer])
    useEffect(() => {
        setPage(1);
    }, [pageSize]);


    const [isLoading, setIsLoading] = useState(true);




    const fetchReport = async () => {
        console.log("Fetching SMS Campaigns........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/reports/whatsapp/" + selectedData.id,
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
    return (

        <div className="flex flex-col h-screen overflow-hidden">
            <div className="w-full py-4">
                <div className='flex justify-between'>
                    <h3 className="mb-1 dark:text-white font-bold text-[18px]">
                        Whatsapp Reports
                    </h3>

                    <button className='btn btn-sm btn-dark shadow' onClick={() => fetchReport()} disabled={isLoading ? true : false}>{isLoading ? "Loading..." : "Reload"}</button>
                </div>
                <hr className="my-4 dark:border-[#191e3a]" />
            </div>

            <section className="flex-1 overflow-y-auto overflow-x-hidden perfect-scrollbar ">




                <div className="datatables">
                    <DataTable
                        noRecordsText="No results match your search query"
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={data[0]}
                        columns={[
                            {
                                accessor: 'MobileNumber', title: 'Phone Number', render: ({ MobileNumber }: any) => {
                                    return (
                                        <b>{MobileNumber}</b>
                                    )
                                },
                            },



                            {
                                accessor: 'SubmitDate', title: 'Date', render: ({ SubmitDate, DoneDate }: any) => {
                                    return (
                                        <b>{SubmitDate} <br />{DoneDate}</b>

                                    )
                                },
                            },

                            {
                                accessor: 'Status', title: 'Status',
                                render: ({ Status }: any) => {
                                    return (
                                        <span className='badge bg-primary' >{Status}</span>
                                    )
                                },
                            },
                            {
                                accessor: 'ErrorCode', title: 'ErrorCode',
                                render: ({ ErrorCode }) => {
                                    return (

                                        <span className='font-bold badge bg-[#DBE7FF] text-[12px] text-[#506690]'>{ErrorCode}</span>
                                    )
                                },
                            },


                        ]}
                        fetching={isLoading}
                        loaderColor="blue"
                        loaderBackgroundBlur={4}
                        totalRecords={data[2]}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        minHeight={200}
                        paginationText={({ totalRecords }: any) => `Showing  ${data[3]} to ${data[4]} of ${totalRecords} entries`}
                    />

                </div>
            </section>
        </div>
    )
}
