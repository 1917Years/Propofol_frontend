import axios from "axios";
import { React, useState, useEffect } from "react";
import { useNavigate, Navigate, useParams, useSearchParams } from "react-router-dom";
import profileImage from "../../assets/img/profile.jpg";
import { SERVER_URL } from "../../utils/SRC";
import { TeamScheduleModal } from "../../Component/Modal"
import ProjectSearchBar from "../../Component/ProjectSearchBar";
import { TagModal } from "../../Component/Modal";

function ProjectMyDetail() {
    const navigate = useNavigate();
    const [isTC, setIsTC] = useState(false);
    const [isTagChecked, setIsTagChecked] = useState([]);
    const [isTagFull, setIsTagFull] = useState(false);
    const [checkedTagList, setCheckedTagList] = useState([]);
    const [tmp, setTmp] = useState(false);
    const [projectDetail, setProjectDetail] = useState({ id: 0, timeTables: [] });
    //const [tagList, setTagList] = useState([]);
    let tagList = [];
    const id = useParams().id;
    //
    const [recommended, setRecommended] = useState([]);
    const [apply, setApply] = useState([]);
    const [participants, setParticipants] = useState([]);
    //
    const [showTeamScheduleModal, setShowTeamScheduleModal] = useState(false);
    //
    const [selectedTagList, setSelectedTagList] = useState([]);
    const [showTagMoadl, setShowTagModal] = useState(false);
    //
    const onTagButtonClickHandler = (e) => {
        if (e.target.value == "-1") return;
        if (checkedTagList.length >= 3 && isTagChecked[e.target.value] == false) {
            setIsTagFull(true);
            return;
        }
        let t = isTagChecked;
        e.target.checked = true;
        t[e.target.value] = !t[e.target.value];
        setIsTagChecked(t);
        let t_c = checkedTagList;
        if (isTagChecked[e.target.value] == true) {
            t_c.push(e.target.name);
            setCheckedTagList(t_c);
        } else if (isTagChecked[e.target.value] == false) {
            setCheckedTagList(t_c.filter((tagname) => tagname !== e.target.name));
            setIsTagFull(false);
        }
        console.log(checkedTagList);
        setTmp(!tmp);
    };
    const keyPressHandler = (e) => {
        if (e.key === "Enter") {
            navigate("/blog/search");
        }
    };
    function deleteProject() {
        axios.delete(SERVER_URL + "/matching-service/api/v1/matchings/" + id)
            .then((res) => {
                console.log(res);
                navigate("/pm/mylist");
            })
            .catch((err) => {
                console.log(err.response);
            })
    }
    async function loadRecommendedDev(page) {
        const params = new URLSearchParams();
        params.append('page', page);
        tagList.map((item) => {
            params.append('tagId', item.id);
        })
        params.append('tagId', '3');
        params.append('tagId', '2');
        console.log(params.getAll('tagId'));
        await axios.get(SERVER_URL + "/user-service/api/v1/members/matchings",
            { params: params }
        )
            .then((res) => {
                console.log(res);
                setRecommended(res.data.data.data);
            })
            .catch((err) => {
                console.log(err.response);
            })
    }

    function loadApplyDev(page) {
        axios.get(SERVER_URL + "/matching-service/api/v1/members/" + id + "/waitingList",
            {
                params: { page: page }
            }
        )
            .then((res) => {
                console.log(res);
                setApply(res.data.data.data);
            })
            .catch((err) => {
                console.log(err.response);
            })
    }

    function loadParticipants(page) {
        axios.get(SERVER_URL + "/matching-service/api/v1/members/" + id + "/membersList",
            {
                params: { page: page }
            }
        )
            .then((res) => {
                console.log(res.data.data.data);
                setParticipants(res.data.data.data);
            })
            .catch((err) => {
                console.log(err.response);
            })
    }

    function loadProjectMyDetail() {
        axios.get(SERVER_URL + "/matching-service/api/v1/matchings/" + id)
            .then((res) => {
                console.log(res);
                res.data.data.tagInfos.map((item) => {
                    tagList.push(item);
                })
                setProjectDetail(res.data.data);
                loadRecommendedDev(1);
                loadApplyDev(1);
                loadParticipants(1);
            })
            .catch((err) => {
                console.log(err.response);
            })
    }

    useEffect(() => {
        loadProjectMyDetail();
        let t = [];
        for (let i = 0; i < tagList.length; i++) {
            t.push(false);
        }
        console.log(t);
        setIsTagChecked(t);
        console.log(isTagChecked);
    }, []);
    return (
        <div class="bg-white w-full font-test">
            {showTagMoadl ?
                (<TagModal
                    setShowTagModal={setShowTagModal}
                    selectedTagList={selectedTagList}
                    setSelectedTagList={setSelectedTagList}
                />)
                :
                (null)}
            <div class="relative w-[60rem] inset-x-1/2 transform -translate-x-1/2">
                <div class="relative my-10">
                    <ProjectSearchBar
                        setShowTagModal={setShowTagModal}
                        selectedTagList={selectedTagList}
                    />
                    <div class="mt-6 px-4 border rounded-lg border-gray-300">
                        <div class="flex mt-4 gap-4">
                            <div class="text-2xl font-btest w-fit">
                                개발자 도움 웹 서비스를 함께 만들어나갈 팀원을 구합니다.
                            </div>
                        </div>
                        <div class="mt-4 mx-auto h-0.25 bg-gray-300"></div>
                        <div class="mt-2 w-full flex justify-end gap-4">
                            <button
                                onClick={() => navigate("/pm/myteamschedule/" + id)}
                            >
                                시간표 수정{">"}
                            </button>
                            <button
                                onClick={() => navigate("/pm/writing?No=" + id)}
                            >
                                프로젝트 수정 {">"}
                            </button>
                            <button
                                onClick={() => { deleteProject() }}
                            >프로젝트 삭제 {">"} </button>
                        </div>
                        <div class="text-xl font-btest mb-4">현재 참여 중인 팀원들</div>
                        {participants.map((item) => {
                            return (
                                <div class="px-4 py-4 flex mt-2 border rounded-lg h-40">
                                    <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                        <img
                                            src={profileImage}
                                            class="w-28 h-28 rounded-full drop-shadow-lg"
                                            alt="profile"
                                        />
                                    </div>
                                    <div class="ml-4 my-auto flex flex-col items-start">
                                        <div class="text-2xl font-btest">{item.nickname}</div>
                                        <button class="mt-1 font-test text-sm">⏱ 시간표 확인하기 {">"}</button>
                                        <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>

                                    </div>
                                    <div class="ml-auto text-right text-sm self-center">
                                        <div class="">
                                            <div class="text-gray-500 text-lg text-left border-b mb-2">기술</div>
                                            <div class="text-black grid grid-cols-3 gap-2">
                                                {item.tagInfos.map((tag) => {
                                                    return (
                                                        <div class="bg-indigo-100 text-center p-1">
                                                            {tag.name}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                        <div class="text-xl font-btest mb-4">지원님, 이런 인재들은 어떠신가요?</div>
                        {recommended.map((item) => {
                            return (
                                <div class="px-4 py-4 flex mt-2 border rounded-lg h-40">
                                    <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                        <img
                                            src={profileImage}
                                            class="w-28 h-28 rounded-full drop-shadow-lg"
                                            alt="profile"
                                        />
                                    </div>
                                    <div class="ml-4 my-auto flex flex-col items-start">
                                        <div class="text-2xl font-btest">{item.nickname}</div>
                                        <button class="mt-1 font-test text-sm">⏱ 시간표 확인하기 {">"}</button>
                                        <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>

                                    </div>
                                    <div class="ml-auto text-right text-sm self-center">
                                        <div class="">
                                            <div class="text-gray-500 text-lg text-left border-b mb-2">기술</div>
                                            <div class="text-black grid grid-cols-3 gap-2">
                                                {item.tagData.map((tag) => {
                                                    return (
                                                        <div class="bg-indigo-100 text-center p-1">
                                                            {tag.name}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                        <div class="px-4 py-4 flex mt-2 border rounded-lg">
                            <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                <img
                                    src={profileImage}
                                    class="w-28 h-28 rounded-full drop-shadow-lg"
                                    alt="profile"
                                />
                            </div>
                            <div class="ml-4 my-auto ">
                                <div class="text-2xl font-btest">신유진</div>
                                <div class="tont-ltest pt-1 text-sm">UI/UX Designer</div>
                                <div class="mt-2 text-sm font-test text-black">💬 안녕하세요, 프론트 디자이너입니다. </div>
                                <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>
                            </div>
                            <div class="ml-auto text-right text-sm">
                                <div class="text-bluepurple text-base">기술</div>
                                <div class=" ml-3 text-black">React, Javascript</div>
                                <div class="text-bluepurple text-base mt-1">가능 시간</div>
                                <div>월요일 화요일 15:00~16:30</div>
                                <div>수요일 목요일 16:00~18:30</div>
                                <div>금요일 토요일 일요일 18:00~16:30</div>
                            </div>
                        </div>
                        <div class="px-4 py-4 flex mt-2 mb-4 border rounded-lg">
                            <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                <img
                                    src={profileImage}
                                    class="w-28 h-28 rounded-full drop-shadow-lg"
                                    alt="profile"
                                />
                            </div>
                            <div class="ml-4 my-auto ">
                                <div class="text-2xl font-btest">최영찬</div>
                                <div class="tont-ltest pt-1 text-sm">Backend Developer</div>
                                <div class="mt-2 text-sm font-test text-black">💬 안녕하세요, 백엔드 디자이너입니다.</div>
                                <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>
                            </div>
                            <div class="ml-auto text-right text-sm">
                                <div class="text-bluepurple text-base">기술</div>
                                <div class="ml-3 text-black">Spring, Java</div>

                                <div class="text-bluepurple text-base mt-1">가능 시간</div>
                                <div>월요일 화요일 12:00~16:30</div>
                                <div>목요일 13:00~18:30</div>
                                <div>일요일 19:00~16:30</div>
                            </div>
                        </div>

                        <div class="text-xl font-btest mt-10 mb-4">📢 본 프로젝트에 지원한 팀원들이에요. 어서 확인해보세요! </div>
                        {apply.map((item) => {
                            return (
                                <div class="px-4 py-4 flex mt-2 border rounded-lg h-40">
                                    <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                        <img
                                            src={profileImage}
                                            class="w-28 h-28 rounded-full drop-shadow-lg"
                                            alt="profile"
                                        />
                                    </div>
                                    <div class="ml-4 my-auto flex flex-col items-start">
                                        <div class="text-2xl font-btest">{item.nickname}</div>
                                        <button class="mt-1 font-test text-sm">⏱ 시간표 확인하기 {">"}</button>
                                        <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>
                                    </div>
                                    <div class="ml-auto text-right text-sm self-center">
                                        <div class="">
                                            <div class="text-gray-500 text-lg text-left border-b mb-2">기술</div>
                                            <div class="text-black grid grid-cols-3 gap-2">
                                                {item.tagInfos.map((tag) => {
                                                    return (
                                                        <div class="bg-indigo-100 text-center p-1">
                                                            {tag.name}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <button
                                            class="basis-1/2 px-4 py-2 rounded-lg bg-gray-500 text-white"
                                            onClick={() => {
                                                axios.post(SERVER_URL + "/matching-service/api/v1/members/" + id + "/" + item.id + "/approve")
                                                    .then((res) => {
                                                        console.log(res);
                                                    })
                                                    .catch((err) => {
                                                        console.log(err.response);
                                                    })
                                            }}
                                        >수락</button>
                                        <button
                                            class="basis-1/2 px-4 py-2 rounded-lg bg-gray-500 text-white"
                                            onClick={() => {
                                                axios.post(SERVER_URL + "/matching-service/api/v1/members/" + id + "/" + item.id + "/reject")
                                                    .then((res) => {
                                                        console.log(res);
                                                    })
                                                    .catch((err) => {
                                                        console.log(err.response);
                                                    })
                                            }}
                                        >거절
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        <div class="flex gap-3">
                            <div class="px-4 py-4 flex mt-2 border rounded-lg w-5/6">
                                <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                    <img
                                        src={profileImage}
                                        class="w-28 h-28 rounded-full drop-shadow-lg"
                                        alt="profile"
                                    />
                                </div>
                                <div class="ml-4 my-auto ">
                                    <div class="text-2xl font-btest">신유진</div>
                                    <div class="tont-ltest pt-1 text-sm">UI/UX Designer</div>
                                    <div class="mt-2 text-sm font-test text-black">💬 안녕하세요, 저를 뽑아주세요. 잠수는 절대 안 탑니다. </div>
                                    <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>
                                </div>
                                <div class="ml-auto text-right text-sm">
                                    <div class="text-bluepurple text-base">기술</div>
                                    <div class=" ml-3 text-black">React, Javascript</div>
                                    <div class="text-bluepurple text-base mt-1">가능 시간</div>
                                    <div>월요일 화요일 15:00~16:30</div>
                                    <div>수요일 목요일 16:00~18:30</div>
                                    <div>금요일 토요일 일요일 18:00~16:30</div>
                                </div>
                            </div>
                            <div class="grow flex flex-col gap-4 mt-2 justify-center mb-4">
                                <button class="basis-1/2 px-4 py-2 rounded-lg bg-gray-500 text-white">수락</button>
                                <button class="basis-1/2 px-4 py-2 rounded-lg bg-gray-500 text-white">거절</button>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <div class="px-4 py-4 flex mt-2 mb-4 border rounded-lg w-5/6">
                                <div className="ProfileImage" class="my-auto mx-4 w-28 h-28 rounded-full">
                                    <img
                                        src={profileImage}
                                        class="w-28 h-28 rounded-full drop-shadow-lg"
                                        alt="profile"
                                    />
                                </div>
                                <div class="ml-4 my-auto ">
                                    <div class="text-2xl font-btest">최영찬</div>
                                    <div class="tont-ltest pt-1 text-sm">Backend Developer</div>
                                    <div class="mt-2 text-sm font-test text-black">💬 안녕하세요, "혁준"하지 않겠습니다. </div>
                                    <button class="mt-1 font-test text-sm">📄 포트폴리오 확인하기 {">"}</button>
                                </div>
                                <div class="ml-auto text-right text-sm">
                                    <div class="text-bluepurple text-base">기술</div>
                                    <div class="ml-3 text-black">Spring, Java</div>

                                    <div class="text-bluepurple text-base mt-1">가능 시간</div>
                                    <div>월요일 화요일 12:00~16:30</div>
                                    <div>목요일 13:00~18:30</div>
                                    <div>일요일 19:00~16:30</div>
                                </div>
                            </div>
                            <div class="grow flex flex-col gap-4 mt-2 justify-center mb-4">
                                <button class="basis-1/2 px-4 py-2 rounded-lg bg-gray-500 text-white">수락</button>
                                <button class="basis-1/2 px-4 py-2 rounded-lg bg-gray-500 text-white">거절</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default ProjectMyDetail;
