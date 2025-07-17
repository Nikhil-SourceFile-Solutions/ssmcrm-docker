import React, { useEffect, useState } from 'react'
import Card from './Card'
import Graph from './Graph/Index'
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import Sales from './Sales';
import SetCrmPin from '../SetCrmPin';
import Followup from './Followup';
import Freetrial from '../Bde/Freetrial';

export default function Index() {

    const { logout, crmToken, apiUrl } = useAuth();
    const [tab, setTab] = useState('todaySale');

    const [cardData, setCardData] = useState([]);
    const [cardLoad, setCardLoad] = useState(true);

    const [fetchingSale, setFetchingSale] = useState(true);
    const [saleData, setSaleData] = useState([]);

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
    }, [followUpPageSize, followUpDate,followUpDate,freeTrailDate]);
    useEffect(() => {
        fetchLeaderDashboard()
    }, [tab, todaySaleFilter, monthSaleFilter, todayCallFilter, monthCallFilter, leadFilter, fetchingSale,followUpDate,freeTrailDate,followUpReload,freeTrailReload])



    const fetchLeaderDashboard = async () => {
        setGraphLoad(true)
        try {

            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/get-leader-dashboard",
                params: {
                    cardLoad: cardLoad,
                    tab: tab,
                    todaySaleFilter: todaySaleFilter,
                    monthSaleFilter: monthSaleFilter,
                    todayCallFilter: todayCallFilter,
                    monthCallFilter: monthCallFilter,
                    leadFilter: leadFilter,
                    fetchingSale: fetchingSale,

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
            <SetCrmPin />


            <Sales fetchingSale={fetchingSale} saleData={saleData} />

            <Graph tab={tab} setTab={setTab} graphLoad={graphLoad}
                todaySaleDtata={todaySaleDtata} setTodaySaleFilter={setTodaySaleFilter} todaySaleFilter={todaySaleFilter}
                monthSaleDtata={monthSaleDtata} monthSaleFilter={monthSaleFilter} setMonthSaleFilter={setMonthSaleFilter}
                todayCallData={todayCallData} todayCallFilter={todayCallFilter} setTodayCallFilter={setTodayCallFilter}
                monthCallData={monthCallData} monthCallFilter={monthCallFilter} setMonthCallFilter={setMonthCallFilter}
                leadData={leadData} leadFilter={leadFilter} setLeadFilter={setLeadFilter}

            />
            <div className='grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-6 mb-6 mt-5 '>

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
