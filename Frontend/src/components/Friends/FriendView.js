import axios from 'axios';
import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { alertActions } from '../../_actions';
import { SERVER_URL } from '../../_constants';
import { calculateDebt } from '../../_helper/debtcalculator';
import { getRoundedAmount } from '../../_helper/money';
import { LocalizedAmount, UserAvatar } from '../Shared/Shared';
import { TransactionView } from '../Transactions/TransactionView';


class FriendView extends React.Component {

    constructor(props) {
        super(props);
        this.state = { transactions: null, };

    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData() {
        try {
            if (this.props.friend) {

                const friendTxn = await axios.get(`${SERVER_URL}/transaction/friend?friendId=${this.props.friend.email}&userId=${this.props.user.email}`);

                this.setState({
                    transactions: friendTxn.data,
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
        let balance = null;
        let color = null;
        let suffix = null;
        let totalAmount = 0;
        if (this.props.friend) {
            balance = calculateDebt(this.props.user, this.state.transactions, true);
            totalAmount = getRoundedAmount(balance.totalAmount);
            color = totalAmount === 0 ? 'orange' : (totalAmount > 0 ? 'green' : 'red');
            suffix = totalAmount === 0 ? "settled up" :
                (totalAmount < 0 ? ' gets back ' : ' owes you ');
        }
        return <>
            <Col lg={8} key={this.props?.friend}>
                {this.props.friend && <Card>
                    <FriendHeader data={{ friend: this.props.friend }} reload={this.forceReload.bind(this)} />
                    {this.state.transactions && <TransactionView transactions={this.state.transactions} />}
                </Card>}
            </Col>
            <Col lg={2}>
                {this.props.friend && this.state.transactions && this.state.transactions.length > 0 &&
                    <><UserAvatar user={this.props.friend} /><div style={{ marginLeft: '3rem', marginTop: '-1rem' }} className="h4"><span style={{ color }}>{suffix}
                        {totalAmount !== 0 && <LocalizedAmount amount={balance.totalAmount} currency={this.props.user.default_currency} />}</span></div></>}
            </Col>
        </>;
    }
}

const FriendHeader = (props) => {
    return (
        <Card.Header>
            <Container fluid={true}>
                <Row>
                    <Col sm={12} className="h4"><UserAvatar user={props.data.friend} /></Col>
                </Row>
            </Container>
        </Card.Header >
    )
};


function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};


const connectedFriendView = connect(mapState, actionCreators)(FriendView);
export { connectedFriendView as FriendView };
