import axios from 'axios';
import React, { Component } from 'react';
import { Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { IoMdAdd } from 'react-icons/io';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import '../../App.css';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { ActivityView } from '../Activity/ActivityView';
import { DashboardView } from '../Dashboard/DashboardView';
import { FriendList } from '../Friends/FriendList';
import { FriendView } from '../Friends/FriendView';
import { GroupCreateOrUpdateModal } from '../Groups/GroupCreateOrUpdateModel';
import { GroupList } from '../Groups/GroupList';
import { GroupView } from '../Groups/GroupView.js';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            redirect: false,
            groupId: null,
            viewComponent: ViewComponent.DASHBOARD,
            groupViewData: null,
            groups: [],
            isGroupCreateOpen: false,
            friends: [],
        }
        this.setGroupView = setGroupView.bind(this);
        this.setFriendView = setFriendView.bind(this);
        this.setActivityView = setActivityView.bind(this);
        this.setDashboardView = setDashboardView.bind(this);
        //this.addNewGroup = this.addNewGroup.bind(this);
    }

    componentWillMount() {
        this.props.clearAlert();
    }

    componentDidMount() {
        this.setLocationState();
        if (this.props.user) this.fetchData();
    }

    setLocationState() {
        if (this.props?.location?.state) {
            this.setState(
                {
                    viewComponent: this.props?.location?.state?.viewComponent || ViewComponent.DASHBOARD,
                    groupViewData: this.props?.location?.state?.groupViewData,
                    friendViewData: this.props?.location?.state?.friendViewData,
                }
            );
        }
    }

    fetchData() {
        axios.get(SERVER_URL + '/user/groups?userId=' + this.props.user.email)
            .then((response) => {
                //update the state with the response data
                this.setState({
                    groups: response.data
                });
                let friendsMap = new Map();
                response.data.flatMap(group => JSON.parse(JSON.stringify(group.members))).filter((member) => member.email !== this.props.user.email).forEach((member) => (friendsMap.set(member.email, member)));
                this.setState({
                    friends: Array.from(friendsMap.values()),
                });
            });
    }
    reload() {
        this.setDashboardView();
        this.fetchData();
    }
    openCreateGroupForm() {
        this.setState({ isGroupCreateOpen: true });
    }
    closeCreateGroupForm() {
        this.setState({ isGroupCreateOpen: false });
    }
    render() {
        return (
            <>
                {!this.props.user ? (
                    <Redirect to='/' />
                ) : (
                    <Container fluid>
                        <Row>
                            <Col lg={2}>
                                <Card style={{ width: '18rem' }}>
                                    <ListGroup>
                                        <ListGroup.Item
                                            style={
                                                this.state.viewComponent === ViewComponent.DASHBOARD
                                                    ? { backgroundColor: 'lightgray' }
                                                    : null
                                            }
                                        >
                                            <Link
                                                to={'#'}
                                                onClick={() =>
                                                    this.setDashboardView(this.props.user.email)
                                                }
                                            >
                                                DashBoard
                                            </Link>
                                        </ListGroup.Item>
                                        <ListGroup.Item
                                            style={
                                                this.state.viewComponent ===
                                                    ViewComponent.RECENTACTIVITYVIEW
                                                    ? { backgroundColor: 'lightgray' }
                                                    : null
                                            }
                                        >
                                            <Link
                                                to={'#'}
                                                onClick={() =>
                                                    this.setActivityView(this.props.user.email)
                                                }
                                            >
                                                Recent Activity
                                            </Link>
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <ListGroup>
                                        <ListGroup.Item>
                                            <Container>
                                                <Container>
                                                    <Row>
                                                        <Col sm={1}><Link to='/groups'>Groups</Link>{' '}</Col>
                                                        <Col sm={1}>
                                                            <Link onClick={() => this.openCreateGroupForm()} to='#'>
                                                                <IoMdAdd />
                                                            </Link>
                                                        </Col>
                                                    </Row>
                                                </Container>
                                                {this.state.isGroupCreateOpen ? (
                                                    <GroupCreateOrUpdateModal
                                                        createMode={true}
                                                        reloadHomeView={this.reload.bind(this)}
                                                        closeModal={() => this.closeCreateGroupForm()}
                                                        isOpen={this.state.isGroupCreateOpen}
                                                    />
                                                ) : null}
                                            </Container>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <GroupList
                                                focussed={
                                                    this.state.viewComponent ===
                                                    ViewComponent.GROUPVIEW
                                                }
                                                selectedId={this.state.groupViewData?.groupId}
                                                groups={this.state.groups}
                                                setGroupView={this.setGroupView}
                                            />
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <ListGroup>
                                        <ListGroup.Item>
                                            <LinkWithText
                                                text='Friends'
                                                onClick={Object.assign(this.state, {
                                                    groupId: '23',
                                                })}
                                                label='+ add'
                                                link='#'
                                            />
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <FriendList
                                                focussed={
                                                    this.state.viewComponent ===
                                                    ViewComponent.FRIENDVIEW
                                                }
                                                selectedId={this.state.friendViewData?.friend}
                                                friends={this.state.friends}
                                                setFriendView={this.setFriendView}
                                            />
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            {renderMainView(
                                this.state,
                                this.setGroupView,
                                this.reload.bind(this),
                                this.setFriendView,
                                this.setDashboardView
                            )}
                        </Row>
                    </Container>
                )}
            </>
        );
    }
}
function setDashboardView() {
    this.setState({ viewComponent: ViewComponent.DASHBOARD });
}
function setGroupView(groupId) {
    this.setState({ viewComponent: ViewComponent.GROUPVIEW, groupViewData: { groupId } });
}
function setFriendView(friend) {
    this.setState({ viewComponent: ViewComponent.FRIENDVIEW, friendViewData: { friend } });
}
function setActivityView(userId) {
    this.setState({ viewComponent: ViewComponent.RECENTACTIVITYVIEW, activityViewData: { userId } });
}

