import { Alert } from "react-bootstrap";

export const AlertMessages = (props) => (
    props.messages.length ? (<Alert color='primary' variant={props.type} style={{ opacity: "unset" }}>
        <Alert.Heading>{props.type === "danger" ? 'Oh snap! You got an error!' : 'Great!'}</Alert.Heading>
        {Array.isArray(props.messages) ? props.messages.map(message => <p key="{message}">
            {message}
        </p>) : <p key="{message}">
            {props.messages}
        </p>}
    </Alert>) : null);