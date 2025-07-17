import React from 'react'
import { useAuth } from '../../../../AuthContext'
import { DataTable } from 'mantine-datatable'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { IoMdRefresh } from 'react-icons/io';

function MonthlyReport({
    monthlyReport,
    filter,
    setFilter,
    isLoading,
}) {
    const { settingData } = useAuth()

    const handleFilter = (data) => {
        setFilter(prevState => ({
            ...prevState,
            monthlyReportFilter: {
                ...prevState.monthlyReportFilter,
                [data.action]: data.value
            }
        }));
    }
    return (
        <div className="panel h-full w-full">
            <div className="flex items-center justify-between mb-5">
                <div><h5 className="font-semibold text-lg dark:text-white-light"> Monthly Report </h5></div>
                <div className="flex items-center flex-wrap">
                    <div>
                        <select name="ctnSelect1" className="form-select form-select-sm text-white-dark w-[180px] mr-2"
                            value={filter.monthlyReportFilter.selectedMonth}
                            onChange={(e) => handleFilter({ action: 'selectedMonth', value: e.target.value })}
                            required>
                            <option value={'01'}>January</option>
                            <option value={'02'}>Febuary</option>
                            <option value={'03'}>March</option>
                            <option value={'04'}>April</option>
                            <option value={'05'}>May</option>
                            <option value={'06'}>June</option>
                            <option value={'07'}>July</option>
                            <option value={'08'}>August</option>
                            <option value={'09'}>September</option>
                            <option value={'10'}>October</option>
                            <option value={'11'}>November</option>
                            <option value={'12'}>December</option>
                        </select>
                    </div>
                    <div>
                        <select name="ctnSelect1" className="form-select form-select-sm text-white-dark w-[180px]"
                            onChange={(e) => handleFilter({ action: 'selectedYear', value: e.target.value })}
                            value={filter.monthlyReportFilter.selectedYear} required>
                            <option>2021</option>
                            <option>2022</option>
                            <option>2023</option>
                            <option>2024</option>
                            <option>2025</option>
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
            <div className="table-responsive">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={monthlyReport.data}
                        columns={[
                            {
                                accessor: 'owner',
                                title: 'Name',
                                render: ({ owner, user_type }: any) => (
                                    <div className='flex flex-col'>
                                        <b>{owner}</b>
                                        <b className='text-bold text-[11px]'>{user_type}</b>
                                    </div>
                                ),
                            },
                            {
                                accessor: 'sale_price',
                                title: 'Product Value',
                                render: ({ sale_price, client_paid, offer_price }: any) => (
                                    <Tippy content={
                                        <div>
                                            <div><span>Product Value: </span> <b>&nbsp;{sale_price}</b></div>
                                            <div><span>Client Paid: </span> <b>&nbsp;{client_paid}</b></div>
                                            {offer_price ? <div><span>Offer Price: </span> <b>&nbsp;{offer_price}</b></div> : null}
                                        </div>
                                    } placement="top">
                                        <b>₹{client_paid}</b>
                                    </Tippy>
                                ),
                            },

                            {
                                accessor: 'total_sales',
                                title: 'Sales',
                                render: ({ total_sales }: any) => (
                                    <b>₹{total_sales}</b>
                                ),
                            },
                        ].filter(Boolean)}  // Filter out null columns
                        totalRecords={monthlyReport.totalItems}
                        recordsPerPage={filter.monthlyReportFilter.pageSize}
                        page={filter.monthlyReportFilter.page}
                        onPageChange={(p) => handleFilter({ action: 'page', value: p })}
                        recordsPerPageOptions={[10, 20, 30, 50, 100]}
                        onRecordsPerPageChange={(s) => handleFilter({ action: 'pageSize', value: s })}
                        fetching={isLoading}
                        minHeight={200}
                        paginationText={({ totalRecords }) => `Showing ${monthlyReport.from} to ${monthlyReport.to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    )
}

export default MonthlyReport