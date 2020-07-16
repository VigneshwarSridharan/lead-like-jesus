import Link from 'next/link'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, ListGroup, ListGroupItem, Button, Alert } from 'reactstrap';
import IconPersonFill from '../components/icons/IconPersonFill';
import Recorder from '../components/recorder'
import { AuthServie, request } from '../lib/APIServices';
import Swal from 'sweetalert2';
import { snakeCase } from 'change-case'

export default function Home() {
    const [checkAuth, setCheckAuth] = useState(false)
    const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
    const teamMembersData = JSON.parse(localStorage.getItem('team-members') || '[]')
    let [teamMembers, setTeamMembers] = useState(teamMembersData)
    const [recordType, setRecordType] = useState('');
    const router = useRouter()
    const [records, setRecords] = useState(teamMembers.map(i => ({ generic: null, scripture: null })))

    const onRecordingComplete = (blob, inx) => {
        console.timeEnd('record-' + inx)
        records[inx][recordType] = blob
        setRecords([...records])
        console.log(blob);
    }
    const onRecordingError = (err, inx) => {
        console.log({ err, inx })
    }
    useEffect(() => {
        if (!userDetails.id) {
            router.push('/login')
        }
        else {
            setCheckAuth(true);
        }
    }, [userDetails]);

    if (!checkAuth) {
        return (
            <div>Please Wait</div>
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

    return (
        <section className="py-5 my-5">
            <Container>
                <Row>
                    <Col xl={{ size: 8, offset: 2 }}>
                        <h6 className="mb-3"> Hi, {userDetails.name} you are in <b className="">{userDetails.team}</b>, and they are your team members.</h6>
                        <div className="record-type">

                            {['generic', 'scripture'].map((item, inx) => {
                                return (
                                    <div className={`item ${recordType === item ? 'active' : ''}`} onClick={() => setRecordType(item)} key={inx}>
                                        <div className="icon"><i className="fas fa-microphone"></i></div>
                                        <div >{item}</div>
                                    </div>
                                )
                            })}
                        </div>
                        {
                            recordType != '' && (
                                <div>

                                    {
                                        false && (
                                            <Alert color="success">
                                                <h4 className="alert-heading">Well done {userDetails.name}!</h4>
                                                <p>Thanks for submiting your audio, Please close the tab </p>
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
                                                            {url && (
                                                                <audio
                                                                    src={url}
                                                                    controls
                                                                    preload="metadata"
                                                                />
                                                            )}
                                                            {
                                                                !item[recordType] && (
                                                                    <Recorder
                                                                        onRecordingStart={() => console.time('record-' + inx)}
                                                                        onRecordingComplete={blob => onRecordingComplete(blob, inx)}
                                                                        onRecordingError={onRecordingError}
                                                                    />
                                                                )
                                                            }
                                                        </div>
                                                    </ListGroupItem>
                                                )
                                            })}
                                        </ListGroup>
                                    </Card>
                                    <div className="text-center">
                                        <Button color="primary" size="lg" className="px-5" onClick={onSubmit}>Submit</Button>
                                    </div>
                                </div>
                            )
                        }

                    </Col>
                </Row>
            </Container>
        </section>
    )
}
