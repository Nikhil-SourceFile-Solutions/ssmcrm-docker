import { setPageTitle } from '../../../store/themeConfigSlice';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import React, { Fragment, useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.css';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import IconX from '../../../components/Icon/IconX';
import PageLoader from '../../../components/Layouts/PageLoader';
const ManageAddresses = () => {

  const dispatch = useDispatch();
  useEffect(() => { dispatch(setPageTitle('Invoice Report')); });

  const { settingData, crmToken, apiUrl } = useAuth()
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
const [saleInvoiceModal,setSaleInvoiceModal]=useState(false);
  const [data, setData] = useState<any>([]);
  const [isLoading,setIsLoading]=useState(false);
  const [isBtnLoading,setIsBtnLoading]=useState(false);
  const[addresses,setAddresses]=useState([])

  const fetchInvoice = async () => {

      console.log('*** Fetching Invoice data ***')

      setIsLoading(true)
      try {
          const response = await axios({
              method: 'get',
              url: apiUrl + "/api/get-invoice?page=" + page + "&pageSize=" + pageSize,

              headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + crmToken,
              },
          });
          if (response.data.status == "success") {

              setData(response.data.data);
              setAddresses(response.data.data.data)

              console.log(response);
          }
      } catch (error) {

      } finally {
          setIsLoading(false)
      }
  }
  useEffect(() => {
      fetchInvoice()
  }, [])

  const defaultParams={
    // id:'',
    name: '',
    email: '',
    mobile: '',
    address: '',
    state: '',
    city: '',
    gst_no: '',
    is_igst: 1
  }
  const [params, setParams] = useState(defaultParams);

const [errors, setErros] = useState<any>({});

const validate = () => {
    setErros({});
    let errors = {};
    if (!params.name) {
        errors = { ...errors, name: "name is required" };
    }
    if (!params.mobile) {
        errors = { ...errors, mobile: "mobile is required" };
    }
    setErros(errors);
    return { totalErrors: Object.keys(errors).length };
};

const changeValue = (e) => {
    const { value, name } = e.target;
    setErros({ ...errors, [name]: "" });
    setParams({ ...params, [name]: value });
};

const AddSaleInvoice = async (data: any) => {
    setIsBtnLoading(true)
    try {
        const response = await axios({
            method: 'post',
            url: apiUrl + "/api/sales-invoice",
            data,
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + crmToken,
            },
        });

        if (response.data.status == 'success') {
            showMessage(response.data.message);
            setSaleInvoiceModal(false);
            fetchInvoice();

        } else { alert("Failed") }

    } catch (error: any) {
        console.log(error)
        // if (error.response.status == 401) dispatch(setCrmToken(''))
        if (error?.response?.status === 422) {
            const serveErrors = error.response.data.errors;
            let serverErrors = {};
            for (var key in serveErrors) {
                serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                console.log(serveErrors[key][0])
            }
            setErros(serverErrors);
            Swal.fire({
                title: "Server Validation Error! Please Solve",
                toast: true,
                position: 'top',
                showConfirmButton: false,
                showCancelButton: false,
                width: 450,
                timer: 2000,
                customClass: {
                    popup: "color-danger"
                }
            });
        }
    } finally {
        setIsBtnLoading(false)
    }
};

const formSubmit = () => {
    const isValid = validate();
    if (isValid.totalErrors) return false;
    const data = new FormData();
    data.append('id',params.id?params.id:'');
    data.append("lead_id", params.lead_id);
    data.append("sale_id", params.sale_id?params.sale_id:'');
    data.append("name", params.name?params.name:'');
    data.append("email", params.email?params.email:'');
    data.append("mobile", params.mobile?params.mobile:'');
    data.append("address", params.address?params.address:'');
    data.append("city", params.city?params.city:'');
    data.append("state", params.state?params.state:'');
    data.append("gst_no", params.gst_no?params.gst_no:'');
    data.append("is_igst", params.is_igst?params.is_igst:'');
    AddSaleInvoice(data);
};

