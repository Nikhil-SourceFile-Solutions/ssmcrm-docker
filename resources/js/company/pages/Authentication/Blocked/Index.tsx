import React from 'react'
import Other from './Other'
import Payment from './Payment'

export default function Index({ block }) {
    return (
        <div className="min-w-[500px] h-[90%] mx-auto ">

            {block == "block" ? <Other /> : block == "payment" ? <Payment /> : <Other />}
        </div>
    )
}
