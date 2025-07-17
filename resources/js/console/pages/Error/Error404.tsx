import React from 'react'
import { Link } from 'react-router-dom'

export default function () {
    return (
        <div className="">
            <div className="relative">
                <img
                    src={0 ? '/assets/images/error/404-dark.svg' : '/assets/images/error/404-light.svg'}
                    alt="404"
                    className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
                />
                <p className="mt-5 text-base dark:text-white text-center">The page you requested was not found!</p>
                <Link to="/" className="btn btn-gradient mx-auto !mt-7 w-max border-0 uppercase shadow-none">
                    Home
                </Link>
            </div>
        </div>
    )
}
