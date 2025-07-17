import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import PageLoader from '../../../components/Layouts/PageLoader';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import Error from '../../Error/Error';
import { MdDelete } from "react-icons/md";
import IconChatDots from '../../../../company/components/Icon/IconChatDots';
import IconLink from '../../../../company/components/Icon/IconLink';
import IconUsersGroup from '../../../../company/components/Icon/IconUsersGroup';
import Swal from 'sweetalert2';
import { IoReload } from "react-icons/io5";
import { useToast } from '../../../ToastContext ';
import { setCrmToken } from '../../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import ControlPanel from './ControlPanel';
import EmployeeDetails from './EmployeeDetails';
export default function Index() {

    const { domain } = useParams();
    console.log(domain)
    const { logout, authUser, crmToken, apiUrl } = useAuth();
    const navigate = useNavigate();

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState(null);

    const [data, setData] = useState<any>([]);

    const [defaultParams] = useState({
        branch_no: data?.company?.branch_no,
        max_employee_count: data?.crmData?.settings?.max_employee_count,
    });

    const [params, setParams] = useState<any>(defaultParams);

    const fetchCompany = async () => {
        setIsLoading(true);
        setError(null)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/companies/' + domain,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                const data = response.data.data;
                setData(data)

                setParams({
                    branch_no: data?.company?.branch_no,
                    max_employee_count: data?.crmData?.settings?.max_employee_count,
                })
            }

        } catch (error) {
            if (error?.response?.status) setError(error?.response)
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        fetchCompany()
    }, [domain])



    const [isDeleting, setIsDeleting] = useState(false);

    const distroy = (company: any) => {

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
                    setIsDeleting(true)
                    const response = await axios({
                        method: 'delete',
                        url: apiUrl + '/api/companies/' + company.id,
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + crmToken,
                        },
                    });
                    if (response.data.status === "success") {

                        navigate('/customers')
                    }
                }
                catch (error) {

                }
                finally {
                    setIsDeleting(false)
                }
            }
        });

    }



    // UPADATE


    const [tab, setTab] = useState('control-panel');

    return (
        <>
            {isLoading ? <PageLoader /> : error ? <Error /> : (
                <section>
                    <div className='flex gap-5 mb-4'>

                        <div className='flex flex-col gap-2'>
                            <div className='panel min-w-[350px] h-fit'>
                                <div className='flex justify-start items-center'>
                                    <div className='w-24 '>
                                        <img src={`https://ui-avatars.com/api/?background=random&name=${data?.company?.customer_name}`} className='rounded-full' alt="" />
                                    </div>
                                    <div className='flex-1 '>
                                        <h5 className='font-extrabold text-[20px]'>{data?.company?.customer_name}</h5>
                                        <p className='font-bold text-[#009688] mt-1'>{data?.company?.customer_phone}</p>
                                        <p className='font-bold text-[#009688] '>{data?.company?.customer_email}</p>
                                    </div>
                                </div>
                            </div>
                            <NavLink to={`/check-crm/${data?.company?.domain}`} className='btn btn-danger'>
                                Check CRM
                            </NavLink>
                        </div>

                        <div className='panel flex-1'>

                            <div className='flex gap-4'>
                                <div className='w-[125px] '>
                                    <img className='rounded' src="https://www.billberrypos.com/udpsldm/2022/10/MicrosoftTeams-image-55.jpg" alt="" />
                                </div>
                                <div className='flex-1'>
                                    <h1 className='font-bold text-[22px] mb-2'>{data?.company?.company_name}</h1>

                                    <div className='flex gap-4 mb-1'>
                                        <span className={`badge ${data?.company?.company_type ? 'bg-[#1abc9c]' : 'bg-blue-500'}   `}>{data?.company?.company_type ? 'SEBI' : 'Non-SEBI'}</span>

                                        <span className={`badge ${data?.company?.status ? 'bg-success' : 'bg-red-500'}`}>{data?.company?.status ? 'Active' : 'Blocked'}</span>

                                        <span className='badge bg-[#075E54]'>{data?.company?.domain}.finsap.com</span>
                                    </div>

                                    <b>{data?.company?.city} - {data?.company?.state} </b>
                                    <br />
                                    {data?.company?.gstin ? (
                                        <small className='font-bold'>GSTIN : {data?.company?.gstin} </small>
                                    ) : null}

                                </div>

                                <div>
                                    {isDeleting ? (<button> <IoReload size={25} className='animate-[spin_2s_linear_infinite]' color='red' onClick={() => distroy(data.company)} /></button>) : (
                                        <button> <MdDelete size={25} color='red' onClick={() => distroy(data.company)} /></button>
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="grid sm:grid-cols-4 xl:grid-cols-4 gap-6 mb-4">
                        <div className="panel h-full p-0">
                            <div className="flex p-5">
                                <div className="shrink-0 bg-success/10 text-success rounded-xl w-11 h-11 flex justify-center items-center dark:bg-success dark:text-white-light">
                                    <IconChatDots className="w-5 h-5" />
                                </div>
                                <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                                    <p className="text-xl dark:text-white-light">{data?.crmData?.activeEmployees}</p>
                                    <h5 className="text-[#506690] text-xs">Active Employees</h5>
                                </div>
                            </div>
                        </div>
                        <div className="panel h-full p-0">
                            <div className="flex p-5">
                                <div className="shrink-0 bg-success/10 text-success rounded-xl w-11 h-11 flex justify-center items-center dark:bg-success dark:text-white-light">
                                    <IconChatDots className="w-5 h-5" />
                                </div>
                                <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                                    <p className="text-xl dark:text-white-light">{data?.crmData?.inactiveEmployees}</p>
                                    <h5 className="text-[#506690] text-xs">Inactive Employees</h5>
                                </div>
                            </div>
                        </div>
                        <div className="panel h-full p-0">
                            <div className="flex p-5">
                                <div className="shrink-0 bg-primary/10 text-primary rounded-xl w-11 h-11 flex justify-center items-center dark:bg-primary dark:text-white-light">
                                    <IconUsersGroup className="w-5 h-5" />
                                </div>
                                <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                                    <p className="text-xl dark:text-white-light">{data?.crmData?.totalsLeads}</p>
                                    <h5 className="text-[#506690] text-xs">Total Leads</h5>
                                </div>
                            </div>
                        </div>
                        <div className="panel h-full p-0">
                            <div className="flex p-5">
                                <div className="shrink-0 bg-danger/10 text-danger rounded-xl w-11 h-11 flex justify-center items-center dark:bg-danger dark:text-white-light">
                                    <IconLink className="w-5 h-5" />
                                </div>
                                <div className="ltr:ml-3 rtl:mr-3 font-semibold">
                                    <p className="text-xl dark:text-white-light">{data?.crmData?.totalClosedWonLeads}</p>
                                    <h5 className="text-[#506690] text-xs">Closed Won Leads</h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex gap-2 mb-2'>
                        <button className={`btn btn-sm shadow ${tab == "control-panel" ? 'btn-dark' : ' btn-outline-dark'} `}
                            onClick={() => setTab('control-panel')}
                        >Control Panel</button>
                        <button className={`btn btn-sm shadow ${tab == "employees-history" ? 'btn-dark' : ' btn-outline-dark'} `}
                            onClick={() => setTab('employees-history')}
                        >Employees History</button>
                    </div>

                    {tab == "control-panel" ? <ControlPanel data={data} domain={domain} params={params} setParams={setParams} /> : <EmployeeDetails domain={domain} />}

                </section >
            )
            }

        </>
    )
}
