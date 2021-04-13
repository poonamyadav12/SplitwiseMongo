import React, { Component, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { alertActions } from '../_actions';
import { AlertMessages } from './Alert/Alert';
import { MyGroups } from './Groups/MyGroups';
import { Home } from './Home/Home';
import { Navbar } from './LandingPage/Navbar';
import { Login } from './Login/Login';
import { Profile } from './Profile/Profile';
import { Signup } from './Signup/Signup';
import { LandingPage } from './LandingPage/LandingPage';

//Create a Main Component
class Main extends Component {

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.props.clearAlerts();
        }
    }

    render() {
        const { alert } = this.props;
        return (

            <Container fluid>
                <Navbar />

                {alert.messages && <AlertBar type={alert.type} messages={alert.messages} />}
                <div>
                    <Switch>
                        <Route
                            exact
                            path="/"
                            render={() => <LandingPage />}
                        />
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/groups" component={MyGroups} />
                        <Route exact path="/home" render={(props) => <Home {...props} />} />
                        <Route exact path="/signup" component={Signup} />
                        <Route exact path="/profile" component={Profile} />
                    </Switch>
                </div>
            </Container>
        );
    }
}

const AlertBar = props => {
    const [show, setShow] = useState(true);

    if (show) {
        return <AlertMessages type={props.type} messages={props.messages} />;
    }
    return <Button variant="danger" onClick={() => setShow(true)}>Show Alert</Button>;
}

function mapState(state) {
    const { alert } = state;
    return { alert };
}

const actionCreators = {
    clearAlerts: alertActions.clear
};

const connectedApp = withRouter(connect(mapState, actionCreators)(Main));
export { connectedApp as Main };
