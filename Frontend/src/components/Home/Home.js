import axios from 'axios';
import { rest } from 'lodash';
import React, { Component } from 'react';
import { Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { IoMdAdd } from 'react-icons/io';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import '../../App.css';
import { alertActions } from '../../_actions';
import { dataActions } from '../../_actions/data.actions';
import { viewActions } from '../../_actions/view.actions';
import { SERVER_URL } from '../../_constants';
import { ViewComponent } from '../../_constants/view.constants';
import * as dataFetcher from '../../_helper/datafetcher';
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
    }

    componentWillMount() {
        this.props.clearAlert();
    }

    componentDidMount() {
        if (this.props.user) {
            this.fetchData();
        }
    }

    fetchData() {
        dataFetcher.fetchData(this.props.user.email).then(data =>
            //update the state with the response data
            this.setState({
                ...data
            }));
    }

    reload() {
        this.props.setDashboardView();
        this.props.refreshHomeData(this.props.user.email);
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
                                                this.props.view.viewComponent === ViewComponent.DASHBOARD
                                                    ? { backgroundColor: 'lightgray' }
                                                    : null
                                            }
                                        >
                                            <Link
                                                to={'#'}
                                                onClick={() =>
                                                    this.props.setDashboardView(this.props.user.email)
                                                }
                                            >
                                                DashBoard
                                            </Link>
                                        </ListGroup.Item>
                                        <ListGroup.Item
                                            style={
                                                this.props.view.viewComponent ===
                                                    ViewComponent.RECENTACTIVITYVIEW
                                                    ? { backgroundColor: 'lightgray' }
                                                    : null
                                            }
                                        >
                                            <Link
                                                to={'#'}
                                                onClick={() =>
                                                    this.props.setActivityView(this.props.user.email)
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
                                                        closeModal={() => this.closeCreateGroupForm()}
                                                        isOpen={this.state.isGroupCreateOpen}
                                                        reloadViews={() => this.props.refreshHomeData(this.props.user.email)}
                                                    />
                                                ) : null}
                                            </Container>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <GroupList
                                                focussed={
                                                    this.props.view.viewComponent ===
                                                    ViewComponent.GROUPVIEW
                                                }
                                                selectedId={this.props.view.groupViewData?.groupId}
                                                groups={this.props.groups || this.state.groups}
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
                                                    this.props.view.viewComponent ===
                                                    ViewComponent.FRIENDVIEW
                                                }
                                                selectedId={this.props.view.friendViewData?.friend}
                                                friends={this.props.friends || this.state.friends}
                                            />
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            {renderMainView(
                                this.state,
                                this.props.view,
                                this.reload.bind(this)
                            )}
                        </Row>
                    </Container>
                )}
            </>
        );
    }
}

function renderMainView(state, view) {
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
    switch (view.viewComponent) {
        case ViewComponent.DASHBOARD:
            return <><Col lg={8}><DashboardView /></Col>{dummyRightView}</>;
        case ViewComponent.GROUPVIEW:
            const groupId = view.groupViewData.groupId;
            return <GroupView key={groupId} groupId={groupId} />;
        case ViewComponent.FRIENDVIEW:
            const friend = view.friendViewData.friend;
            return <FriendView key={friend.email} friend={friend} />;
        case ViewComponent.RECENTACTIVITYVIEW:
            const userId = view.activityViewData.userId;
            const groups = state.groups;
            return <><Col lg={8}><ActivityView key={userId} userId={userId} groups={groups} /></Col>{dummyRightView}</>;
        default:
            return '';
    }
}

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
    const { groups, friends } = state.data;
    return { user, view: state.view, groups, friends };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
    setActivityView: viewActions.setActivityView,
    setDashboardView: viewActions.setDashboardView,
    refreshHomeData: dataActions.refreshHomeData,
};

const connectedHome = connect(mapState, actionCreators)(Home);
export { connectedHome as Home, Home as HomeForTest };

