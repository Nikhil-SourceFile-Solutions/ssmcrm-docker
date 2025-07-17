import React, { useState } from 'react'
import EmployeeSales from './EmployeeSales';
import AllSale from './AllSale';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';

function Index({ filterUsers, allSales, setFilter, filter, employeeSales, count, isLoading, yearlyReport, monthlyReport }) {

    const tabs = [
        { key: 'all-sales', label: 'All Sales' },
        { key: 'employee-sales', label: 'Employees Sales' },
        { key: 'yearly-report', label: 'Yearly Report' },
        { key: 'monthly-report', label: 'Monthly Report' },
    ];

    const handleTabChange = (tabKey) => {
        setFilter({ ...filter, subTab: tabKey });
    };

    return (
        <div className='panel '>
            <div className='flex gap-4'>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`btn ${filter.subTab === tab.key ? 'btn-gradient' : 'btn-dark'} btn-sm`}
                        onClick={() => handleTabChange(tab.key)}
                        aria-selected={filter.subTab === tab.key}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className='mt-4  p-2 rounded'>
                {filter.subTab == "employee-sales" ? <EmployeeSales
                    filterUsers={filterUsers}
                    count={count}
                    employeeSales={employeeSales}
                    filter={filter}
                    setFilter={setFilter}
                    isLoading={isLoading} /> :
                    filter.subTab == "all-sales" ? <AllSale
                        filterUsers={filterUsers}
                        count={count}
                        filter={filter}
                        allSales={allSales}
                        setFilter={setFilter}
                        isLoading={isLoading}
                    /> :
                        filter.subTab == "monthly-report" ? <MonthlyReport
                            monthlyReport={monthlyReport}
                            filter={filter}
                            setFilter={setFilter}
                            isLoading={isLoading}
                        /> :
                            filter.subTab == "yearly-report" ? <YearlyReport
                                yearlyReport={yearlyReport}
                                filter={filter}
                                setFilter={setFilter}
                                isLoading={isLoading}

                            /> :
                                null}


            </div>
        </div>
    )
}

export default Index