import { useEffect } from "react"
import { AuthServie } from "../../../lib/APIServices"
import { Container, Row, Col, Card, FormGroup, Label, Input, Button, Form, Table } from "reactstrap"
import moment from "moment"
import {useRouter} from 'next/router'
import Axios from "axios"
import { API_URL } from "../../../lib/constants"

const TableList = (props) => {
    const router = useRouter()
    console.log(props)
    let tableData = props.response.data;
    useEffect(() => {  //mounted

    }, [])
    return (
        <section className="py-5">
            <Container>
                <Row>
                    <Col sm={{ size: 12 }}>
                        <div className="text-right">
                            <Button className="my-3" color="success" onClick={()=>{router.push('/dashboard/user/adduser')}}>Add User</Button>
                        </div>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Password</th>
                                    <th>Role</th>
                                    <th>Created On</th>
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