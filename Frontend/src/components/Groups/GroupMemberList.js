import React, { useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { Link } from 'react-router-dom';
import '../../App.css';
import { UserTypeHead } from '../User/UserTypeHead';

export const GroupMemberList = (props) => {
  const [members, setMembers] = useState(initialMembers());

  function initialMembers() {
    return (props.initialMembers || []).map((member) => ({ ...member, initial: true, }));
  }
  function handleEmailChange(index, e) {
    const newMembers = members.map((member, i) => {
      if (i === index) {
        return { ...member, email: e.target.value };
      }
      return member;
    });
    setMembers(newMembers);
    props.onChange(newMembers);
  }
  function handleNameChange(index, value) {
    if (value.length === 0) {
      return;
    }
    const newMembers = members.map((member, i) => {
      if (i === index) {
        return { ...member, first_name: value[0].first_name, last_name: value[0].last_name, email: value[0].email };
      }

      return member;
    });
    setMembers(newMembers);
    props.onChange(newMembers);
  }
  function addEmptyMember() {
    setMembers([...members, { group_join_status: "INVITED", }]);
  }
  function handleDelete(index, e) {
    setMembers(members.filter((member, i) => i !== index));
  }
  return (
    <>
      {members.map((member, index) => (
        <Container key={index}>
          <Row>
            <Col sm={2}>
              <Form.Group controlId={`formName${index}`}>
                {member.initial ? <Form.Label><h5>{member.first_name}{' '}{member.last_name}</h5></Form.Label> : <UserTypeHead key={member.first_name + index} skipCurrentUser={true} initialValue={member} onChange={handleNameChange.bind(null, index)} style={{ fontSize: '18px', width: '17.5rem' }} />}
              </Form.Group>
            </Col>
            <Col sm={2}>
              <Form.Group controlId={`formEmail${index}`}>
                {member.initial ? <Form.Label><h5>{member.email}</h5></Form.Label> :
                  <Form.Control type="text" style={{ fontSize: '18px', width: '19rem' }}
                    value={member.email ? member.email : null}
                    placeholder="Email" onChange={handleEmailChange.bind(null, index)} />}
              </Form.Group>
            </Col>
            <Col sm={1} style={{ textAlign: 'center' }}>
              {!member.initial && <MdRemoveCircleOutline onClick={handleDelete.bind(null, index)} style={{ height: '27px', width: '25px', verticalAlign: 'text-top' }} />}
            </Col>
          </Row>
        </Container>
      ))}
      <Link onClick={() => addEmptyMember()} to="#" > +Add person</Link>
    </>
  );
};