import axios from 'axios';
import React, { useState } from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { SETTLEUP_TXN } from '../../_helper/money';
import { AlertMessages } from '../Alert/Alert';
import { LocalizedAmount } from '../Shared/Shared';
var _ = require('lodash');


function PerFriendSettleUpModal(props) {
  const [errorMsg, setErrorMsg] = useState([]);

  const [payer, payee] = props.total < 0 ? [props.friend, props.user] : [props.user, props.friend];

  async function handleSubmit(e) {
    e.preventDefault();
    const settlementTxns = JSON.parse(
      JSON.stringify({
        transactions: [{
          from: payer.email,
          to: [payee.email],
          amount: Math.abs(props.total),
          currency_code: props.friend.default_currency,
          group_id: props.group.id,
          description: `Settle up in ${props.group.name}`,
          type: SETTLEUP_TXN,
        }]
      })
    );

    try {
      const response = await axios.post(SERVER_URL + '/transactions/settle', settlementTxns);
      await props.reloadGroupView();
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
        className="add-expense-modal"
        backdrop="static"
        animation={false}
        style={{ width: "100vw" }}
      >
        <Modal.Header closeButton>
          <Modal.Title><h2>SETTLE UP BALANCE</h2></Modal.Title>
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
                  <h3><b>{payer.first_name}</b> {' to '} <b>{payee.first_name}</b></h3>
                </Row>
                <Row>
                  <h2><LocalizedAmount amount={Math.abs(props.total)} currency={props.friend.default_currency} /></h2>
                </Row>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.closeModal}>
            Cancel
            </Button>
          <Button variant="success" onClick={handleSubmit}>Confirm</Button>
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

const connectedPerFriendSettleUpModal = connect(mapState, actionCreators)(PerFriendSettleUpModal);
export { connectedPerFriendSettleUpModal as PerFriendSettleUpModal };
