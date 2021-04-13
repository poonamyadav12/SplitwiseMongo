import React from "react";
import { Button, Col, Container, Image, Row } from "react-bootstrap";
import { connect } from "react-redux";
import { Redirect } from "react-router";

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <>
      {this.props.user && <Redirect to="/home" />}
      <Container>
        <Row>
          <Col sm={5}>
            <h1>Less stress when</h1>
            <h1>sharing expenses</h1>
            <h1 style={{ color: 'magenta', marginBottom: '8rem' }}>with housemates.</h1>
            <h3>Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.</h3>
            <Button href="/signup" variant="success">
              SIGN UP
          </Button>
          </Col>
          <Col sm={6}>
            <Image src="https://splitwise-images.s3.amazonaws.com/images/1616199002433" />
          </Col>
        </Row>
      </Container>
    </>;
  }
}

function mapState(state) {
  const { user } = state.authentication;
  const { registering } = state.registration;
  return { registering, user };
}

const connectedLandingPage = connect(mapState, {})(LandingPage);
export { connectedLandingPage as LandingPage, LandingPage as LandingPageForTest };
