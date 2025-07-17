import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import Select from 'react-select';
import { NavLink, useNavigate } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import CommonLeftnav from '../CommonLeftnav';
import { IRootState } from '../../store';
import axios from 'axios';
import SaleView from './SaleView';
import { useAuth } from '../../AuthContext';

const ViewSales = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const hideCols = useSelector((state: IRootState) => state.themeConfig.hideCols);

  const { crmToken, apiUrl } = useAuth()

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filteredOwner, setFilteredOwner] = useState(0);
    const [filteredStatus, setFilteredStatus] = useState(0);

    useEffect(() => {
        if (!crmToken) navigate('/')
        else {
            dispatch(setPageTitle('View Leads'));
            fetchLeads()
        }

    }, [page, pageSize, filteredOwner, filteredStatus]);

    useEffect(() => {

        if (filteredStatus || filteredOwner) setPage(1)

    }, [filteredOwner, filteredStatus])


    const [isLoading, setIsLoading] = useState(true);
    const [leads, setLeads] = useState([]);
    const [response, setResponse] = useState(null);

    const [owners, setOwners] = useState(0);
    const [statuses, setStatuses] = useState(0);


    const [saleStatuses, setSaleStatuses] = useState([]);

    const [saleOwners, setSaleOwners] = useState([]);

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const onwer = owners ? 1 : 0;
            const status = statuses ? 1 : 0;
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/' + "sales?page=" + page
                    + "&pageSize=" + pageSize
                    + "&owners=" + onwer
                    + "&statuses=" + status
                    + "&filteredOwner=" + filteredOwner
                    + "&filteredStatus=" + filteredStatus,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });

            if (response.data.status == "success") {
                setResponse(response.data.data);
                setLeads(response.data.data.data)

                if (response.data.salesOwners) {
                    let a = response.data.salesOwners
                    a.unshift({ value: 0, label: "All" })
                    setSaleOwners(a)
                    setOwners(1)
                }
                if (response.data.saleStatuses) {
                    let a = response.data.saleStatuses
                    a.unshift({ value: 0, label: "All" })
                    setSaleStatuses(a)
                    setStatuses(1)
                }


            }

            console.log(response)
        } catch (error) {

        } finally {
            setIsLoading(false)
        }
    }


    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });


    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const showHideColumns = (col: any, value: any) => hideCols.includes(col) ? dispatch(setHideCols(hideCols.filter((d: any) => d !== col))) : dispatch(setHideCols([...hideCols, col]));

    const cols = [
        { accessor: 'id', title: 'Sale Id', editable: true },
        { accessor: 'owner', title: 'Owner', editable: true },
        { accessor: 'bank', title: 'Bank', editable: true },
        { accessor: 'client_paid', title: 'Client Paid', editable: false },
        { accessor: 'first_name', title: 'first_name', editable: true },
        { accessor: 'sale_date', title: 'sale_date', editable: true },
        { accessor: 'start_date', title: 'start_date', editable: true },
        { accessor: 'due_date', title: 'due_date', editable: true },
        { accessor: 'status', title: 'status', editable: true },
    ];




    const [showSaleViewDrawer, setShowSaleViewDrawer] = useState(false);
    const [viewSale, setViewSale] = useState('');



    return (
        <div>
            <div className="flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full">
                <div className={`panel xl:block p-4 dark:gray-50 w-[300px] max-w-full flex-none space-y-3 xl:relative absolute z-10 xl:h-auto h-full hidden ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none overflow-hidden`}>
                    <div className="flex flex-col h-full pb-16">
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <div className="space-y-1">
                                <CommonLeftnav />
                            </div>
                        </PerfectScrollbar>
                    </div>
                </div>

                <div className="panel p-0 flex-1 overflow-x-hidden h-full">
                    <div className="flex flex-col h-full">
                        <div className="panel mt-6">
                            <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                                <div>
                                    <Select placeholder="Select Lead Owner" onChange={(e: any) => setFilteredOwner(e.value)} className='w-[230px] z-10' options={owners ? saleOwners : []} />
                                </div>

                                <div>
                                    <Select placeholder="Select Lead Status" onChange={(e: any) => setFilteredStatus(e.value)} className='w-[230px] z-10' options={statuses ? saleStatuses : []} />
                                </div>

                            </div>
                            <div className="datatables">



                                <DataTable
                                    className="whitespace-nowrap table-hover"
                                    records={leads}

                                    columns={[
                                        {
                                            accessor: 'id',
                                            title: 'Sale Id',
                                            sortable: true,
                                            hidden: hideCols.includes('id'),
                                        },
                                        {
                                            accessor: 'owner',
                                            title: 'Owner',
                                            sortable: true,
                                            hidden: hideCols.includes('owner'),
                                        },
                                        {
                                            accessor: 'first_name',
                                            title: 'Full Name',
                                            sortable: true,
                                            hidden: hideCols.includes('first_name'),
                                        },

                                        {
                                            accessor: 'status',
                                            title: 'Status',
                                            sortable: true,
                                            hidden: hideCols.includes('status'),
                                        },
                                        {
                                            accessor: 'bank',
                                            title: 'Bank',
                                            sortable: true,
                                            hidden: hideCols.includes('bank'),
                                        },
                                        {
                                            accessor: 'sale_date',
                                            title: 'Sale Date',
                                            sortable: true,
                                            hidden: hideCols.includes('sale_date'),
                                        },
                                        {
                                            accessor: 'start_date',
                                            title: 'Start Date',
                                            sortable: true,
                                            hidden: hideCols.includes('start_date'),
                                        },
                                        {
                                            accessor: 'due_date',
                                            title: 'Due Date',
                                            sortable: true,
                                            hidden: hideCols.includes('due_date'),
                                        },

                                    ]}
                                    onCellClick={({ record, column }) => {
                                        console.log(record)
                                        setViewSale(record)
                                        setShowSaleViewDrawer(!showSaleViewDrawer)
                                    }}



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
                                    loaderSize="xl"
                                    loaderColor="green"
                                    loaderBackgroundBlur={1}
                                    paginationText={({ from, to, totalRecords }) => `Showing  ${response?.from} to ${response.to} of ${totalRecords} entries`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* <SaleView /> */}
            </div>
        </div>
    );
};

export default ViewSales;
