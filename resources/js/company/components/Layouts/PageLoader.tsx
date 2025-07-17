import React from 'react'
import { LineWave } from 'react-loader-spinner'
export default function PageLoader() {
    return (

        <div className="flex h-full">
            <div className="m-auto">

                <span className="animate-spin border-[3px] mt-10 border-success border-l-transparent rounded-full w-6 h-6 inline-block align-middle m-auto mb-10"></span>

            </div>
        </div>

    )
}
