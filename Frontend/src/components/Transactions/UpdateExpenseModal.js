import axios from 'axios';
import _ from 'lodash';
import { default as React, useState } from 'react';
import { Button, Card, Col, Container, Form, ListGroup, Modal, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { connect } from 'react-redux';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { CURRENCYFORMAT } from '../../_helper/money';
import { AlertMessages } from '../Alert/Alert';

function UpdateExpenseModal(props) {
  const [amount, setAmount] = useState(props.transaction.amount);
  const [description, setDescription] = useState(props.transaction.description);

  const [errorMsg, setErrorMsg] = useState([]);

  function handleAmountChange(event, maskedvalue, floatvalue) {
    setAmount(maskedvalue);
  }

  function handleDescChange(e) {
    e.preventDefault();
    setDescription(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      "transaction": {
        ...props.transaction,
        amount,
        description,
        from: props.transaction.from.email,
        to: props.transaction.to.map((user) => user.email)
      },
    };

    if (data.transaction.lentAmount !== null) delete data.transaction.lentAmount;
    if (data.transaction.createdAt !== null) delete data.transaction.createdAt;
    if (data.transaction.updatedAt !== null) delete data.transaction.updatedAt;
    if (data.transaction.created_at !== null) delete data.transaction.created_at;
    if (data.transaction.updated_at !== null) delete data.transaction.updated_at;
    if (data.transaction.comments) {
      data.transaction.comments = _.map(data.transaction.comments, cm => _.pick(cm, ['_id', 'userId', 'txnId', 'comment', 'createdAt']));
    }
    if (data.transaction.commentUsers !== null) delete data.transaction.commentUsers;

    try {
      const response = await axios.post(SERVER_URL + '/transaction/update', data);
      props.reloadGroupView();
      props.closeModal();
    } catch (error) {
      const data = error?.response?.data;
      const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
      setErrorMsg(msg);
    }
  }

  return (
    <>
      <Modal
        show={props.isOpen}
        onHide={props.closeModal}
        keyboard={false}
        backdrop="static"
        className="update-expense-modal"
        animation={false}
        style={{ width: "100vw" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update the expense</Modal.Title>
          <AlertMessages type="danger" messages={errorMsg} />
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col sm={2}>
                <img src="https://s3.amazonaws.com/splitwise/uploads/category/icon/square_v2/uncategorized/general@2x.png" alt="transaction" />
              </Col>
              <Col sm={3}>
                <Row>
                  <Form.Group controlId="formDescription">
                    <Form.Control type="text" style={{ fontSize: '24px', width: '29.5rem' }} value={description} placeholder="Description" onChange={handleDescChange} />
                  </Form.Group>
                </Row>
                <Row>
                  <CurrencyInput prefix={CURRENCYFORMAT[props.user.default_currency]} value={amount} onChange={handleAmountChange} style={{ fontSize: '32px', width: '29.5rem', border: '1px solid #ccc', 'border-radius': '4px', color: '#5555555' }} />
                </Row>
              </Col>
            </Row>
          </Container>
          <Card.Title>With you and</Card.Title>
          <ListGroup>
            {props.transaction.to.map((member) => (
              <ListGroup.Item>
                <Form.Label>{`${member.first_name}${member.last_name ? " " + member.last_name : ""}`}</Form.Label>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}


function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  errorAlert: alertActions.error,
  clearAlert: alertActions.clear,
};

const connectedUpdateExpenseModal = connect(mapState, actionCreators)(UpdateExpenseModal);
export { connectedUpdateExpenseModal as UpdateExpenseModal };
