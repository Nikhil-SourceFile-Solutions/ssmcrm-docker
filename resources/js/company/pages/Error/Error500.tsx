import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Error500({ error }) {
    return (
        <div className="">
            <div className="relative">
                <img
                    src={0 ? '/assets/images/error/500-dark.svg' : '/assets/images/error/500-light.svg'}
                    alt="500"
                    className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
                />
                <p className="mt-5 text-base dark:text-white text-center">{error.statusText}</p>
                <NavLink to="/" className="btn btn-gradient mx-auto !mt-7 w-max border-0 uppercase shadow-none">
                    Home
                </NavLink>
            </div>
        </div>
    )
}
