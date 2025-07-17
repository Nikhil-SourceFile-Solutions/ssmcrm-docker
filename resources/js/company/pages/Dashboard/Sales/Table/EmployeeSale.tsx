import React from 'react'
import { useAuth } from '../../../../AuthContext'
import { DataTable } from 'mantine-datatable'
function EmployeeSale({ allSales, isLoading }) {

    console.log(allSales, isLoading)
    const { settingData } = useAuth()
    return (
        <div className="table-responsive">
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    className="whitespace-nowrap table-hover"
                    records={allSales}
                    columns={[
                        {
                            accessor: 'owner',
                            title: 'Owner',
                            render: ({ owner }) => (
                                <b>{owner}</b>
                            ),
                        },
                        {
                            accessor: 'sale_price',
                            title: 'Sale Price',
                            render: ({ sale_price }) => (
                                <b className='text-primary'>{sale_price}</b>
                            ),
                        },
                        {
                            accessor: 'client_paid',
                            title: 'Client Paid',
                            render: ({ client_paid }) => (
                                <b className='text-[#009688]'>{client_paid}</b>
                            ),
                        },
                        {
                            accessor: 'offer_price',
                            title: 'Offer Price',
                            render: ({ offer_price }) => (
                                <b className='text-yellow-600'>{offer_price}</b>
                            ),
                        },
                        // Conditionally add GST Value column

                        {
                            accessor: 'total_sales',
                            title: 'Total Sales',
                            render: ({ total_sales }) => (
                                <b className='text-[#03880c]'>{total_sales}</b>
                            ),
                        },
                        {
                            accessor: 'total_count',
                            title: 'No.of Sales',
                            render: ({ total_count }) => (
                                <b >{total_count}</b>
                            ),
                        },
                    ]}
                    totalRecords={1000}
                    // recordsPerPage={filter.yearlyReportFilter.pageSize}
                    // page={filter.yearlyReportFilter.page}
                    recordsPerPageOptions={[12]}
                    // onRecordsPerPageChange={(s) => handleFilter({ action: 'pageSize', value: s })}
                    fetching={isLoading}
                    minHeight={200}
                // paginationText={({ totalRecords }) => {
                //     const from = yearlyReport?.from ?? 0;
                //     const to = yearlyReport?.to ?? 0;
                //     return `Showing ${from} to ${to} of ${totalRecords} entries`;
                // }}
                />

            </div>

        </div>
    )
}

export default EmployeeSale