import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/config";
import "../style/admin-tours.css";

import AdminTourCard from "../shared/AdminTourCard";

const AdminTours = () => {
    const [tours, setTours] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [toursPerPage] = useState(8);
    const [loading, setLoading] = useState(false);
    const token=localStorage.getItem('token');

    useEffect(() => {
        fetchTours();
    }, []);

    const fetchTours = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/Tour/GetTours`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            const data = await response.json();
            setTours(data);
        } catch (error) {
            console.error("Error fetching tours:", error);
        }
        setLoading(false);
    };

    // Get current tours
    const indexOfLastTour = currentPage * toursPerPage;
    const indexOfFirstTour = indexOfLastTour - toursPerPage;
    const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);

    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <section className="admin-tours">
            <Container>
                <Row>
                    <Col lg="12">
                        <div className="admin-tours-header">
                            <h4>All Tours</h4>
                            
                        </div>

                        {loading ? (
                            <div className="text-center">
                                <h4>Loading....</h4>
                            </div>
                        ) : (
                            <>
                                <Row>
                                    {currentTours?.map(tour => (
                                        <Col lg="3" md="6" sm="6" className="mb-4" key={tour.tour_Id}>
                                            <AdminTourCard tour={tour} onRefresh={fetchTours} />
                                        </Col>
                                    ))}
                                </Row>

                                <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                                    {[...Array(Math.ceil(tours.length / toursPerPage))].map((_, i) => (
                                        <span
                                            key={i}
                                            onClick={() => paginate(i + 1)}
                                            className={`page__numbers ${currentPage === i + 1 ? "active" : ""}`}
                                        >
                                            {i + 1}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default AdminTours;