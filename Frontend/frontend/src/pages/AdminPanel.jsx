import React from "react"
import CommonSection from "../shared/CommonSection.jsx";
import { Container, Row, ButtonGroup, Button } from "reactstrap";
import Newslatter from './../shared/Newsletter.jsx'
import '../style/adminPanel.css'
import { Link, Outlet} from "react-router-dom";
import { useState, useEffect } from "react";
import AdminTours from "./AdminTours.jsx";

const AdminPanel = () => {

    

    
        const[isAuthorized, setIsAuthorized] = useState(false);
    
        useEffect(() => {
            const checkUserRole = () => {
                try {
                    // Get the user data from your login response
                    const userData = JSON.parse(localStorage.getItem('user'));
                    //console.log("User data:", userData);
    
                    // Check if user exists and has admin role
                    if (userData && userData.role?.toLowerCase() === 'admin') {
                       
                        setIsAuthorized(true);
                    } else {
                        console.log("Not an admin. Current role:", userData?.role);
                        setIsAuthorized(false);
                    }
                } catch (error) {
                    console.error("Error checking role:", error);
                    setIsAuthorized(false);
                }
            };
    
            checkUserRole();
        }, []);


    // Ternary operator to check role
    return isAuthorized ? (
        // If role is admin, show admin panel
        <>
            <CommonSection title={"Admin Panel"} />
            <section>
                <Container className="admin-container">
                    <Row className="justify-content-center mb-4">
                        <ButtonGroup className="btn-group-custom">
                            <Button className="button-custom ">
                                <Link className="link-custom" to="/admin">
                                    All Tours
                                </Link>
                            </Button>
                            <Button className="button-custom ">
                                <Link className="link-custom" to="/admin/adminBooking">
                                    Show Booking Tours
                                </Link>
                            </Button>
                            <Button className="button-custom ">
                                <Link className="link-custom" to="/admin/review">
                                    Show All Reviews
                                </Link>
                            </Button>
                        </ButtonGroup>
                    </Row>
                    <Outlet/>
                </Container>
                
                <div>
                    <Link 
                        className="add-tour-btn position-fixed bottom-0 end-0 m-5" 
                        style={{background:"#9400FF"}} 
                        to={"/addtour/0"}
                    >
                        +
                    </Link>
                </div>
            </section>
            <Newslatter/>
        </>
    ) : (
        // If role is not admin, show error message
        <CommonSection title={"You are not Admin"} />
    )
}

export default AdminPanel;