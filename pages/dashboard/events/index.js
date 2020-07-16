import { useEffect, useState } from "react"
import { request } from "../../../lib/APIServices"
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, Table, Badge } from "reactstrap"
import moment from "moment"
import { useRouter } from 'next/router'
import Axios from "axios"
import { API_URL } from "../../../lib/constants"
import Swal from "sweetalert2"

const Eventlist = (props) => {
    const router = useRouter()
    console.log(props)
    let { events, activeEvent } = props.response.data
    let [tableData, setTableData] = useState(events)
    useEffect(() => {  //mounted

    }, [])
    const editEvent = (id) => {
        router.push('/dashboard/events/' + id);
    }
    const deleteEvent = (id) => {
        request.delete('/event/' + id).then(res => {
            if (res.status == 1) {
                Swal.fire(
                    'Success!',
                    'Added Successfully',
                    'success'
                )
                tableData = tableData.filter(f => f.id != id)
                setTableData([...tableData])
            }

        })
    }
    return (
        <section className="py-3">
            <Container fluid>
                <Row>
                    <Col sm={{ size: 12 }}>
                        <div className="text-right">
                            <Button className="my-3" color="success" onClick={() => { router.push('/dashboard/events/addevents') }}><i className="fas fa-microphone ml-2"></i> Add Event</Button>
                        </div>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Event Name</th>
                                    <th>File name</th>
                                    <th>Created On</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item, inx) => {
                                    return (
                                        <tr key={inx}>
                                            <td>{item.id}</td>
                                            <td>{item.name}</td>
                                            <td>{(() => {
                                                let name = item.file.split('/').pop()
                                                return <a href={item.file} download>{name}</a>
                                            })()}</td>
                                            <td>{moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                            <td>
                                                <div>
                                                    {item.id == activeEvent.value ? (
                                                        <Badge href="#" color="primary">Active</Badge>
                                                    ) : (
                                                            <Badge href="#" color="danger">InActive</Badge>
                                                        )}
                                                </div>
                                            </td>
                                            <td>
                                                <Button color="primary" size="sm" className="p-1 pl-2 ml-2" onClick={() => editEvent(item.id)} title={`Edit ${item.name}`}>
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                                <Button color="danger" size="sm" className="p-1 px-2 ml-2" onClick={() => deleteEvent(item.id)} title={`Delete ${item.name}`}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </section>
    )
}
export async function getServerSideProps(context) {

    let response = await Axios.get(`${API_URL}/event/eventlist`)
    response = response.data
    return {
        props: {
            response
        }, // will be passed to the page component as props
    }
}


export default Eventlist 