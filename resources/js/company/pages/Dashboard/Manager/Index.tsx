import React, { useEffect, useState } from 'react'
import Card from './Card'
import { useAuth } from '../../../AuthContext';
import axios from 'axios';
import Sales from './Sales';
import Graph from './Graph/Index'
import SetCrmPin from '../SetCrmPin';
import Followup from './Followup';
import Freetrial from './Freetrial';

export default function Index() {

    const { logout, crmToken, apiUrl } = useAuth();
    const [tab, setTab] = useState('todaySale');

    const [cardData, setCardData] = useState([]);
    const [cardLoad, setCardLoad] = useState(true);

    const [saleData, setSaleData] = useState([]);
    const [fetchingSale, setFetchingSale] = useState(true);

    const [graphLoad, setGraphLoad] = useState(true);

    const [todaySaleDtata, setTodaySaleData] = useState([]);
    const [todaySaleFilter, setTodaySaleFilter] = useState('active');


    const [monthSaleDtata, setMonthSaleDtata] = useState([]);
    const [monthSaleFilter, setMonthSaleFilter] = useState('active');

    const [todayCallData, setTodayCalldata] = useState([]);
    const [todayCallFilter, setTodayCallFilter] = useState('active');

    const [monthCallData, setMonthCalldata] = useState([]);
    const [monthCallFilter, setMonthCallFilter] = useState('active');

    const [leadData, setLeaddata] = useState([]);
    const [leadFilter, setLeadFilter] = useState('active');

    const getFormattedTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Extracts date in 'YYYY-MM-DD' format
    };
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
        fetchManagerDashboard()
    }, [tab, cardLoad,followUpDate,freeTrailDate,])

    const fetchManagerDashboard = async () => {
        // setGraphLoad(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-manager-dashboard",
                params: {
                    cardLoad: cardLoad,
                    fetchingSale: fetchingSale,
                    tab: tab,
                    todaySaleFilter: todaySaleFilter,
                    monthSaleFilter: monthSaleFilter,
                    todayCallFilter: todayCallFilter,
                    monthCallFilter: monthCallFilter,
                    leadFilter: leadFilter,

                    // fetchingCard: fetchingCard,
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


            if (response.data.status == "success") {
                if (cardLoad) setCardData(response.data.data.cardData)
                if (fetchingSale) setSaleData(response.data.data.saleData)
                    if (followUpReload) setfollowUpData(response.data.data.followUpData)
                        if (freeTrailReload) setFreeTrailData(response.data.data.freeTrailData)

                if (tab == "todaySale") setTodaySaleData(response.data.data.todaySaleDtata)
                else if (tab == "monthSale") setMonthSaleDtata(response.data.data.monthSaleDtata)
                else if (tab == "todayCall") setTodayCalldata(response.data.data.todayCallData)
                else if (tab == "monthCall") setMonthCalldata(response.data.data.monthCallData)
                else if (tab == "leadCount") setLeaddata(response.data.data.leadData)
            }

        } catch (error) {

        } finally {
            if (cardLoad) setCardLoad(false)
            if (fetchingSale) setFetchingSale(false)
            setGraphLoad(false)
        }
    }
    return (
        <>
            <Card cardLoad={cardLoad} cardData={cardData} />
            <SetCrmPin/>

            <Sales fetchingSale={fetchingSale} saleData={saleData} />

            <Graph tab={tab} setTab={setTab} graphLoad={graphLoad}
                todaySaleDtata={todaySaleDtata} setTodaySaleFilter={setTodaySaleFilter} todaySaleFilter={todaySaleFilter}
                monthSaleDtata={monthSaleDtata} monthSaleFilter={monthSaleFilter} setMonthSaleFilter={setMonthSaleFilter}
                todayCallData={todayCallData} todayCallFilter={todayCallFilter} setTodayCallFilter={setTodayCallFilter}
                monthCallData={monthCallData} monthCallFilter={monthCallFilter} setMonthCallFilter={setMonthCallFilter}
                leadData={leadData} leadFilter={leadFilter} setLeadFilter={setLeadFilter}
            />

<div className='grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 mt-5 gap-6 mb-6 '>

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
