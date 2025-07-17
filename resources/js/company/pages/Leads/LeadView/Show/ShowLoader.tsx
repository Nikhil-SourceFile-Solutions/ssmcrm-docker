import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
export default function ShowLoader() {
    return (
        <>
            <div className='text-end my-2'>
                <Skeleton duration={1} inline={true} width={100} height={20} count={3} className='me-4 ' />
            </div>
            <hr className="mb-4 dark:border-[#191e3a]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>


            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div>
                    <Skeleton duration={1} inline={true} height={15} width={100} className='me-4 ' />
                    <Skeleton duration={1} inline={true} height={40} className='me-4 ' />
                </div>
            </div>

            <div className='mt-4'>
                <Skeleton duration={1} inline={true} height={80} className='me-4 ' />
            </div>

            {/* <Skeleton duration={1}  inline={true} height={25} className='me-4 ' count={3} />
                <Skeleton duration={1}  inline={true} height={25} className='me-4 ' count={5} /> */}

        </>
    )
}

{/* <Skeleton duration={1}  inline={true} width={150} height={25} /> */ }
{/* <Skeleton count={5} /> */ }

{/* <SkeletonTheme baseColor="#202020" highlightColor="#444">
                <p>
                    <Skeleton count={3.5} />
                </p>
            </SkeletonTheme>

            <Skeleton circle={true} height={200} width={252} borderRadius="2rem" duration={1} /> */}
