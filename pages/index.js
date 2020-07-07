import Link from 'next/link'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, ListGroup, ListGroupItem } from 'reactstrap';
import IconPersonFill from './components/icons/IconPersonFill';
import Recorder from 'react-mp3-recorder'

export default function Home() {
    const [checkAuth, setCheckAuth] = useState(false)
    const userDetails = JSON.parse(localStorage.getItem('user-details') || '{}')
    const teamMembers = JSON.parse(localStorage.getItem('team-members') || '[]')
    const router = useRouter()
    const [records, setRecords] = useState(teamMembers.map(i => null))

    const onRecordingComplete = (blob, inx) => {
        records[inx] = blob
        setRecords([...records])
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
    return (
        <section className="py-5 my-5">
            <Container>
                <Row>
                    <Col sm={{ size: 8, offset: 2 }}>
                        <p><b>Note: </b> Hold mic icon and record</p>
                        <Card body>
                            <ListGroup flush>
                                {teamMembers.map((item, inx) => {
                                    return (
                                        <ListGroupItem key={inx}>
                                            <IconPersonFill />
                                            {item.name}
                                            <Recorder
                                                onRecordingComplete={blob => onRecordingComplete(blob,inx)}
                                                onRecordingError={onRecordingError}
                                            />
                                            {records[inx] && (
                                                <audio
                                                    src={URL.createObjectURL(records[inx])}
                                                    controls
                                                    preload="metadata"
                                                />
                                            )}
                                        </ListGroupItem>
                                    )
                                })}
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}
