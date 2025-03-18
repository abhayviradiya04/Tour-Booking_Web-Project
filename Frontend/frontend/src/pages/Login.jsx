import React, { useState, useContext } from "react"
import '../style/login.css'
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap'
import { Link, useNavigate } from 'react-router-dom';
import loginImg from '../assets/images/login.png'
import userIcon from '../assets/images/user2.png'
import AuthContext from '../context/AuthContext.js'
import { BASE_URL } from './../utils/config.js'
import Swal from 'sweetalert2';

const Login = () => {
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        username: '',
        email: '',           // Added email field
        password: '',
        role: 'user',        // Added role field
        id: 0,               // Added id field if needed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const handleChange = e => {
        setCredentials(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${BASE_URL}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: credentials.username, // Ensure this is the correct username
                    password: credentials.password, // Ensure this is the correct password
                   
                })
            });
            


            if (!response.ok) {
                const errorData = await response.json(); // Get the error response
                throw new Error(errorData.title || 'Login failed');
            }

            const data = await response.json();
            

            // Set user and expiration time in local storage
            const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 day in milliseconds
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('expirationTime', expirationTime); 
            localStorage.setItem('token',data.token)

            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: data.message || 'Logged in successfully!'
            }).then(() => {
                navigate('/');
            });

        } catch (err) {
            console.error('Login error:', err);
            dispatch({ type: 'LOGIN_FAILURE', payload: err.message });

            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: err.message || 'Invalid credentials'
            });
        }
    };
    return (
        <section>
            <Container>
                <Row>
                    <Col lg='8' className="m-auto">
                        <div className="login__contain d-flex justify-content-between">
                            <div className="login__img">
                                <img src={loginImg} alt="Login" />
                            </div>

                            <div className="login__form">
                                <div className="user">
                                    <img src={userIcon} alt="User" />
                                </div>
                                <h2>Login</h2>

                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <input
                                            type="text"
                                            placeholder="Enter Username"
                                            required
                                            name="username"
                                            value={credentials.username}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>
                                   
                                    <FormGroup>
                                        <input
                                            type="password"
                                            placeholder="Enter Password"
                                            required
                                            name="password"
                                            value={credentials.password}
                                            onChange={handleChange}
                                        />
                                    </FormGroup>
                                    {/* Hidden input for role */}
                                    <input
                                        type="hidden"
                                        name="role"
                                        value={credentials.role}
                                    />
                                    <Button
                                        className="btn auth__btn"
                                        type="submit"
                                    >
                                        Login
                                    </Button>
                                </Form>
                                <p>Don't have an Account? <Link to='/register'>Create</Link></p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Login;