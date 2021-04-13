import _ from 'lodash';
import React, { Component } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FaTag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FcInvite } from 'react-icons/fc';
import { BsPersonCheckFill } from 'react-icons/bs';
import '../../App.css';
import { alertActions } from '../../_actions';
import { connect } from 'react-redux';


class GroupList extends Component {

    render() {
        return <Card style={{ width: '15rem' }}>
            {this.props.groups.length > 0 ?
                <ListGroup variant="flush">
                    {this.props.groups.map((group) => {
                        const groupUser = _.filter(group.members, (m) => m.email === this.props.user.email)[0];

                        return (
                            <ListGroup.Item
                                style={
                                    this.props.focussed &&
                                        this.props.selectedId === group.id
                                        ? { backgroundColor: 'lightgray' }
                                        : null
                                }
                                key={group.id}
                            >
                                <GroupName
                                    join_status={groupUser?.group_join_status}
                                    groupName={group.name}
                                    groupId={group.id}
                                    setGroupView={this.props.setGroupView}
                                />
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup> : "No Groups to show"
            }
        </Card>
    }
}

const GroupName = (props) => (
    <Link to='#' onClick={() => props.setGroupView(props.groupId)}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaTag />
            {' '}{props.groupName}
            {props.join_status === 'INVITED' ? (
                <FcInvite
                    style={{ width: '20px', height: '20px', marginLeft: '1rem' }}
                />
            ) : (
                <BsPersonCheckFill
                    style={{ width: '20px', height: '20px', marginLeft: '1rem' }}
                />
            )}
        </div>
    </Link>
);

function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    errorAlert: alertActions.error,
    clearAlert: alertActions.clear,
};


const connectedGroupList = connect(mapState, actionCreators)(GroupList);
export { connectedGroupList as GroupList };