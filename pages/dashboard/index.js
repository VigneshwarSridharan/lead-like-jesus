import { Container, Card, Row, Col, Table, Button, Nav, NavItem, NavLink, TabPane, TabContent } from "reactstrap";
import { API_URL } from "../../lib/constants";
import { useEffect, useState } from "react";
import Axios from "axios";
import Link from 'next/link';

const Dashboard = (props) => {
    console.log(props)
    let { members = [], eventCount = 0, userCount = 0, activeEvent = {} } = props

    let tabs = members.reduce((total, item) => {
        total[item.team] = total[item.team] || []
        total[item.team].push(item)
        return total
    }, {})
    const [activeTab, setActiveTab] = useState(Object.keys(tabs).length ? Object.keys(tabs)[0] : '');

    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    }
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
                <Card body>
                    <div className="d-flex align-items-start justify-content-between mb-3">
                        <h3>Active Event Details ({activeEvent.name})</h3>
                        <Link passHref href={`/dashboard/merge/${activeEvent.id}`}>
                            <Button tag="a" color="success" ><i className="fas fa-download mr-2"></i>Download Merged Audio</Button>
                        </Link>
                    </div>


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
                                                <th>Team</th>
                                                <th>Generic</th>
                                                <th>Scripture</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                tabs[name].map((item, inx) => {
                                                    return (
                                                        <tr key={inx}>
                                                            <td>{inx + 1}</td>
                                                            <td>{item.name}</td>
                                                            <td>{item.id}</td>
                                                            <td>{item.team}</td>
                                                            <td>{item.submitted.includes('generic') ? <i className="fas fa-check text-success"></i> : <i className="fas fa-times text-danger"></i>}</td>
                                                            <td>{item.submitted.includes('scripture') ? <i className="fas fa-check text-success"></i> : <i className="fas fa-times text-danger"></i>}</td>
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