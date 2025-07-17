import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function SebiLoader() {
  return (
    <>
        <div>
            <div className="flex flex-col h-full">
                <div className='panel'>
                    <div className='flex items-center justify-between mb-5'>
                        <div className='text-end my-2'>
                            <Skeleton duration={1} inline={true} width={137} height={28} className='me-4 ' />
                        </div>
                        <div className=' flex gap-3' >
                            <Skeleton duration={1} inline={true} width={101} height={38} className='me-4 ' />
                        </div>
                    </div>
                    <hr className="my-4 dark:border-[#191e3a]" />
                    <div className='mb-5 space-y-5'>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true} height={39} className='me-4 ' />
                            </div>
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true}  height={39} className='me-4 ' />
                            </div>
                            <div>
                                <Skeleton duration={1} inline={true} width={60} height={20}  className='me-4 ' />
                                <Skeleton duration={1} inline={true}  height={80} className='me-4 ' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}
