import React from "react";
import { Card, CardBody } from "reactstrap";
import { Link } from 'react-router-dom';
import "./tour-card.css";
// import calculateAvgRating from "../utils/avgRating";


const TourCard = ({ tour }) => {

    const { tour_Id, title, city, photo, price, featured } = tour;
    // const { totalRating, avgRating } = calculateAvgRating(reviews);
  
    return (
        <>
            <div className="tour__card">
                <Card>
                    <div className="tour__img">
                        <img src={photo} alt="tour-img" style={{ height: "200px", objectFit: "cover" }} />
                        {featured && <span>Featured</span>}
                    </div>
                </Card>

                <CardBody>
                    <div className="card__top d-flex align-items-center justify-content-between">
                        <span className="tour__location d-flex align-items-center gap-1">
                            <i className="ri-map-pin-line"></i>{city}
                        </span>
                        <span className="tour__rating d-flex align-items-center gap-1">
                            <Link to={`/tour/${tour_Id}#reviews`} className="rating-link" aria-label="View Reviews">
                                <i className="ri-star-fill"></i>
                            </Link>
                            {/* {avgRating} */}
                        </span>
                    </div>

                    <h5 className="tour__title">
                        <Link to={`/tour/${tour_Id}`}>{title}</Link>
                    </h5>

                    <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
                        <h5>
                            ${price}<span> /per person</span>
                        </h5>
                        <button className="btn booking__btn">
                            <Link to={`/tour/${tour_Id}`}>Book Now</Link>
                        </button>
                    </div>
                </CardBody>
            </div>
        </>
    )
}

export default TourCard;
