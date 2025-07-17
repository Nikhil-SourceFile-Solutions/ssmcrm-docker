import React, { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts';
import { IoMdRefresh } from 'react-icons/io';
import { VscGraph, VscGraphLine, VscGraphScatter } from 'react-icons/vsc';
import PageLoader from '../../../../components/Layouts/PageLoader';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../../store';
import { HiOutlineTableCells } from 'react-icons/hi2';
import EmployeeSale from '../Table/EmployeeSale';
function EmployeeSales({ employeeSales, count, filter, setFilter, isLoading, filterUsers }) {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    interface EmployeeSale {
        owner: string;
        total_sales: number;
    }

    const { owners, sales, formattedData } = useMemo(() => {
        if (!employeeSales) return { owners: [], sales: [], formattedData: [] };

        return employeeSales.reduce(
            (acc, l) => {
                acc.owners.push(l.owner);
                acc.sales.push(l.total_sales);
                acc.formattedData.push({ x: l.owner, y: l.total_sales });
                return acc;
            },
            { owners: [] as string[], sales: [] as number[], formattedData: [] as { x: string; y: number }[] }
        );
    }, [employeeSales]);


    const topSale = sales.length > 0 ? Math.max(...sales).toFixed(2) : '0.00';
    const index = sales.indexOf(topSale);
    const topEmployee = owners[index] ? owners[index] : 'N/A';
    const totalSales = sales.length > 0 ? sales.reduce((sum, sale) => sum + Number(sale), 0).toFixed(2) : '0.00';

    const areaChart = {
        series: [{ name: 'Sales', data: sales }],
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
                curve: "smooth",
                width: 3,
                fill: {
                    type: "gradient",
                    gradient: {
                        type: "horizontal",
                        colorStops: [
                            [
                                {
                                    offset: 0,
                                    color: "#0085FF",
                                    opacity: 1
                                },
                                {
                                    offset: 33,
                                    color: "#FF2E92",
                                    opacity: 1
                                },
                                {
                                    offset: 80,
                                    color: "#FFAC2F",
                                    opacity: 1
                                },
                                {
                                    offset: 99,
                                    color: "#FFFFFF",
                                    opacity: 1
                                }
                            ]
                        ]
                    }
                }
            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    type: "vertical",
                    colorStops: [
                        [
                            {
                                offset: 0,
                                color: "#F48116",
                                opacity: 1.0
                            },
                            {
                                offset: 70,
                                color: "#6510F8",
                                opacity: 0.2
                            },
                            {
                                offset: 97,
                                color: "#6510F8",
                                opacity: 0.0
                            }
                        ]
                    ]
                }
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    style: {
                        colors: "#000"
                    }
                }
            },

            yaxis: {
                opposite: false,
                labels: {
                    offsetX: 0,
                },
            },
            labels: owners,
            legend: { horizontalAlign: 'left' },
            grid: {
                borderColor: isDark ? '#161d28' : '#eef2f5',
            },
            tooltip: {
                theme: 'light',
            },
        },
    };





    const columnChart = useMemo(() => ({
        series: [{ name: 'Sales', data: sales, type: 'column' }],
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
                borderColor: isDark ? '#161d28' : '#eef2f5',
                padding: { left: 20, right: 20 },
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
            },
            xaxis: {
                categories: owners,
                axisBorder: { show: true, color: '#e0e6ed' },
            },
            yaxis: {
                tickAmount: 5,
                labels: {
                    formatter: (value) => Math.round(value),
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
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
    }), [isLoading]);


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
            employeeSaleFilter: {
                ...prevState.employeeSaleFilter,
                [data.action]: data.value
            }
        }));
    }

    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const renderChart = () => {
        if (isLoading) {
            return <PageLoader />;
        } else if (sales.length === 0) {
            return (
                <div className="flex items-center p-3.5 rounded text-danger bg-danger-light dark:bg-danger-dark-light">
                    <span className="ltr:pr-2 rtl:pl-2">
                        <strong className="ltr:mr-1 rtl:ml-1">No Data Found!</strong>
                    </span>
                </div>
            );
        }


        switch (filter?.employeeSaleFilter?.chart) {
            case "column":
                return <ReactApexChart options={columnChart.options} series={columnChart.series} type="bar" height={400} className="overflow-hidden" />;
            case "area":
                return <ReactApexChart options={areaChart.options} series={areaChart.series} type="area" height={400} className="overflow-hidden" />;
            case "treemap":
                return <ReactApexChart options={treeChart.options} series={treeChart.series} type="treemap" height={400} className="overflow-hidden" />;
            default:
                return <EmployeeSale allSales={employeeSales} isLoading={isLoading} />;
        }
    }

    return (
        <div>
            <div className='flex justify-between items-center  bg-[#dbe7ff38] p-2 rounded'>
                <h1 className='font-bold text-[18px]'>Employee Sales</h1>



                <div className='flex gap-4'>
                    <select
                        className='form-select form-select-sm w-[150px]'
                        value={filter?.employeeSaleFilter?.manager}
                        onChange={(e) => handleFilter({ action: 'manager', value: e.target.value })} >
                        <option value="0">All</option>
                        {filterUsers?.filter(user => user.user_type == "Manager").map(manager => (
                            <option key={manager.id} value={manager.id}>{manager.first_name} {manager.last_name}</option>
                        ))}
                    </select>

                    {filter?.employeeSaleFilter?.manager != "0" && (
                        <select
                            className='form-select form-select-sm w-[150px]'
                            value={filter?.employeeSaleFilter.leader}
                            onChange={(e) => handleFilter({ action: 'leader', value: e.target.value })}>
                            <option value="0">All</option>
                            {filterUsers?.filter(user => user.user_type == "Team Leader" && user.manager_id == filter?.employeeSaleFilter?.manager).map(leader => (
                                <option key={leader.id} value={leader.id}>{leader.first_name} {leader.last_name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className='flex gap-5 mt-1'>
                    <label className="inline-flex">
                        <input
                            type="radio"
                            name="default_radio2"
                            value={'active'}
                            className="form-radio"
                            checked={filter?.employeeSaleFilter?.isActiveUsers === "active"}
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
                            checked={filter?.employeeSaleFilter?.isActiveUsers === "inactive"}
                            onChange={() => handleFilter({ action: "isActiveUsers", value: "inactive" })}
                        />
                        <span>Inactive Users</span>
                    </label>
                </div>

                <div>
                    <Flatpickr
                        options={{
                            mode: 'range',
                            dateFormat: 'Y-m-d',
                            position: 'auto left',
                        }}
                        name="date_range"
                        value={filter.employeeSaleFilter.dateRange}
                        className="form-input form-input-sm"
                        onChange={(CustomDate) => {
                            const date = CustomDate.map((dateStr) => {
                                const formattedDate = dateFormatter.format(new Date(dateStr));
                                return formattedDate.split('/').reverse().join('-');
                            });
                            if (date.length == 2) handleFilter({ action: "dateRange", value: date })
                        }}
                    />

                </div>


                <div className='flex gap-4'>
                    {['treemap', 'area', 'column', 'table'].map(chartType => (
                        <button
                            key={chartType}
                            className={`${filter?.employeeSaleFilter?.chart == chartType ? "bg-[#1d67a7]" : "bg-[red]/50"} btn btn-sm shadow`}
                            onClick={() => handleFilter({ action: "chart", value: chartType })}
                        >
                            {chartType === 'treemap' ? <VscGraphScatter color='white' className="w-5 h-5" /> :
                                chartType === 'area' ? <VscGraphLine color='white' className="w-5 h-5" /> :
                                    chartType === 'column' ? <VscGraph color='white' className="w-5 h-5" /> :
                                        <HiOutlineTableCells color='white' className="w-5 h-5" />}


                        </button>
                    ))}
                    <button
                        className='bg-dark btn btn-sm shadow'
                        onClick={() => handleFilter({ action: "reload", value: !filter?.reload })}
                    >
                        <IoMdRefresh className="w-5 h-5" color='white' />
                    </button>
                </div>
            </div>

            {isLoading ? null : (
                <div className='flex justify-around mt-4  py-1'>
                    <div className='flex-1 text-center'>
                        <b className='text-[18px] text-[#009688]'>₹{totalSales}  </b>
                        <br />
                        <small className='font-bold'>Total Sales</small>
                    </div>
                    <div className='flex-1 text-center'>
                        <div>
                            <b className='text-[18px] text-[#009688]'>₹{topSale} | {topEmployee}</b>
                            <br />
                            <small className='font-bold'>Leading Employee</small>
                        </div>
                    </div>
                    <div className='flex-1 text-center'>
                        <b className='text-[18px] text-[#009688]'>{count}</b>
                        <br />
                        <small className='font-bold'>Total Sales Count</small>
                    </div>
                </div>
            )}
            <div>
                {renderChart()}
            </div>
        </div>
    )
}

export default EmployeeSales