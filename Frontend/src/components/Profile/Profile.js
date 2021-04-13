import React, { Component, useState } from 'react';
import { Button, Card, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import TimezoneSelect from 'react-timezone-select';
import '../../App.css';
import { userActions } from '../../_actions';
import { getDefaultUserImage } from '../../_constants/avatar';
import { CURRENCY } from '../../_helper/money';
import { UploadImage } from '../Image/UploadImage';
import { GrEdit } from 'react-icons/gr';

//Define a Login Component
class Profile extends Component {
  //call the constructor method
  constructor(props) {
    //Call the constrictor of Super class i.e The Component
    super(props);
    //maintain the state required for this component
    this.state = {
      firstName: this.props.user?.first_name,
      lastName: this.props.user?.last_name,
      username: this.props.user?.email,
      password: null,
      new_password: null,
      timeZone: this.props.user?.time_zone,
      currency: this.props.user?.default_currency,
      imageUrl: this.props.user?.avatar,
      editMode: false,
    };

    //Bind the handlers to this class
    this.firstNameChangeHandler = this.firstNameChangeHandler.bind(this);
    this.lastNameChangeHandler = this.lastNameChangeHandler.bind(this);
    this.usernameChangeHandler = this.usernameChangeHandler.bind(this);
    this.currentPasswordChangehandler = this.currentPasswordChangehandler.bind(this);
    this.newPasswordChangeHandler = this.newPasswordChangeHandler.bind(this);
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
  currentPasswordChangehandler = (e) => {
    this.setState({
      password: e.target.value
    })
  }
  //password change handler to update state variable with the text entered by the user
  newPasswordChangeHandler = (e) => {
    this.setState({
      new_password: e.target.value
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
        password: this.props.user.password,
        time_zone: this.state.timeZone,
        avatar: this.state.imageUrl,
      }
    }

    if (this.state.new_password) {
      data.user.password = this.state.password;
      data.user.new_password = this.state.new_password;
    }

    this.props.update(data);
    this.setState({ editMode: false });
  }

  setEditMode() {
    this.setState({ editMode: true });
  }

  render() {
    console.log('Here ' + this.props.user);
    return (
      <>
        {!this.props.user && <Redirect to='/login' />}
        {this.props.user &&
          <Container>
            <Row style={{ alignItems: 'center' }}>
              <Col lg={3} style={{ 'width': '20%', marginTop: '3%' }}>
                <img style={{ width: '17rem' }} src="https://assets.splitwise.com/assets/core/logo-square-65a6124237868b1d2ce2f5db2ab0b7c777e2348b797626816400534116ae22d7.svg" alt="Logo" />
              </Col>
              <Col lg={3}>
                <UploadImage label="Your avatar" defaultImage={this.state.imageUrl || getDefaultUserImage()} onChange={this.avatarChangeHandler}></UploadImage>
              </Col>
              <Col lg={6}>
                <Card style={{ width: '35rem' }}>
                  <Form>
                    <EditableField parentReloaded={this.state.reloaded} setParentEditMode={this.setEditMode.bind(this)} controlId="formFirstName" label="First name" value={this.state.firstName} onChange={this.firstNameChangeHandler} />
                    <EditableField parentReloaded={this.state.reloaded} setParentEditMode={this.setEditMode.bind(this)} controlId="formLastName" label="Last name" value={this.state.lastName} onChange={this.lastNameChangeHandler} />
                    <Form.Group controlId="formBasicEmail">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'baseline' }}>
                        <Form.Label>Email address</Form.Label>
                        <Form.Label>{this.props.user.email}</Form.Label>
                      </div>
                    </Form.Group>
                    <EditablePasswordField parentReloaded={this.state.reloaded} setParentEditMode={this.setEditMode.bind(this)} controlId="formLastName" currentPassword={this.state.password} newPassword={this.state.new_password} onChangeCurrent={this.currentPasswordChangehandler} onChangeNew={this.newPasswordChangeHandler} />
                    <Form.Group>
                      <Form.Label>Currency</Form.Label>
                      <Typeahead
                        id="currency"
                        labelKey="name"
                        onChange={this.currencyHandler}
                        options={CURRENCY}
                        placeholder="Choose a currency..."
                        defaultInputValue={this.state.currency}
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
                        defaultInputValue={this.state.timeZone}
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
                      Submit</Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Container>}
      </>
    )
  }
}

const EditableField = (props) => {
  const [editMode, setEditMode] = useState(props.editMode);
  if (editMode) {
    return <Form.Group controlId={`${props.controlId}Edit`}>
      <Form.Label>{props.label}</Form.Label>
      <Form.Control type="text" value={props.value || ''} onChange={props.onChange} />
    </Form.Group>;
  }
  return <Form.Group controlId={`${props.controlId}View`}>
    <Form.Label>{props.label}</Form.Label>
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
      <Form.Label>{props.value || 'none'}</Form.Label> &nbsp; <GrEdit onClick={() => { setEditMode(true); props.setParentEditMode(true); }} />
    </div>
  </Form.Group>;
}

const EditablePasswordField = (props) => {
  const [editMode, setEditMode] = useState(props.editMode);
  if (editMode) {
    return <><Form.Group controlId={`${props.controlId}CurrentEdit`}>
      <Form.Label>Current Password</Form.Label>
      <Form.Control type="password" value={props.currentPassword || ''} onChange={props.onChangeCurrent} />
    </Form.Group>
      <Form.Group controlId={`${props.controlId}NewEdit`}>
        <Form.Label>New Password</Form.Label>
        <Form.Control type="password" value={props.newPassword || ''} onChange={props.onChangeNew} />
      </Form.Group>
    </>;
  }
  return <Form.Group controlId={`${props.controlId}View`}>
    <Form.Label>{props.label}</Form.Label>
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
      <Form.Label>••••••••••</Form.Label> &nbsp; <GrEdit onClick={() => { setEditMode(true); props.setParentEditMode(true); }} />
    </div>
  </Form.Group>;
}


function mapState(state) {
  const { user } = state.authentication;
  const { updating } = state.update;
  return { updating, user };
}

const actionCreators = {
  update: userActions.update
}

const connectedProfilePage = connect(mapState, actionCreators)(Profile);
export { connectedProfilePage as Profile, Profile as ProfileForTest };