import axios from 'axios';
import _ from 'lodash';
import React, { Component } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import '../../App.css';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { ViewComponent } from '../Home/Home';
import { UserAvatar } from '../Shared/Shared';


class MyGroups extends Component {
  constructor(props) {
    super(props);
    this.state = { groups: null, searchString: '' };
  }

  async componentDidMount() {
    await this.fetchData();
  }

  async fetchData() {
    try {
      if (this.props.user) {
        const response = await axios.get(
          SERVER_URL + '/user/groups?userId=' + this.props.user.email
        );
        //update the state with the response data
        this.setState({
          groups: response.data,
        });
      }
    } catch (error) {
      console.log(error);
      const data = error.response.data;
      const msg = Array.isArray(data)
        ? data.map((d) => d.message)
        : ['Some error occured, please try again.'];
      this.props.errorAlert(msg);
    }
  }

  async joinGroup(groupId) {
    const data = {
      groupId,
      userId: this.props.user.email,
    };
    try {
      const response = await axios.post(SERVER_URL + '/group/join', data);
      this.forceReload();
    } catch (error) {
      const data = error.response.data;
      const msg = Array.isArray(data)
        ? data.map((d) => d.message)
        : ['Some error occured, please try again.'];
      this.props.errorAlert(msg);
    }
  }

  forceReload() {
    this.fetchData();
  }

  handleSearchString(e) {
    this.setState({ searchString: e.target.value });
  }

  setGroupView(groupId) {
    this.setState({
      viewComponent: ViewComponent.GROUPVIEW,
      groupViewData: { groupId },
    });
  }

  setFriendView(friend) {
    this.setState({
      viewComponent: ViewComponent.FRIENDVIEW,
      friendViewData: { friend },
    });
  }

  render() {
    if (!this.props.user) {
      return <Redirect to='/home' />;
    }

    if (this.state.viewComponent) {
      return (
        <Redirect
          to={{
            pathname: '/home',
            state: {
              viewComponent: this.state.viewComponent,
              friendViewData: this.state.friendViewData,
              groupViewData: this.state.groupViewData,
            }
          }
          }
        />
      );
    }

    const filteredGroups = _.filter(this.state.groups || [], (g) =>
      g.name.toLowerCase().includes(this.state.searchString.toLowerCase())
    );
    const invitedGroups = _.filter(filteredGroups, (group) => {
      const groupUser = _.find(
        group.members,
        (m) => m.email === this.props.user.email
      );
      return groupUser.group_join_status === 'INVITED';
    });
    const joinedGroups = _.filter(filteredGroups, (group) => {
      const groupUser = _.find(
        group.members,
        (m) => m.email === this.props.user.email
      );
      return groupUser.group_join_status !== 'INVITED';
    });

    return (
      <Container fluid={true}>
        <Container>
          <h2>MY GROUPS</h2>
        </Container>
        <Container>
          <Row>
            <Col lg={10}>
              <Form.Group>
                <InputGroup>
                  <Form.Control
                    prefix
                    style={{ width: '60vw', height: '5rem' }}
                    type='text'
                    placeholder='Search here..'
                    onChange={this.handleSearchString.bind(this)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Container>
        <Container>
          <h4> GROUP INVITES </h4>
          <ListGroup variant='flush'>
            {invitedGroups.length > 0 ? (
              invitedGroups.map((group) => {
                const groupUser = _.find(
                  group.members,
                  (m) => m.email === this.props.user.email
                );

                return (
                  <ListGroup.Item key={group.id}>
                    <GroupItem
                      join_status={groupUser?.group_join_status}
                      group={group}
                      user={this.props.user}
                      setGroupView={this.setGroupView.bind(this)}
                      setFriendView={this.setFriendView.bind(this)}
                      joinGroup={this.joinGroup.bind(this)}
                    />
                  </ListGroup.Item>
                );
              })
            ) : (
              <ListGroup.Item>
                <h5>No groups.</h5>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Container>
        <Container>
          <h4> GROUPS JOINED </h4>
          <ListGroup variant='flush'>
            {joinedGroups.length > 0 ? (
              joinedGroups.map((group) => {
                const groupUser = _.find(
                  group.members,
                  (m) => m.email === this.props.user.email
                );

                return (
                  <ListGroup.Item key={group.id}>
                    <GroupItem
                      join_status={groupUser?.group_join_status}
                      group={group}
                      user={this.props.user}
                      setGroupView={this.setGroupView.bind(this)}
                      setFriendView={this.setFriendView.bind(this)}
                      joinGroup={this.joinGroup.bind(this)}
                    />
                  </ListGroup.Item>
                );
              })
            ) : (
              <ListGroup.Item>
                <h5>No groups.</h5>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Container>
      </Container>
    );
  }
}

const GroupItem = (props) => (
  <>
    <Card key={props.group.id}>
      <Container fluid={true}>
        <GroupHeader
          reloadGroupView={props.reloadGroupView}
          group={props.group}
          join_status={props.join_status}
          eventKey={props.group.id}
          setGroupView={props.setGroupView}
          joinGroup={props.joinGroup}
        />
        <Card.Body>
          <GroupDetail
            group={props.group}
            join_status={props.join_status}
            user={props.user}
            setFriendView={props.setFriendView}
          />
        </Card.Body>
      </Container>
    </Card>
  </>
);

const GroupHeader = (props) => {
  return (
    <Row style={{ marginBottom: '1rem' }}>
      <Col sm={10}><Link
        to='#'
        onClick={() => props.setGroupView(props.group.id)}
        className='h4'
      >
        {' '}
        {props.group.name}
      </Link></Col>
      <Col sm={2}>
        {props.join_status === 'INVITED' ? (
          <Button
            style={{ marginLeft: '2rem' }}
            variant='success'
            onClick={() => props.joinGroup(props.group.id)}
          >
            ACCEPT INVITATION
          </Button>
        ) : null}
      </Col>
    </Row>
  );
};

const GroupDetail = (props) => {
  return (
    <Container
      style={{
        border: '1px solid lightgray',
        borderRadius: '1rem',
        padding: '2rem',
      }}
      fluid={true}
    >
      <div className='h5'>MEMBERS</div>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '3rem' }}>
          <UserAvatar user={props.user} />{' '}
        </div>
        {props.group.members.length > 0 &&
          props.group.members
            .filter((member) => member.email != props.user.email)
            .map((member) => (
              <div
                style={{ marginRight: '3rem' }}
                onClick={() => props.setFriendView(member)}
              >
                <UserAvatar user={member} />{' '}
              </div>
            ))}
      </div>
    </Container>
  );
};

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  errorAlert: alertActions.error,
  clearAlert: alertActions.clear,
};

const connectedMyGroups = connect(mapState, actionCreators)(MyGroups);
export { connectedMyGroups as MyGroups };
