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
        router.push('/dashboard/user/' + id);
    }
    const deleteUser = (id) => {
        request.delete('/auth/user/' + id).then(res => {
            if (res.status) {
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
        <section className="py-5">
            <Container>
                <Row>
                    <Col sm={{ size: 12 }}>
                        <div className="text-right">
                            <Button className="my-3" color="success" onClick={() => { router.push('/dashboard/user/adduser') }}>Add User</Button>
                        </div>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Password</th>
                                    <th>Role</th>
                                    <th>Created On</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item, inx) => {
                                    return (
                                        <tr>
                                            <td>{item.id}</td>
                                            <td>{item.username}</td>
                                            <td>{item.password}</td>
                                            <td>{item.role}</td>
                                            <td>{moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                            <td>
                                                <div>
                                                    {item.active ? (
                                                        <Badge href="#" color="primary">Active</Badge>
                                                    ) : (
                                                            <Badge href="#" color="danger">InActive</Badge>
                                                        )}
                                                </div>
                                            </td>
                                            <td>
                                                <h6 className="btn" onClick={() => editUser(item.id)}>
                                                    <i class="fas fa-user-edit"></i>
                                                </h6>
                                            </td>
                                            <td>
                                                <h6 className="btn" onClick={() => deleteUser(item.id)}>
                                                    <i class="fas fa-trash-alt"></i>
                                                </h6>
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

    let response = await Axios.get(`${API_URL}/auth/userlist`)
    response = response.data
    return {
        props: {
            response
        }, // will be passed to the page component as props
    }
}


export default TableList 