import React, { useEffect, useState } from 'react'
import PageLoader from '../../../components/Layouts/PageLoader'
import { TbHandClick } from 'react-icons/tb'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

export default function Card({ fetchingCard }) {
    const { logout, crmToken, apiUrl } = useAuth();
    const[analysts,setAnalyst]=useState([])
        const fetchAnalystDashboard = async () => {
            console.log("Fecheing BDE Dashboard Data ......")
            try {
                const response = await axios({
                    method: 'get',
                    url: apiUrl + "/api/analyst-dashboards",
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "Bearer " + crmToken,
                    },
                });



                if (response.data.status == "success") {
                    setAnalyst(response.data);

                }



            } catch (error) {

            } finally {
              console.log(88)
            }
        }
        console.log(analysts)

        useEffect(()=>{
            fetchAnalystDashboard()
        },[])
    return (
        <>
            {fetchingCard ? <PageLoader /> : (
                <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-6 mb-6 text-white">

                    <NavLink to='/analyst/campaign' >
                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 cursor-pointer">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Campaign</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{analysts?.total_campaign}</div>
                        {/* <span className="invisible group-hover/item:visible "><TbHandClick size={25} color='red' /></span> */}
                    </div>
                    </NavLink>
                    <NavLink to='/analyst/expiredservice' >
                    <div className="panel bg-gradient-to-r from-[#6bed3d] to-[#09e1cd] cursor-pointer">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Whatsapp Campaign</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{analysts?.whatsapp_campaign}</div>

                    </div>
                    </NavLink>
                    <NavLink to='/analyst/saleservice' >
                    <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 cursor-pointer">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Sms Campaign</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{analysts?.sms_campaign}</div>
                    </div>
                    </NavLink>
                    <NavLink to='/analyst/expiredservice' >
                    <div className="panel bg-gradient-to-r from-[#92cf7c] to-[#09e1cd] cursor-pointer">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Total Application Campaign</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{analysts?.application_campaign}</div>

                    </div>
                    </NavLink>
                    <NavLink to='/analyst/expiredservice' >
                    <div className="panel bg-gradient-to-r from-[#37522e] to-[#09e1cd] cursor-pointer">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Expired Campaign</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{analysts?.expired}</div>

                    </div>
                    </NavLink>
                    <NavLink to='/analyst/pausedservice' >
                    <div className="panel bg-gradient-to-r from-[#09e1cd] to-cyan-400 cursor-pointer">
                        <div className="ltr:mr-1 rtl:ml-1 text-md font-semibold">Paused Campaign</div>
                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3 mt-5">{analysts?.paused}</div>

                    </div>
                    </NavLink>

                </div>
            )}
        </>
    )
}

