import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Form, Button, Col } from 'react-bootstrap';

import Stack from '@mui/material/Stack';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';


export default function MainForm() {
    const [jobDescription, setJobDescription] = useState(null);
    const [links, setLinks] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [errorValue, setErrorValue] = useState(null);
    const [openError, setOpenError] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [successValue, setSuccessValue] = useState(null);
    
    let HOST = 'http://3.83.44.25//api';
    
    const saveFile = async () => {
        const a = document.createElement('a');
        a.download = `${taskId}.csv`;
        a.href = `${HOST}/get_parse_data/${taskId}`;
        a.click();
        a.remove();
        setTaskId(null);
        setSuccessValue('Csv File was download!')
    }

    useEffect(() => {
        if (taskId === null) {
            return
        }
        const evtSource = new EventSource(`${HOST}/stream/${taskId}`);

        evtSource.addEventListener("message", function (event) {
            console.log('new_message', event.data);
            let status = event.data;
            if (status === 'SUCCESS') {
                saveFile();
            }
            evtSource.close();
        });

    }, [taskId]);

    const createTask = async () => {
        
        if (taskId != null){
            setErrorValue('Parse task was created, please wait.');
            setOpenError(true);
            return
        }
        if (jobDescription === null || jobDescription === '') {
            setErrorValue('Job description is empty!');
            setOpenError(true);
            return
        }
        if (links === null || links === '') {
            setErrorValue('Links is empty!');
            setOpenError(true);
            return
        }
        let joinLinks = links.replace(/\s+/g, ' ');
        let jonLinks = joinLinks.split(', ')
        let response = await fetch(
            `${HOST}/create_task`, {
            method: 'POST',
            body: JSON.stringify({
                user_job_description: jobDescription,
                links: jonLinks,
            }),
            headers: {
                'Content-type': 'application/json',
            },
        });
        const data = await response.json();
        console.log(data, data.task_id);
        setTaskId(data.task_id);
        setOpenError(false);
        setOpenSuccess(true);
        setSuccessValue('Background task was created, wait 1 minute.')
    }

    return (
        <div className='container mt-5'>
            <Form className='mb-4'
                onSubmit={ (e) => {
                        e.preventDefault();
                        createTask();
                    }
                }
            >
                <Form.Group className='mb-3'>
                    <Form.Label>Enter your job descrition:</Form.Label>
                    <Form.Control
                        as="textarea" rows="5"
                        className='square border border-dark rounded-9'
                        type='text'
                        placeholder="Example: I'd like work with data and analytics..."
                        onChange={(e) => setJobDescription(e.target.value)}
                        style={{ resize: 'none', overflowY: 'scroll' }}
                    />
                </Form.Group>
                <Form.Group className='mb-3'>
                    <Form.Label>Enter your links on job platforms:</Form.Label>
                    <Form.Control
                        className='square border border-dark rounded-9'
                        type='text'
                        placeholder="Example: https://job_platform_1, https://job_platform_2"
                        onChange={(e) => setLinks(e.target.value)}
                    />
                </Form.Group>
                <Button variant='outline-primary' type='submit' style={{ width: '30rem', borderColor: 'black', color: 'black' }}>
                    Создать поисковый запрос
                </Button>
            </Form>

            <Stack sx={{ width: '100%' }} spacing={2}>
                <Collapse in={openSuccess}>
                    <Alert id='succes' severity="success" onClose={() => { setOpenSuccess(false); }}>
                        <AlertTitle>Success</AlertTitle>
                        This is a success alert — <strong>{successValue}!</strong>
                    </Alert>
                </Collapse>
                <Collapse in={openError}>
                    <Alert id='error' severity="error" onClose={() => { setOpenError(false); }}>
                        <AlertTitle>Error</AlertTitle>
                        This is an error alert — <strong>{errorValue}</strong>
                    </Alert>
                </Collapse>
            </Stack>

        </div >
    )
}