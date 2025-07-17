import React from 'react'
import { FaInfoCircle } from 'react-icons/fa'

export default function Blocked() {
    return (

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 text-white">
                <div className="flex justify-center mb-4">
                    <FaInfoCircle size={50} />
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">CRM Blocked</h2>
                <p className="text-center mb-6">
                    CRM Blocked by Team Finsap
                </p>

            </div>
        </div>

    )
}
