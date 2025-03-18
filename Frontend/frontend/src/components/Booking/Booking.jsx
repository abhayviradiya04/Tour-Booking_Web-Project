import { React, useState, useContext } from "react";
import './booking.css'
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from 'reactstrap';
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.js";
import { BASE_URL } from "../../utils/config.js";
import Swal from "sweetalert2";
import { loadScript } from "./razorpayUtils"; // Create this utility function

const Booking = ({ tour, avgRating }) => {
    const { price, reviews, title, tour_Id } = tour;
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const token=localStorage.getItem('token');

    const [booking, setBooking] = useState({
        tourBooking_id: 0,
        tourName: title,
        customerName: user ? user.username : "",
        guestSize: 1,
        phone: "",
        bookAt: "",
        updatedAt: new Date().toISOString(),
        userId: user && user.id,
        userEmail: user && user.email,
        tour_id: tour_Id
    });

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    };

    const validateGuestSize = (size) => {
        const guestNumber = parseInt(size);
        return guestNumber > 0 && guestNumber <= tour.maxGroupSize; // Add maximum limit check
    };

    const handlechange = e => {
        const { id, value } = e.target;

        if (id === 'phone') {
            const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
            setBooking(prev => ({ ...prev, [id]: phoneNumber }));
            return;
        }

        if (id === 'guestSize') {
            if (value === '' || /^\d+$/.test(value)) {
                const guestNumber = value === '' ? value : parseInt(value);
                setBooking(prev => ({ ...prev, [id]: guestNumber }));
            }
            return;
        }

        setBooking(prev => ({ ...prev, [id]: value }));
    };

    const serviceFee = 10;
    const totalAmount = Number(price) * Number(booking.guestSize) + Number(serviceFee);

    const handleClick = async e => {
        e.preventDefault();

        if (!user || !validatePhone(booking.phone) || !validateGuestSize(booking.guestSize)) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Sign In',
                text: 'You need to login to book a tour'
            });
            return;
        }

        try {
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

            if (!res) {
                console.error('Razorpay SDK failed to load');
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: 'Razorpay SDK failed to load'
                });
                return;
            }

            const finalAmount = Number(price) * Number(booking.guestSize) + Number(serviceFee);

            const options = {
                key: "rzp_test_2K2eGnhmTiYi44", // Your Razorpay Key ID
                amount: finalAmount * 100,
                currency: "INR",
                name: "Tour Booking",
                description: `Booking for ${booking.tourName}`,
                handler: async function (response) {
                    try {
                        // First save the booking
                        const bookingData = {
                            ...booking,
                            updatedAt: new Date().toISOString()
                        };

                         console.log('Sending booking data:', bookingData); // Debug log

                        const bookingResponse = await fetch(`${BASE_URL}/api/TourBooking/Add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(bookingData)
                        });

                        if (!bookingResponse.ok) {
                            throw new Error('Failed to save booking');
                        }

                        const savedBooking = await bookingResponse.json();
                        // console.log('Complete booking response:', savedBooking);

                        // Wait a short time to ensure the booking is saved
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Make a separate call to get the latest booking
                        const getBookingResponse = await fetch(`${BASE_URL}/api/TourBooking/GetLatestBooking`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        });

                        if (!getBookingResponse.ok) {
                            throw new Error('Failed to get booking ID');
                        }

                        const latestBooking = await getBookingResponse.json();
                        const bookingId = latestBooking.tourBooking_id;

                        if (!bookingId) {
                            throw new Error('Could not get valid booking ID');
                        }

                        // Prepare payment data
                        const paymentData = {
                            paymentId: 0,
                            transactionId: response.razorpay_payment_id,
                            tourId: parseInt(booking.tour_id),
                            price: parseFloat(finalAmount),
                            status: "Success",
                            bookingId: bookingId,
                            createdAt: new Date().toISOString()
                        };

                        // console.log('Sending payment data with bookingId:', bookingId);
                        // console.log('Complete payment data:', paymentData);

                        const paymentResponse = await fetch(`${BASE_URL}/api/Payment/Add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(paymentData)
                        });

                        if (!paymentResponse.ok) {
                            const errorData = await paymentResponse.json();
                            console.error('Payment API Error:', errorData);
                            throw new Error(errorData.message || 'Failed to save payment details');
                        }

                        const savedPayment = await paymentResponse.json();
                        // console.log('Payment saved successfully:', savedPayment);

                        // After successful payment and saving
                        const emailResponse = await fetch(`${BASE_URL}/api/TourBooking/SendBookingConfirmation`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            }
                        });
                        
                        if (!emailResponse.ok) {
                            throw new Error('Failed to send confirmation email');
                        }

                        const emailResult = await emailResponse.json();

                        if (emailResult.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Booking Successful',
                                text: 'Your tour has been booked successfully! A confirmation email has been sent.'
                            });
                        } else {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Booking Successful',
                                text: 'Your tour has been booked successfully, but the confirmation email could not be sent.'
                            });
                        }

                        navigate('/');

                    } catch (error) {
                        console.error('Error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'An error occurred. Please try again.'
                        });
                    }
                },
                prefill: {
                    name: booking.customerName,
                    email: booking.userEmail,
                    contact: booking.phone
                },
                theme: {
                    color: "#9400FF"
                },
                modal: {
                    ondismiss: function() {
                        Swal.fire({
                            icon: 'info',
                            title: 'Payment Cancelled',
                            text: 'Your payment was cancelled. Please try again.'
                        });
                    }
                },
                notes: {
                    "booking_id": "temp_" + Date.now()
                },
                retry: {
                    enabled: true,
                    max_count: 1
                }
            };

            // console.log('Razorpay Options:', { 
            //     ...options, 
            //     amount: options.amount,
            //     key: "Key provided: " + (options.key ? "Yes" : "No")
            // });

            const paymentObject = new window.Razorpay(options);
            
            paymentObject.on('payment.failed', function (response){
                console.error('Payment Failed:', response.error);
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: response.error.description
                });
            });

            paymentObject.open();

        } catch (error) {
            console.error('Razorpay Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: error.message || 'There was an error initiating the payment'
            });
        }
    };

    return (
        <div className="booking">
            <div className="booking__top d-flex align-items-center justify-content-between">
                <h3>${price} <span>/per person/</span></h3>
                <span className="tour__rating d-flex align-items-center">
                    <i className="ri-star-fill"></i>
                    {avgRating === 0 ? null : avgRating} ({reviews?.length})
                </span>
            </div>

            <div className="booking__form">
                <h5>Information</h5>
                <Form className="booking__info-form" onSubmit={handleClick}>
                    <FormGroup>
                        <input
                            type="text"
                            placeholder="Enter Your Email"
                            id="fullName"
                            required
                            onChange={handlechange}
                            value={booking.userEmail}
                        />
                    </FormGroup>
                    <FormGroup>
                        <input
                            type="number"
                            placeholder="Phone"
                            id="phone"
                            required
                            onChange={handlechange}
                            value={booking.phone}
                            pattern="[0-9]{10}"
                        />
                    </FormGroup>
                    <FormGroup className="d-flex align-items-center gap-3">
                        <input
                            type="date"
                            placeholder=""
                            id="bookAt"
                            required
                            onChange={handlechange}
                            value={booking.bookAt}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <input
                            type="number"
                            placeholder={`Guest (max ${tour.maxGroupSize})`}
                            id="guestSize"
                            required
                            onChange={handlechange}
                            value={booking.guestSize}
                            min={1}
                        />
                    </FormGroup>
                </Form>
            </div>

            <div className="booking__bottom">
                <ListGroup>
                    <ListGroupItem className="border-0 px-0">
                        <h5 className="d-flex align-items-center gap-1">
                            ${price} <i className="ri-close-line"></i> {booking.guestSize || 1} person
                        </h5>
                        <span>${price * (booking.guestSize || 1)}</span>
                    </ListGroupItem>
                    <ListGroupItem className="border-0 px-0">
                        <h5>Service charge</h5>
                        <span>${serviceFee}</span>
                    </ListGroupItem>
                    <ListGroupItem className="border-0 px-0 total">
                        <h5>Total</h5>
                        <span>${totalAmount}</span>
                    </ListGroupItem>
                </ListGroup>

                <Button
                    className="btn w-100 mt-4"
                    style={{ background: "#9400FF" }}
                    onClick={handleClick}
                >
                    Book Now
                </Button>
            </div>
        </div>
    );
};

export default Booking;
