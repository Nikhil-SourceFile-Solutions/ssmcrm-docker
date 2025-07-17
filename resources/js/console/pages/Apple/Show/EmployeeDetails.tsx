import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../AuthContext';

function EmployeeDetails({ domain }) {

    const { logout, authUser, crmToken, apiUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);

    const fetchEmployeeHistory = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + '/api/employess-history/' + domain,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == 'success') {
                const data = response.data.data;
                setData(data)
            }

        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchEmployeeHistory()
    }, [domain])

    return (
        <div className="table-responsive mb-5 panel">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Current Max Users</th>
                        <th>Current Users</th>
                        <th>Old Max Users</th>
                        <th>Old Users</th>
                        <th>Date</th>
                        <th>Updated By</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((a, index) => (
                        <tr className='font-bold'>
                            <td>{index + 1}</td>
                            <td className='text-xl text-[#009688]'>{a.current_users}</td>

                            <td>
                                <div className='text-[#0faa07]'>
                                    <span className='inline-block w-[70px]'>Active:</span>{a.current_active_users}
                                </div>
                                <div className='text-[#e95f2b]'>
                                    <span className='inline-block w-[70px]'>Blocked:</span>{a.current_blocked_users}
                                </div>
                            </td>
                            <td className='text-xl text-[#000]/50'>{a.previous_users}</td>

                            <td>
                                <div className='text-[#000]/50'>
                                    <span className='inline-block w-[70px]'>Active:</span>{a.current_active_users}
                                </div>
                                <div className='text-[#000]/50'>
                                    <span className='inline-block w-[70px]'>Blocked:</span>{a.current_blocked_users}
                                </div>
                            </td>


                            <td>{a.date_time}</td>
                            <td>{a.first_name} {a.last_name}</td>
                        </tr>
                    ))}


                </tbody>
            </table>
        </div>
    )
}

export default EmployeeDetails