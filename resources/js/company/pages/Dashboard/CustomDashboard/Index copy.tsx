import React from 'react';
import { useState, useEffect } from 'react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { IRootState } from '../../../store';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import ReactApexChart from 'react-apexcharts';
import Main from '../../Development/Main';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import PageLoader from '../../../components/Layouts/PageLoader';

const Index = () => {

    //

    const { logout, crmToken, apiUrl } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('Custom Dashboard'))
        fetchLeadDashboardData();
    }, [])


    const [isLoading, setIsLoading] = useState(true);
    const [homeData, setHomeData] = useState<any>([]);
    const fetchLeadDashboardData = async () => {
        console.log("Fecheing Custom Dashboard Data ......")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-custom-dashboard",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setHomeData(response.data.data);
            }

        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }


    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // CallsHistoryLeadsChart
    const CallsHistoryLeadsChart: any = {
        series: [
            {
                name: 'Leads',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 300,
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#805dca'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            xaxis: {
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -40 : 0,
                },
            },
            labels: ['EmpName1', 'EmpName2', 'EmpName3', 'EmpName4', 'EmpName5', 'EmpName6', 'EmpName7', 'EmpName8', 'EmpName9', 'EmpName10', 'EmpName11', 'EmpName12'],
            legend: {
                horizontalAlign: 'left',
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
            },
        },
    };
    // FreeTrailLeadsChart
    const FreeTrailLeadsChart: any = {
        series: [
            {
                name: 'Leads',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 300,
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#805dca'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            xaxis: {
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -40 : 0,
                },
            },
            labels: ['EmpName1', 'EmpName2', 'EmpName3', 'EmpName4', 'EmpName5', 'EmpName6', 'EmpName7', 'EmpName8', 'EmpName9', 'EmpName10', 'EmpName11', 'EmpName12'],
            legend: {
                horizontalAlign: 'left',
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
            },
        },
    };
    // FollowUpLeadsChart
    const FollowUpLeadsChart: any = {
        series: [
            {
                name: 'Leads',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 300,
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#805dca'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            xaxis: {
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -40 : 0,
                },
            },
            labels: ['EmpName1', 'EmpName2', 'EmpName3', 'EmpName4', 'EmpName5', 'EmpName6', 'EmpName7', 'EmpName8', 'EmpName9', 'EmpName10', 'EmpName11', 'EmpName12'],
            legend: {
                horizontalAlign: 'left',
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
            },
        },
    };
    // OngoingFreeTrailLeadsChart
    const OngoingFreeTrailLeadsChart: any = {
        series: [
            {
                name: 'Leads',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 300,
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#805dca'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            xaxis: {
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -40 : 0,
                },
            },
            labels: ['EmpName1', 'EmpName2', 'EmpName3', 'EmpName4', 'EmpName5', 'EmpName6', 'EmpName7', 'EmpName8', 'EmpName9', 'EmpName10', 'EmpName11', 'EmpName12'],
            legend: {
                horizontalAlign: 'left',
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
            },
        },
    };
    const [CustomDate, selectDate] = useState<any>('2022-07-05 to 2022-07-10');
    return (
        <div className="p-0 flex-1 overflow-x-hidden h-full">
            {isLoading ? <PageLoader /> : (
                <div className="flex flex-col h-full">
                    <div className='panel'>
                        <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                            <div className="w-[260px]">
                                <h5 className="font-semibold text-lg dark:text-white-light">Custom Dashboard </h5>
                            </div>
                            <div className="flex ltr:ml-auto rtl:mr-auto">
                                <form autoComplete="off" className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                        <div>
                                            <label >Select Duration</label>
                                            <Flatpickr
                                                options={{
                                                    mode: 'range',
                                                    dateFormat: 'Y-m-d',
                                                    position: isRtl ? 'auto right' : 'auto left',
                                                }}
                                                value={CustomDate}
                                                className="form-input w-[240px]"
                                                onChange={(CustomDate) => selectDate(CustomDate)}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <hr className="my-4 dark:border-[#191e3a]" />
                        <div className='mb-5'>
                            <div className="panel mb-4">
                                <div className="mb-5 flex items-center justify-between">
                                    <h5 className="text-lg font-semibold dark:text-white">Calls History</h5>
                                </div>
                                <div className="mb-5">
                                    <ReactApexChart series={CallsHistoryLeadsChart.series} options={CallsHistoryLeadsChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="area" height={300} />
                                </div>
                            </div>

                            <div className="panel mb-4">
                                <div className="mb-5 flex items-center justify-between">
                                    <h5 className="text-lg font-semibold dark:text-white">Free Trial</h5>
                                </div>
                                <div className="mb-5">
                                    <ReactApexChart series={FreeTrailLeadsChart.series} options={FreeTrailLeadsChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="area" height={300} />
                                </div>
                            </div>
                            <div className="panel mb-4">
                                <div className="mb-5 flex items-center justify-between">
                                    <h5 className="text-lg font-semibold dark:text-white">Follow Up</h5>
                                </div>
                                <div className="mb-5">
                                    <ReactApexChart series={FollowUpLeadsChart.series} options={FollowUpLeadsChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="area" height={300} />
                                </div>
                            </div>
                            <div className="panel mb-4">
                                <div className="mb-5 flex items-center justify-between">
                                    <h5 className="text-lg font-semibold dark:text-white">Ongoing Free Trial</h5>
                                </div>
                                <div className="mb-5">
                                    <ReactApexChart series={OngoingFreeTrailLeadsChart.series} options={OngoingFreeTrailLeadsChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="area" height={300} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;