function renderMainView(state, setGroupView, reloadHomeView, setFriendView, setDashboardView) {
    const dummyRightView = (<Col lg={2}>
        <Card style={{ width: '18rem' }}>
            <Card.Header>
                GET SPLITWISE PRO<br></br>
                <img style={{ width: '16rem' }} src="https://assets.splitwise.com/assets/pro/logo-337b1a7d372db4b56c075c7893d68bfc6873a65d2f77d61b27cb66b6d62c976c.svg" alt="Logo" />
            </Card.Header><br></br>
            <Card.Footer>
                Subscribe to Splitwise Pro for no ads, currency conversion, charts, search, and more.
        </Card.Footer>
        </Card>
    </Col>);
    switch (state.viewComponent) {
        case ViewComponent.DASHBOARD:
            return <><Col lg={8}><DashboardView setFriendView={setFriendView} setGroupView={setGroupView} /></Col>{dummyRightView}</>;
        case ViewComponent.GROUPVIEW:
            const groupId = state.groupViewData.groupId;
            return <GroupView key={groupId} groupId={groupId} reloadHomeView={reloadHomeView} setDashboardView={setDashboardView} />;
        case ViewComponent.FRIENDVIEW:
            const friend = state.friendViewData.friend;
            return <FriendView key={friend.email} friend={friend} />;
        case ViewComponent.RECENTACTIVITYVIEW:
            const userId = state.activityViewData.userId;
            return <><Col lg={8}><ActivityView key={userId} userId={userId} setGroupView={setGroupView} /></Col>{dummyRightView}</>;
        default:
            return '';
    }
}

export const ViewComponent = Object.freeze({
    DASHBOARD: 'DASHBOARD',
    GROUPVIEW: 'GROUPVIEW',
    FRIENDVIEW: 'FRIENDVIEW',
    RECENTACTIVITYVIEW: 'RECENTACTIVITYVIEW'
});

const LinkWithText = (props) => (
    <Container>
        <Row>
            <Col sm={1}>{props.text}{' '}</Col>
            <Col sm={1}>
                <Link onClick={() => props.onClick()} to={props.link}>
                    <IoMdAdd />
                </Link>
            </Col>
        </Row>
    </Container>
);

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};

const connectedHome = connect(mapState, actionCreators)(Home);
export { connectedHome as Home, Home as HomeForTest };

