import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts';
import PageLoader from '../../../components/Layouts/PageLoader';
import { FaEye } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
export default function LeadByStatus({ leadByStatusData, reloadLBSD, setReloadLBSD, LBfilter, setLBfilter }) {

    const { logout, crmToken, apiUrl } = useAuth();

    const [data, setData] = useState([])

    useEffect(() => {
        setData(leadByStatusData)
    }, [leadByStatusData])
    const getFilteredLeadCount = async (action, value) => {
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-leads-filered-count",
                params: {
                    action: action,
                    value: value,
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {

                if (response.data.action == "status") {
                    setData({
                        ...data,
                        statusLead: response.data.value

                    })
                } else if (response.data.action == "state") {
                    setData({
                        ...data,
                        stateLead: response.data.value
                    })
                } else if (response.data.action == "source") {
                    setData({
                        ...data,
                        sourceLead
                            : response.data.value
                    })
                }

            }

        } catch (error) {

        } finally {

        }
    }



    return (
        <>
            {reloadLBSD ? <PageLoader /> : (
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

                    <div className='panel'>
                        <b>Lead By Status</b>
                        <div className='m-4'>
                            <select className="form-select form-select-lg text-white-dark" onChange={(e) => getFilteredLeadCount('status', e.target.value)}>


                                {data?.status && data.status
                                    .filter((value, index, self) => self.indexOf(value) === index)
                                    .map((s, i) => (
                                        <option key={i} value={s}>{s}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span>Leads Count</span>
                            <span className='badge badge-outline-dark font-bold'>{data.statusLead}</span>
                            {/* <span ><FaEye size={20} /></span> */}
                        </div>
                    </div>

                    <div className='panel'>
                        <b>Lead By State</b>
                        <div className='m-4'>
                            <select className="form-select form-select-lg text-white-dark" onChange={(e) => getFilteredLeadCount('state', e.target.value)}>
                                {data?.states && data.states
                                    .filter((value, index, self) => self.indexOf(value) === index)
                                    .map((s, i) => (
                                        <option key={i} value={s}>{s}</option>
                                    ))
                                }



                            </select>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span>Leads Count</span>
                            <span className='badge badge-outline-dark font-bold'>{data.stateLead}</span>
                            {/* <span><FaEye size={20} /></span> */}
                        </div>
                    </div>

                    <div className='panel'>
                        <b>Lead By Source</b>
                        <div className='m-4'>
                            <select className="form-select form-select-lg text-white-dark" onChange={(e) => getFilteredLeadCount('source', e.target.value)}>

                                {data?.source && data.source
                                    .filter((value, index, self) => self.indexOf(value) === index)
                                    .map((s, i) => (
                                        <option key={i} value={s}>{s}</option>
                                    ))
                                }


                            </select>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span>Leads Count</span>
                            <span className='badge badge-outline-dark font-bold'>{data.sourceLead}</span>
                            {/* <span><FaEye size={20} /></span> */}
                        </div>
                    </div>

                </div>
            )}

        </>
    )
}
