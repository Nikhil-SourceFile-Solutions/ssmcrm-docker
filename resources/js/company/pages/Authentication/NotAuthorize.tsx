import React from 'react'
import AlertCard from '../../components/AlertCard'

export default function NotAuthorize() {
    return (
        <div>
            <AlertCard
                title={'You are Not Authorize!'}
                message=" you need to contact admin in order to Access this page."
                buttons={[{ title: 'Go Home', url: '/', action: 'link', color: '' }]}
            />
        </div>
    )
}
