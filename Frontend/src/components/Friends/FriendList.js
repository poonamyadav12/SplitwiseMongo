import React, { Component } from 'react';
import '../../App.css';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ListGroup, Card } from 'react-bootstrap';

export class FriendList extends Component {

    render() {
        return <Card style={{ width: '15rem' }}>
            {this.props.friends.length > 0 ?
                <ListGroup variant="flush">
                    {this.props.friends.map((friend) =>
                        <ListGroup.Item style={this.props.focussed && this.props.selectedId?.email === friend.email ? { backgroundColor: 'lightgray' } : null} key={friend.email}><FriendName friendName={friend.first_name} friend={friend} setFriendView={this.props.setFriendView} /></ListGroup.Item>
                    )}
                </ListGroup> : "No Friends to show"
            }
        </Card>
    }
}

const FriendName = (props) => <Link to="#" onClick={() => props.setFriendView(props.friend)} ><FaTag />&nbsp;{props.friendName}</Link>