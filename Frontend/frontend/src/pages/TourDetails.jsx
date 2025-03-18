import React, { useEffect, useRef, useState, useContext } from "react";
import "../style/tour-details.css";
import { Container, Row, Col, Form, ListGroup } from "reactstrap";
import { useParams, Link } from "react-router-dom";
import calculateAvgRating from "./../utils/avgRating";
import avatar from "../assets/images/avatar.jpg";
import Booking from "../components/Booking/Booking";
import Newsletter from "../shared/Newsletter";
import Swal from "sweetalert2";
import AuthContext from "./../context/AuthContext";
import { BASE_URL } from "../utils/config";

const TourDetails = () => {
  const { id } = useParams();
  const reviewMsgRef = useRef("");
  const { user } = useContext(AuthContext);

  const [tourRating, setTourRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadReviews, setReloadReviews] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [updatedReviewText, setUpdatedReviewText] = useState("");
  const [updatedRating, setUpdatedRating] = useState(null);
  const token=localStorage.getItem('token');

  // Fetch tour details
  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/Tour/GetTour/${id}`,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tour details");
        }
        const data = await response.json();
        setTour(data[0]);
        await fetchReviews();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/Review/GetByTourId/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const reviews = await response.json();
      setTour((prev) => {
        if (!prev) return null;
        const { totalRating, avgRating } = calculateAvgRating(reviews);
        return {
          ...prev,
          reviews,
          totalRating,
          avgRating,
        };
      });
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  // Reload reviews when needed
  useEffect(() => {
    if (reloadReviews) {
      fetchReviews();
      setReloadReviews(false);
    }
  }, [reloadReviews]);

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "You need to log in to submit a review.",
      });
      return;
    }

    try {
      const reviewData = {
        UserName: user.username,
        ReviewText: reviewMsgRef.current.value.trim(),
        Rating: parseInt(tourRating),
        UserId: user.id,
        tour_Id: parseInt(id),
      };

      if (!tourRating) {
        Swal.fire({
          icon: "warning",
          title: "Rating Required",
          text: "Please select a rating before submitting your review",
        });
        return;
      }

      const response = await fetch(`${BASE_URL}/api/Review/Add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit review");
      }

      await Swal.fire({
        icon: "success",
        title: "Review Submitted!",
        text: "Thank you for your feedback",
        showConfirmButton: false,
        timer: 1500,
      });

      reviewMsgRef.current.value = "";
      setTourRating(null);
      setHover(null);
      setReloadReviews(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to submit review. Please try again.",
      });
    }
  };

  // Handle review deletion
  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) {
      console.error("Review ID is undefined. Cannot delete review.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Review ID is not valid.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/api/Review/Delete/${reviewId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error("Failed to delete review");
        }

        Swal.fire({
          icon: "success",
          title: "Review Deleted!",
          text: "Your review has been successfully deleted.",
          showConfirmButton: false,
          timer: 1500,
        });

        setReloadReviews(true);
      } catch (error) {
        console.error("Error deleting review:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to delete review. Please try again.",
        });
      }
    }
  };

  // Handle review editing
  const handleEditReview = (review) => {
    setEditReview(review);
    setUpdatedReviewText(review.reviewText);
    setUpdatedRating(review.rating);
  };

  // Submit edited review
  const submitEditReview = async () => {
    if (!editReview) return;

    const updatedReview = {
      ...editReview,
      reviewText: updatedReviewText,
      rating: updatedRating,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/Review/Update/${editReview.review_Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(updatedReview),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update review");
      }

      Swal.fire({
        icon: "success",
        title: "Review Updated!",
        text: "Your review has been successfully updated.",
        showConfirmButton: false,
        timer: 1500,
      });

      // Refresh reviews after update
      setEditReview(null);
      setUpdatedReviewText("");
      setUpdatedRating(null);
      fetchReviews(); // Re-fetch reviews to get the updated list
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to update review. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center pt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center pt-5">
        <h4 className="text-danger">{error}</h4>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="text-center pt-5">
        <h4>Tour not found</h4>
      </div>
    );
  }

  const { photo, title, description, price, address, reviews = [], city, distance, maxGroupSize } = tour;
  const { totalRating, avgRating } = calculateAvgRating(reviews);

  return (
    <>
      <section>
        <Container>
          <Row>
            <Col lg="8">
              <div className="tour__content">
                <img src={photo} alt={title} />
                <div className="tour__info">
                  <h2>{title}</h2>
                  <div className="d-flex align-items-center gap-5">
                    <span className="tour__rating d-flex align-items-center gap-1">
                      <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }}></i>
                      {avgRating === 0 ? null : avgRating}
                      {totalRating === 0 ? "Not rated" : <span>({reviews.length})</span>}
                    </span>
                    <span><i className="ri-map-pin-user-fill"></i> {address}</span>
                  </div>

                  <div className="tour__extra-details">
                    <span><i className="ri-map-pin-2-line"></i> {city}</span>
                    <span><i className="ri-money-dollar-circle-line"></i> ${price} /per person</span>
                    <span><i className="ri-map-pin-time-line"></i> {distance} km</span>
                    <span><i className="ri-group-line"></i> {maxGroupSize} people</span>
                  </div>

                  <h5>Description</h5>
                  <p>{description}</p>
                </div>

                <div className="tour__reviews mt-4">
                  <h4>Reviews ({reviews?.length} reviews)</h4>
                  {user ? (
  <Form onSubmit={handleSubmitReview}>
    <div className="d-flex align-items-center gap-3 mb-4 rating__group">
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star}>
          <input
            type="radio"
            name="rating"
            value={star}
            onChange={() => setTourRating(star)}
            className="d-none"
          />
          <i
            className={`ri-star-${star <= (hover || tourRating) ? "fill" : "line"}`}
            style={{
              color: star <= (hover || tourRating) ? "#9400FF" : "#ccc",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
          />
        </label>
      ))}
    </div>

    <div className="review__input">
      <input type="text" ref={reviewMsgRef} placeholder="Share your thoughts..." required />
      <button className="btn primary__btn text-white">Submit Review</button>
    </div>
  </Form>
) : (
  <p className="text-danger">
    <Link to="/login">Log in</Link> to submit a review.
  </p>
)}


                  <ListGroup className="user__reviews">
                    {reviews?.length > 0 ? (
                      reviews.map((review) => (
                        <div className="review__item" key={review.review_Id}>
                          <img src={avatar} alt="user" />
                          <div className="w-100">
                            <div className="d-flex align-items-center justify-content-between">
                              <div>
                                <h5>{review.userName}</h5>
                                <p>
                                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <span className="d-flex align-items-center">
                                {review.rating}
                                <i className="ri-star-s-fill"></i>
                              </span>
                            </div>
                            <h6>{review.reviewText}</h6>

                            {/* Delete & Edit */}
                            {user && review.userId === user.id && (
                              <div className="review__actions">
                                <i
                                  className="ri-delete-bin-line text-danger  icon"
                                  
                                  onClick={() => handleDeleteReview(review.review_Id)}
                                ></i>
                                <i
                                  className="ri-edit-line text-primary icon"
                                  
                                  onClick={() => handleEditReview(review)}
                                ></i>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        <p>No reviews yet for this tour. Be the first to review!</p>
                      </div>
                    )}
                  </ListGroup>
                </div>
              </div>
            </Col>

            <Col lg="4">
            {user ? (
  <Booking tour={tour} />
) : (
  <p className="text-danger">
    <Link to="/login">Log in</Link> to book this tour.
  </p>
)}

            </Col>
          </Row>
        </Container>
      </section>

      <Newsletter />

      {/* Edit Review Modal */}
      {editReview && (
        <div className="edit-review-modal">
          <div className="modal-content">
          <h5>Edit Review</h5>
<textarea
  value={updatedReviewText}
  onChange={(e) => setUpdatedReviewText(e.target.value)}
  rows="4"
  placeholder="Edit your review here"
/>
<div className="d-flex gap-2">
  {[1, 2, 3, 4, 5].map((star) => (
    <label key={star}>
      <input
        type="radio"
        name="rating"
        value={star}
        onChange={() => setUpdatedRating(star)}
        className="d-none"
      />
      <i
        className={`ri-star-${star <= updatedRating ? "fill" : "line"}`}
        style={{
          color: star <= updatedRating ? "#9400FF" : "#ccc",
          cursor: "pointer",
          transition: "color 0.3s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.2)"}  // Hover effect
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}  // Reset size when hover ends
      />
    </label>
  ))}
</div>
 <button onClick={submitEditReview} className="btn-1">Submit</button>
            <button onClick={() => setEditReview(null)} className="btn-2">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default TourDetails;
