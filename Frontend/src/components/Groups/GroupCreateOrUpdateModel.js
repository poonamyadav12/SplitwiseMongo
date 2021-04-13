import axios from 'axios';
import _ from 'lodash';
import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import '../../App.css';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { getDefaultGroupImage } from '../../_constants/avatar';
import { AlertMessages } from '../Alert/Alert';
import { UploadImage } from '../Image/UploadImage';
import { GroupMemberList } from './GroupMemberList';

function GroupCreateOrUpdateModal(props) {
  const [name, setName] = useState(props && props.group && props.group.name || "");

  const [errorMsg, setErrorMsg] = useState([]);

  const [members, setMembers] = useState(props && props.group && props.group.members || []);

  const [imageUrl, setImageUrl] = useState(props && props.group && props.group.avatar || getDefaultGroupImage());

  function handleGroupNameChange(e) {
    e.preventDefault();
    setName(e.target.value);
  }

  function handleGroupMemberChange(members) {
    setMembers(members);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let group = {
      creator: props.group && props.group.creator || props.user.email,
      name,
      members: members.map((m) => ({ first_name: m.first_name, last_name: m.last_name, email: m.email, group_join_status: m.group_join_status })),
      avatar: imageUrl,
    };

    if (props && props.group && props.group.id) {
      group = { ...group, id: props.group.id };
    }
    try {
      const response = await axios.post(SERVER_URL + (props.createMode ? '/group/create' : '/group/update'), { group });
      props.reloadHomeView();
      props.closeModal();

    } catch (error) {
      const data = error.response.data;
      const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
      setErrorMsg(msg);
    }
  }

  return <Modal
    show={props.isOpen}
    onHide={props.closeModal}
    keyboard={false}
    backdrop="static"
    className="group-create-modal"
    animation={false}
    style={{ width: "100vw" }}
  >
    <Modal.Header closeButton>
      <Modal.Title>{props.group ? 'UPDATE THE GROUP' : 'START A NEW GROUP'}</Modal.Title>
      <AlertMessages messages={errorMsg} />
    </Modal.Header>
    <Modal.Body style={{ width: "60vw" }} >
      <Container fluid={true}>
        <Row>
          <Col lg={3}>
            <UploadImage defaultImage={props?.group?.avatar || getDefaultGroupImage()} label={'Group avatar'} onChange={setImageUrl}></UploadImage>
          </Col>
          <Col lg={4}><Form.Group controlId="formGroupName">
            <Form.Label>My group shall be called...</Form.Label>
            <Form.Control type="text" style={{ fontSize: '24px', width: '40rem' }} defaultValue={props?.group?.name} placeholder="1600 Pennsylvania Ave" onChange={handleGroupNameChange} />
          </Form.Group>
            <Card.Title>GROUP MEMBERS</Card.Title>
            <GroupMemberList initialMembers={props?.group?.members || [{
              first_name: props.user.first_name,
              email: props.user.email,
              last_name: props.user.last_name,
            },]} onChange={(members) => handleGroupMemberChange(members)} />
          </Col>
        </Row>
      </Container>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={props.closeModal}>
        Cancel
          </Button>
      <Button variant="success" onClick={handleSubmit}>Save</Button>
    </Modal.Footer>
  </Modal>;
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  errorAlert: alertActions.error,
  clearAlert: alertActions.clear,
};

const connectedGroupCreateOrUpdateModal = connect(mapState, actionCreators)(GroupCreateOrUpdateModal);
export { connectedGroupCreateOrUpdateModal as GroupCreateOrUpdateModal, GroupCreateOrUpdateModal as GroupCreateOrUpdateModalForTest };
