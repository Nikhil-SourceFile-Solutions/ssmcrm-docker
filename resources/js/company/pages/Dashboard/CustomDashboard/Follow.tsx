import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import PageLoader from '../../../components/Layouts/PageLoader';

function Follow({ reload, isLoading, setIsLoading }) {

    const { logout, crmToken, apiUrl } = useAuth();

    function getTodayDateRange() {
        const today = new Date();
        const yearFull = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        const fullDate = `${yearFull}-${month}-${day}`;
        return [fullDate, fullDate];
    }

    const [followUps, setFollowUps] = useState([]);
    const [dateRange, setDateRange] = useState(getTodayDateRange())
    const [filterEmployee, setFilterEmployee] = useState('all');
    const fetchFollowUp = async () => {
        console.log("Fetching... Calls")
        setIsLoading(true)
        try {
            const response = await axios({
                method: 'get',
                url: apiUrl + "/api/home-data-custom-dashboard",
                params: { tab: 'follow', dateRange: JSON.stringify(dateRange), filterEmployee: filterEmployee },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: "Bearer " + crmToken,
                },
            });

            if (response.data.status == "success") {
                setFollowUps(response.data.freeTrials);
            }
        } catch (error) {
            console.log(error)
            if (error?.response?.status == 401) logout()
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFollowUp()
    }, [reload, dateRange, filterEmployee])

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // 
    const columnChart: any = {
        series: [

            {
                name: 'Total Free Trials',
                data: followUps?.map((call: any) => call.total_calls),
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'bar',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#fc278c', '#fb7d01'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                },
            },
            grid: {
                // borderColor: isDark ? '#191e3a' : '#e0e6ed',
            },
            xaxis: {
                categories: followUps?.map((call: any) => call.first_name),
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -10 : 0,
                },
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
                y: {
                    formatter: function (val: any) {
                        return val;
                    },
                },
            },
        },
    };
    return (

        <>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white">Follow Ups</h5>

                <div className='flex gap-4'>
                    <div>
                        <select className="form-select text-white-dark" onChange={(e) => setFilterEmployee(e.target.value)}>
                            <option value={'all'}>All</option>
                            <option value={1}>Active Employees</option>
                            <option value={0}>Blocked Employees</option>
                        </select>
                    </div>

                    <div>
                        <Flatpickr
                            options={{
                                mode: 'range',
                                dateFormat: 'Y-m-d',
                                position: 'auto left',
                            }}
                            value={dateRange}
                            className="form-input w-[240px]"
                            onChange={(selectedDates) => {
                                const date = selectedDates.map(dateObj => {
                                    const year = dateObj.getFullYear();
                                    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                                    const day = String(dateObj.getDate()).padStart(2, '0');
                                    return `${year}-${month}-${day}`;
                                });
                                if (date.length === 2) setDateRange(date);
                            }}
                        />
                    </div>

                </div>
            </div>
            <div className="mb-5">

                {isLoading ? <PageLoader /> : (
                    <ReactApexChart series={columnChart.series} options={columnChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="bar" height={300} />

                )}
            </div>
        </>
    )
}


export default React.memo(Follow);