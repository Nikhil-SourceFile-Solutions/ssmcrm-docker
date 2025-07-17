import React, { useEffect, useState } from 'react'
import Card from './Card'
import Followup from './Followup'
import Freetrial from './Freetrial'
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import Sales from './Sales';
import SetCrmPin from '../SetCrmPin';

export default function Index() {

    const { logout, crmToken, apiUrl } = useAuth();

    const [fetchingCard, setFetchingCard] = useState(true);
    const [cardData, setCardData] = useState([]);

    const [fetchingSale, setFetchingSale] = useState(true);
    const [saleData, setSaleData] = useState([]);

    const getFormattedTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Extracts date in 'YYYY-MM-DD' format
    };

    const [yrYear, setYrYear] = useState();
    const [followUpReload, setFollowUpReload] = useState(true);
    const [followUpData, setfollowUpData] = useState<any>([])
    const [followUpPage, setFollowUpPage] = useState(1);
    const followUp_PAGE_SIZES = [10, 20, 30, 50, 100];
    const [followUpPageSize, setFollowUpPageSize] = useState(followUp_PAGE_SIZES[0]);
    const [followUpDate, setFollowUpDate] = useState(getFormattedTodayDate());

    const [freeTrailReload, setFreeTrailReload] = useState(true);
    const [freeTrailData, setFreeTrailData] = useState<any>([])
    const [freeTrailPage, setFreeTrailPage] = useState(1);
    const freeTrail_PAGE_SIZES = [10, 20, 30, 50, 100];
    const [freeTrailPageSize, setFreeTrailPageSize] = useState(freeTrail_PAGE_SIZES[0]);
    const [freeTrailDate, setFreeTrailDate] = useState(getFormattedTodayDate());


    useEffect(() => {
        if (freeTrailPage !== 1) {
            setFreeTrailPage(1);
        } else {
            setFreeTrailReload(true);
        }
        // }, [followUpPageSize, mrMonth, mrYear]);
    }, [freeTrailPageSize, freeTrailDate]);

    useEffect(() => {
        if (!freeTrailPage) {
            setFreeTrailReload(true);
        }
    }, [freeTrailPage]);





    useEffect(() => {
        if (followUpPage !== 1) {
            setFollowUpPage(1);
        } else {
            setFollowUpReload(true);
        }
        // }, [followUpPageSize, mrMonth, mrYear]);
    }, [followUpPageSize, followUpDate]);

    useEffect(() => {
        if (!followUpPage) {
            setFollowUpReload(true);
        }
    }, [followUpPage]);


    useEffect(() => {
        if (fetchingCard || followUpReload || freeTrailReload) {
            fetchBdeDashboard()
        }
    }, [fetchingCard, followUpReload, freeTrailReload]);

    const fetchBdeDashboard = async () => {
        console.log("Fecheing BDE Dashboard Data ......")
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-bde-dashboard",
                params: {
                    fetchingCard: fetchingCard,
                    fetchingSale: fetchingSale,
                    followUpReload: followUpReload,
                    freeTrailReload: freeTrailReload,

                    followUpPageSize: followUpPageSize,
                    followUpPage: followUpPage,
                    followUpDate: followUpDate,

                    freeTrailPageSize: freeTrailPageSize,
                    freeTrailPage: freeTrailPage,
                    freeTrailDate: freeTrailDate

                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });
            //

            if (response.data.status == "success") {
                if (fetchingCard) setCardData(response.data.data.cardData)

                if (fetchingSale) setSaleData(response.data.data.saleData)

                if (followUpReload) setfollowUpData(response.data.data.followUpData)

                if (freeTrailReload) setFreeTrailData(response.data.data.freeTrailData)
            }

            console.log(response)

        } catch (error) {

        } finally {
            if (fetchingCard) setFetchingCard(false)

            if (fetchingSale) setFetchingSale(false)

            if (followUpReload) setFollowUpReload(false)

            if (freeTrailReload) setFreeTrailReload(false)
        }
    }

    return (
        <>
            <Card fetchingCard={fetchingCard} cardData={cardData} />

            <Sales fetchingSale={fetchingSale} saleData={saleData} />
            <SetCrmPin/>

            <div className='grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-6 mb-6 '>

                <Followup
                    followUpData={followUpData}
                    followUpPageSize={followUpPageSize}
                    followUpPage={followUpPage}
                    setFollowUpPage={setFollowUpPage}
                    followUp_PAGE_SIZES={followUp_PAGE_SIZES}
                    setFollowUpPageSize={setFollowUpPageSize}
                    followUpReload={followUpReload}
                    followUpDate={followUpDate}
                    setFollowUpDate={setFollowUpDate} />

                <Freetrial
                    freeTrailData={freeTrailData}
                    freeTrailPageSize={freeTrailPageSize}
                    freeTrailPage={freeTrailPage}
                    setFreeTrailPage={setFreeTrailPage}
                    freeTrail_PAGE_SIZES={freeTrail_PAGE_SIZES}
                    setFreeTrailPageSize={setFreeTrailPageSize}
                    freeTrailReload={freeTrailReload}
                    freeTrailDate={freeTrailDate}
                    setFreeTrailDate={setFreeTrailDate} />
            </div>
        </>
    )
}
