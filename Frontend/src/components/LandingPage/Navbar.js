import React, { Component } from 'react';
import { ListGroup, NavDropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { userActions } from '../../_actions';
import { ProfileAvatar } from '../Shared/Shared';
import { GrGroup } from 'react-icons/gr';

//create the Navbar Component
class Navbar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }
  //handle logout to destroy the cookie
  handleLogout = () => {
    this.props.logout();
  }

  render() {
    return (
      <>
        <div>
          <nav className='navbar navbar-inverse'>
            <div className='container-fluid'>
              <div className='navbar-header'>
                <Link to="/" className='navbar-brand'>
                  Splitwise App
                    </Link>
              </div>
              <ul className='nav navbar-nav'></ul>
              {!this.props.user && (
                <ul className='nav navbar-nav navbar-right'>
                  <li>
                    <Link to='/signup'>
                      <span className='glyphicon glyphicon-user'></span>Sign
                          me Up
                        </Link>
                  </li>
                </ul>
              )}
              <ul className='nav navbar-nav navbar-right'>
                {this.props.user ? (
                  <>
                    <li>
                      <Link to='/groups'>
                        My groups
                      </Link>
                    </li>
                    <li>
                      <NavDropdown
                        title={
                          <ProfileAvatar
                            user={this.props.user}
                            textColor={'white'}
                          />
                        }
                        id='basic-nav-dropdown'
                      >
                        <ListGroup.Item
                          style={{ backgroundColor: 'lightgray' }}
                        >
                          <Link to='/profile'>Profile</Link>
                        </ListGroup.Item>
                        <ListGroup.Item
                          style={{ backgroundColor: 'lightgray' }}
                          onClick={this.handleLogout}
                        >
                          <Link to='#'>Logout</Link>
                        </ListGroup.Item>
                      </NavDropdown>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to='/login'>
                      <span className='glyphicon glyphicon-log-in'></span>{' '}
                          Login
                        </Link>
                        )
                  </li>
                )}
              </ul>
            </div>
          </nav>
        </div>
      </>
    );
  }
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const actionCreators = {
  logout: userActions.logout
};

const connectedNavBar = connect(mapState, actionCreators)(Navbar);
export { connectedNavBar as Navbar };