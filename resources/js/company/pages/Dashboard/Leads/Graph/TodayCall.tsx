
import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import PageLoader from '../../../../components/Layouts/PageLoader';
import { IoMdRefresh } from 'react-icons/io';
import { VscGraph, VscGraphLine, VscGraphScatter } from "react-icons/vsc";

export default function TodayCall({
    todayCallData, filter, setFilter
}) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const { todayCallFilter, graphReload } = filter;

    const filterUsers = todayCallData.filterUsers;

    const salesData = todayCallData?.calls || [];
    const salesValues = salesData.map((l: any) => l.calls);
    const salesNames = salesData.map((l: any) => l.name);

    const columnChart = useMemo(() => ({
        series: [{ name: 'Calls', data: salesValues, type: 'column' }],
        options: {
            chart: { height: 750, type: 'bar', fontFamily: 'Nunito, sans-serif', toolbar: { show: false } },
            dataLabels: { enabled: false },
            stroke: { width: 2, colors: ['transparent'] },
            colors: ['#EF1262', '#b512efe6'],
            dropShadow: { enabled: true, blur: 3, color: '#515365', opacity: 1 },
            plotOptions: {
                bar: { horizontal: false, columnWidth: '55%', borderRadius: 8, borderRadiusApplication: 'end' },
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                itemMargin: { horizontal: 8, vertical: 8 },
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                padding: { left: 20, right: 20 },
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
            },
            xaxis: {
                categories: salesNames,
                axisBorder: { show: true, color: isDark ? '#3b3f5c' : '#e0e6ed' },
            },
            yaxis: {
                tickAmount: 5,
                opposite: isRtl,
                labels: {
                    formatter: (value) => Math.round(value),
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: isDark ? 'dark' : 'light',
                    type: 'vertical',
                    shadeIntensity: 0.2,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.9,
                    stops: [0, 100],
                },
            },
            tooltip: { shared: true, intersect: false, marker: { show: true } },
        },
    }), [salesValues, salesNames, isDark, isRtl]);

    const areaChart = useMemo(() => ({
        series: [{ name: 'Calls', data: salesValues }],
        options: {
            chart: { type: 'area', height: 300, zoom: { enabled: false }, toolbar: { show: false } },
            colors: ['#7300d0'],
            dataLabels: { enabled: false },
            stroke: { width: 2, curve: 'smooth' },
            xaxis: { axisBorder: { color: isDark ? '#191e3a' : '#e0e6ed' } },
            yaxis: { opposite: isRtl, labels: { offsetX: isRtl ? -40 : 0 } },
            labels: salesNames,
            legend: { horizontalAlign: 'left' },
            grid: { borderColor: isDark ? '#191E3A' : '#E0E6ED' },
            tooltip: { theme: isDark ? 'dark' : 'light' },
        },
    }), [salesValues, salesNames, isDark, isRtl]);

    const formattedData = useMemo(() => salesData.map(l => ({ x: l.name, y: l.calls })), [salesData]);

    const treeChart = useMemo(() => ({
        series: [{ data: formattedData }],
        options: {
            legend: { show: false },
            chart: { height: 450, type: 'treemap', toolbar: { show: false } },
            colors: [
                '#3B93A5', '#F7B844', '#ADD8C7', '#EC3C65',
                '#CDD7B6', '#C1F666', '#D43F97', '#1E5D8C',
                '#421243', '#7F94B0', '#EF6537', '#C0ADDB',
            ],
        },
    }), [formattedData]);



    const handleFilter = (data) => {
        setFilter(prevState => ({
            ...prevState,
            todayCallFilter: {
                ...prevState.todayCallFilter,
                [data.action]: data.value,
                reload: true
            }
        }));
    }

    const renderChart = () => {
        if (todayCallData.reload) {
            return <PageLoader />;
        } else if (salesData.length === 0) {
            return (
                <div className="flex items-center p-3.5 rounded text-danger bg-danger-light dark:bg-danger-dark-light">
                    <span className="ltr:pr-2 rtl:pl-2">
                        <strong className="ltr:mr-1 rtl:ml-1">No Data Found!</strong>
                    </span>
                </div>
            );
        }

        switch (todayCallFilter?.chart) {
            case "column":
                return <ReactApexChart options={columnChart.options} series={columnChart.series} type="bar" height={400} className="overflow-hidden" />;
            case "area":
                return <ReactApexChart options={areaChart.options} series={areaChart.series} type="area" height={400} className="overflow-hidden" />;
            case "treemap":
                return <ReactApexChart options={treeChart.options} series={treeChart.series} type="treemap" height={400} className="overflow-hidden" />;
            default:
                return null;
        }
    }

    return (
        <div className="panel h-full p-0 lg:col-span-2">
            <div className="flex items-center justify-between dark:text-white-light p-3 border-b border-white-light dark:border-[#1b2e4b]">
                <h5 className="font-semibold text-lg">Today's Calls</h5>
                <div>
                    <div className='flex gap-4'>
                        <select
                            className='form-select form-select-sm w-[150px]'
                            value={todayCallFilter?.manager}
                            onChange={(e) => handleFilter({ action: 'manager', value: e.target.value })}
                        >
                            <option value="0">All</option>
                            {filterUsers?.filter(user => user.user_type === "Manager").map(manager => (
                                <option key={manager.id} value={manager.id}>{manager.first_name} {manager.last_name}</option>
                            ))}
                        </select>

                        {todayCallFilter?.manager != "0" && (
                            <select
                                className='form-select form-select-sm w-[150px]'
                                value={todayCallFilter?.leader}
                                onChange={(e) => handleFilter({ action: 'leader', value: e.target.value })}
                            >
                                <option value="0">All</option>
                                {filterUsers?.filter(user => user.user_type === "Team Leader" && user.manager_id == todayCallFilter?.manager).map(manager => (
                                    <option key={manager.id} value={manager.id}>{manager.first_name} {manager.last_name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className='flex gap-5'>
                    <label className="inline-flex">
                        <input
                            type="radio"
                            name="default_radio2"
                            value={'active'}
                            className="form-radio"
                            checked={todayCallFilter?.isActiveUsers === "active"}
                            onChange={() => handleFilter({ action: "isActiveUsers", value: "active" })}
                        />
                        <span>Active Users</span>
                    </label>
                    <label className="inline-flex">
                        <input
                            type="radio"
                            name="default_radio2"
                            value={'inactive'}
                            className="form-radio"
                            checked={todayCallFilter?.isActiveUsers === "inactive"}
                            onChange={() => handleFilter({ action: "isActiveUsers", value: "inactive" })}
                        />
                        <span>Inactive Users</span>
                    </label>
                </div>

                <div className='flex gap-4'>
                    {['treemap', 'area', 'column'].map(chartType => (
                        <button
                            key={chartType}
                            className={`${todayCallFilter?.chart === chartType ? "bg-[#1abc9c]" : "bg-[red]/50"} btn btn-sm shadow`}
                            onClick={() => handleFilter({ action: "chart", value: chartType })}
                        >
                            {chartType === 'treemap' ? <VscGraphScatter color='white' className="w-5 h-5" /> :
                                chartType === 'area' ? <VscGraphLine color='white' className="w-5 h-5" /> :
                                    <VscGraph color='white' className="w-5 h-5" />}
                        </button>
                    ))}
                    <button
                        className='bg-dark btn btn-sm shadow'
                        onClick={() => handleFilter({ action: "reload", value: !todayCallFilter?.reload })}
                    >
                        <IoMdRefresh className="w-5 h-5" color='white' />
                    </button>
                </div>
            </div>
            {renderChart()}
        </div>
    );
}
