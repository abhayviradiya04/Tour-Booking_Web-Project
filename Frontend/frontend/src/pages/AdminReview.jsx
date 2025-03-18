import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "reactstrap";
import { BASE_URL } from "../utils/config";
import "../style/admin-review.css";
import Swal from 'sweetalert2';

const AdminReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem('token');
    const reviewsPerPage = 8;

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/api/Review/GetAll`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const result = await response.json();
            console.log("API Response:", result);
            setReviews(result);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load reviews'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
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
                const response = await fetch(`${BASE_URL}/api/Review/Delete/${reviewId}`, {
                    method: 'DELETE',
                    headers: {
                       Authorization:`Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete review');
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Review has been deleted.',
                    timer: 1500,
                    showConfirmButton: false
                });

                fetchReviews();
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete review'
            });
        }
    };

    // Get current reviews for pagination
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

    return (
        <section className="admin-reviews">
            <Container>
                <h2 className="review-title text-center mb-4">All Reviews</h2>

                {loading ? (
                    <div className="text-center loading-spinner">
                        <div className="spinner"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center">
                        <h3>No reviews found</h3>
                    </div>
                ) : (
                    <>
                        <Row>
                            {currentReviews.map((review, index) => (
                                <Col lg="6" className="mb-4" key={review.review_Id || index}>
                                    <Card className="review-card">
                                        <div className="review-card__header">
                                            <div className="user-info">
                                                <i className="ri-user-line"></i>
                                                <h4>{review.userName || 'Anonymous'}</h4>
                                            </div>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteReview(review.review_Id)}
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                        <div className="review-card__body">
                                            <div className="review-info">
                                                <i className="ri-star-fill"></i>
                                                <span>Rating: {review.rating || 'N/A'}</span>
                                            </div>
                                            <div className="review-text">
                                                <p>{review.reviewText || 'No review text'}</p>
                                            </div>
                                            <div className="review-tour">
                                                <i className="ri-map-pin-line"></i>
                                                <span>Tour Name: {review.tourName || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {reviews.length > reviewsPerPage && (
                            <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                                {[...Array(Math.ceil(reviews.length / reviewsPerPage))].map((_, i) => (
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

export default AdminReview;
