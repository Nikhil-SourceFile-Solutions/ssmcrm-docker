import React, { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setCrmToken, setPageTitle } from '../../../store/themeConfigSlice';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../../store';
import axios from 'axios';
import Swal from 'sweetalert2';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { downloadExcel } from 'react-export-table-to-excel';
import IconFile from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import PageLoader from '../../../components/Layouts/PageLoader';
import { Tab } from '@headlessui/react';
import LeftTab from '../LeftTab';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useAuth } from '../../../AuthContext';
import AlertCard from '../../../components/AlertCard';
import ProductGroup from './ProductGroup';
import CreateOrUpdate from './CreateOrUpdate';
import { IoMdRefresh } from 'react-icons/io';
const Index = () => {

    /*##### MAIN THINGS #####*/
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { crmToken, apiUrl } = useAuth()


    useEffect(() => {

        dispatch(setPageTitle('Product Sales'));
    });

    /*##### DATATABLE THINGS #####*/

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [filterType, setFilterType] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [isProductLoading, setIsProductLoading] = useState(false)

    const [productprice, setProductprice] = useState([])
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [response, setResponse] = useState(null);

    const [dropdowns, setDropdown] = useState([])




    useEffect(() => {
        fetchProductprice()
    }, [page, pageSize, filterType, search])

    const [fetchingError, setFetchingError] = useState(null);

    const fetchProductprice = async () => {
        setIsProductLoading(true);
        setFetchingError(null);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/products?page=" + page + "&pageSize=" + pageSize + "&filterType=" + filterType + "&search=" + search,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + crmToken,
                },
            });
            if (response.data.status == 'success') {
                setProductprice(response.data.data.data)
                setResponse(response.data.data);
                setDropdown(response.data.dropdowns)
            }
        } catch (error: any) {
            console.log(error)
            setFetchingError(null)
            if (error.response.status == 401) dispatch(setCrmToken(''))
        } finally {
            setIsProductLoading(false);
        }
    }

    function handleDownloadExcel() {
        const header = ['#', 'Type', 'Product Name', 'Price', 'Duration', 'Status'];
        downloadExcel({
            fileName: 'Product Price',
            sheet: 'react-export-table-to-excel',
            tablePayload: {
                header,
                body: productprice.map((product: any, index) => ({
                    a: index + 1,
                    b: product.value,
                    c: product.pro_name,
                    d: product.pro_price,
                    e: product.pro_duration,
                    h: product.pro_status == "Active" ? 'Active' : 'Blocked',
                })),
            },
        });
    }

    const exportTable = (type: any) => {
        let columns: any = ['#', 'Type', 'Product Name', 'Price', 'Duration', 'Status'];
        let records = productprice.map((product: any, index) => ({
            "#": index + 1,
            "Type": product.value,
            "Product Name": product.pro_name,
            "Price": product.pro_price,
            "Duration": product.pro_duration,
            "Status": product.pro_status == "Active" ? 'Active' : 'Blocked',
        }));
        let filename = 'Product Price';
        let newVariable: any;
        newVariable = window.navigator;
        if (type === 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            columns.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';
            records.map((item: any) => {
                rowhtml += '<tr>';
                columns.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
        }
    };

    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };

    /*##### CURD OPERATIONS #####*/

    const [showProductSalesDrawer, setShowProductSalesDrawer] = useState(false);

    const distroy = (productprice: any) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.value) {
                try {
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/products/' + productprice.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {
                        // Swal.fire({ title: response.data.title, text: response.data.message, icon: 'success', customClass: 'sweet-alerts' });
                        showMessage(response.data.message)
                        fetchProductprice()
                    }
                }
                catch (error) {
                    if (error.response && error.response.status === 400) {
                        showMessage("Cannot delete the product as it is being used.");
                    } else {
                        showMessage("Error deleting product.");
                    }
                }
                finally {

                }
            }
        });

    }

    const updateStatus = async (id: number) => {

        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + '/api/product-status-update',
                data: { id: id },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                const newDropdowns = [...productprice],
                    index = productprice.findIndex((n: any) => n.id == id);
                newDropdowns[index] = {
                    ...newDropdowns[index],
                    pro_status: response.data.value
                },
                    setProductprice(newDropdowns);
                Swal.fire({
                    title: response.data.message,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    showCancelButton: false,
                    width: 500,
                    timer: 2000,
                    customClass: {
                        popup: "color-success"
                    }
                });
            }
        } catch (error) {

        }

    }

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };




    const [productGroupDrawer, setProductGroupDrawer] = useState(false)
    const [editProduct, setEditProduct] = useState<any>(null);
    return (
        <>
            {/* xl:block p-4 dark:gray-50 w-[400px] max-w-full flex-none space-y-3 xl:relative absolute z-10  h-full hidden ltr:xl:rounded-r-md ltr:rounded-r-none rtl:xl:rounded-l-md rtl:rounded-l-none overflow-hidden */}

            <div className="flex gap-5 relative  h-full">
                <div className={`panel w-[280px]`}>
                    <div className="flex flex-col h-full pb-2">
                        <PerfectScrollbar className="relative ltr:pr-3.5 rtl:pl-3.5 ltr:-mr-3.5 rtl:-ml-3.5 h-full grow">
                            <LeftTab />
                        </PerfectScrollbar>
                    </div>
                </div>
                {
                    fetchingError ? <Error error={fetchingError} fetchProductprice={fetchProductprice} /> : (
                        <div className=" p-0 flex-1 overflow-x-hidden ">
                            <div className="flex flex-col ">
                                <div className='panel'>
                                    <div className='flex items-center justify-between mb-1'>
                                        <h5 className="font-semibold text-lg dark:text-white-light">Product Sales List</h5>

                                        <div className="flex items-center flex-wrap">
                                            <button type="button" className="btn btn-primary btn-sm m-1"
                                                onClick={handleDownloadExcel}
                                            >
                                                <IconFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                EXCEL
                                            </button>
                                            <button type="button"
                                                onClick={() => exportTable('print')}
                                                className="btn btn-primary btn-sm m-1">
                                                <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                                                PRINT
                                            </button>
                                        </div>

                                        <div>
                                            <button className='btn btn-primary shadow' onClick={() => {

                                                setProductGroupDrawer(true)
                                            }}>Product Groups</button>
                                        </div>
                                        <div className='flex gap-4'>
                                            <select className='form-select w-[150px]' onChange={(e: any) => setFilterType(e.target.value)}>
                                                <option value="">All</option>
                                                {dropdowns.map((dropdown: any) => (
                                                    <option key={dropdown.id} value={dropdown.id}>{dropdown.value}</option>
                                                ))}
                                            </select>
                                            <input type="text" className="form-input w-auto" placeholder="Search By Name..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
                                            {
                                                dropdowns &&
                                                <button className='btn btn-sm btn-primary' onClick={() => { setEditProduct(null); setShowProductSalesDrawer(!showProductSalesDrawer) }}>Add Product Sales</button>

                                            }
                                             <button onClick={() => { fetchProductprice() }} className="bg-[#f4f4f4] rounded-md p-2  enabled:hover:bg-primary-light dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30  disabled:opacity-60 disabled:cursor-not-allowed">
                                                        <IoMdRefresh className="w-5 h-5" />
                                                    </button>

                                        </div>
                                    </div>
                                    <hr className="my-4 dark:border-[#191e3a]" />

                                    <div className='mb-5'>
                                        {
                                            !dropdowns ? (<>
                                                <AlertCard
                                                    title={'No Product Type found!'}
                                                    message="To continue with  adding Products, you need to add the Lead Product in the Settings dropdown."
                                                    buttons={[{ title: 'Go to Dropdown', url: '/settings/dropdowns', action: 'link', color: '' }]}
                                                />
                                            </>) :
                                                <div className="datatables">
                                                    <DataTable
                                                        highlightOnHover
                                                        className="whitespace-nowrap table-hover"
                                                        records={productprice}
                                                        columns={[
                                                            {
                                                                accessor: 'id',
                                                                sortable: true,
                                                                render: ({ id }) => (
                                                                    <div className="flex flex-col gap-2">
                                                                        <div className="font-semibold">{id}</div>
                                                                    </div>
                                                                ),
                                                            },
                                                            {
                                                                accessor: 'Type',
                                                                sortable: true,
                                                                render: ({ value }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-semibold">{value}</div>
                                                                    </div>
                                                                ),
                                                            },

                                                            {
                                                                accessor: 'Group',
                                                                sortable: true,
                                                                render: ({ group_name }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-semibold">{group_name}</div>
                                                                    </div>
                                                                ),
                                                            },

                                                            {
                                                                accessor: 'Name',
                                                                sortable: true,
                                                                render: ({ pro_name }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-semibold">{pro_name}</div>
                                                                    </div>
                                                                ),
                                                            },
                                                            {
                                                                accessor: 'Price',
                                                                sortable: true,
                                                                render: ({ pro_price }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-semibold">{pro_price}</div>
                                                                    </div>
                                                                ),
                                                            },
                                                            {
                                                                accessor: 'Duration',
                                                                sortable: true,
                                                                render: ({ pro_duration }) => (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-semibold">{pro_duration}</div>
                                                                    </div>
                                                                ),
                                                            },
                                                            {
                                                                accessor: 'Status',
                                                                sortable: true,
                                                                render: ({ id, pro_status }) => (
                                                                    <div className="flex flex-col gap-2">
                                                                        <label className="w-12 h-6 relative">
                                                                            <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" onChange={(e) => {
                                                                                updateStatus(id)
                                                                            }} id="custom_switch_checkbox1" checked={pro_status ? true : false} />
                                                                            <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                                        </label>
                                                                    </div>
                                                                ),
                                                                // render: ({ id, pro_status }) => (
                                                                //     <div className="flex flex-col gap-2">
                                                                //         <label className="w-12 h-6 relative">
                                                                //             <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" onChange={(e) => {
                                                                //                 updateStatus(id)
                                                                //             }} id="custom_switch_checkbox1"  checked={pro_status ? true : false} />
                                                                //             <span className={`outline_checkbox border-2 border-[#d15553] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#d15553] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-success peer-checked:before:bg-success before:transition-all before:duration-300`}></span>
                                                                //         </label>
                                                                //     </div>
                                                                // ),
                                                            },
                                                            {
                                                                accessor: 'Action',
                                                                sortable: true,
                                                                render: (userFullData) => (
                                                                    <div className="flex gap-2">
                                                                        <button type="button" onClick={() => {
                                                                            setEditProduct(userFullData)
                                                                            setShowProductSalesDrawer(true)
                                                                        }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><FaEdit /></button>
                                                                        <button type="button" onClick={() => { distroy(userFullData) }} className="btn btn-dark w-10 h-10 p-0 rounded-full"><MdDelete /></button>
                                                                    </div>
                                                                ),
                                                            },
                                                        ]}

                                                        totalRecords={response?.total}
                                                        recordsPerPage={pageSize}
                                                        page={page}
                                                        onPageChange={(p) => setPage(p)}
                                                        recordsPerPageOptions={PAGE_SIZES}
                                                        onRecordsPerPageChange={setPageSize}
                                                        sortStatus={sortStatus}
                                                        onSortStatusChange={setSortStatus}
                                                        // selectedRecords={selectedRecords}
                                                        // onSelectedRecordsChange={setSelectedRecords}
                                                        minHeight={200}
                                                        fetching={isProductLoading}
                                                        loaderColor="blue"
                                                        loaderBackgroundBlur={4}
                                                        paginationText={({ from, to, totalRecords }) => `Showing  ${response?.from} to ${response.to} of ${totalRecords} entries`}

                                                    />
                                                </div>
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >

            <CreateOrUpdate
                showProductSalesDrawer={showProductSalesDrawer}
                setShowProductSalesDrawer={setShowProductSalesDrawer}
                fetchProductprice={fetchProductprice}
                editProduct={editProduct}
            />

            <ProductGroup
                productGroupDrawer={productGroupDrawer}
                setProductGroupDrawer={setProductGroupDrawer}
                dropdowns={dropdowns}
            />

        </>
    );
};

const Error = ({ error, fetchProductprice }) => {
    return (<>

        <div className='bg-[#ece7f7] w-full h-[calc(80vh-80px)] flex flex-col items-center justify-center text-center space-y-4'>
            <h1 className='text-5xl font-extrabold'>{error?.status}</h1>
            <p><b>{error?.message}</b></p>
            <p><b>{error?.response?.statusText}</b></p>
            <div className='space-x-4'>
                <NavLink to={'/'} className='bg-blue-500 text-white px-4 py-2 rounded'>Back to Home</NavLink>
                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={() => fetchProductprice()}>Re Try</button>
            </div>
        </div>
    </>)
}

export default Index;
