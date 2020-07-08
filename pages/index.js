import Link from 'next/link'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, ListGroup, ListGroupItem, Button } from 'reactstrap';
import IconPersonFill from '../components/icons/IconPersonFill';
import Recorder from '../components/recorder'
import { AuthServie, request } from '../lib/APIServices';
import Swal from 'sweetalert2';
import { snakeCase } from 'change-case'

export default function Home() {
    const [checkAuth, setCheckAuth] = useState(false)
    const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
    const teamMembers = JSON.parse(localStorage.getItem('team-members') || '[]')
    const router = useRouter()
    const [records, setRecords] = useState(teamMembers.map(i => null))

    const onRecordingComplete = (blob, inx) => {
        records[inx] = blob
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
        if (records.filter(f => !f).length) {
            Swal.fire('Sorry!', 'All audio recorders are required.', 'error')
            return
        }
        const formData = new FormData();
        records.map((record, inx) => {
            const audioFile = new File([record], `${snakeCase(userDetails.name)}-${snakeCase(teamMembers[inx].name)}.mp3`, {
                type: record.type
            })
            formData.append('audios[]', audioFile)
        })
        // formData.append('team', )
        request.post('/test/' + userDetails.team, formData, {
            onUploadProgress: progressEvent => console.log(progressEvent.loaded)
        }).then(res => {
            console.log(res)
        })
    }

    return (
        <section className="py-5 my-5">
            <Container>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <p><b>Note: </b> Hold mic icon and record</p>
                        <Card body className="mb-3">
                            <ListGroup flush>
                                {teamMembers.map((item, inx) => {
                                    return (
                                        <ListGroupItem className="d-flex align-items-center justify-content-between" key={inx}>
                                            <div className="d-flex align-items-center">
                                                <IconPersonFill className="mr-2" />
                                                {item.name}
                                            </div>
                                            <div className="d-flex align-items-center" >
                                                {records[inx] && (
                                                    <audio
                                                        src={URL.createObjectURL(records[inx])}
                                                        controls
                                                        preload="metadata"
                                                    />
                                                )}
                                                <Recorder
                                                    onRecordingComplete={blob => onRecordingComplete(blob, inx)}
                                                    onRecordingError={onRecordingError}
                                                />
                                            </div>
                                        </ListGroupItem>
                                    )
                                })}
                            </ListGroup>
                        </Card>
                        <div className="text-center">
                            <Button color="primary" size="lg" className="px-5" onClick={onSubmit}>Submit</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}
