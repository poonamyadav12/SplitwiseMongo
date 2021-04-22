import React, { Component, useState } from 'react';
import { Accordion, Button, Card, Col, Container, Form, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import '../../App.css';
import { SETTLEUP_TXN } from '../../_helper/money';
import { LocalizedAmount, UserAvatar } from '../Shared/Shared';
import { GrEdit } from 'react-icons/gr';
import { RiChatDeleteLine } from 'react-icons/ri';
import { UpdateExpenseModal } from './UpdateExpenseModal';
import { alertActions } from '../../_actions';
import axios from 'axios';
import { SERVER_URL } from '../../_constants';
import { AlertMessages } from '../Alert/Alert';
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
                    <ConnectedComments transaction={props.transaction} />
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

class Comments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: '',
            transaction: props.transaction
        };
    }

    handleCommentChange(e) {
        this.setState({ comment: e.target.value });
    }

    async handleSubmit() {
        const data = {
            txnId: this.state.transaction.id,
            userId: this.props.user.email,
            comment: this.state.comment
        };
        try {
            const response = await axios.post(SERVER_URL + '/transaction/comment', data);
            this.setState({ transaction: response.data, comment: '' })
        } catch (error) {
            console.log("error", error);
            const data = error.response.data;
            const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            this.props.errorAlert(msg);
        }
    }


    render() {
        return (
            <div
                style={{
                    border: '1px solid lightgray',
                    borderRadius: '5px',
                }}
            >
                {this.state.transaction.comments &&
                    this.state.transaction.comments.map((comment) => (
                        <SingleComment
                            user={this.props.user}
                            key={comment._id}
                            comment={comment}
                        />
                    ))}
                <Form style={{ margin: '1rem' }}>
                    <Form.Group controlId='formBasicComment'>
                        <Form.Control
                            as='textarea'
                            rows={4}
                            placeholder='Enter Comment'
                            onChange={this.handleCommentChange.bind(this)}
                            value={this.state.comment}
                        />
                        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                            <Button
                                variant='success'
                                disabled={!this.state.comment}
                                onClick={this.handleSubmit.bind(this)}
                            >
                                ADD COMMENT
                    </Button>
                        </div>
                    </Form.Group>
                </Form>
            </div>
        );
    }
}

const SingleComment = (props) => {
    const [settleUpWarning, openSettleUpWarning] = useState(false);
    const [hide, setHide] = useState(false);
    function openSettleUpWarningModal() {
        openSettleUpWarning(true);
    }
    function closeSettleUpWarningModal() {
        openSettleUpWarning(false);
    }

    const isYou = props.user.email === props.comment.user.email;
    return (
        hide ? null :
            <Container
                style={{
                    textAlign: isYou ? 'right' : 'left',
                    margin: '1rem',
                    marginRight: isYou ? 'unset' : '15rem',
                    marginLeft: isYou ? '15rem' : 'unset',
                }}
                fluid={true}
            >
                <Card
                    style={{
                        border: '1px solid lightgray',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        padding: '1rem',
                        marginBottom: '1rem',
                    }}
                >
                    {isYou ? <Card.Header >< RiChatDeleteLine onClick={openSettleUpWarningModal} /><CommentDeleteWarningModal
                        isOpen={settleUpWarning}
                        closeModal={closeSettleUpWarningModal}
                        comment={props.comment}
                        hide={() => setHide(true)}
                    /> </Card.Header> : null}
                    <Card.Body>
                        <h4>{props.comment.comment}</h4>
                    </Card.Body>
                    <Card.Footer style={{ color: 'green' }}>
                        {dateFormat(props.comment.createdAt, 'yyyy-mm-dd HH:MM')}
                    </Card.Footer>
                </Card>
                <UserAvatar user={props.comment.user} label={isYou ? 'You' : null} />
            </Container>
    );
}

function CommentDeleteWarningModal(props) {
    async function handleDeleteSubmit() {
        console.log("Deleting the comment", props.comment._id);
        const data = {
            _id: props.comment._id,
        };
        try {
            const response = await axios.post(SERVER_URL + '/transaction/comment/delete', data);
            props.hide();

        } catch (error) {
            console.log("error", error);
            const data = error.response.data;
            const msg = Array.isArray(data) ? data.map(d => d.message) : ["Some error occured, please try again."];
            this.props.errorAlert(msg);
        }
    }
    return (
        <>
            <Modal
                show={props.isOpen}
                onHide={props.closeModal}
                keyboard={false}
                className="add-expense-modal"
                animation={false}
                style={{ width: "100vw" }}
            >
                <Modal.Header closeButton>
                    <Modal.Title><h2 style={{ color: 'red' }}>Comment Delete</h2></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: 'blue' }}>Are you sure you want to delete the comment?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={props.closeModal}>
                        No
                    </Button>
                    <Button variant="danger" onClick={handleDeleteSubmit}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
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
const actionCreators = {
    successAlert: alertActions.success,
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};

const ConnectedLentTransactionBanner = connect(mapState, {})(LentTransactionBanner);
const ConnectedPayerTransactionBanner = connect(mapState, {})(PayerTransactionBanner);
const ConnectedComments = connect(mapState, actionCreators)(Comments);