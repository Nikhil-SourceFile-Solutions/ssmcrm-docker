import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoIosCloseCircle } from "react-icons/io";
const LeadProblem = ({ count, message, bgColor, viewLeads }) => {
    const [modal, setModal] = useState(false);
    const [leads, setLeads] = useState([]);

    const handleViewLeads = (leads) => {
        setLeads(leads);
        setModal(true);
    };

    return (
        <>
            <div className={`bg-${bgColor} p-4 rounded mb-4`}>
                <b className='text-[18px]'>{count} {message}</b>
                <div className='flex gap-3 mt-4'>
                    <button className='btn btn-sm shadow btn-secondary' onClick={() => handleViewLeads(viewLeads)}>View Leads</button>
                    <button className='btn btn-sm shadow btn-secondary'>Move Leads</button>
                </div>
            </div>

            <Transition appear show={modal} as={Fragment}>
                <Dialog as="div" open={modal} onClose={() => setModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>

                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-start justify-center min-h-screen px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg max-h-screen my-8 w-full max-w-md text-black dark:text-white-dark overflow-hidden">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <div className="text-lg font-bold">Leads</div>
                                        <button type="button" className="text-black hover:text-gray-600" onClick={() => setModal(false)}>
                                            <IoIosCloseCircle size={25} />
                                        </button>
                                    </div>
                                    <div className="p-5 max-h-[60vh] overflow-y-auto">
                                        {leads.length ? (
                                            leads.map((lead, index) => (
                                                <p key={index}>{lead}</p>
                                            ))
                                        ) : (
                                            <p>No leads available.</p>
                                        )}

                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default function Lead({ result: { inactiveOwnersLeads, noOwnerLeads } }) {
    const noLeads = !inactiveOwnersLeads.length && !noOwnerLeads.length;

    return (
        <div>
            {noLeads ? (
                <div className='bg-[#1da740] text-white p-4 rounded'>
                    <b>There are no problems found with leads</b>
                </div>
            ) : (
                <>
                    {noOwnerLeads.length > 0 && (
                        <LeadProblem
                            count={noOwnerLeads.length}
                            message="leads found with no owners"
                            bgColor="[#fbe5e6]"
                            viewLeads={noOwnerLeads}
                        />
                    )}
                    {inactiveOwnersLeads.length > 0 && (
                        <LeadProblem
                            count={inactiveOwnersLeads.length}
                            message="leads found with inactive owners"
                            bgColor="[#F0F0F0]"
                            viewLeads={inactiveOwnersLeads}
                        />
                    )}
                </>
            )}
        </div>
    );
}