const handleEdit=(address)=>{
    if(address){
        setParams({
            id:address.id?address.id:'',
            sale_id:address.sale_id?address.sale_id:'',
            lead_id:address.lead_id?address.lead_id:'',
            name:address.name?address.name:'',
            email:address.email?address.email:'',
            mobile:address.mobile?address.mobile:'',
            address:address.address?address.address:'',
            state:address.state?address.state:'',
            city:address.city?address.city:'',
            gst_no:address.gst_no?address.gst_no:'',
            is_igst:address.is_igst?address.is_igst:''
        })
    }
    else setParams(defaultParams)
    setSaleInvoiceModal(true);
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
  return (
    <div className="">
      <div className="w-full  bg-white shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Invoice Addresses</h2>
          {/* <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={()=>{{ setParams(defaultParams)
            setSaleInvoiceModal(true)}}}
          >
            + Add New Address
          </button> */}
        </div>

        {/* Address Cards */}
        <div className="space-y-4">
          {addresses.map((address, index) => (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="font-semibold">{address.name}<span className="text-gray-500">({address.mobile})</span> <span className="text-gray-500">({address.email})</span></div>
              </div>
              <p className="text-sm mt-2">{address.address},{address.state},{address.city}</p>
              <div className="mt-2 text-right">
                <button onClick={()=>{handleEdit(address)}} className="text-blue-500 hover:text-blue-700">Edit</button>
                {/* <button className="ml-4 text-red-500 hover:text-red-700">Block</button> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Transition appear show={saleInvoiceModal} as={Fragment}>
            <Dialog as="div" open={saleInvoiceModal} onClose={() => console.log("No outside")}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                    <div className="flex items-start justify-center min-h-screen px-4">
                        <Transition.Child

                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="text-lg font-bold">Update Address</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setSaleInvoiceModal(false)}>
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">


                                    {isLoading ? <PageLoader /> : (
                                        <form autoComplete="off" action="">
                                            <div>

                                                <div className=' grid grid-cols-2 gap-2' >
                                                {/* <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='sale_id'
                                                            value={params.sale_id}
                                                            onChange={changeValue}
                                                            placeholder='sale_id'
                                                        />
                                                        <div className="text-danger mt-1">{errors.name}</div>
                                                    </div>
                                                    <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='lead_id'
                                                            value={params.lead_id}
                                                            onChange={changeValue}
                                                            placeholder='lead_id'
                                                        />
                                                        <div className="text-danger mt-1">{errors.name}</div>
                                                    </div> */}
                                                    <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='name'
                                                            value={params.name}
                                                            onChange={changeValue}
                                                            placeholder='Name/Company'
                                                        />
                                                        <div className="text-danger mt-1">{errors.name}</div>
                                                    </div>

                                                    <div className="relative mb-1 mt-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='email'
                                                            value={params.email}
                                                            onChange={changeValue}
                                                            placeholder='Enter Email '
                                                        />
                                                        <div className="text-danger mt-1">{errors.email}</div>
                                                    </div>

                                                    <div className="relative mb-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='mobile'
                                                            value={params.mobile}
                                                            onChange={changeValue}
                                                            maxLength={10}
                                                            placeholder='Enter Mobile '
                                                        />
                                                        <div className="text-danger mt-1">{errors.mobile}</div>
                                                    </div>
                                                    <div className="relative mb-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='gst_no'
                                                            value={params.gst_no}
                                                            onChange={changeValue}
                                                            placeholder='Enter Gst No '
                                                        />
                                                        <div className="text-danger mt-1">{errors.gst_no}</div>
                                                    </div>
                                                </div>

                                                <div className="relative mb-2">

                                                    <textarea className="form-input"
                                                        name='address'
                                                        value={params.address}
                                                        onChange={changeValue}
                                                        placeholder='Enter Address '
                                                    ></textarea>
                                                    <div className="text-danger mt-1">{errors.address}</div>
                                                </div>

                                                <div className=' grid grid-cols-2 gap-2' >
                                                    <div className="relative mb-2">


                                                        <select name="state" className='form-select' value={params.state} onChange={changeValue}>
                                                            <option value="">Select State</option>
                                                            {data?.states?.map((state, index) => (
                                                                <option key={index} value={state}>{state}</option>
                                                            ))}
                                                        </select>
                                                        <div className="text-danger mt-1">{errors.state}</div>
                                                    </div>


                                                    <div className="relative mb-2">
                                                        <input
                                                            className="form-input"
                                                            type="text"
                                                            name='city'
                                                            value={params.city}
                                                            onChange={changeValue}
                                                            placeholder='Enter City '
                                                        />
                                                        <div className="text-danger mt-1">{errors.city}</div>



                                                    </div>

                                                    <div className="relative mb-2">

                                                        <select name="is_igst" className='form-select' value={params.is_igst} onChange={changeValue}>
                                                            <option value="1">IGST</option>
                                                            <option value="0">CGST + SGST</option>


                                                        </select>
                                                        <div className="text-danger mt-1">{errors.is_igst}</div>
                                                    </div>

                                                    <div className="relative mb-2">
                                                        <button type="button" onClick={() => formSubmit()} disabled={isBtnLoading} className="btn btn-primary w-max m-auto">
                                                            {isBtnLoading ? 'Please Wait' : 'Submit' }

                                                        </button>
                                                    </div>


                                                </div>


                                            </div>


                                        </form>
                                    )}





                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    </div>
  );
};

export default ManageAddresses;
