import React from 'react'
import Alert from './Alert'

function RiskProfile({ data }) {


    return (

        <Alert title={data.title} message={data.message} buttonLabel={data.linkLabel} action={data.action} link={data.link} />
    )
}


export default RiskProfile