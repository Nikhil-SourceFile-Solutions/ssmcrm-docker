import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function LeadCardLoader() {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-6 mb-4">
                <div>
                    <Skeleton duration={1} inline={true} height={80} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={80} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={80} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={80} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={80} />
                </div>
            </div>

            <div className="grid sm:grid-cols-4 xl:grid-cols-5 gap-6 mb-4">
                <div>
                    <Skeleton duration={1} inline={true} height={60} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={60} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={60} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={60} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={60} />
                </div>
            </div>

        </>

    )
}
