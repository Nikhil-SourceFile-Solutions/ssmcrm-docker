import React from 'react'
import Card from './Card'
import { IoMdRefresh } from 'react-icons/io'


export default function HrDashboard() {
    return (
        <div>
            <div>

                <div className='flex justify-between items-center mb-2'>
                    <h1 className='font-extrabold text-[18px]'>Dashboard</h1>

                    <button
                        className='bg-dark btn btn-sm shadow'
                        onClick={() => alert(12)}
                    >
                        <IoMdRefresh className="w-5 h-5" color='white' />
                    </button>
                </div>
                <Card />






            </div>
        </div>
    )
}
