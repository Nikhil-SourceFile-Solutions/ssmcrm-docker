import React, { useEffect, useState } from 'react'
import PageLoader from '../../../components/Layouts/PageLoader';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { IRootState } from '../../../store';

export default function Verification({ phone, token, mainAction }) {

    const apiUrl = useSelector((state: IRootState) => state.themeConfig.apiUrl);
    console.log(phone)



    useEffect(() => {

        getRiskprofileResult();
    }, [])

    const [isLoading, setIsLoading] = useState(true);
    const [riskprofile, setRiskprofile] = useState([]);
    const getRiskprofileResult = async () => {
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/customer-riskprofile-result",
                params: { phone: phone, token: token },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == "success") {
                setRiskprofile(response.data.riskprofile)
            }

            console.log(response)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    const [isBtnLoading, setIsBtnLoading] = useState(false);

    const verifyRiskprofile = async () => {
        setIsBtnLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/customer-riskprofile-verify",
                params: { phone: phone, token: token },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.status == "success") setRiskprofile(response.data.riskprofile)
        } catch (error) {



        } finally {
            setIsBtnLoading(false)
        }
    }

    return (
        <div>
            {isLoading ? <PageLoader /> : (
                <div>


                    <div>
                        {riskprofile.is_verified ? (
                            <>
                                <b>{riskprofile.full_name}</b>
                                <button>Download Riskprofile</button>
                            </>
                        ) : riskprofile?.pdf ? (
                            <div style={{ width: '100%', height: '100vh', border: 'none' }}>
                                <iframe
                                    src={riskprofile?.pdf} // Corrected: Removed double quotes
                                    title="My Embedded Content"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none' }}
                                />
                            </div>
                        ) : (
                            <>
                                <button
                                    className="btn btn-secondary m-auto"
                                    disabled={isBtnLoading}
                                    onClick={() => verifyRiskprofile()}
                                >
                                    {isBtnLoading ? 'Please Wait...' : 'Submit Riskprofile'}
                                </button>
                            </>
                        )}
                    </div>


                </div>
            )}
        </div>
    )
}
