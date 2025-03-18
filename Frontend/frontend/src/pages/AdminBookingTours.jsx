import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "reactstrap";
import { BASE_URL } from "../utils/config";
import "../style/admin-booking-tours.css";
import Swal from 'sweetalert2';

const AdminBookingTour = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const bookingsPerPage = 8;

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBookings();
    }, []);

    // Fetch all bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/TourBooking/GetTourBookings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const result = await response.json();
            console.log("API Response:", result);
            setBookings(result);
            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load bookings'
            });
        } finally {
            setLoading(false);
        }
    };

    // Delete booking
    const handleDelete = async (bookingId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const response = await fetch(`${BASE_URL}/api/TourBooking/Delete/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete booking');
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Booking has been deleted.',
                    timer: 1500,
                    showConfirmButton: false
                });

                fetchBookings();
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete booking'
            });
        }
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    // Get current bookings for pagination
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

    return (
        <section className="booking-tours">
            <Container>
                <h2 className="booking-title text-center mb-4">Tour Bookings</h2>

                {loading ? (
                    <div className="text-center loading-spinner">
                        <div className="spinner"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center">
                        <h3>No bookings found</h3>
                    </div>
                ) : (
                    <>
                        <Row>
                            {currentBookings.map((booking, index) => (
                                <Col lg="6" className="mb-4" key={booking.tourBooking_id || index}>
                                    <Card className="booking-card">
                                        <div className="booking-card__header">
                                            <h4>{booking.customerName || 'No Name'}</h4>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDelete(booking.tourBooking_id)}
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                        <div className="booking-card__body">
                                            <div className="booking-info">
                                                <i className="ri-map-pin-line"></i>
                                                <span>Tour: {booking.tourName || 'N/A'}</span>
                                            </div>
                                            <div className="booking-info">
                                                <i className="ri-group-line"></i>
                                                <span>Guests: {booking.guestSize || 0}</span>
                                            </div>
                                            <div className="booking-info">
                                                <i className="ri-phone-line"></i>
                                                <span>Phone: {booking.phone || 'N/A'}</span>
                                            </div>
                                            <div className="booking-info">
                                                <i className="ri-mail-line"></i>
                                                <span>Email: {booking.userEmail || 'N/A'}</span>
                                            </div>
                                            <div className="booking-info">
                                                <i className="ri-calendar-line"></i>
                                                <span>Booked on: {formatDate(booking.bookAt)}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {bookings.length > bookingsPerPage && (
                            <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                                {[...Array(Math.ceil(bookings.length / bookingsPerPage))].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`page__numbers ${currentPage === i + 1 ? "active" : ""}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>
        </section>
    );
};

export default AdminBookingTour;

