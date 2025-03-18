import React, { useState, useEffect,useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import '../style/my-tour.css'; // Assuming you will add styles in this file
import { BASE_URL } from '../utils/config'; // Adjust the import based on your config file location
import { Modal, Button, Form } from 'reactstrap'; // Import necessary components from reactstrap
import Swal from 'sweetalert2';
import CommonSection from "../shared/CommonSection";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const MyTour = () => {
    const{user}=useContext(AuthContext);
  const [tourBookings, setTourBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [updatedTourDate, setUpdatedTourDate] = useState('');
  const [updatedNumberOfGuests, setUpdatedNumberOfGuests] = useState(1);
  const token=localStorage.getItem('token');


  

  useEffect(() => {
    const fetchTourBookings = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`${BASE_URL}/api/TourBooking/GetBookingsWithUser/${user.id}`,{
            headers:{
              Authorization:`Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const data = await response.json();
          setTourBookings(data);
          setLoading(false);
        } catch (err) {
          setError(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTourBookings();
  }, [user]);

  const openEditModal = (booking) => {
    setCurrentBooking(booking);
    setUpdatedTourDate(booking.bookAt.split('T')[0]);
    setUpdatedNumberOfGuests(booking.guestSize);
    setIsEditModalOpen(true);
  };

  const openDetailModal = (booking) => {
    setCurrentBooking(booking);
    setIsDetailModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentBooking(null);
    setUpdatedTourDate('');
    setUpdatedNumberOfGuests(1);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setCurrentBooking(null);
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    const updatedBooking = {
      ...currentBooking,
      bookAt: updatedTourDate,
      guestSize: updatedNumberOfGuests,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/TourBooking/Update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedBooking),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      Swal.fire('Success', 'Booking updated successfully', 'success');
      setTourBookings((prev) =>
        prev.map((b) => (b.tourBooking_id === updatedBooking.tourBooking_id ? updatedBooking : b))
      );
      closeEditModal();
    } catch (error) {
      console.error("Error updating booking:", error);
      Swal.fire('Error', 'Failed to update booking', 'error');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/TourBooking/Delete/${bookingId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete booking');
        }

        Swal.fire('Deleted!', 'Your booking has been deleted.', 'success');
        setTourBookings((prev) => prev.filter((b) => b.tourBooking_id !== bookingId));
      } catch (error) {
        console.error("Error deleting booking:", error);
        Swal.fire('Error', 'Failed to delete booking', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="tour-booking-container">
        <CommonSection title={"My Booking Tours"} />
        <div className="booking-list">
          {[1, 2, 3].map((_, index) => (
            <div className="booking-card skeleton-loader" key={index}>
              <div className="skeleton-line tour-name"></div>
              <div className="skeleton-line booking-id"></div>
              <div className="skeleton-line customer-name"></div>
              <div className="skeleton-line guest-size"></div>
              <div className="skeleton-line booking-date"></div>
              <div className="skeleton-line contact-info"></div>
              <div className="skeleton-line email-info"></div>
              <div className="actions">
                <div className="skeleton-circle"></div>
                <div className="skeleton-circle"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="tour-booking-container">
       <CommonSection title={"My Booking Tours"} />
      {tourBookings.length === 0 ? (
        <p className="no-booking">You have no bookings yet.</p>
      ) : (
        <div className="booking-list">
          {tourBookings.map((booking) => (
            <div className="booking-card" key={booking.tourBooking_id}>
              <h3 className="tour-name">{booking.tourName}</h3>
              <p className="booking-id">Booking ID: {booking.tourBooking_id}</p>
              <p className="customer-name">Customer: {booking.customerName}</p>
              <p className="guest-size">Guests: {booking.guestSize}</p>
              <p className="booking-date">Booked At: {new Date(booking.bookAt).toLocaleDateString()}</p>
              <p className="contact-info">Contact: {booking.phone}</p>
              <p className="email-info">Email: {booking.userEmail}</p>
              <div className="actions">
                <button className="view-details-btn me-5" onClick={() => openEditModal(booking)}>
                  <i className="ri-edit-line"></i>
                </button>
                <button className="view-details-btn" onClick={() => handleDeleteBooking(booking.tourBooking_id)}>
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Booking Modal */}
      <Modal isOpen={isEditModalOpen} toggle={closeEditModal}>
        <Form onSubmit={handleEditBooking}>
          <div className="modal-header">
            <h5 className="modal-title">Edit Booking</h5>
            <button type="button" className="btn-close" onClick={closeEditModal} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="tourDate">Tour Date</label>
              <input
                type="date"
                id="tourDate"
                className="form-control"
                value={updatedTourDate}
                onChange={(e) => setUpdatedTourDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="numberOfGuests">Number of Guests</label>
              <input
                type="number"
                id="numberOfGuests"
                className="form-control"
                value={updatedNumberOfGuests}
                onChange={(e) => setUpdatedNumberOfGuests(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button color="secondary" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isDetailModalOpen} toggle={closeDetailModal}>
        <div className="modal-header">
          <h5 className="modal-title">Booking Details</h5>
          <button type="button" className="btn-close" onClick={closeDetailModal} aria-label="Close"></button>
        </div>
        <div className="modal-body">
          {currentBooking && (
            <div>
              <h2>{currentBooking.tourName}</h2>
             
              <p>Customer Name: {currentBooking.customerName}</p>
              <p>Booking Date: {new Date(currentBooking.bookAt).toLocaleDateString()}</p>
              <p>Number of Guests: {currentBooking.guestSize}</p>
              <p>Phone: {currentBooking.phone}</p>
              <p>User Email: {currentBooking.userEmail}</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button color="secondary" onClick={closeDetailModal}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MyTour;
