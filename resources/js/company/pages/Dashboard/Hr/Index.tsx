import React, { useEffect, useState } from 'react'
import { IoMdRefresh } from 'react-icons/io'
import Card from './Card'
import { useDispatch } from 'react-redux';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import UpdateModal from './Sales/Index';
export default function Index() {

    const { logout, crmToken, apiUrl, selectedBranch } = useAuth();
    const dispatch = useDispatch();

    const [error, setError] = useState();

    const [hrData, setHrData] = useState([])
    const fetchHrDashboard = async () => {

        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-hr-dashboard",

                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,

                },
            });

            if (response.data.status == "success") {
                setHrData(response.data.data);
            }
            console.log(response.data.data)
        } catch (error) {
            console.log(error)

        }
        finally {
            console.log('ginfal')
        }



    }

    useEffect(() => {
        fetchHrDashboard();
    }, [])
    const [isModalOpen, setModalOpen] = useState(false);
    return (
        <div>

            <div className='flex justify-between items-center mb-2'>
                <h1 className='font-extrabold text-[18px]'>Dashboard</h1>

                <button
                    className='bg-dark btn btn-sm shadow'
                    onClick={() => alert(12)}
                >
                    <IoMdRefresh className="w-5 h-5" color='white' />
                </button>
            </div>
            <Card hrData={hrData} />

            {/* <Sale /> */}

        </div>
    )
}
