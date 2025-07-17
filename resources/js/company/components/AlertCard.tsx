import React from 'react'
import { FaInfoCircle } from "react-icons/fa";
import { NavLink } from 'react-router-dom';

export default function AlertCard({ title, message, buttons }) {

    console.log(buttons)

    return (
        <div className="max-w-md mx-auto mt-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 text-white">
                    <div className="flex justify-center mb-4">
                        <FaInfoCircle size={50} />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>
                    <p className="text-center mb-6">
                        {message}.
                    </p>
                    <div className="flex justify-center space-x-4">
                        {buttons?.map((button) => (
                            <Button button={button} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

}


const Button = ({ button }) => {

    return (

        <>
            {button.action == "link" ? (
                <NavLink to={button.url} className="bg-purple-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-800 transition-colors duration-300">
                    {button.title}
                </NavLink>
            ) : button.action == "click" ? (
                <button onClick={button.callback} type='button' className="bg-purple-700 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-800 transition-colors duration-300">
                    {button.title}
                </button>
            ) : null}

        </>

    )

}
