import Link from 'next/link'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, ListGroup, ListGroupItem, Button, Alert, ModalHeader, ModalBody, Modal, Table } from 'reactstrap';
import IconPersonFill from '../components/icons/IconPersonFill';
import Recorder from '../components/recorder'
import { AuthServie, EventServices, request } from '../lib/APIServices';
import Swal from 'sweetalert2';
import { snakeCase } from 'change-case'
import Timer from '../components/Timer';
import { API_URL } from '../lib/constants';
import Axios from 'axios';

const Home = props => {
    const [checkAuth, setCheckAuth] = useState(false)
    const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
    let [teamMembers, setTeamMembers] = useState([])
    let [teamMembersTable, setTeamMembersTable] = useState([])
    const [recordType, setRecordType] = useState(props.recordType.length == 1 ? props.recordType[0] : '');
    const router = useRouter()
    const [records, setRecords] = useState([])
    const [activeRecord, setActiveRecord] = useState(null)
    const [permisstion, setPermisstion] = useState(true)
    const [isLoading, setIsLoading] = useState(true);
    const [activeEvent, setActiveEvent] = useState({});
    const userId = localStorage.getItem('user-id') || '';

    const [payer, setPlayer] = useState({
        isOpen: false,
        base: "",
        list: []
    })

    const togglePayer = (isOpen = false, base = "", list = []) => setPlayer({ isOpen, base, list })

    const deleteAudios = (type, person) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Are you sure to delete all ${type} audios of ${person.name}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.value) {
                EventServices.deleteUserAudios({
                    type,
                    person,
                    id: activeEvent.value
                }).then(res => {
                    console.log(res)
                    Swal.fire(
                        'Success!',
                        'Deleted Successfully',
                        'success'
                    )
                    let inx = teamMembersTable.findIndex(f => f.id === person.id)
                    teamMembersTable[inx]['submitted'] = teamMembersTable[inx]['submitted'].filter(f => f != type)
                    setTeamMembersTable([...teamMembersTable])
                    if(person.id == userDetails.id) {
                        window.location.reload();
                    }

                }).catch(err => {
                    console.log(err)
                    Swal.fire(
                        'Sorry!',
                        'Faild to Delete',
                        'error'
                    )
                })
            }
        })
    }

    useEffect(() => {
        if (userDetails.id) {
            AuthServie.login(userDetails.id).then(res => {
                if (res.status == "success") {
                    setTeamMembers(res.data.teamMembers)
                    setTeamMembersTable(res.data.teamMembersTable)
                    setActiveEvent(res.data.activeEvent)
                    setRecords(res.data.teamMembers.map(i => ({ appreciation: null, scripture: null })))
                    setIsLoading(false)
                }
                else {
                    Swal.fire(
                        "Sorry!",
                        res.message,
                        "error"
                    )
                    setIsLoading(false)
                }
            })
        }
    }, [])

    const onRecordingStart = (inx) => {
        setActiveRecord(inx)
    }

    const onRecordingComplete = (blob, inx) => {
        setActiveRecord(null)
        console.timeEnd('record-' + inx)
        records[inx][recordType] = blob
        setRecords([...records])
        console.log(blob);
    }
    const onRecordingError = (err, inx) => {
        console.log({ err, inx })
    }

    const removeAudio = inx => {
        records[inx][recordType] = null
        setRecords([...records]);
    }

    useEffect(() => {
        if (!userDetails.id) {
            router.push('/login')
        }
        else {
            setCheckAuth(true);
        }
    }, [userDetails]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                console.log('You let me use your mic!')
            })
            .catch(function (err) {
                setPermisstion(false)
            });
    }, [])

    if (!checkAuth) {
        return (
            <div>Please Wait</div>
        )
    }

    if (isLoading) {
        return (
            <section className="py-5 my-5">
                <Container>
                    <Card body className="text-center">
                        <h3><i className="fas fa-circle-notch fa-spin text-primary"></i></h3> Please Wait
                    </Card>
                </Container>
            </section>
        )
    }

    const onSubmit = () => {
        if (records.filter(f => !f[recordType]).length) {
            Swal.fire('Sorry!', 'All ' + recordType + ' audio recorders are required.', 'error')
            return
        }
        const formData = new FormData();
        records.map((record, inx) => {
            const audioFile = new File([record[recordType]], `${snakeCase(userDetails.name)}-${snakeCase(teamMembers[inx].name)}.mp3`, {
                type: record[recordType].type
            })
            formData.append('audios[]', audioFile)
        })
        // formData.append('team', )
        request.post(`/submit/${userDetails.team}/${snakeCase(userDetails.name)}/${recordType}`, formData, {
            onUploadProgress: progressEvent => console.log(progressEvent.loaded)
        }).then(res => {
            console.log(res)
            teamMembers = teamMembers.map((item, inx) => {
                let { destination, originalname } = res.files[inx];
                destination = destination.replace('./public', '');
                return ({
                    ...item,
                    [recordType]: `${destination}/${originalname}`
                })
            })
            setTeamMembers([...teamMembers])
            window.localStorage.setItem('team-members', JSON.stringify(teamMembers))
            Swal.fire(
                'Success!',
                'Upload Successfully',
                'success'
            )
        }).catch(err => {
            Swal.fire(
                'Sorry!',
                'Upload Faild',
                'error'
            )
        })
    }

    let isSubmitted = { appreciation: false, scripture: false }
    let [firstMembers = {}] = teamMembers
    if (firstMembers.appreciation) {
        isSubmitted['appreciation'] = true
    }
    if (firstMembers.scripture) {
        isSubmitted['scripture'] = true
    }



    if (!permisstion) {
        return (
            <section className="py-5 my-5">
                <Container>
                    <Card body className="text-center bg-danger border-danger text-white">
                        <i className="fas fa-microphone"></i> Please give microphone access to record the voice
                    </Card>
                </Container>
            </section>
        )
    }

    return (
        <section className="py-5 my-5">
            <Container>
                <Row>
                    <Col xl={userDetails.observer ? { size: 10, offset: 1 } : { size: 8, offset: 2 }}>
                        <h6 className="mb-3"> Hi, {userDetails.name} you are in <b className="">{userDetails.team}</b>, and they are your team members.</h6>
                        <div className="record-type">

                            {[...props.recordType, 'members'].map((item, inx) => {
                                if (!userDetails.observer && item == 'members') return
                                return (
                                    <div className={`item ${recordType === item ? 'active' : ''}`} onClick={() => setRecordType(item)} key={inx}>
                                        <div className="icon"><i className={`fas ${item == 'members' ? 'fa-users' : 'fa-microphone'}`}></i></div>
                                        <div >{item} {item == 'members' && <span className="badge badge-primary">New</span>} </div>
                                    </div>
                                )
                            })}
                        </div>

                        {
                            recordType == 'members' && (
                                <Card body>
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>S.no</th>
                                                <th>Name</th>
                                                <th>Id (Email \ Phone Number)</th>
                                                <th >Team</th>
                                                <th>Appreciation</th>
                                                <th>Scripture</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                teamMembersTable.map((item, inx) => {
                                                    return (
                                                        <tr key={inx}>
                                                            <td>{inx + 1}</td>
                                                            <td>{item.name} {item.observer && '(Observer)'}</td>
                                                            <td>{item.id}</td>
                                                            <td>{item.team}</td>
                                                            <td>
                                                                <div className="d-inline mx-2">
                                                                    {item.submitted.includes('appreciation') ? <i className="fas fa-check text-success"></i> : <i className="fas fa-times text-danger"></i>}
                                                                </div>
                                                                <div className="d-inline mx-2">
                                                                    {item.submitted.includes('appreciation') ? <Button color={'info'} size={'sm'} onClick={() => togglePayer(true, item.base + '/appreciation', item.appreciationList)}><i className="fas fa-play"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline mx-2">
                                                                    {item.submitted.includes('appreciation') ? <Button color={'danger'} size={'sm'} onClick={() => deleteAudios('appreciation', item, inx)}><i className="far fa-trash-alt"></i></Button> : ''}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-inline mx-2">
                                                                    {item.submitted.includes('scripture') ? <i className="fas fa-check text-success"></i> : <i className="fas fa-times text-danger"></i>}
                                                                </div>
                                                                <div className="d-inline mx-2">
                                                                    {item.submitted.includes('scripture') ? <Button color={'info'} size={'sm'} onClick={() => togglePayer(true, item.base + '/scripture', item.scriptureList)}><i className="fas fa-play"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline mx-2">
                                                                    {item.submitted.includes('scripture') ? <Button color={'danger'} size={'sm'} onClick={() => deleteAudios('scripture', item, inx)}><i className="far fa-trash-alt"></i></Button> : ''}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </Card>
                            )
                        }

                        {
                            props.recordType.includes(recordType) ? (
                                <div>

                                    {
                                        isSubmitted[recordType] && (
                                            <Alert color="success">
                                                <h4 className="alert-heading">Well done {userDetails.name}!</h4>
                                                <p>Thanks for submiting your audio of {recordType}, Please close the tab </p>
                                            </Alert>
                                        )
                                    }

                                    <Card body className="mb-3">
                                        <ListGroup flush>
                                            {teamMembers.map((item, inx) => {
                                                let url = null;
                                                if (item[recordType]) {
                                                    url = item[recordType]
                                                }
                                                else if (records[inx][recordType]) {
                                                    url = URL.createObjectURL(records[inx][recordType]);
                                                }

                                                return (
                                                    <ListGroupItem className={`d-flex align-items-center justify-content-between flex-column flex-md-row`} key={inx}>
                                                        <div className="d-flex align-items-center">
                                                            <IconPersonFill className="mr-2" />
                                                            {item.name}
                                                        </div>
                                                        <div className="d-flex align-items-center" >
                                                            {
                                                                activeRecord === inx && (
                                                                    <div className="m-0 mr-3 h3 timer text-nowrap">
                                                                        <Timer />
                                                                    </div>
                                                                )
                                                            }
                                                            {url && (
                                                                <audio
                                                                    src={url}
                                                                    controls
                                                                    preload="metadata"
                                                                />
                                                            )}
                                                            {
                                                                (!url) ? (
                                                                    <div style={{ pointerEvents: activeRecord != null && activeRecord != inx ? "none" : "auto" }}>
                                                                        <Recorder
                                                                            onRecordingStart={() => onRecordingStart(inx)}
                                                                            onRecordingComplete={blob => onRecordingComplete(blob, inx)}
                                                                            onRecordingError={onRecordingError}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                        !item[recordType] ? (
                                                                            <i className="fas fa-times text-danger p-3 pointer" onClick={() => removeAudio(inx)} title="Delete"></i>
                                                                        ) : ''
                                                                    )
                                                            }
                                                        </div>
                                                    </ListGroupItem>
                                                )
                                            })}
                                        </ListGroup>
                                    </Card>
                                    {
                                        !isSubmitted[recordType] && (
                                            <div className="text-center">
                                                <Button color="primary" size="lg" className="px-5" onClick={onSubmit}>Submit</Button>
                                            </div>
                                        )
                                    }
                                </div>
                            ) : ''
                        }

                        {
                            recordType === '' && (
                                (
                                    <div className="text-center">
                                        <span className="text-danger">*</span>Choose the one option to proceed
                                    </div>
                                )
                            )
                        }

                    </Col>
                </Row>

            </Container>
            <Modal isOpen={payer.isOpen} size="lg" centered toggle={() => togglePayer(false)}>
                <ModalHeader toggle={() => togglePayer(false)}><i className="fas fa-volume-up mr-3"></i>Player</ModalHeader>
                <ModalBody className="p-0" style={{ height: 350 }}>
                    <iframe
                        style={{ width: "100%", height: 350, margin: 0, padding: 0, border: 0 }}
                        src={`/player?base=${window.location.origin}${payer.base}/&list=${payer.list.toString()}`}
                    // src="/player?base=https://blessedman.live/events/10041/record-source/Team-A/aadarsh/appreciation/&list=aadarsh-daisy.mp3,aadarsh-jaagruti.mp3,aadarsh-jones.mp3,aadarsh-nancy.mp3,aadarsh-saji.mp3,aadarsh-sherlyn.mp3,aadarsh-yesuratnam.mp3"
                    />
                </ModalBody>
            </Modal>
        </section>
    )
}

export async function getServerSideProps(context) {

    let response = await Axios.get(`${API_URL}/event/record-type`)
    response = response.data
    return {
        props: {
            recordType: response.data || {}
        }, // will be passed to the page component as props
    }
}

export default Home