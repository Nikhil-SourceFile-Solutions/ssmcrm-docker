import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import axios from 'axios';
import Error404 from '../../Error/Error404';
import Error500 from '../../Error/Error500';
import { DataTable } from 'mantine-datatable';
import Show from '../Show';
import Select from 'react-select';
import { IoMdRefresh } from 'react-icons/io';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { useAuth } from '../../../AuthContext';
import AccountsTable from '../Accounts/Index';
import MainLeft from '../../LeftNav/MainLeft';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { useLocation, useNavigate } from 'react-router-dom';


export default function Index() {
    const { logout, crmToken, authUser, apiUrl } = useAuth();
    return authUser?.user_type == "Accounts" ? <AccountsTable /> : <SalesTable />
}


const SalesTable = () => {


    interface SalesTable {
        filterOwner?: number;
        filterStatus?: number;
        search?: string;
        page?: number;
        pageSize?: number;
    }

    const storedSalesTable = localStorage.getItem('teamSaleTable');
    let parsedSalesTable: SalesTable | null = null;

    try {
        parsedSalesTable = storedSalesTable ? JSON.parse(storedSalesTable) : null;
    } catch (error) {
        console.error('Failed to parse saleTable from localStorage:', error);
    }

    const [filter, setFilter] = useState({
        filterOwner: parsedSalesTable?.filterOwner ?? 0,
        filterStatus: parsedSalesTable?.filterStatus ?? 0,
        search: parsedSalesTable?.search ?? '',
        page: parsedSalesTable?.page ?? 1,
        pageSize: parsedSalesTable?.pageSize ?? 10,
    });






    const navigate = useNavigate();
    const { logout, crmToken, authUser, apiUrl } = useAuth();
    const dispatch = useDispatch();
    const hideCols = useSelector((state: IRootState) => state.themeConfig.hideCols);
    useEffect(() => { dispatch(setPageTitle('Sales')); });


    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];

    const [search, setSearch] = useState('');

