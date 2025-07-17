import React, { useState } from 'react'
import TodaySale from './TodaySale';
import MonthSale from './MonthSale';
import TodayCall from './TodayCall';
import MonthCall from './MonthCall';
import LeadCount from './LeadCount';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
export default function Index(
    { filter,
        setFilter,
        todaySaleData,
        monthSaleData,
        todayCallData,
        monthCallData,
        leadCountData,

    }
) {


    const { isFirstLoading, graphReload, tab } = filter;

    const handleTab = (tab) => {
        setFilter({
            ...filter,
            tab: tab,
            graphReload: true
        })
    }
    return (
        <div className=' flex gap-5'>

            {isFirstLoading ? (
                <div className=' flex flex-col gap-4 rounded min-w-[220px] h-full'>

                    <Skeleton duration={1} inline={true} height={360} className='me-4 ' >
                    </Skeleton>
                </div>
            ) :

                (
                    <div className='bg-white-light shadow-[0_0_20px_0_#d0d0d0] dark:bg-[#050b14] flex flex-col gap-6 p-5 rounded min-w-[220px] h-full'>
                        <button type="button" className={`btn btn-lg ${tab == "todaySale" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => handleTab('todaySale')}>Today's Sales</button>
                        <button type="button" className={`btn btn-lg ${tab == "monthSale" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => handleTab('monthSale')}>Monthly Sales</button>
                        <button type="button" className={`btn btn-lg ${tab == "todayCall" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => handleTab('todayCall')}>Today's Calls</button>
                        <button type="button" className={`btn btn-lg ${tab == "monthCall" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => handleTab('monthCall')}>Monthly Calls</button>
                        <button type="button" className={`btn btn-lg ${tab == "leadCount" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => handleTab('leadCount')}>Leads Count</button>
                    </div>
                )
            }

            <div className=' flex-1 '>
                {


                    isFirstLoading || graphReload ? (<Skeleton duration={1} inline={true} height={360} className='me-4 ' />) :
                        (
                            tab == "todaySale" ? <TodaySale todaySaleData={todaySaleData} filter={filter} setFilter={setFilter} /> :
                                tab == "monthSale" ? <MonthSale monthSaleData={monthSaleData} filter={filter} setFilter={setFilter} /> :
                                    tab == "todayCall" ? <TodayCall todayCallData={todayCallData} filter={filter} setFilter={setFilter} /> :
                                        tab == "monthCall" ? <MonthCall monthCallData={monthCallData} filter={filter} setFilter={setFilter} /> :
                                            <LeadCount leadCountData={leadCountData} filter={filter} setFilter={setFilter} />


                        )
                }
            </div>
            {/* 

            
                
            </div> */}
        </div>
    )
}
