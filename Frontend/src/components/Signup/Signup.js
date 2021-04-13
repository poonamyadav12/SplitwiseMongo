import React, { Component } from 'react';
import { Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import '../../App.css';
import { userActions } from '../../_actions';
import { getDefaultUserImage } from '../../_constants/avatar';
import { CURRENCY } from '../../_helper/money';
import { UploadImage } from '../Image/UploadImage';
import TimezoneSelect from 'react-timezone-select';

//Define a Login Component
class Signup extends Component {
    //call the constructor method
    constructor(props) {
        //Call the constrictor of Super class i.e The Component
        super(props);
        //maintain the state required for this component
        this.state = {
            firstName: "",
            lastName: "",
            username: "",
            password: "",
            errorMsg: "",
            timeZone: null,
            currency: 'USD',
            imageUrl: "",
        }

        //Bind the handlers to this class
        this.firstNameChangeHandler = this.firstNameChangeHandler.bind(this);
        this.lastNameChangeHandler = this.lastNameChangeHandler.bind(this);
        this.usernameChangeHandler = this.usernameChangeHandler.bind(this);
        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.submitSignup = this.submitSignup.bind(this);
        this.timezoneHandler = this.timezoneHandler.bind(this);
        this.currencyHandler = this.currencyHandler.bind(this);
        this.avatarChangeHandler = this.avatarChangeHandler.bind(this);
    }
    //Call the Will Mount to set the auth Flag to false
    componentWillMount() {
        this.setState({
            authFlag: false
        })
    }
    avatarChangeHandler = (imageUrl) => {
        this.setState({ imageUrl });
    }

    //name change handler to update state variable with the text entered by the user
    firstNameChangeHandler = (e) => {
        this.setState({
            firstName: e.target.value
        })
    }
    //name change handler to update state variable with the text entered by the user
    lastNameChangeHandler = (e) => {
        this.setState({
            lastName: e.target.value
        })
    }
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
    //timezone change handler
    timezoneHandler = (value) => {
        this.setState({
            timeZone: value.value
        })
    }
    //timezone change handler
    currencyHandler = (value) => {
        this.setState({
            currency: value[0].name
        })
    }
    setHasError = (errorMsg) => {
        this.setState({
            errorMsg: errorMsg
        })
    }
    //submit Login handler to send a request to the node backend
    submitSignup = (e) => {
        //var headers = new Headers();
        //prevent page from refresh
        e.preventDefault();
        const data = {
            user: {
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                email: this.state.username,
                default_currency: this.state.currency,
                password: this.state.password,
                time_zone: this.state.timeZone,
                avatar: this.state.imageUrl,

            }
        }

        this.props.register(data);
    }
    buildErrorComponent = () => {
        return this.state.errorMsg && <div class="alert alert-danger" role="alert">{this.state.errorMsg}</div>
    }
    render() {
        //redirect based on successful login
        return (
            <>
                {this.props.user && <Redirect to="/home" />}
                <Container>
                    <Row style={{ alignItems: 'center' }}>
                        <Col lg={3} style={{ 'width': '20%', marginTop: '3%' }}>
                            <img style={{ width: '17rem' }} src="https://assets.splitwise.com/assets/core/logo-square-65a6124237868b1d2ce2f5db2ab0b7c777e2348b797626816400534116ae22d7.svg" alt="Logo" />
                        </Col>
                        <Col lg={3}>
                            <UploadImage defaultImage={getDefaultUserImage()} onChange={this.avatarChangeHandler}></UploadImage>
                        </Col>
                        <Col lg={6}>
                            <Card style={{ width: '35rem' }}>
                                <Form>
                                    {this.buildErrorComponent()}
                                    <Form.Group controlId="formBasicName">
                                        <Form.Label>First name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter first name" onChange={this.firstNameChangeHandler} />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicLastName">
                                        <Form.Label>Last name</Form.Label>
                                        <Form.Control type="text" placeholder="Enter last name" onChange={this.lastNameChangeHandler} />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email" onChange={this.usernameChangeHandler} />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Password" onChange={this.passwordChangeHandler} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Currency</Form.Label>
                                        <Typeahead
                                            id="currency"
                                            labelKey="name"
                                            onChange={this.currencyHandler}
                                            options={CURRENCY}
                                            placeholder="Choose a currency..."
                                            renderMenuItemChildren={(option, props) => (
                                                <ListGroup.Item key={option.name}>
                                                    <span>{option.name}</span>{' '}
                                                </ListGroup.Item>
                                            )}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Time Zone</Form.Label>
                                        <TimezoneSelect
                                            value={'America/Los Angeles'}
                                            onChange={this.timezoneHandler}
                                            timezones={{
                                                'America/Los_Angeles': 'Los Angeles',
                                                'Europe/Berlin': 'Frankfurt',
                                                'Asia/Kuwait': 'Kuwait',
                                                'Asia/Bahrain': 'Bahrain',
                                                'Canada/Mountain': 'Canada Mountain',
                                                'Canada/Pacific': 'Canada Pacific',
                                                'Asia/Kolkata': 'Indian Standard Time',
                                                //    ...i18nTimezones,
                                            }}
                                        />
                                    </Form.Group>
                                    <Button variant="success" type="submit" onClick={this.submitSignup}>
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
    const { user } = state.authentication;
    const { registering } = state.registration;
    return { registering, user };
}

const actionCreators = {
    register: userActions.register
}

const connectedRegisterPage = connect(mapState, actionCreators)(Signup);
export { connectedRegisterPage as Signup, Signup as SignupForTest };
//export Login Component