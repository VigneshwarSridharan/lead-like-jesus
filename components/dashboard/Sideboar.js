import Link from "next/link"
import { ListGroup, ListGroupItem } from "reactstrap"
import { useRouter } from "next/router";

let sidebardata = [
    
    {
        name: 'Users',
        icon: 'fas fa-user',
        path: '/dashboard/user',
    },
    {
        name: 'Events',
        icon: 'fas fa-microphone',
        path: '/dashboard/events',
    },
]

const Sidebar = props => {
    let router = useRouter();

    const goToPath = path => router.push(path)
    return (
        <div className="sidebar">
            <Link href="/dashboard">
                <div className="h4 text-center pointer  p-3 mb-5">Lead Like Jesus</div>
            </Link>
            <ListGroup flush className="border-top border-bottom" >
                <ListGroupItem action tag="a" className={`${'/dashboard' == router.pathname ? 'active' : ''}`} onClick={() => goToPath('/dashboard')}>
                    <i className={`fas fa-layer-group mr-2`}></i> Dashboard
                </ListGroupItem>
                {
                    sidebardata.map((item, inx) => {
                        return (
                            <ListGroupItem action tag="a" className={`${router.pathname.startsWith(item.path) ? 'active' : ''}`} key={inx} onClick={() => goToPath(item.path)}>
                                <i className={`${item.icon} mr-2`}></i> {item.name}
                            </ListGroupItem>
                        )
                    })
                }
            </ListGroup>
        </div>
    )
}

export default Sidebar