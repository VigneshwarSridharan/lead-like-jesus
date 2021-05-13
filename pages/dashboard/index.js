import { Container, Card, Row, Col, Table, Button, Nav, NavItem, NavLink, TabPane, TabContent, Modal, ModalBody, ModalHeader, ListGroupItem, ListGroup, Label, ModalFooter } from "reactstrap";
import { API_URL } from "../../lib/constants";
import { useEffect, useState } from "react";
import Axios from "axios";
import Link from 'next/link';
import { EventServices, request } from "../../lib/APIServices";
import Swal from 'sweetalert2';
import { snakeCase } from "snake-case";

const Dashboard = (props) => {
    let { eventCount = 0, userCount = 0, activeEvent = {}, } = props

    const [invitationOpen, setInvitationOpen] = useState(false)
    const [invitations, setInvitations] = useState([])
    const [members, setMembers] = useState(props.members || [])
    const [recordType, setRecordType] = useState([...props.recordType] || []);
    const toggleInvitationOpen = () => setInvitationOpen(p => !p)

    let tabs = members.reduce((total, item) => {
        total[item.team] = total[item.team] || []
        total[item.team].push(item)
        return total
    }, {})
    const [activeTab, setActiveTab] = useState(Object.keys(tabs).length ? Object.keys(tabs)[0] : '');
    const [payer, setPlayer] = useState({
        isOpen: false,
        base: "",
        list: []
    })

    const togglePayer = (isOpen = false, base = "", list = []) => setPlayer({ isOpen, base, list })

    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    }

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
                    id: activeEvent.id
                }).then(res => {
                    console.log(res)
                    Swal.fire(
                        'Success!',
                        'Deleted Successfully',
                        'success'
                    )
                    let inx = members.findIndex(f => f.id === person.id)
                    members[inx]['submitted'] = members[inx]['submitted'].filter(f => f != type)
                    setMembers([...members])

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
    const updateRecordType = () => {
        if (recordType.length) {
            EventServices.updateRecordType({ recordType }).then(res => {
                Swal.fire(
                    'Success!',
                    'Updated Successfully',
                    'success'
                )
            }).catch(err => {
                console.log(err)
                Swal.fire(
                    'Sorry!',
                    'Faild to update',
                    'error'
                )
            })
        }
        else {
            Swal.fire('Faild', "Record Type is required", 'error')
        }
    }

    const sendMail = (url) => {
        let swal = Swal.fire({
            showConfirmButton: false,
            title: 'Please Wait..'
        })
        request.get(url).then(res => {
            swal.close()
            if (res.status) {
                Swal.fire('Success', 'Mail sent successfully!', 'success')
            }
            else {
                Swal.fire('Sorry!', 'Mail not sent', 'error')
            }
            console.log(res)
        })
    }

    const sendInvitation = () => {
        let swal = Swal.fire({
            showConfirmButton: false,
            title: 'Please Wait..'
        })
        request.post(`/invitation/${activeEvent.id}`, { invitations }).then(res => {
            swal.close()
            if (res.status) {
                Swal.fire('Success', 'Invitation mail sent successfully!', 'success')
                setInvitationOpen(false)
            }
            else {
                Swal.fire('Sorry!', 'Invitation mail not sent', 'error')
            }
        })
    }
    useEffect(() => {
        setInvitations([])
    }, [invitationOpen])
    return (
        <section className="py-5">
            <Container fluid>
                <Row>
                    <Col sm={4}>
                        <Card body className="mb-3">
                            <div className="d-flex align-items-center">
                                <div className="h1 m-0 mr-3 text-muted"><i className="fas fa-users"></i></div>
                                <div className="border-left pl-3">
                                    <div className="h3 m-0">{members.length}</div>
                                    <div className="">Members</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col sm={4}>
                        <Card body className="mb-3">
                            <div className="d-flex align-items-center">
                                <div className="h1 m-0 mr-3 text-muted"><i className="fas fa-microphone "></i></div>
                                <div className="border-left pl-3">
                                    <div className="h3 m-0">{eventCount}</div>
                                    <div className="">Events</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col sm={4}>
                        <Card body className="mb-3">
                            <div className="d-flex align-items-center">
                                <div className="h1 m-0 mr-3 text-muted"><i className="fas fa-user"></i></div>
                                <div className="border-left pl-3">
                                    <div className="h3 m-0">{userCount}</div>
                                    <div className="">users</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Card body className="mb-3">
                    <h5 className="mb-3">Record Type</h5>
                    <Row className="align-items-center">
                        {
                            ["appreciation", "scripture"].map((item, inx) => {
                                let active = recordType.includes(item);
                                return (
                                    <Col key={inx}>
                                        <Card
                                            body
                                            className={`text-capitalize flex-row align-items-center pointer ${active ? 'bg-primary text-white border-primary' : ''}`}
                                            onClick={() => {
                                                if (active) {
                                                    recordType.splice(inx, 1)
                                                    setRecordType([...recordType])
                                                }
                                                else {
                                                    recordType.push(item);
                                                    recordType.sort()
                                                    setRecordType([...recordType])
                                                }
                                            }}
                                        >
                                            <i className={`far ${active ? 'fa-check-square ' : 'fa-square'} mr-3`}></i> <b>{item}</b>
                                        </Card>
                                    </Col>
                                )
                            })
                        }
                        <Col className="text-center">
                            <Button color="success" onClick={updateRecordType} disabled={(recordType.toString() === props.recordType.toString())}>Update</Button>
                        </Col>
                    </Row>
                </Card>
                <Card body>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                        <h3>Active Event Details ({activeEvent.name})</h3>
                        <Link passHref href={`/dashboard/merge/${activeEvent.id}`}>
                            <Button tag="a" color="success" ><i className="fas fa-download mr-2"></i>Download Merged Audio</Button>
                        </Link>
                    </div>

                    <div className="d-flex justify-content-between">
                        <Nav tabs>
                            {Object.keys(tabs).map((name, inx) => {
                                return (
                                    <NavItem key={inx}>
                                        <NavLink
                                            className={`${activeTab === name ? 'active bg-primary text-white border-primary' : ''}`}
                                            onClick={() => { toggle(name); }}
                                        >{name}</NavLink>
                                    </NavItem>
                                )
                            })}
                        </Nav>
                        <Button color="primary" onClick={toggleInvitationOpen}><i className="fas fa-paper-plane mr-2" />Send Invitation</Button>
                    </div>
                    <TabContent activeTab={activeTab}>
                        {Object.keys(tabs).map((name, inx) => {
                            return (
                                <TabPane tabId={name} key={inx}>
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
                                                tabs[name].map((item, inx) => {
                                                    return (
                                                        <tr key={inx}>
                                                            <td>{inx + 1}</td>
                                                            <td>{item.name} {item.observer && '(Observer)'}</td>
                                                            <td>{item.id}</td>
                                                            <td>{item.team}</td>
                                                            <td>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('appreciation') ? <i className="fas fa-check text-success"></i> : <i className="fas fa-times text-danger"></i>}
                                                                </div>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('appreciation') ? <Button color={'info'} size={'sm'} onClick={() => togglePayer(true, item.base + '/appreciation', item.appreciationList)}><i className="fas fa-play"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('appreciation') ? <Button color={'danger'} size={'sm'} onClick={() => deleteAudios('appreciation', item, inx)}><i className="far fa-trash-alt"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('appreciation') ? <Button tag="a" size={'sm'} href={`${API_URL}/merge-user-audio/${activeEvent.id}/${name}/${snakeCase(item.name)}/appreciation`}><i className="fas fa-clone"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline">
                                                                    {item.submitted.includes('appreciation') ? <Button color="warning" className="text-white" size={'sm'} onClick={() => sendMail(`/mail-merge-user-audio/${activeEvent.id}/${name}/${snakeCase(item.name)}/appreciation`)}><i className="fas fa-envelope"></i></Button> : ''}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('scripture') ? <i className="fas fa-check text-success"></i> : <i className="fas fa-times text-danger"></i>}
                                                                </div>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('scripture') ? <Button color={'info'} size={'sm'} onClick={() => togglePayer(true, item.base + '/scripture', item.scriptureList)}><i className="fas fa-play"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('scripture') ? <Button color={'danger'} size={'sm'} onClick={() => deleteAudios('scripture', item, inx)}><i className="far fa-trash-alt"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline mr-1">
                                                                    {item.submitted.includes('scripture') ? <Button tag="a" size={'sm'} href={`${API_URL}/merge-user-audio/${activeEvent.id}/${name}/${snakeCase(item.name)}/scripture`}><i className="fas fa-clone"></i></Button> : ''}
                                                                </div>
                                                                <div className="d-inline">
                                                                    {item.submitted.includes('scripture') ? <Button color="warning" className="text-white" size={'sm'} onClick={() => sendMail(`/mail-merge-user-audio/${activeEvent.id}/${name}/${snakeCase(item.name)}/scripture`)}><i className="fas fa-envelope"></i></Button> : ''}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                </TabPane>
                            )
                        })}
                    </TabContent>


                </Card>
            </Container>

            <Modal isOpen={payer.isOpen} size="lg" centered toggle={() => togglePayer(false)}>
                <ModalHeader toggle={() => togglePayer(false)}><i className="fas fa-volume-up mr-3"></i>Player</ModalHeader>
                <ModalBody className="p-0" style={{ height: 350 }}>
                    <iframe
                        style={{ width: "100%", height: 350, margin: 0, padding: 0, border: 0 }}
                        src={`/player?base=${window.location.origin}${payer.base}/&list=${payer.list.toString()}`}
                    // src="/player?base=https://zerra.co.in/events/10041/record-source/Team-A/aadarsh/appreciation/&list=aadarsh-daisy.mp3,aadarsh-jaagruti.mp3,aadarsh-jones.mp3,aadarsh-nancy.mp3,aadarsh-saji.mp3,aadarsh-sherlyn.mp3,aadarsh-yesuratnam.mp3"
                    />
                </ModalBody>
            </Modal>

            <Modal isOpen={invitationOpen} toggle={toggleInvitationOpen}>
                <ModalHeader toggle={toggleInvitationOpen}>Send Invitation</ModalHeader>
                <ModalBody className="p-0">
                    <ListGroup flush>
                        <ListGroupItem className="py-2 border-bottom pointer" onClick={() => {
                            if (invitations.length === props.members.length) {
                                setInvitations([])
                            }
                            else {
                                setInvitations(props.members.map(({ id }) => id))
                            }
                        }}>
                            <i className={`far ${invitations.length === props.members.length ? 'fa-check-square text-primary' : 'fa-square'} mr-1`}></i> Select All
                        </ListGroupItem>
                    </ListGroup>
                </ModalBody>
                <ModalBody style={{ height: 'calc(100vh - 190px)', overflow: 'auto' }} className="p-0">
                    <ListGroup flush>
                        {
                            props.members.map((item, inx) => {
                                return (
                                    <ListGroupItem className="py-2 pointer" onClick={() => {
                                        if (invitations.includes(item.id)) {
                                            invitations.splice(invitations.indexOf(item.id), 1)
                                            setInvitations([...invitations])
                                        }
                                        else {
                                            setInvitations([...invitations, item.id])
                                        }
                                    }} key={inx}>
                                        <i className={`far ${invitations.includes(item.id) ? 'fa-check-square text-primary' : 'fa-square'} mr-1`}></i> {item.name} ({item.team})
                                    </ListGroupItem>
                                )
                            })
                        }
                    </ListGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={sendInvitation}>Send</Button>
                </ModalFooter>
            </Modal>

        </section>
    )
}

export async function getServerSideProps(context) {

    let response = await Axios.get(`${API_URL}/dashboard`)
    response = response.data
    return {
        props: {
            ...response.data || {}
        }, // will be passed to the page component as props
    }
}

export default Dashboard