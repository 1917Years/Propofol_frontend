import React, { useEffect, useState } from "react";
import { useUpdateEffect } from 'react-use';
import { SERVER_URL, server_URL } from "./SRC";
import {
    getRefreshToken,
    getAccessToken,
} from "./auth";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

function See() {
    const [listening, setListening] = useState(false);
    const [data, setData] = useState([]);
    const [value, setValue] = useState(null);

    const [notice, setNotice] = useState([]); // 타입, 세부타입?, 내용

    const [showNotice, setShowNotice] = useState(false);

    const [meventSource, msetEventSource] = useState(undefined);

    const navigate = useNavigate();

    let eventSource = undefined;

    useEffect(() => {
        console.log("listening", listening);
        if (getAccessToken() != "no access_token") {
            if (!listening) {
                console.log(getAccessToken());
                eventSource = new EventSource(server_URL + "/api/v1/subscribe/" + getAccessToken()); //구독
                //msetEventSource(new EventSource("http://localhost:8088/sse"));
                if (eventSource != undefined) {
                    msetEventSource(eventSource);
                    //Custom listener
                    // eventSource.addEventListener("Progress", (event) => {
                    //   const result = JSON.parse(event.data);
                    //   console.log("received:", result);
                    //   setData(result)
                    // });
                    console.log("eventSource", eventSource);
                    eventSource.onopen = event => {
                        console.log("connection opened");
                    };
                    eventSource.onmessage = event => {
                        const result = JSON.parse(event.data);
                        console.log("result", event.data);
                        setData(old => [...old, result]);
                        setValue(result);
                    };
                    eventSource.onerror = event => {
                        console.log(event.target.readyState);
                        if (event.target.readyState === EventSource.CLOSED) {
                            console.log("eventsource closed (" + event.target.readyState + ")");
                        }
                        eventSource.close();
                    };
                    loadNotice(1);
                    setListening(true);
                }
                return () => {
                    eventSource.close();
                    console.log("eventsource closed");
                };
            }
        }
    }, []);

    useUpdateEffect(() => {
        console.log("data: ", data);
    }, [data]);

    const checkData = () => {
        data.slice(1).map((mes) => {
            console.log("mes: ", mes.message)
        })
        console.log(data);
    };

    function deleteNoticeAll() {

    }

    function loadNotice(page) {
        axios.get(SERVER_URL + "/alarm-service/api/v1/alarms/",
            {
                params: { page: page }
            })
            .then((res) => {
                console.log(res);
                setData(res.data.data);
            })
            .catch((err) => {
                console.log(err.response);
            });
    }

    function deleteNotice(noticeId) {
        console.log(noticeId);
        axios.delete(SERVER_URL + "/alarm-service/api/v1/alarms/" + noticeId,
            {
                params: { page: 1 }
            })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err.response);
            });
    }

    function Notice(data) {
        const [message, setMessage] = useState([]);
        useEffect(() => {
            setMessage(data);
        }, [])
        try {
            console.log(message.date);
            {
                message.date.map((mes) => {
                    if (mes.type == "APPLY") {
                        return (
                            <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-1">
                                <button
                                    class="flex gap-2 items-center"
                                    onClick={() => { navigate('/pm/myproject/' + 1); }}
                                >
                                    <div class=" text-xs">
                                        📣
                                    </div>
                                    <div> {mes.message}</div>
                                </button>
                                <div class="text-gray-400">2022.05.27</div>
                            </div>
                        )
                    }
                })
            }
        }
        catch (err) {
            console.log(err);
            return (
                <div class="text-red-500">
                    알림을 받아오는 과정에서 에러가 발생했습니다.
                </div>
            )
        }
    }

    return (
        <div>
            <button
                class=""
                onClick={() => {
                    checkData();
                    setShowNotice(true);
                }}
            >
                {data.slice(1).length > 0 ?
                    (<div class="absolute w-1 h-1 rounded-full bg-red-500"></div>)
                    :
                    (null)
                }
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path
                        fill="white"
                        d="M15 21c0 1.598-1.392 3-2.971 3s-3.029-1.402-3.029-3h6zm.137-17.055c-.644-.374-1.042-1.07-1.041-1.82v-.003c.001-1.172-.938-2.122-2.096-2.122s-2.097.95-2.097 2.122v.003c.001.751-.396 1.446-1.041 1.82-4.668 2.709-1.985 11.715-6.862 13.306v1.749h20v-1.749c-4.877-1.591-2.193-10.598-6.863-13.306zm-3.137-2.945c.552 0 1 .449 1 1 0 .552-.448 1-1 1s-1-.448-1-1c0-.551.448-1 1-1zm-6.451 16c1.189-1.667 1.605-3.891 1.964-5.815.447-2.39.869-4.648 2.354-5.509 1.38-.801 2.956-.76 4.267 0 1.485.861 1.907 3.119 2.354 5.509.359 1.924.775 4.148 1.964 5.815h-12.903z" />
                </svg>
            </button>
            {showNotice ?
                (<div
                    class="shadow-lg absolute text-sm flex flex-col w-fit min-w-[24rem] min-h-[6rem] justify-center h-fit px-4 py-2 bg-white text-black rounded-lg transform -translate-x-[90%]"
                    onMouseEnter={() => {
                        console.log("ㅎㅇ");
                    }}
                    onMouseLeave={() => {
                        console.log("ㅂㅇ");
                        setShowNotice(false);
                    }}
                >
                    <Notice
                        date={data}
                    />
                    {data.slice(1).length > 0 ?
                        (<div>
                            <button
                                class="bg-white text-gray-600 border border-gray-300 rounded-lg py-1 px-2 w-full"
                                onClick={() => {

                                }}
                            >
                                전부 삭제하기
                            </button>
                        </div>)
                        :
                        (
                            <div class="text-gray-600">
                                아직 아무런 알림도 오지 않았어요!
                            </div>
                        )
                    }
                    {data.slice(1).map((mes) => {
                        let imoji = "";
                        //let mes = JSON.parse(item);
                        if (mes.type == "APPLY") { imoji = "📣"; }
                        else if (mes.type == "OUT") { imoji = "😥"; }
                        else if (mes.type == "APPROVE") { imoji = "😊"; }
                        else if (mes.type == "REJECT") { imoji = "😅"; }
                        else if (mes.type == "COMMENT") { imoji = "💬"; }
                        else if (mes.type == "COMMENTSUBSCRIBER_BOARD") { imoji = "📣"; }
                        else if (mes.type == "LIKE") { imoji = "💗"; }
                        else if (mes.type == "SUBSCRIBE") { imoji = "👍"; }

                        return (
                            <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                <button
                                    class="flex gap-2 items-center"
                                    onClick={() => {
                                        if (mes.type == "APPLY") {
                                            navigate('/pm/myproject/' + mes.boardId);
                                        }
                                        else if (mes.type == "OUT") {
                                            navigate('/pm/myproject/' + mes.boardId);
                                        }
                                        else if (mes.type == "APPROVE") {
                                            navigate('/pm/detail/' + mes.boardId);
                                        }
                                        else if (mes.type == "REJECT") {
                                            navigate('/pm/detail/' + mes.boardId);
                                        }
                                        else if (mes.type == "COMMENT") {
                                            navigate('/blog/detail/' + mes.boardId);
                                        }
                                        else if (mes.type == "COMMENTSUBSCRIBER_BOARD") {
                                            navigate('/blog/detail/' + mes.boardId);
                                        }
                                        else if (mes.type == "LIKE") {
                                            navigate('/blog/detail/' + mes.boardId);
                                        }
                                        else if (mes.type == "SUBSCRIBE") {

                                        }
                                    }}
                                >
                                    <div class=" text-xs">
                                        {imoji}
                                    </div>
                                    <div> {mes.message}</div>
                                </button>
                                <div class="flex gap-2">
                                    <div class="text-gray-400">{mes.createdDateTime.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(mes.id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        )
                        if (JSON.parse(mes).type == "APPLY") { //누가 플젝에 신청함
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/pm/myproject/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            📣
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "OUT") { //회원이 탈퇴함
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/pm/myproject/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            😥
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "APPROVE") { //신청 승인됨
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/pm/detail/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            😊
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "REJECT") { //신청 거절당함
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/pm/detail/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            😅
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "COMMENT") { //댓글 달림
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/blog/detail/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            💬
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "COMMENTSUBSCRIBER_BOARD") { //구독중인 사람이 글 씀
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/blog/detail/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            📣
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "LIKE") { //좋아요
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                        onClick={() => { navigate('/blog/detail/' + JSON.parse(mes).boardId); }}
                                    >
                                        <div class=" text-xs">
                                            💗
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                        if (JSON.parse(mes).type == "SUBSCRIBE") { //구독
                            return (
                                <div class="flex items-center justify-between border-b border-gray-300 py-1 px-2 gap-2">
                                    <button
                                        class="flex gap-2 items-center"
                                    >
                                        <div class=" text-xs">
                                            👍
                                        </div>
                                        <div> {JSON.parse(mes).message}</div>
                                    </button>
                                    <div class="text-gray-400">{JSON.parse(mes).createdDate.split("T")[0]}</div>
                                    <button
                                        class="text-black"
                                        onClick={() => {
                                            deleteNotice(JSON.parse(mes).id);
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            )
                        }
                    })}
                </div>)
                :
                (null)}

        </div>
    );
}

export default See;