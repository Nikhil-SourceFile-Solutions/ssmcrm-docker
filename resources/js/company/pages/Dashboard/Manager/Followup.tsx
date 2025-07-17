import { DataTable } from 'mantine-datatable'
import React from 'react'
import Flatpickr from 'react-flatpickr';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';

export default function Followup({
    followUpData,
    followUpPageSize,
    followUpPage,
    setFollowUpPage,
    followUp_PAGE_SIZES,
    setFollowUpPageSize,
    followUpReload,
    followUpDate,
    setFollowUpDate
}) {

    const { authUser } = useAuth();
    const navigate = useNavigate();
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return (
        <div className="panel h-full w-full">
            <div className="flex items-center justify-between mb-5">
                <div><h5 className="font-semibold text-lg dark:text-white-light">Follow UP</h5></div>
                <div className="flex items-center flex-wrap">
                    <div>
                        <Flatpickr
                            options={{
                                dateFormat: 'Y-m-d',
                                position: 'auto left',
                            }}
                            value={followUpDate}
                            className="form-input w-[150px]"
                            onChange={(CustomDate) => {
                                const date = CustomDate.map((dateStr) => {
                                    const formattedDate = dateFormatter.format(new Date(dateStr));
                                    return formattedDate.split('/').reverse().join('-');
                                });
                                if (date.length == 1) setFollowUpDate(date[0])
                            }}
                        />
                    </div>

                </div>
            </div>
            <div className="table-responsive">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={followUpData.data}
                        columns={[
                            { accessor: 'first_name', title: 'Name' },
                            { accessor: 'phone', title: 'Phone' },
                            { accessor: 'state', title: 'State' },
                            {
                                accessor: 'followup', title: 'Follow Up Date'
                            },
                        ]}



                        onCellClick={({ record, column }: any) => {
                            navigate('/leads/viewleads/show', {
                                state: {
                                    lead_id: record.id,
                                    filterOwner: authUser.id,
                                    filterStatus: 'today-follow-up',
                                    filterState: 0,
                                    multyLead: 1,
                                }
                            });
                        }}




                        totalRecords={followUpData.totalItems}
                        recordsPerPage={followUpPageSize}
                        page={followUpPage}
                        onPageChange={(p) => setFollowUpPage(p)}
                        recordsPerPageOptions={followUp_PAGE_SIZES}
                        onRecordsPerPageChange={setFollowUpPageSize}
                        // fetching={followUpReload}
                        minHeight={200}
                        paginationText={({ totalRecords }) => `Showing  ${followUpData.from} to ${followUpData.to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    )
}
