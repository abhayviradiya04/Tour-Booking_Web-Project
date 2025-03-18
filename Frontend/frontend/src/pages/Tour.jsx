import React, { useState, useEffect } from "react";
import CommonSection from "../shared/CommonSection";
import "../style/tour.css";
import TourCard from "../shared/TourCard";
import SearchBar from "../shared/SearchBar";
import Newslatter from "../shared/Newsletter";
import { Container, Row, Col } from "reactstrap";

const Tour = () => {
    const [allTours, setAllTours] = useState([]); // Store all tours
    const [displayedTours, setDisplayedTours] = useState([]); // Store tours to display
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(0);
    const [showContent, setShowContent] = useState(false);
    const token=localStorage.getItem('token');

    // Fetch all tours
    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5049/api/Tour/GetTours',{
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                })
                const data = await response.json();

                if (Array.isArray(data)) {
                    setAllTours(data);
                    setPageCount(Math.ceil(data.length / 8));
                    setDisplayedTours(data.slice(0, 8)); // Display the first 8 tours
                } else {
                    throw new Error("Invalid data structure");
                }
                setTimeout(() => {
                    setLoading(false);
                    setShowContent(true);
                }, 500); // 0.5 second delay
            } catch (err) {
                console.error('Error fetching tours:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    // Handle page change
    useEffect(() => {
        if (allTours.length > 0) {
            const startIndex = page * 8;
            const endIndex = startIndex + 8;
            setDisplayedTours(allTours.slice(startIndex, endIndex));
        }
    }, [page, allTours]);

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Search function
    const handleSearch = async (searchTerm) => {
        try {
            const response = await fetch(`http://localhost:5049/api/Tour/SearchTours/search?title=${searchTerm}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("No tours available matching the search criteria.");
            }
            const filteredTours = await response.json();
            setDisplayedTours(filteredTours);
            setPageCount(Math.ceil(filteredTours.length / 8)); // Update page count based on filtered results
            setPage(0); // Reset to the first page
        } catch (error) {
            console.error(error);
            setDisplayedTours([]); // Clear displayed tours if there's an error
            setError(error.message); // Set error message to display
        }
    };

    return (
        <>
            <CommonSection title={"All Tours"} />
            <section>
                <Container>
                    <Row>
                        <SearchBar onSearch={handleSearch} />
                    </Row>
                </Container>
            </section>

            <section className="pt-0">
                <Container>
                    {/* Loading Spinner */}
                    {loading && (
                        <div className="centered-loader">
                            <div id="wifi-loader">
                                <svg className="circle-outer" viewBox="0 0 86 86">
                                    <circle className="back" cx="43" cy="43" r="40"></circle>
                                    <circle className="front" cx="43" cy="43" r="40"></circle>
                                    <circle className="new" cx="43" cy="43" r="40"></circle>
                                </svg>
                                <svg className="circle-middle" viewBox="0 0 60 60">
                                    <circle className="back" cx="30" cy="30" r="27"></circle>
                                    <circle className="front" cx="30" cy="30" r="27"></circle>
                                </svg>
                                <svg className="circle-inner" viewBox="0 0 34 34">
                                    <circle className="back" cx="17" cy="17" r="14"></circle>
                                    <circle className="front" cx="17" cy="17" r="14"></circle>
                                </svg>
                                <div className="text" data-text="Loading"></div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !loading && (
                        <div className="text-center pt-5">
                            <h4 className="text-danger">Error: {error}</h4>
                            <button 
                                className="btn btn-primary mt-3"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Tours List */}
                    {!loading && !error && (
                        <Row>
                            {displayedTours.length > 0 ? (
                                displayedTours.map((tour) => (
                                    <Col lg="3" md="6" sm="6" className="mb-4" key={tour.tour_Id}>
                                        <TourCard tour={tour} />
                                    </Col>
                                ))
                            ) : (
                                <div className="text-center pt-5">
                                    <h4>No Tours Available</h4>
                                </div>
                            )}

                            {/* Pagination */}
                            {pageCount > 1 && (
                                <Col lg="12">
                                    <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                                        {/* Page Numbers */}
                                        {[...Array(pageCount).keys()].map((number) => (
                                            <span
                                                key={number}
                                                onClick={() => handlePageClick(number)}
                                                className={page === number ? "active__page" : ""}
                                            >
                                                {number + 1}
                                            </span>
                                        ))}
                                    </div>
                                </Col>
                            )}
                        </Row>
                    )}
                </Container>
            </section>

            <Newslatter />
        </>
    );
};

export default Tour;