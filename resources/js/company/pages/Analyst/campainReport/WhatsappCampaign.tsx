import React, { useEffect, useState } from 'react';
import IconFile from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import 'tippy.js/dist/tippy.css';

export default function WhatsappReport() {
    return (
        <div className="panel flex-1 overflow-x-hidden h-full">
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                <div className="flex items-center flex-wrap">
                    <button type="button" className="btn btn-primary btn-sm m-1" onClick={() => alert(9)}>
                        <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        EXCEL
                    </button>
                    <button type="button" onClick={() => alert("Haiiiiii")} className="btn btn-primary btn-sm m-1">
                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                        PRINT
                    </button>
                </div>
                <input type="text" className="form-input w-auto" placeholder="Search..." onChange={(e) => alert(e.target.value)} />
            </div>

            <div className="datatables">
                {/* <DataTable
                    className="whitespace-nowrap table-hover"
                    records={reports}
                    columns={[
                        // {
                        //     accessor: 'id',
                        //     title: 'ID',
                        //     sortable: true,
                        //     render: ({ id }) => (
                        //         <div className="flex flex-col gap-2">
                        //             <div className="font-semibold">{id}</div>
                        //         </div>
                        //     ),
                        // },
                        {
                            accessor: 'campaign_name',
                            sortable: true,
                            render: ({ campaign_name, created_at, update_data }) => (
                                <div className="flex flex-col gap-2">
                                    <div className="font-semibold">{campaign_name}  </div>
                                </div>
                            ),
                        },


                        {
                            accessor: 'campaign_name',
                            title: 'Clients',
                            sortable: true,
                            render: (data) => (<span onClick={() => handleMobileNo(data)} className='badge bg-primary'>{data.total_number_count}</span>)
                        },
                        {
                            accessor: 'template',
                            title: 'Content',
                            sortable: true,
                            render: ({ t2, template }) => (
                                <Tippy content={template}>
                                    <div>
                                        {t2}
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
                        {
                            accessor: 'campaign_name',
                            title: 'Report',
                            sortable: true,
                            render: (data) => (
                                <div className='flex gap-4' >

                                    <button className='badge  bg-success' onClick={() => handleReport(data)}> Send Updates</button>
                                    <button className='badge  badge-outline-primary' onClick={() => handleUpdatedData(data)}>View Updates</button>

                                </div>
                            )
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
                <WhatsappCampaignDrawer showWACampaignDrawer={showWACampaignDrawer}
                    setShowWACampaignDrawer={setShowWACampaignDrawer} reportData={reportData} fetchData1={fetchData} />

                <WhatsappUpdatedCampaign showWAUpdatedData={showWAUpdatedData}
                    setShowWAUpdatedData={setShowWAUpdatedData} reportData={reportData} fetchData1={fetchData} />
                <GetWAMobileNoDrawer showWAMobileNoDrawer={showWAMobileNoDrawer}
                    setWAMobileNoDrawer={setWAMobileNoDrawer} reportData={reportData} fetchData1={fetchData} /> */}
            </div>
        </div>

    )
}



