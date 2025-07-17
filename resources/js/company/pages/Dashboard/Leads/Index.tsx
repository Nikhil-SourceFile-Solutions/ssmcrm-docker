import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Card from './Card';
import { useAuth } from '../../../AuthContext';
import { setCallBacktData, setPageTitle } from '../../../store/themeConfigSlice';
import axios from 'axios';
import SetCrmPin from '../SetCrmPin';
import Graph from './Graph/Index';
import { IoMdRefresh } from 'react-icons/io';
import IconChatDots from '../../../components/Icon/IconChatDots';
import IconUsersGroup from '../../../components/Icon/IconUsersGroup';
import IconLink from '../../../components/Icon/IconLink';
import { GiSandsOfTime } from "react-icons/gi";
import { Resolver } from 'dns';
export default function Index() {

    const { logout, crmToken, apiUrl, selectedBranch } = useAuth();
    const dispatch = useDispatch();

    const [error, setError] = useState();


    const [cardData, setCardData] = useState([]);
    const [serviceData, setServiceData] = useState([]);
    const [todaySaleData, setTodaySaleData] = useState([]);
    const [monthSaleData, setMonthSaleData] = useState([]);
    const [todayCallData, setTodayCallData] = useState([]);
    const [monthCallData, setMonthCallData] = useState([]);
    const [leadCountData, setLeadCountData] = useState([]);


    const [filter, setFilter] = useState({
        isFirstLoading: true,
        cardReload: false,
        graphReload: true,
        tab: 'todaySale',
        todaySalesFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,
        },
        monthSalesFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,

        },
        todayCallFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,
        },
        monthCallFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,
        },
        LoadCoundFilter: {
            manager: 0,
            leader: 0,
            isActiveUsers: "active",
            chart: "column",
            reload: false,
        }
    })

    const fetchLeadDashboardData = async () => {
        console.log("Fecheing Leads Dashboard Data ......")

        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-leads-dashboard",
                params: {
                    filter: JSON.stringify(filter),
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                    SelectedBranch: selectedBranch
                },
            });


            if (response.data.status === "success") {
                const { isFirstLoading, cardReload, tab } = filter;
                const responseData = response.data.data;
                if (isFirstLoading || cardReload) {
                    setCardData(responseData.cardData);
                    setServiceData(responseData.serviceData)
                }
                if (isFirstLoading || tab === "todaySale") {
                    setTodaySaleData(responseData.todaySaleData);
                } else {
                    switch (tab) {
                        case "monthSale":
                            setMonthSaleData(responseData.monthSaleData);
                            break;
                        case "todayCall":
                            setTodayCallData(responseData.todayCallData);
                            break;
                        case "monthCall":
                            setMonthCallData(responseData.monthCallData);
                            break;
                        case "leadCount":
                            setLeadCountData(responseData.leadData);
                            break;
                        default:
                            console.warn("Unhandled tab:", tab);
                    }
                }





                setFilter((prevFilter) => {
                    const filterKey =
                        tab === "todaySale" ? "todaySalesFilter" :
                            tab === "monthSale" ? "monthSalesFilter" :
                                tab === "todayCall" ? "todayCallFilter" :
                                    tab === "monthCall" ? "monthCallFilter" :
                                        tab === "leadCount" ? "LoadCoundFilter" :
                                            null;

                    if (!filterKey) return prevFilter;

                    return {
                        ...prevFilter,
                        isFirstLoading: false,
                        cardReload: false,
                        graphReload: false,
                        [filterKey]: {
                            ...prevFilter[filterKey],
                            reload: false
                        }
                    };
                });

            }


        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {

        }
    }


    useEffect(() => {
        dispatch(setPageTitle('Lead Dashboard'))

        const { isFirstLoading, cardReload, todaySalesFilter, monthSalesFilter, todayCallFilter, monthCallFilter, LoadCoundFilter, graphReload } = filter;

        if (isFirstLoading
            || cardReload || graphReload
            || todaySalesFilter.reload
            || monthSalesFilter.reload
            || todayCallFilter.reload
            || monthCallFilter.reload
            || LoadCoundFilter.reload) fetchLeadDashboardData();
    }, [
        filter.isFirstLoading,
        filter.cardReload,
        filter.tab,
        filter.todaySalesFilter,
        filter.monthSalesFilter,
        filter.todayCallFilter,
        filter.monthCallFilter,
        filter.LoadCoundFilter,
        filter.LoadCoundFilter,

    ])




    const handleFilter = () => {
        setFilter(prevState => ({
            ...prevState,
            cardReload: true
        }));
    }


    const statuses = [
        { title: "Active", count: 24, color: "bg-green-500" },
        { title: "Pending", count: 12, color: "bg-yellow-500" },
        { title: "Inactive", count: 8, color: "bg-red-500" },
        { title: "Archived", count: 5, color: "bg-gray-500" },
    ];

    return (
        <div>

            <div className='flex justify-between items-center mb-2'>
                <h1 className='font-extrabold text-[18px]'>Dashboard</h1>

                <button
                    className='bg-dark btn btn-sm shadow'
                    onClick={() => handleFilter()}
                >
                    <IoMdRefresh className="w-5 h-5" color='white' />
                </button>
            </div>
            <Card cardData={cardData} filter={filter} setFilter={setFilter} serviceData={serviceData} />















            {/* <div className='panel mb-4 bg-[#fbe5e6]'>
                <div className='panel mb-4 bg-white/30'>
                    <strong>Title Of Warning</strong>
                    <div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos numquam in non cum harum, deleniti nulla quia dolorem odio ipsum illo a repellendus laboriosam, animi saepe quisquam commodi? Quia, nulla.</p>
                    </div>
                    <div className='flex gap-2'>
                        <button className='btn btn-sm shadow btn-dark'>One</button>
                        <button className='btn btn-sm shadow btn-dark'>Two</button>
                    </div>
                </div>
                <div className='panel mb-4 bg-white/30'>
                    <strong>Title Of Warning</strong>
                    <div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos numquam in non cum harum, deleniti nulla quia dolorem odio ipsum illo a repellendus laboriosam, animi saepe quisquam commodi? Quia, nulla.</p>
                    </div>

                    <div className='flex gap-5 mt-2'>
                        <button className='btn btn-sm shadow btn-dark'>One</button>
                        <button className='btn btn-sm shadow btn-dark'>Two</button>
                    </div>
                </div>
            </div> */}

            <SetCrmPin />

            <Graph filter={filter} setFilter={setFilter}
                todaySaleData={todaySaleData}
                monthSaleData={monthSaleData}
                todayCallData={todayCallData}
                monthCallData={monthCallData}
                leadCountData={leadCountData}


            />


        </div>
    )
}
const StatusCard = ({ title, count, color }) => {
    return (
        <div
            className={`flex flex-col items-center justify-center w-40 h-24 p-4 rounded-lg shadow-md text-white ${color}`}
        >
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-xl font-bold">{count}</p>
        </div>
    );
};