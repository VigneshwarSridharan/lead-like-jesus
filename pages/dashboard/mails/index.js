import { useEffect, useState } from "react"
import { request } from "../../../lib/APIServices"
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, Table, Badge } from "reactstrap"
import moment from "moment"
import { useRouter } from 'next/router'
import Axios from "axios"
import { API_URL } from "../../../lib/constants"
import Swal from "sweetalert2"

const TableList = (props) => {
    const router = useRouter()
    // const [active, setActive] = useState(true)
    // let tableData = props.response.data;
    let [tableData, setTableData] = useState(props.response.data)
    useEffect(() => {  //mounted

    }, [])
    const editUser = (id) => {
        router.push('/dashboard/mails/' + id);
    }
    return (
        <section className="py-3">
            <Container fluid>
                <Card body>
                    <Row>
                        <Col sm={{ size: 12 }}>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <h3>Mails</h3>
                                
                            </div>
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Subject</th>
                                        <th>Last Updated</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item, inx) => {
                                        return (
                                            <tr key={inx}>
                                                <td>{item.id}</td>
                                                <td>{item.name}</td>
                                                <td>{item.subject}</td>
                                                <td>{moment(item.updated_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                                <td>
                                                    <Button color="primary" size="sm" className="p-1 px-2 ml-2" onClick={() => editUser(item.id)} title={`Edit ${item.username}`}>
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </section>
    )
}
export async function getServerSideProps(context) {
console.log(`${API_URL}/mail-config`)
    let response = await Axios.get(`${API_URL}/mail-config`)
    response = response.data
    return {
        props: {
            response
        }, // will be passed to the page component as props
    }
}


export default TableList 