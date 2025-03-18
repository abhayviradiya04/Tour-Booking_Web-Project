import React, { useState } from "react";
import '../style/register.css';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import registerImg from '../assets/images/register.png';
import userIcon from '../assets/images/user2.png';
import { BASE_URL } from './../utils/config.js';
import Swal from 'sweetalert2';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword:'',
        
    });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const[error,setErrors] =useState({});
    

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        }
        if (!/[0-9]/.test(password)) {
            errors.push("Password must contain at least one number");
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push("Password must contain at least one special character (!@#$%^&*)");
        }
        return errors;
    };
     // Email validation function
     const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const sendOtp = async () => {
        if (!validateEmail(formData.email)) {
            Swal.fire('Error', 'Invalid email format.', 'error');
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/User/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
            
            setOtpSent(true);
            Swal.fire('OTP Sent', 'Check your email for the OTP.', 'success');
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const verifyOtp = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/User/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'OTP verification failed');
            
            setIsVerified(true);
            Swal.fire('Verified!', 'OTP verification successful.', 'success');
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateEmail(formData.email)) {
            Swal.fire('Error', 'Invalid email format.', 'error');
            return;
        }
        if (!isVerified) {
            Swal.fire('Error', 'Please verify your OTP first.', 'error');
            return;
        }
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            Swal.fire('Password Error', passwordErrors.join('\n'), 'error');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Passwords do not match.', 'error');
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'user' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');
            
            Swal.fire('Success!', 'Registration successful!', 'success')
                .then(() => navigate('/login'));
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    return (
        <section>
            <Container>
                <Row>
                    <Col lg='8' className="m-auto">
                        <div className="register__contain d-flex justify-content-between">
                            <div className="register__img">
                                <img src={registerImg} alt="Register" />
                            </div>
                            <div className="register__form">
                                <div className="user">
                                    <img src={userIcon} alt="User" />
                                </div>
                                <h2>Register</h2>
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <input type="text" placeholder="Enter Username" required name="username" value={formData.username} onChange={handleChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <input type="email" placeholder="Enter Email" required name="email" value={formData.email} onChange={handleChange} />
                                    </FormGroup>
                                    {!otpSent ? (
                                        <Button type="button"className="btonclick ms-0 mb-3 mt-0" onClick={sendOtp}>Send OTP</Button>
                                    ) : (
                                        <>
                                            <FormGroup>
                                                <input type="text" placeholder="Enter OTP" required value={otp} onChange={e => setOtp(e.target.value)} />
                                            </FormGroup>
                                            <Button type="button" className="btonclick" onClick={verifyOtp} disabled={isVerified}>Verify OTP</Button>
                                        </>
                                    )}
                                    <FormGroup>
                                        <input type="password" placeholder="Enter Password" required name="password" value={formData.password} onChange={handleChange} />
                                    </FormGroup>
                                    <FormGroup>
                                        <input type="password" placeholder="Confirm Password" required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                                    </FormGroup>
                                    <Button className="btn secondary__btn auth__btn" type="submit" disabled={!isVerified}>Create Account</Button>
                                </Form>
                                <p>Already have an Account? <Link to='/login'>Login</Link></p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Register;
