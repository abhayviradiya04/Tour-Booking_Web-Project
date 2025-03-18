import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState("pending");
    const bookingData = location.state?.bookingData;  // Accessing passed booking data
    const token=localStorage.getItem('token');

    useEffect(() => {
        if (bookingData) {
            createRazorpayPayment();
        }
    }, [bookingData]);

    const createRazorpayPayment = async () => {

        try {
            
            // Making an API call to the backend to create Razorpay order
            const response = await fetch("http://localhost:5049/api/payment/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: bookingData.price,  // Use actual price from bookingData
                    currency: "INR", // INR for Indian Rupees
                }),
            });

            const data = await response.json();

            if (data && data.order_id) {
                // Razorpay Payment Options
                const options = {
                    key: "rzp_test_2K2eGnhmTiYi44", // Your Razorpay Key
                    amount: data.amount * 100, // Convert to paise
                    currency: data.currency,
                    order_id: data.order_id, // Razorpay Order ID
                    name: bookingData.TourName,
                    description: `Payment for ${bookingData.TourName}`,
                    handler: function (response) {
                        handlePaymentSuccess(response);
                    },
                    prefill: {
                        name: bookingData.CustomerName,
                        email: "customer@example.com",
                        contact: bookingData.Phone,
                    },
                    theme: {
                        color: "#F37254", // Razorpay color theme
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();
            } else {
                throw new Error("Failed to create Razorpay order");
            }
        } catch (error) {
            console.error("Error creating Razorpay payment:", error);
            setPaymentStatus("failed");
        }
    };

    const handlePaymentSuccess = async (paymentResponse) => {
        try {
            // Send payment info to backend API to store payment details
            const paymentInfo = {
                TransactionId: paymentResponse.razorpay_payment_id,
                TourId: bookingData.tour_id,
                Price: bookingData.price, // Ensure actual price is used
                Status: "Success",
                BookingId: bookingData.tourBooking_id,
            };

            const paymentResponse = await fetch("http://localhost:5049/api/Payment/Add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(paymentInfo),
            });

            if (!paymentResponse.ok) {
                throw new Error("Failed to store payment data.");
            }

            // After storing payment info, store the booking details
            const bookingResponse = await fetch("http://localhost:5049/api/TourBooking/Add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bookingData),
            });

            if (!bookingResponse.ok) {
                throw new Error("Failed to store booking data.");
            }

            setPaymentStatus("successful");
            navigate("/booking-success"); // Navigate to success page after successful booking
        } catch (error) {
            console.error("Error handling payment success:", error);
            setPaymentStatus("failed");
        }
    };

    return (
        <div>
            <h1>Payment</h1>
            {paymentStatus === "pending" && <p>Processing payment...</p>}
            {paymentStatus === "successful" && <p>Payment successful! Booking confirmed.</p>}
            {paymentStatus === "failed" && <p>Payment failed. Please try again.</p>}
        </div>
    );
};

export default PaymentForm;
