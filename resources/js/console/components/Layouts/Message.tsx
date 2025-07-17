import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { setLeadAlert } from '../../store/themeConfigSlice';
export default function Message({ payload }: any) {
    const dispatch = useDispatch();
    console.log(payload.data)
    // setLeadAlert
    useEffect(() => {

        if (payload && payload.data) handleMessageData(payload.data)
    }, [payload])

    const handleMessageData = (data: any) => {

        if (data.action == "lead-alert") {
            dispatch(setLeadAlert(data.value))
        }
    }
    return (
        <>
            <div id="notificationHeader">
                {/* image is optional */}
                {payload?.notification?.image && (
                    <div id="imageContainer">
                        <img src={payload.notification.image} width={100} />
                    </div>
                )}
                <span>{payload.notification.title}</span>
            </div>
            <div id="notificationBody">{payload.notification.body}</div>
        </>
    )
}

