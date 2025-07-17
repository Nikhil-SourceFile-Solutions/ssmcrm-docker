import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function ListEmpLoader() {
  return (
    <>
        <div>
            <div className="table-responsive mb-5">
                <table>
                    <thead>
                        <tr>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                            <th><Skeleton duration={1} inline={true} width={100} height={20} className='me-4 ' /></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <th><Skeleton duration={1}  inline={true} width={120} height={20} className='me-4 ' /></th>
                            </td>
                            <td>
                                <th>
                                    <div className='flex items-center'>
                                        <Skeleton duration={1} borderRadius={'10rem'} inline={true} width={40} height={40} className='me-2 ' />
                                        <Skeleton duration={1}  inline={true} width={100} height={20} className='' />
                                    </div>
                                </th>
                            </td>
                            <td>
                                <th><Skeleton duration={1}  inline={true} width={150} height={20} className='me-4 ' /></th>
                            </td>
                            <td>
                                <th><Skeleton duration={1}  inline={true} width={120} height={20} className='me-4 ' /></th>
                            </td>
                            <td>
                                <th><Skeleton duration={1}  inline={true} width={70} height={20} className='me-4 ' /></th>
                            </td>
                            <td>
                                <th><Skeleton duration={1}  inline={true} width={70} height={20} className='me-4 ' /></th>
                            </td>
                            <td>
                                <th><Skeleton duration={1} borderRadius={'10rem'} inline={true} width={40} count={3} height={40} className='me-2' /></th>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </>
  )
}
