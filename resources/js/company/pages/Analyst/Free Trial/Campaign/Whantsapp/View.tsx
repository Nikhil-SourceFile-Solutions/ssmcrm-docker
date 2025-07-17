import React, { useEffect, useState } from 'react';

import axios from 'axios';
import PageLoader from '../../../../../components/Layouts/PageLoader';
import { useAuth } from '../../../../../AuthContext';



export default function View({ data, setDrawer, drawer }: any) {


    const { crmToken, apiUrl, logout } = useAuth()
    useEffect(() => {
        if (drawer) fetchData()
    }, [drawer])

    const [isLoading, setIsLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);





    const fetchData = async () => {
        console.log("Fetching Update History.....")
        setIsLoading(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/campaigns/whatsapp/updates",
                params: { whatsapp_campaign_id: data.id },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setCampaigns(response.data.campaigns)
            }

        } catch (error) {
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <div>

            {isLoading ? <PageLoader /> : campaigns.length ? (
                <div className="table-responsive mb-5">
                    <table className='"table-striped'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Campaign</th>

                                <th>Template</th>
                                <th className="text-center">Time</th>
                            </tr>
                        </thead>
                        <tbody>

                            {campaigns.map((c: any, i: number) => (
                                <tr key={c.id}>

                                    <td>
                                        <b>{campaigns.length - i}</b>
                                    </td>
                                    <td>
                                        <div className="whitespace-nowrap"><b>{c.campaign_name}</b></div>
                                    </td>

                                    <td>
                                        <div className='max-w-[300px]' style={{ textWrap: "wrap" }}>
                                            <h1><b>{c.template_name}</b></h1>
                                            <span className='font-bold text-[12px] text-[#506690]'>{c.final_template}</span>
                                        </div>
                                    </td>
                                    <td className="text-center"><b>{c.created_at}</b></td>
                                </tr>
                            ))}

                        </tbody>

                    </table>
                </div>

            ) : <>No Campaihhhh</>}

        </div>
    )
}
