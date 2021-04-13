import React, { Component } from 'react';
import '../../App.css';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

import { userActions } from '../../_actions';
import { Row, Container, Col, Card, Form, Button } from 'react-bootstrap';


//Define a Login Component
class Login extends Component {
    //call the constructor method
    constructor(props) {
        //Call the constrictor of Super class i.e The Component
        super(props);

        // reset login status
        this.props.logout();
        //maintain the state required for this component
        this.state = {
            username: "",
            password: "",
        }

        //Bind the handlers to this class
        this.usernameChangeHandler = this.usernameChangeHandler.bind(this);
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.submitLogin = this.submitLogin.bind(this);
    }
    //Call the Will Mount to set the auth Flag to false
    componentWillMount() { }
    //username change handler to update state variable with the text entered by the user
    usernameChangeHandler = (e) => {
        this.setState({
            username: e.target.value
        })
    }
    //password change handler to update state variable with the text entered by the user
    passwordChangeHandler = (e) => {
        this.setState({
            password: e.target.value
        })
    }
    submitLogin = (e) => {
        e.preventDefault();
        this.props.login(this.state.username, this.state.password);
    }
    render() {
        return (
            <>
                {this.props.user && <Redirect to="/home" />}
                <Container>
                    <Row style={{ alignItems: 'center' }}>
                        <Col lg={4}>
                            <img style={{ width: '17rem' }} src="https://assets.splitwise.com/assets/core/logo-square-65a6124237868b1d2ce2f5db2ab0b7c777e2348b797626816400534116ae22d7.svg" alt="Logo" />
                        </Col>

                        <Col lg={8}>
                            <Card style={{ width: '35rem' }}>
                                <Form>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email" onChange={this.usernameChangeHandler} />
                                        <Form.Text className="text-muted">
                                            We'll never share your email with anyone else.
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Password" onChange={this.passwordChangeHandler} />
                                    </Form.Group>
                                    <Button variant="success" type="submit" onClick={this.submitLogin}>
                                        Submit
                                </Button>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </>
        )
    }
}
function mapState(state) {
    const { loggingIn, user } = state.authentication;
    return { user, loggingIn };
}

const actionCreators = {
    login: userActions.login,
    logout: userActions.logout
};


const connectedLoginPage = connect(mapState, actionCreators)(Login);
export { connectedLoginPage as Login };
