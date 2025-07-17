import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';
import PageLoader from '../../components/Layouts/PageLoader';
import Lead from './Lead';

export default function Index() {

    const { domain } = useParams();
    const { logout, authUser, crmToken, apiUrl } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState<any>([]);

    const fetchDataForCheckCrm = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/check-crm",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            if (response.data.status == "success") {
                setData(response?.data?.options)
            }
        } catch (error) {

        } finally {
            setIsLoading(false)
        }

    }


    const [checking, setChecking] = useState(false)

    const [checkResult, setCheckResult] = useState([]);
    const checkCrm = async (action) => {

        if (checking) return 0;
        setChecking(true)
        try {
            setCheckResult([])
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/check-crm-depth",
                params: { action: action, domain: domain },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });


            if (response.data.status == "success") {

                console.log(response.data)
                setCheckResult(response?.data)
            }

        } catch (error) {


        } finally {
            setChecking(false)
        }
    }

    useEffect(() => {
        fetchDataForCheckCrm()
    }, [])

    return (
        <div className='flex justify-between gap-4'>

            <div className='panel w-[300px] h-fit'>
                {data?.map((option) => (
                    <button className='btn btn-dark w-full' onClick={() => checkCrm(option.action)}>Check {option?.title}</button>
                ))}
            </div>

            <div className='panel flex-1'>
                {checking ? < PageLoader /> : (
                    <>
                        {checkResult?.action == "lead" ? <Lead result={checkResult} /> : null}

                    </>
                )}
            </div>
        </div>
    )
}
