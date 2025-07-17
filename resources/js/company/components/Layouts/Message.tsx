import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLeadAlert } from '../../store/themeConfigSlice';

export default function Message({ payload }: { payload: any }) {
    const [callbackAudio] = useState(() => new Audio('/callback.wav'));
    const dispatch = useDispatch();

    useEffect(() => {
        if (payload && payload.data) {
            handleMessageData(payload.data);
            callbackAudio.play();
        }
    }, [payload, callbackAudio]);

    const handleMessageData = (data: any) => {
        if (data.action === "lead-alert") {
            dispatch(setLeadAlert(data.value));
        }
    };

    return (
        <div id="notification">
            <div id="notificationHeader">
                {payload?.notification?.image && (
                    <div id="imageContainer">
                        <img src={payload.notification.image} alt="Notification" width={100} />
                    </div>
                )}
                <span>{payload.notification.title}</span>
            </div>
            <div id="notificationBody">{payload.notification.body}</div>
        </div>
    );
}