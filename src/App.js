import './App.css';
import {Card, Form, Button, ProgressBar, Alert, Container} from 'react-bootstrap';
import { useRef } from 'react';
// import useFileUploaderS3 from 'use-file-uploader-s3';
import useFileUploadS3 from './hooks/use-file-upload-s3';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const TOKEN = process.env.REACT_APP_TOKEN;
const MAX_IMAGE_SIZE = 1000000;

function App() {
    const fileInput = useRef(null)
    const [{ fileData, data, isLoading, isError, progress }, readFile, clearError] = useFileUploadS3(API_ENDPOINT, TOKEN, MAX_IMAGE_SIZE);
    const handleFileInput = (e) => {
        e.preventDefault();
        let files = e.target.files || e.dataTransfer.files
        if (!files.length) return
        readFile(files[0]);
    }
    if(isError){
        setTimeout(()=>{
            fileInput.current.value = '';
            clearError();
        }, 3000)
    }

    const resetState = ()=>{
        clearError();
        fileInput.current.value = '';
    }

  return (
    <div className="App">
            <Container>
                <Card variant="info">
                    <Card.Header>File Uploader</Card.Header>
                    <Card.Body>
                        {fileData && <Card.Img variant="top" src={fileData} style={{width:'100px'}}/>}
                        {isLoading && <Card.Img variant="top" src="loading.gif" style={{width:'100px'}}/>}
                        <div className="m-2">
                            {isError && (
                                <Alert variant="danger">
                                    <Alert.Heading>Opps! there is an error.</Alert.Heading>
                                    <p>{isError}</p>
                                </Alert>
                            )}
                            {data && (
                                <Alert variant="success">
                                    <Alert.Heading>Uploaded Successfully</Alert.Heading>
                                    <p>{data}</p>
                                </Alert>
                            )}
                            {<ProgressBar now={progress} label={`${progress}%`} />}
                        </div>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Control type="file" onChange={handleFileInput} ref={fileInput}/>
                            <div className="d-grid gap-2 mt-2">
                                {data && <Button variant="outline-danger" onClick={resetState}>Reset</Button>}
                            </div>
                        </Form.Group>
                    </Card.Body>
                </Card>
            </Container>
    </div>
  );
}

export default App;
