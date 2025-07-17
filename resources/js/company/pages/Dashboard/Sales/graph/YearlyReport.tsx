import { DataTable } from 'mantine-datatable'
import React from 'react'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useAuth } from '../../../../AuthContext';
import { IoMdRefresh } from 'react-icons/io';

function getLastFiveYears(): number[] {
    const currentYear: number = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i < 5; i++) {
        years.push(currentYear - i);
    }
    return years;
}

export default function YearlyReport({
    yearlyReport, filter, setFilter, isLoading,
}) {

    const handleFilter = (data) => {
        setFilter(prevState => ({
            ...prevState,
            yearlyReportFilter: {
                ...prevState.yearlyReportFilter,
                [data.action]: data.value
            }
        }));
    }

    const { settingData } = useAuth()
    const years = getLastFiveYears();



    interface SalesData {
        month_name: string;
        year: string;
        total_sales: number;
        sale_price: number;
        client_paid: number;
        offer_price?: number;

    }



    console.log("yearlyReport?.data", yearlyReport?.data)


    return (
        <div className=" h-full w-full">
            <div className="flex items-center justify-between mb-5">
                <div><h5 className="font-semibold text-lg dark:text-white-light"> Yearly Report  </h5></div>
                <div className="flex items-center flex-wrap">
                    <div>
                        <select name="ctnSelect1" value={filter.yearlyReportFilter.selectedYear} className="form-select form-select-sm text-white-dark w-[240px]"
                            onChange={(e) => handleFilter({ action: 'selectedYear', value: e.target.value })}>
                            {years.map((year, i) => (
                                <option key={i} value={year}> {year} - {year + 1}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    className='bg-dark btn btn-sm shadow'
                    onClick={() => handleFilter({ action: "reload", value: !filter?.reload })}
                >
                    <IoMdRefresh className="w-5 h-5" color='white' />
                </button>
            </div>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-white shadow rounded">
                    <p>Sales Price</p>
                    <p>1500000000000</p>
                </div>
                <div className="p-4 bg-white shadow rounded">
                    <p>Client Paid</p>
                    <p>1500000000000</p>
                </div>
                <div className="p-4 bg-white shadow rounded">
                    <p>Offer Price</p>
                    <p>1500000000000</p>
                </div>
               
                <div className="p-4 bg-white shadow rounded">
                    <p>Sales Amount</p>
                    <p>1500000000000</p>
                </div>
            </div> */}

            <div className="table-responsive">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={yearlyReport?.data}
                        columns={[
                            {
                                accessor: 'month_name',
                                title: 'Month',
                                render: ({ month_name, year }: SalesData) => (
                                    <b>{month_name} {year}</b>
                                ),
                            },
                            {
                                accessor: 'sale_price',
                                title: 'Sale Price',
                                render: ({ sale_price }: SalesData) => (
                                    <b className='text-primary'>{sale_price}</b>
                                ),
                            },
                            {
                                accessor: 'client_paid',
                                title: 'Client Paid',
                                render: ({ client_paid }: SalesData) => (
                                    <b className='text-[#009688]'>{client_paid}</b>
                                ),
                            },
                            {
                                accessor: 'offer_price',
                                title: 'Offer Price',
                                render: ({ offer_price }: SalesData) => (
                                    <b className='text-yellow-600'>{offer_price}</b>
                                ),
                            },


                            {
                                accessor: 'total_sales',
                                title: 'Total Sales',
                                render: ({ total_sales }: SalesData) => (
                                    <b className='text-[#03880c]'>{total_sales}</b>
                                ),
                            },
                        ]}
                        totalRecords={yearlyReport?.totalItems}
                        recordsPerPage={filter.yearlyReportFilter.pageSize}
                        page={filter.yearlyReportFilter.page}
                        recordsPerPageOptions={[12]}
                        onRecordsPerPageChange={(s) => handleFilter({ action: 'pageSize', value: s })}
                        fetching={isLoading}
                        minHeight={200}
                        paginationText={({ totalRecords }) => {
                            const from = yearlyReport?.from ?? 0;
                            const to = yearlyReport?.to ?? 0;
                            return `Showing ${from} to ${to} of ${totalRecords} entries`;
                        }}
                    />

                </div>

            </div>
        </div >
    )
}
