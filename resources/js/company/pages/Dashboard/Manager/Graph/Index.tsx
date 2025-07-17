import React, { useState } from 'react'
import TodaySale from './TodaySale';
import MonthSale from './MonthSale';
import TodayCall from './TodayCall';
import MonthCall from './MonthCall';
import LeadCount from './LeadCount';

export default function Index({ tab, setTab, todaySaleDtata, setTodaySaleFilter, todaySaleFilter, graphLoad,

    monthSaleDtata, monthSaleFilter, setMonthSaleFilter,
    todayCallData, todayCallFilter, setTodayCallFilter,
    monthCallData, monthCallFilter, setMonthCallFilter,
    leadData, leadFilter, setLeadFilter,
}) {


    return (
        <div className=' flex gap-5'>

            <div className='bg-white-light shadow-[4px_6px_10px_-3px_#bfc9d4] flex flex-col gap-6 p-5 rounded min-w-[220px] h-full'>
                <button type="button" className={`btn btn-lg ${tab == "todaySale" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => setTab('todaySale')}>Today's Sales</button>
                <button type="button" className={`btn btn-lg ${tab == "monthSale" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => setTab('monthSale')}>Monthly Sales</button>
                <button type="button" className={`btn btn-lg ${tab == "todayCall" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => setTab('todayCall')}>Today's Calls</button>
                <button type="button" className={`btn btn-lg ${tab == "monthCall" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => setTab('monthCall')}>Monthly Calls</button>
                <button type="button" className={`btn btn-lg ${tab == "leadCount" ? 'btn-gradient' : 'btn-dark'}`} onClick={() => setTab('leadCount')}>Leads Count</button>
            </div>

            <div className=' flex-1 '>
                {
                    tab == "todaySale" ? <TodaySale todaySaleDtata={todaySaleDtata} setTodaySaleFilter={setTodaySaleFilter} todaySaleFilter={todaySaleFilter} graphLoad={graphLoad} /> :
                        tab == "monthSale" ? <MonthSale monthSaleDtata={monthSaleDtata} monthSaleFilter={monthSaleFilter} setMonthSaleFilter={setMonthSaleFilter} graphLoad={graphLoad} /> :
                            tab == "todayCall" ? <TodayCall todayCallData={todayCallData} todayCallFilter={todayCallFilter} setTodayCallFilter={setTodayCallFilter} graphLoad={graphLoad} /> :
                                tab == "monthCall" ? <MonthCall monthCallData={monthCallData} monthCallFilter={monthCallFilter} setMonthCallFilter={setMonthCallFilter} graphLoad={graphLoad} /> :
                                    <LeadCount leadData={leadData} leadFilter={leadFilter} setLeadFilter={setLeadFilter} graphLoad={graphLoad} />
                }
            </div>
        </div>
    )
}
