import { Container } from "reactstrap";
import { API_URL } from "../../lib/constants";

const Dashboard = (props) => {
    return (
        <section className="py-5">
            <Container fluid>
                <h3>Dashboard</h3>

                <a href={`${API_URL}/merge`} >Download Merge</a>
            </Container>

        </section>
    )
}

export default Dashboard