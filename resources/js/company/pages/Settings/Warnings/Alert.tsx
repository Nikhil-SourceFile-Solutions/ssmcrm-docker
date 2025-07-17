import React from 'react'
import { Link } from 'react-router-dom'

function Alert({ icon, title, message, buttonLabel, action, link, onButtonClick }) {
    return (

        <div className="w-full  p-4 bg-[#fbe5e6] rounded-lg shadow-md mb-2">
            <div className="flex items-center space-x-4">
                <div className="text-blue-500 text-3xl">
                    {icon || <span>ℹ️</span>}
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <p className="mt-1 text-sm font-semibold text-gray-600">{message}</p>
                </div>
            </div>
            <div className="mt-4 text-right">

                {action == "navigation" ? (
                    <button className='btn btn-dark shadow'>
                        <Link to={link} > {buttonLabel}</Link>
                    </button>
                ) : null}

                {/* <button
                    onClick={onButtonClick}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    {buttonLabel || 'OK'}
                </button> */}
            </div>
        </div>

    )
}

export default Alert