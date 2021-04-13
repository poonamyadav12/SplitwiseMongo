import React, { Component, useState } from 'react';
import { Accordion, Button, Card, Col, Container, Image, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import '../../App.css';
import { SETTLEUP_TXN } from '../../_helper/money';
import { LocalizedAmount, UserAvatar } from '../Shared/Shared';
import { GrEdit } from 'react-icons/gr';
import { UpdateExpenseModal } from './UpdateExpenseModal';
var dateFormat = require("dateformat");

export class TransactionView extends Component {
    render() {
        const uiTxns = this.props.transactions.map((txn) => convertToUiTransactionView(txn));
        if (uiTxns.length === 0) return <ListGroup><ListGroup.Item>No Transaction to show</ListGroup.Item></ListGroup>;
        return (
            <Card fluid='true'>
                <Accordion>
                    {uiTxns.map((transaction) => (
                        <ListGroup key={transaction.id}>
                            <TransactionAccordian
                                transaction={transaction}
                                reloadGroupView={this.props.reloadGroupView}
                            />
                        </ListGroup>
                    ))}
                </Accordion> 
            </Card>
        );
    }
}

function TransactionAccordian(props) {

    return (
        <Card key={props.transaction.id}>
            <TransactionHeader
                reloadGroupView={props.reloadGroupView}
                transaction={props.transaction}
                eventKey={props.transaction.id}
            />
            <Accordion.Collapse eventKey={props.transaction.id}>
                <Card.Body>
                    <TransactionCardDetail transaction={props.transaction} />
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}


function TransactionHeader(props) {
    const [isUpdateExpenseFormOpen, setUpdateExpenseModalOpen] = useState(false);

    return (
        <Card.Header>
            <Accordion.Toggle as={Button} variant='link' eventKey={props.eventKey}>
                <Container>
                    <Row style={{ display: 'flex', alignItems: 'center' }}>
                        <Col sm={1} style={{ width: '1rem' }}>
                            <Row>
                                <h5 style={{ marginRight: '5px', color: 'grey' }}>
                                    <div>
                                        {dateFormat(
                                            props.transaction.createdAt,
                                            'mmm'
                                        ).toUpperCase()}
                                    </div>{' '}
                                    <div>{dateFormat(props.transaction.createdAt, 'd')}</div>
                                </h5>
                            </Row>
                        </Col>
                        <Col sm={props.transaction.type !== SETTLEUP_TXN ? 3 : 4}>
                            <Row>
                                {props.transaction.type !== SETTLEUP_TXN ? (
                                    <div style={{ display: 'flex', alignItems: 'baseline', marginLeft: '1rem' }}>
                                        <div className='h5' style={{ marginRight: '1rem' }}>{props.transaction.description}</div>
                                        <GrEdit onClick={() => setUpdateExpenseModalOpen(true)} />
                                        {isUpdateExpenseFormOpen ? (
                                            <UpdateExpenseModal
                                                transaction={props.transaction}
                                                reloadGroupView={props.reloadGroupView}
                                                closeModal={() => setUpdateExpenseModalOpen(false)}
                                                isOpen={isUpdateExpenseFormOpen}
                                            />
                                        ) : null}{' '}
                                    </div>
                                ) : (
                                    <div className='h5'>
                                        <Image
                                            src={
                                                'https://assets.splitwise.com/assets/api/payment_icon/square/small/offline.png'
                                            }
                                            style={{ width: '2rem' }}
                                        />{' '}
                                        <b>{props.transaction.from.first_name}</b>
                                        {' paid to '}
                                        <b>{props.transaction.to[0].first_name}</b>
                                        {' #settleup '}
                                    </div>
                                )}
                            </Row>
                        </Col>
                        {props.transaction.type !== SETTLEUP_TXN ? (
                            <>
                                <Col sm={4}>
                                    <ConnectedPayerTransactionBanner
                                        transaction={props.transaction}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <ConnectedLentTransactionBanner
                                        transaction={props.transaction}
                                    />
                                </Col>
                            </>
                        ) : (
                            <Col
                                sm={7}
                                style={{ textAlign: 'center', marginLeft: '22rem' }}
                            >
                                <div>Settled amount</div>
                                <div style={{ color: 'blue' }}>
                                    <LocalizedAmount
                                        amount={props.transaction.amount}
                                        currency={props.transaction.currency_code}
                                    />
                                </div>
                            </Col>
                        )}
                    </Row>
                </Container>
            </Accordion.Toggle>
        </Card.Header>
    );
}

class PayerTransactionBanner extends React.Component {
    render() {
        const userId = this.props.user.email;
        const payerName = this.props.transaction.from.email === userId ? 'you' : this.props.transaction.from.first_name;
        return (
            <>
                <div>{payerName}&nbsp;paid</div>
                <div style={payerName === 'you' ? { color: 'green' } : { color: 'red' }}><LocalizedAmount amount={this.props.transaction.amount} currency={this.props.transaction.currency_code} /></div>
            </>
        );
    }
}

class LentTransactionBanner extends React.Component {
    render() {
        const userId = this.props.user.email;
        const payerName = this.props.transaction.from.email === userId ? 'you' : this.props.transaction.from.first_name;
        return (
            <>
                <div>{payerName}&nbsp;lent</div>
                <div style={payerName === 'you' ? { color: 'green' } : { color: 'red' }}><LocalizedAmount amount={this.props.transaction.lentAmount} currency={this.props.transaction.currency_code} /></div>
            </>
        );
    }
}

const TransactionCardDetail = (props) => {
    const owesList = props.transaction.to.map(payee => {
        return (
            <ListGroup.Item key={payee.first_name}><UserAvatar user={payee} />{' '}owes{' '}<LocalizedAmount amount={payee.oweAmount} currency={props.transaction.currency_code} /></ListGroup.Item>
        );
    });
    return (
        <ListGroup>
            <ListGroup.Item key={props.transaction.from.first_name}><UserAvatar user={props.transaction.from} />&nbsp;paid <LocalizedAmount amount={props.transaction.amount} currency={props.transaction.currency_code} /></ListGroup.Item>
            {owesList}
        </ListGroup>
    );
}

function convertToUiTransactionView(transaction) {
    const amount = transaction.amount;
    const totalpayees = transaction.to.length;

    const amountPerMember = (transaction.type === SETTLEUP_TXN) ? amount : (amount / (totalpayees + 1));
    transaction.to = transaction.to.map((payee) => {
        payee.oweAmount = amountPerMember;
        return payee;
    });
    transaction.lentAmount = (transaction.type === SETTLEUP_TXN) ? amount : (amount * totalpayees / (totalpayees + 1));
    return transaction;
}

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const ConnectedLentTransactionBanner = connect(mapState, {})(LentTransactionBanner);
const ConnectedPayerTransactionBanner = connect(mapState, {})(PayerTransactionBanner);