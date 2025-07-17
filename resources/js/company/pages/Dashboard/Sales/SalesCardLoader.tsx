import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function SalesCardLoader() {
    return (
        <>
            <div className="grid sm:grid-cols-4 xl:grid-cols-4 gap-6 mb-6">
                <div>
                    <Skeleton duration={1} inline={true} height={84} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={84} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={84} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={84} className='me-4 ' />
                </div>

            </div>
        </>
    )
}
