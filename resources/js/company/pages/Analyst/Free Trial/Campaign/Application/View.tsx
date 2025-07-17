import React, { useEffect, useState } from 'react';
import PageLoader from '../../../../../components/Layouts/PageLoader';
import { useAuth } from '../../../../../AuthContext';



export default function View({ data, setDrawer, drawer }: any) {

    const { settingData, crmToken, apiUrl, authUser } = useAuth()


    return (
        <div>

            {/* {isLoading ? <PageLoader /> : data?.updates?.length ? ( */}
            <div className="table-responsive mb-5">
                <table className='"table-striped'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Updates</th>
                            <th className="text-center">Time</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            data?.updates?.length ?
                                data?.updates?.map((c: any, i: number) => (
                                    <tr key={c.id}>

                                        <td>
                                            <b>{data?.updates?.length - i}</b>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap"><b>{c.update}</b></div>
                                        </td>
                                        <td className="text-center"><b>{c.created_at}</b></td>
                                    </tr>
                                )) : <div className=' flex justify-center' >No Updates Found</div>}
                    </tbody>

                </table>
            </div>

            {/* ) : <>No Application Campain</>} */}

        </div>
    )
}
