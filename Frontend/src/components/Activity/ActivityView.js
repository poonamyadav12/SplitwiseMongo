import axios from 'axios';
import React from 'react';
import { Card, Container, Dropdown, Form, ListGroup, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { SETTLEUP_TXN } from '../../_helper/money';
import { GroupAvatar, LocalizedAmount } from '../Shared/Shared';
import Pagination from 'react-bootstrap/Pagination'
import { viewActions } from '../../_actions/view.actions';
var dateFormat = require("dateformat");


class ActivityView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recentActivities: null,
            pageIndex: 1,
            pageSize: 2,
            isLoading: true,
            sortOrder: 'desc',
            groupName: '',
        };
    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData(index = null, sortOrder = null, pageSize = null, groupName = null) {
        try {
            if (this.props.user) {
                let queryUrl = `${SERVER_URL}/user/activityv2?userId=${this.props.user.email}`;
                queryUrl = queryUrl + `&pageIndex=${index != null ? index : this.state.pageIndex}`;
                queryUrl = queryUrl + `&pageSize=${pageSize || this.state.pageSize}`;
                queryUrl = queryUrl + `&sortOrder=${sortOrder || this.state.sortOrder}`;
                if (groupName != null) {
                    queryUrl = queryUrl + `&groupName=${groupName}`;
                } else {
                    queryUrl = queryUrl + `&groupName=${this.state.groupName}`;
                }

                const recentActivity = await axios.get(queryUrl);

                const data = recentActivity.data;
                this.setState({
                    recentActivities: data.docs,
                    total: data.totalDocs,
                    pages: data.totalPages,
                    hasPrevPage: data.hasPrevPage,
                    hasNextPage: data.hasNextPage,
                    isLoading: false,
                });
            }
        } catch (err) {
            this.props.errorAlert(["Something went wrong. Please try again"]);
        }
    }

    async forceReload() {
        await this.fetchData();
    }

    async goToPage(index) {
        this.setState({ pageIndex: index, isLoading: true });
        await this.fetchData(index);
    }

    async setSortOrder(e) {
        this.setState({ sortOrder: e.target.value, isLoading: true });
        await this.fetchData(null, e.target.value);
    }

    async setPageSize(e) {
        this.setState({ pageSize: e.target.value, pageIndex: 1, isLoading: true });
        await this.fetchData(1 /* Reset page index to 1 */, null, e.target.value);
    }

    async setGroupName(e) {
        this.setState({ groupName: e.target.value, pageIndex: 1, isLoading: true });
        await this.fetchData(1 /* Reset page index to 1 */, null, null, e.target.value);
    }

    render() {
        return (
            <>
                <Row>
                    <Col lg={4}>
                        <Form.Group>
                            <Form.Label>Page size</Form.Label>
                            <Form.Control
                                as='select'
                                defaultValue={this.state.pageSize}
                                onChange={this.setPageSize.bind(this)}
                            >
                                <option value={2}>2</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col lg={4}>
                        <Form.Group>
                            <Form.Label>Filter by group</Form.Label>
                            <Form.Control
                                as='select'
                                defaultValue={this.state.groupName}
                                onChange={this.setGroupName.bind(this)}
                            >
                                <option value={''}>All groups</option>
                                {this.props.groups &&
                                    this.props.groups.map((group) => group.name).unique().map((groupName) => (
                                        <option value={groupName}>{groupName}</option>
                                    ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col lg={4}>
                        <Form.Group>
                            <Form.Label>Sort by</Form.Label>
                            <Form.Control
                                as='select'
                                defaultValue={this.state.sortOrder}
                                onChange={this.setSortOrder.bind(this)}
                            >
                                <option value={'desc'}>most recent first</option>
                                <option value={'asc'}>most recent last</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                {this.state.recentActivities &&
                    this.state.recentActivities.length > 0 ? (
                    <Card>
                        <Card.Header>
                            <ListGroup.Item>
                                <h3> Activity log</h3>
                            </ListGroup.Item>
                        </Card.Header>
                        <ListGroup>
                            {this.state.recentActivities.map((activity, index) => (
                                <ConnectedSingleActivityView
                                    activity={activity}
                                    index={index}
                                    key={index}
                                ></ConnectedSingleActivityView>
                            ))}
                        </ListGroup>
                        <div style={{ textAlign: 'center' }}>
                            <Pagination size='lg'>
                                <Pagination.First
                                    onClick={() => this.goToPage(1)}
                                    disabled={this.state.isLoading}
                                />
                                {this.state.hasPrevPage && (
                                    <Pagination.Prev
                                        onClick={() => this.goToPage(this.state.pageIndex - 1)}
                                        disabled={this.state.isLoading}
                                    />
                                )}
                                {Array(this.state.pages)
                                    .fill()
                                    .map((element, index) => (
                                        <Pagination.Item
                                            key={index + 1}
                                            onClick={() => this.goToPage(index + 1)}
                                            disabled={this.state.isLoading}
                                            active={index + 1 == this.state.pageIndex}
                                        >
                                            {index + 1}
                                        </Pagination.Item>
                                    ))}
                                {this.state.hasNextPage && (
                                    <Pagination.Next
                                        onClick={() => this.goToPage(this.state.pageIndex + 1)}
                                        disabled={this.state.isLoading}
                                    />
                                )}
                                <Pagination.Last
                                    onClick={() => this.goToPage(this.state.pages)}
                                    disabled={this.state.isLoading}
                                />
                            </Pagination>
                        </div>
                    </Card>
                ) : this.state.recentActivities ? (
                    <h4>No activities yet.</h4>
                ) : null}
            </>
        );
    }
}

const SingleActivityView = (props) => {
    const createrName = props.user.email === props.activity.creator.email ? 'you' : props.activity.creator.first_name;
    const groupName = props.activity.group.name;
    const type = props.activity.type;
    let clickable = true;
    let header = null;
    switch (type) {
        case 'GROUP_CREATION':
            header = <><b>{createrName}</b>&nbsp;created {' '}<b>{groupName}</b></>;
            break;
        case 'MEMBER_ADDED':
            header = <><b>{createrName}</b>&nbsp;added {' '}<b>{props.activity.added.first_name}</b>{' in '}<b>{groupName}</b></>;
            break;
        case 'MEMBER_DELETED':
            clickable = false;
            header = <><b>{createrName}</b>&nbsp;left {' '}<b>{props.activity.deleted.first_name}</b>{' '}<b>{groupName}</b></>;
            break;
        case 'TRANSACTION_ADDED':
            header =
                props.activity.transaction.type == SETTLEUP_TXN ? (
                    <>
                        <b>{createrName}</b>{' settled '}
                        <b style={{ color: 'green' }}>
                            <LocalizedAmount
                                amount={props.activity.transaction.amount}
                                currency={props.user.default_currency}
                            />
                        </b>
                        {' in '}
                        <b>{groupName}</b>
                    </>
                ) : (
                    <>
                        <b>{createrName}</b>&nbsp;added&nbsp;
                        <b>{props.activity.transaction.description}</b>{' ('}
                        <b style={{ color: 'red' }}>
                            <LocalizedAmount
                                amount={props.activity.transaction.amount}
                                currency={props.user.default_currency}
                            />
                        </b>
                        {') in '}
                        <b>{groupName}</b>
                    </>
                );
            break;
        default:
            return null;
    }

    const date = props.activity.createdAt;
    return (
        <ListGroup.Item key={props.index} onClick={() => {if(clickable) props.setGroupView(props.activity.group.id)}}>
            <Container>
                <Row>
                    <div><GroupAvatar group={props.activity.group} />{header}</div>
                </Row>
                <Row>
                    <div>{dateFormat(date, "mmm d")}</div>
                </Row>
            </Container>
        </ListGroup.Item>);
}


function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
    setGroupView: viewActions.setGroupView,
};


const connectedActivityView = connect(mapState, actionCreators)(ActivityView);
const ConnectedSingleActivityView = connect(mapState, actionCreators)(SingleActivityView);
export { connectedActivityView as ActivityView };