const location = useLocation();
  const page = location.state?.page || 0;

    const [data, setData] = useState<any>([]);
    const [firstTime, setFirstTime] = useState(1);
    const [allSaleOwners, setAllSaleOwners] = useState<any>([]);
    const allSaleStatus: any = [
        { label: 'All', value: 0 },
        { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Expired', value: 'Expired' },
        { label: 'Paused', value: 'Paused' },
    ];

    const [createSaleData, setCreateSaleData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<any>(null);

    const fetchLeads = async (a = 0) => {
        console.log("Fetching Sales........", a)
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',

                url: apiUrl + '/api/get-team-sales',
                params: {
                    ...filter,
                   firstTime: allSaleOwners?.length ? 0 : (page ? 1 : 0)
                },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {

                setData(response.data.data)

                 if (response?.data?.allSaleOwners) {
                    setAllSaleOwners(response.data.allSaleOwners)
                    // setCreateSaleData(response.data.createSaleData)
                    // setleadStatus(response.data.leadStatus)
                    // setLeadSources(response.data.leadSources)
                    // setComplateOwners(response.data.complateOwners)
                    setFirstTime(0)
                }
            } else setData([]);

        } catch (error) {

            if (error?.response?.status == 404) setError(error.response)
            if (error?.response?.status == 500) setError(error.response)

        } finally {
            setIsLoading(false)
        }
    }




    useEffect(() => {
        fetchLeads()
        localStorage.setItem("teamSaleTable", JSON.stringify(filter));
    }, [filter]);





    return (
        <>
            <MainLeft>
                {!error ? (<div className="p-0 flex-1 overflow-x-hidden h-full">
                    <div className="flex flex-col h-full">
                        <div className="panel ">
                            <div className='flex justify-between gap-4'>
                                <div className='flex gap-3  w-full'>

                                    <div>
                                        <div>
                                            <Select placeholder="Select Sale Owner" onChange={(e: any) => {
                                                setFilter({ ...filter, filterOwner: e.value, page: 1 })
                                            }}
                                                isLoading={isLoading}
                                                isDisabled={isLoading}
                                                className={`w-[230px] z-10 ${filter.filterOwner ? 'border-2 border-[#31ab89]' : ''}  rounded-md font-bold`} value={allSaleOwners?.find((s: any) => s.value == filter.filterOwner)} options={allSaleOwners} />
                                        </div>
                                    </div>


                                    <div>
                                        <Select placeholder="Select Sale Status" onChange={(e: any) => {
                                            setFilter({ ...filter, filterStatus: e.value, page: 1 })
                                        }}
                                            isLoading={isLoading}
                                            isDisabled={isLoading}
                                            className={`w-[230px] z-10 ${filter.filterStatus ? 'border-2 border-[#31ab89]' : ''}  rounded-md font-bold`} value={allSaleStatus?.find((s: any) => s.value == filter.filterStatus)} options={allSaleStatus}

                                        />
                                    </div>

                                </div>
                                <div className='flex gap-3 justify-end  w-full'>
                                    <button disabled={isLoading ? true : false} onClick={() => fetchLeads()} className="bg-[#f4f4f4] rounded-md p-2 enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                        <IoMdRefresh className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="datatables mt-4">
                                <DataTable
                                    className="whitespace-nowrap table-hover"
                                    records={data?.data}

                                    columns={[
                                        {
                                            accessor: 'id',
                                            title: 'Sale Id',
                                        },
                                        {
                                            accessor: 'owner',
                                            title: 'Owner',
                                        },
                                        {
                                            accessor: 'first_name',
                                            title: 'Full Name',

                                            render: ({ first_name, last_name }) => {
                                                return (
                                                    <b>{first_name} {last_name}</b>

                                                )
                                            },
                                        },
                                        {
                                            accessor: 'status',
                                            title: 'Status',
                                            hidden: hideCols.includes('status'),
                                            render: (lead: any) => {
                                                return (
                                                    lead.status == "Closed Won" ? <button type="button" className="btn btn-success btn-sm shadow-sm py-0.5">Create Sale</button> :
                                                        <span className={`badge ${lead.status == "Pending" ? 'bg-[#ff9800]' :
                                                            lead.status == "Approved" ? 'bg-[#2ab717]' : lead.status == "Expired" ? 'bg-red-500' : 'bg-dark'} text-center cursor-pointer py-0.5 w-full`} >{lead.status}</span>
                                                )
                                            },
                                        },
                                        {
                                            accessor: 'bank',
                                            title: 'Bank / Amount',
                                            render: ({ bank, is_bank_upi, bank_name, upi, client_paid }) => (
                                                <>
                                                    <span>{is_bank_upi == 'bank' ? bank_name : upi} <br /> <b className='flex text-[15px] mt-1 text-success'><FaIndianRupeeSign size={18} /> {client_paid}</b></span>
                                                </>
                                            )
                                        },
                                        {
                                            accessor: 'sale_date',
                                            title: 'Sale Date',
                                        },
                                        {
                                            accessor: 'start_date <br/> due_date',
                                            title: 'Service Date',
                                            render: ({ start_date, due_date }) => (
                                                <>
                                                    <span>{start_date} <br /> {due_date}</span>
                                                </>
                                            )
                                        },
                                    ]}
                                    onCellClick={({ record }) => {
                                        if (authUser.user_type == "Manager") {
                                            navigate('/sales/show', {
                                                state: {
                                                    sale_id: record.id,
                                                    filterOwner: 0,
                                                    filterStatus: 0,
                                                    team: 1,
                                                }
                                            });
                                        }

                                    }}

                                    totalRecords={data.totalItems}
                                    recordsPerPage={filter.pageSize}
                                    page={filter.page}
                                    onPageChange={(p) => setFilter({ ...filter, page: p })}
                                    recordsPerPageOptions={PAGE_SIZES}
                                    onRecordsPerPageChange={(s) => setFilter({ ...filter, pageSize: s, page: 1 })}
                                    sortStatus={{ columnAccessor: 'id', direction: 'asc' }}
                                    minHeight={500}
                                    fetching={isLoading}
                                    loaderSize="xl"
                                    loaderColor="green"
                                    loaderBackgroundBlur={1}
                                    paginationText={({ totalRecords }) => `Showing  ${data?.from} to ${data.to} of ${totalRecords} entries`}
                                />
                            </div>
                        </div >
                    </div >


                </div >) : error.status == 404 ? (<Error404 />) : error.status == 500 ? (<Error500 error={error} />) : null}


            </MainLeft>

        </>
    )

}
