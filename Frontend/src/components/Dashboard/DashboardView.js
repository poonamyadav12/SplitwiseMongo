import axios from 'axios';
import React, { useState } from 'react';
import { Button, Card, Col, Container, ListGroup, Row, Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { calculateDebtPerFriend } from '../../_helper/debtcalculator';
import { getRoundedAmount } from '../../_helper/money';
import { LocalizedAmount, UserAvatar } from '../Shared/Shared';
import { SettleUpModal } from '../Transactions/SettleUpModal';
var _ = require('lodash');


class DashboardView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { transactions: null };
  }

  async componentDidMount() {
    await this.fetchData();
  }

  async fetchData() {
    try {
      if (this.props.user) {
        const transactions = await axios.get(`${SERVER_URL}/user/transactions?userId=${this.props.user.email}`);
        this.setState({
          transactions: transactions.data,
        });
      }
    } catch (err) {
      this.props.errorAlert(["Something went wrong. Please try again"]);
    }
  }

  async forceReload() {
    await this.fetchData();
  }

  render() {
    if (!this.state.transactions) return null;
    if (this.state.transactions.length === 0) return <h5>No transactions yet. Start adding expenses to see the balances.</h5>;

    const calculatedDebt = calculateDebtPerFriend(this.props.user, this.state.transactions);

    const negativeFriendBalances = calculatedDebt.per_friend.filter((f) => getRoundedAmount(f.total) < 0);
    const positiveFriendBalances = calculatedDebt.per_friend.filter((f) => getRoundedAmount(f.total) > 0);

    return (
      <>
        <Card>
          <Container fluid={true}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Total balance</th>
                  <th>You owe</th>
                  <th>You are owed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <h4
                      style={{
                        color:
                          calculatedDebt.totalAmount >= 0 ? 'green' : 'red',
                      }}
                    >
                      <LocalizedAmount
                        amount={calculatedDebt.total}
                        doNotPrintAbs={true}
                        currency={this.props.user.default_currency}
                      />
                      {'*'}
                    </h4>
                  </td>
                  <td>
                    <h4 style={{ color: 'red' }}>
                      <LocalizedAmount
                        amount={calculatedDebt.owed}
                        currency={this.props.user.default_currency}
                      />
                      {'*'}
                    </h4>
                  </td>
                  <td>
                    <h4 style={{ color: 'green' }}>
                      <LocalizedAmount
                        amount={calculatedDebt.lent}
                        currency={this.props.user.default_currency}
                      />
                      {'*'}
                    </h4>
                  </td>
                </tr>
              </tbody>
            </Table>
            <Row style={{ height: '80vh' }}>
              <Col
                sm={6}
                style={{ height: '90vh', borderRight: '1px solid grey' }}
              >
                <h3>YOU OWE</h3>
                <ListGroup>
                  {negativeFriendBalances.length > 0
                    ? negativeFriendBalances.map((friendBalance) => (
                      <BalanceView key={friendBalance.friend.email}
                        data={friendBalance}
                        user={this.props.user}
                        reloadDashboardView={this.forceReload.bind(this)}
                        setFriendView={this.props.setFriendView}
                        setGroupView={this.props.setGroupView}
                      />
                    ))
                    : <h4 style={{color:"gray"}}>You don't owe anything</h4>}
                </ListGroup>
              </Col>
              <Col sm={6}>
                <h3>YOU ARE OWED</h3>
                <ListGroup>
                  {positiveFriendBalances.length > 0
                    ? positiveFriendBalances.map((friendBalance) => (
                      <BalanceView key={friendBalance.friend.email}
                        data={friendBalance}
                        user={this.props.user}
                        reloadDashboardView={this.forceReload.bind(this)}
                        setFriendView={this.props.setFriendView}
                        setGroupView={this.props.setGroupView}
                      />
                    ))
                    : <h4 style={{color:"gray"}}>You are not owed anything</h4>}
                </ListGroup>
              </Col>
            </Row>
          </Container>
        </Card>
      </>
    );
  }
}

const BalanceView = (props) => {
  const [isSettleUpModalOpen, setSettleModalOpen] = useState(false);

  const color = props.data.balance > 0 ? 'green' : 'red';
  return (
    <ListGroup.Item key={props.data.friend.email}>
      <Row style={{ display: 'flex', alignItems: 'baseline' }}>
        <Col sm={9}>
          <Link to='#' onClick={() => props.setFriendView(props.data.friend)}>
            <UserAvatar user={props.data.friend} />
            <div style={{ marginLeft: '3rem', marginTop: '-1rem' }} className="h5">
              <span>{` ${props.data.total > 0 ? 'owes you' : 'you owe'} `}</span>
              <span style={{ color }}>
                <LocalizedAmount
                  amount={props.data.total}
                  currency={props.user.default_currency}
                />
              </span>
            </div>
          </Link>
          <ul>
            {props.data.per_group.length > 0 &&
              props.data.per_group.filter((perGroupData) => perGroupData.total !== 0).map((perGroupData) => (
                <PerGroupBalanceView
                  key={perGroupData.groupId}
                  type={perGroupData.total > 0 ? 'lent' : 'owe'}
                  data={perGroupData}
                  friend={props.data.friend}
                  user={props.user}
                  setGroupView={props.setGroupView}
                />
              ))}
          </ul>
        </Col>
        <Col sm={1}>
          <Button style={{ marginLeft: '1rem' }} variant='primary' onClick={() => setSettleModalOpen(true)}>Settle Up</Button>
          <SettleUpModal data={props.data} reloadDashboardView={props.reloadDashboardView} closeModal={() => setSettleModalOpen(false)} isOpen={isSettleUpModalOpen} />
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

const PerGroupBalanceView = (props) => {
  const color = props.type === "lent" ? 'red' : 'green';
  const prefix = props.type === "lent" ? `${props.friend.first_name} owes you ` : ` You owe ${props.friend.first_name} `;
  return (<Link key={props.friend.email} to='#' onClick={() => props.setGroupView(props.data.group.id)}><li>
    {prefix}<span style={{ color }}><LocalizedAmount amount={props.data.total} currency={props.user.default_currency} /></span>{' for '}{'"'}{props.data.group.name}{'"'}
  </li></Link>);
};



function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  errorAlert: alertActions.error,
  clearAlert: alertActions.clear,
};


const connectedDashboardView = connect(mapState, actionCreators)(DashboardView);
export { connectedDashboardView as DashboardView };
