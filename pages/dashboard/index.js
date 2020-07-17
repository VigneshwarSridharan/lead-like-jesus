import { Container, Card } from "reactstrap";
import { API_URL } from "../../lib/constants";

const Dashboard = (props) => {
    return (
        <section className="py-5">
            <Container fluid>
                <Card body>
                    <h3>Dashboard</h3>

                    <a href={`${API_URL}/merge`} >Download Merge</a>
                </Card>
            </Container>

        </section>
    )
}

export default Dashboard