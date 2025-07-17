import { DataTable } from 'mantine-datatable'
import React from 'react'
import Flatpickr from 'react-flatpickr';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Freetrial({ freeTrailData, freeTrailPageSize, freeTrailPage,
    setFreeTrailPage, freeTrail_PAGE_SIZES, setFreeTrailPageSize, freeTrailReload,
    freeTrailDate, setFreeTrailDate
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
                <div><h5 className="font-semibold text-lg dark:text-white-light">Free Trial</h5></div>
                <div className="flex items-center flex-wrap">
                    <div>
                        <Flatpickr
                            options={{
                                dateFormat: 'Y-m-d',
                                position: 'auto left',
                            }}
                            value={freeTrailDate}
                            className="form-input w-[150px]"
                            onChange={(CustomDate) => {
                                const date = CustomDate.map((dateStr) => {
                                    const formattedDate = dateFormatter.format(new Date(dateStr));
                                    return formattedDate.split('/').reverse().join('-');
                                });
                                if (date.length == 1) setFreeTrailDate(date[0])
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
                        records={freeTrailData.data}
                        columns={[
                            { accessor: 'first_name', title: 'Name' },
                            { accessor: 'phone', title: 'Phone' },
                            { accessor: 'state', title: 'State' },
                            {
                                accessor: 'free_trial', title: 'Free Trial Date'
                            },
                        ]}

                        onCellClick={({ record, column }: any) => {
                            navigate('/leads/viewleads/show', {
                                state: {
                                    lead_id: record.id,
                                    filterOwner: authUser.id,
                                    filterStatus: 'today-free-trial',
                                    filterState: 0,
                                    multyLead: 1,
                                }
                            });
                        }}

                        totalRecords={freeTrailData.totalItems}
                        recordsPerPage={freeTrailPageSize}
                        page={freeTrailPage}
                        onPageChange={(p) => setFreeTrailPage(p)}
                        recordsPerPageOptions={freeTrail_PAGE_SIZES}
                        onRecordsPerPageChange={setFreeTrailPageSize}
                        fetching={freeTrailReload}
                        minHeight={200}
                        paginationText={({ totalRecords }) => `Showing  ${freeTrailData.from} to ${freeTrailData.to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    )
}
