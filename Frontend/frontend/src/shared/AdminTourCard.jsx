import { React, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, Col, Row } from "reactstrap";

import "./admin-tour-card.css";
import { BASE_URL } from "../utils/config";

const AdminTourCard = ({ tour }) => {
  const token=localStorage.getItem('token');
    const {
        tour_Id,
        title,
        city,
        photo,
        price,
        featured,
        description
    } = tour || {};
    const handleDelete = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/Tour/Delete/${tour_Id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                    
                }
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error("Failed to delete tour");
            }
        } catch (error) {
            console.error("Error deleting tour:", error);
        }
    };

    if(!tour) return <h1>No data found...</h1>;



    return (
        <div className="tour__card">
            <Card>
                <div className="tour__img">
                    <img src={photo} alt="tour-img" className="card-img-top" />
                    {featured && <span>Featured</span>}
                </div>
            </Card>

            <CardBody>
                <div className="card__top d-flex align-items-center justify-content-between">
                    <span className="tour__location d-flex align-items-center gap-1">
                        <i className="ri-map-pin-line"></i>
                        {city}
                    </span>

                </div>

                <h5 className="tour__title">
                    <Link to={`/tour/${tour_Id}`}>{title}</Link>
                </h5>

                <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
                    <h5>${price}<span> /per person/</span></h5>
                </div>

                <div>
                    <Row className="mt-3">
                        <Col>
                            <Link to={`/addtour/${tour_Id}`} className="btn booking__btn1 ms-5 link-light">Update</Link>
                        </Col>
                        <Col>
                            <Button className="btn booking__btn1" onClick={handleDelete}>Delete</Button>
                        </Col>
                    </Row>
                </div>
            </CardBody>
        </div>
    )
}

export default AdminTourCard;
