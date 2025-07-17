import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { DataTable } from 'mantine-datatable';
import { useAuth } from '../../AuthContext';

export default function ViewReport({ selectedData, drawer }: any) {
  const {crmToken, apiUrl } = useAuth()
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [data, setData] = useState([]);



    const [isLoading, setIsLoading] = useState(true);
    useEffect(()=>{
        if(drawer){
            fetchReport();
        }
    },[drawer, page])

    useEffect(()=>{
      if(page!=1) setPage(1)

        else if(drawer) fetchReport();
    },[pageSize])






    const fetchReport = async () => {
        console.log("Fetching SMS Campaigns........")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/reports/sms/" + selectedData.id,
                params: { page: page, pageSize: pageSize },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setData(response.data.data)
                console.log('viewwww report', response.data.data);
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
                        SMS Reports
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
                        records={data?.data}
                        columns={[
                            {
                                accessor: 'MobileNumber', title: 'Phone Number', render: ({ MobileNumber }: any) => {
                                    return (
                                        <b>{MobileNumber}</b>
                                    )
                                },
                            },

                            {
                                accessor: 'SenderId', title: 'Sender Id', render: ({ SenderId }: any) => {
                                    return (
                                        <span className='badge bg-[#3b3f5c] w-fit'>{SenderId}</span>
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
                                        <span className={`badge ${Status == "DELIVRD" ? 'bg-success' : Status == "SUBMITTED" ? 'bg-warning' : 'bg-primary'} `} >{Status}</span>
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
            </section>
        </div>
    )
}
