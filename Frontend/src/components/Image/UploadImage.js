import axios from 'axios';
import React from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { SERVER_URL } from '../../_constants';
import { getDefaultUserImage } from '../../_constants/avatar';

export class UploadImage extends React.Component {
    state = {
        imageUrl: this.props.defaultImage,
        image: null,
        uploaded: false,
        showButton: false,
    }

    componentDidMount = () => {
        this.props.onChange(this.state.imageUrl);
    }

    uploadImage = async () => {
        if (!this.state.image) return;
        try {
            var formData = new FormData();
            formData.append("image", this.state.image);
            const response = await axios.post(SERVER_URL + '/image-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            this.props.onChange(response.data.imageUrl);
            this.setState({
                imageUrl: response.data.imageUrl,
                uploaded: true,
                showButton: false,
            });
        } catch (error) {
            this.setState({ uploaded: false, showButton: true })
        }
    }

    handleDrop = dropped => {
        this.setState({ image: dropped[0], uploaded: false, showButton: true })
    }

    render() {
        return (
            <Col style={{ textAlign: 'center' }}>
                <Form.Group controlId="imageUplaod">
                    <Form.Label><h5>{this.props.label || 'Avatar'}</h5></Form.Label>
                    <Dropzone
                        onDrop={this.handleDrop}
                        style={{ width: '150px', height: '150px' }}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <>
                                <div {...getRootProps()}>
                                    <AvatarEditor
                                        width={150}
                                        height={150}
                                        border={10}
                                        scale={1}
                                        borderRadius={80}
                                        rotate={0}
                                        color={[256, 256, 256]}
                                        image={this.state.image || this.state.imageUrl} />
                                    <input {...getInputProps()} />
                                </div>
                            </>
                        )}
                    </Dropzone>
                    {!this.state.showButton && <h5>Drop images or click to upload</h5>}
                    {this.state.showButton && <Button variant="success" onClick={this.uploadImage}>{this.props.confirmButton || 'Confirm'}</Button>}
                </Form.Group>
                {this.state.uploaded && <h4>Uploaded successfully</h4>}
            </Col >
        )
    }
}