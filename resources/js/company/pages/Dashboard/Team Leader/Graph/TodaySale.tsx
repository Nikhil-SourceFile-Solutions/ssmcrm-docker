import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import PageLoader from '../../../../components/Layouts/PageLoader';
import axios from 'axios';
import { useAuth } from '../../../../AuthContext';

export default function TodaySale({ todaySaleDtata, setTodaySaleFilter, todaySaleFilter, graphLoad }) {


    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;



    const [isLoading, setIsLoading] = useState(false);




    const uniqueVisitorSeries: any = {
        series: [
            {
                name: 'Sales',
                data: todaySaleDtata?.map((l: any) => l.sales),
                type: 'column',
            },



        ],
        options: {
            chart: {
                height: 750,
                type: 'bar',
                fontFamily: 'Nunito, sans-serif',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                colors: ['transparent'],
            },
            colors: ['#5c1ac3', '#a78bfa'],
            dropShadow: {
                enabled: true,
                blur: 3,
                color: '#515365',
                opacity: 0.4,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 8,
                    borderRadiusApplication: 'end',
                },
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                itemMargin: {
                    horizontal: 8,
                    vertical: 8,
                },
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                padding: {
                    left: 20,
                    right: 20,
                },
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
            xaxis: {
                categories: todaySaleDtata?.map((l: any) => l.name),
                axisBorder: {
                    show: true,
                    color: isDark ? '#3b3f5c' : '#e0e6ed',
                },
            },
            yaxis: {
                tickAmount: 6,
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -10 : 0,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: isDark ? 'dark' : 'light',
                    type: 'vertical',
                    shadeIntensity: 0.3,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100],
                },
            },
            tooltip: {
                shared: true,
                intersect: false,
                marker: {
                    show: true,
                },
            },
        },
    };
    return (

        <div className="panel h-full p-0 lg:col-span-2">
            <div className="flex items-start justify-between dark:text-white-light p-5 border-b  border-white-light dark:border-[#1b2e4b]">
                <h5 className="font-semibold text-lg ">Today's Sales</h5>
                <div className='flex gap-5'>
                    <label className="inline-flex">
                        <input type="radio" name="default_radio2" value={'active'} className="form-radio" defaultChecked={todaySaleFilter == "active" ? true : false}
                            onClick={() => setTodaySaleFilter('active')}
                        />
                        <span>Active Users</span>
                    </label>
                    <label className="inline-flex">
                        <input type="radio" name="default_radio2" value={'inactive'} className="form-radio" defaultChecked={todaySaleFilter == "inactive" ? true : false}
                            onClick={() => setTodaySaleFilter('inactive')}
                        />
                        <span>Inactive Users</span>
                    </label>
                </div>
            </div>

            {graphLoad ? <PageLoader /> : todaySaleDtata?.length ? (
                <ReactApexChart options={uniqueVisitorSeries.options} series={uniqueVisitorSeries.series} type="bar" height={450} className="overflow-hidden" />

            ) : <div className="flex items-center p-3.5 rounded text-danger bg-danger-light dark:bg-danger-dark-light">
                <span className="ltr:pr-2 rtl:pl-2">
                    <strong className="ltr:mr-1 rtl:ml-1">No Data Found!</strong>
                </span>
            </div>}
        </div>
    )
}
