import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../AuthContext';

export default function Index() {

    const { logout, crmToken, settingData, apiUrl } = useAuth();

    useEffect(() => {
        fetchStatus()
    }, [])

    const [data, setData] = useState([]);

    const fetchStatus = async () => {

        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/upgrade/growthlift",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") setData(response.data.data)

            console.log(response)
        } catch (error) {

            console.log(error)

        } finally {

        }
    }


    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const Upgrade = async (table) => {

        setIsBtnLoading(true)


        try {
            const response = await axios({
                method: 'post',
                url: apiUrl + "/api/upgrade/growthlift/table",
                data: { table: table },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                fetchStatus()
            }
        } catch (error) {

        } finally {
            setIsBtnLoading(false)
        }

    }
    return (
        <>
            <div className='p-10'>Growth CRM Upgrade</div>

            <table>
                <thead>
                    <tr>
                        <th>Table</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {data?.map((table) => (
                        <tr>
                            <td>{table.table}</td>
                            <td>
                                <span className={`badge ${table.status ? 'bg-success' : 'bg-danger'} `}>
                                    {table.status ? 'Success' : 'Pending'}
                                </span>
                            </td>
                            <td><button className='btn btn-secondary btn-sm' disabled={isBtnLoading} onClick={() => !table.status ? Upgrade(table.table) : null}>
                                {isBtnLoading ? 'Loading....' : !table.status ? 'Migrate' : "No Action"}
                            </button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
