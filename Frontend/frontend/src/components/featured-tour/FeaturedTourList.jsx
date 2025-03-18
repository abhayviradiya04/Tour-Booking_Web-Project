import React, { useState, useEffect } from "react";
import TourCard from "../../shared/TourCard";

import { Col } from "reactstrap";
import "../../style/featuredTourList.css";

const FeaturedTourList = () => {
    const [allTours, setAllTours] = useState([]); // Store all tours
    const [tours, setTours] = useState([]); // Store paginated tours
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [pageCount, setPageCount] = useState(0); // Total pages
    const [page, setPage] = useState(0); // Current page
    const token=localStorage.getItem('token');

    // Fetch all tours
    useEffect(() => {
        setLoading(true); // Start loading
        fetch(`http://localhost:5049/api/Tour/GetTours`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched Data:", data); // Debugging log
                if (Array.isArray(data)) {
                    setAllTours(data); // Store all tours
                    setPageCount(Math.ceil(data.length / 8)); // Calculate total pages
                    setTours(data.slice(0, 8)); // Load first 8 tours
                } else {
                    setError("Invalid data structure");
                }
                setLoading(false); // Stop loading
            })
            .catch((error) => {
                console.error("Error:", error);
                setError(error.message); // Set error state
                setLoading(false); // Stop loading even in case of error
            });
    }, []);

    // Handle page change
    useEffect(() => {
        if (allTours.length > 0) {
            setTours(allTours.slice(page * 8, (page + 1) * 8)); // Load tours for the current page
        }
    }, [page, allTours]);

    const featuredTours = tours.filter((tour) => tour.featured === true); // Filter featured tours

    return (
        <>
            {/* Loading Spinner */}
            {loading && (
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
            )}

            {/* Error Message */}
            {error && <h4>{error}</h4>}

            {/* Featured Tours */}
            {!loading &&
                !error &&
                featuredTours.map((tour) => (
                    <Col lg="3" className="mb-4" key={tour.id}>
                        <TourCard tour={tour} />
                    </Col>
                ))}

            {/* No Featured Tours */}
            {!loading && !error && featuredTours.length === 0 && (
                <h4>No featured tours available</h4>
            )}

            {/* Pagination */}
            {pageCount > 1 && (
                <Col lg="12">
                    <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                        {/* Page Numbers */}
                        {[...Array(pageCount).keys()].map((number) => (
                            <span
                                key={number}
                                onClick={() => setPage(number)}
                                className={page === number ? "active__page" : ""}
                            >
                                {number + 1}
                            </span>
                        ))}
                    </div>
                </Col>
            )}
        </>
    );
};

export default FeaturedTourList;
