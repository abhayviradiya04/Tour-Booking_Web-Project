import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './../pages/Home';
import Tours from "./../pages/Tour";
import TourDetails from './../pages/TourDetails';
import Login from "./../pages/Login";
import Register from './../pages/Register';
import SearchResultList from "./../pages/SearchResultList";
import ThankYou from "../pages/ThankYou";
import About from "../pages/About";
import AdminPanel from "../pages/AdminPanel";
import BookingTour from "../pages/BookingTour";
import AdminTours from "../pages/AdminTours";
import AdminBookingTours from "../pages/AdminBookingTours";
import Form from "../pages/TourAddForm";
import MesonryImagesGallery from "../components/Image-gallery/MesonryImagesGallery";
import AdminReview from "../pages/AdminReview";
import MyTour from "../pages/MyTour";
import PaymentForm from "../pages/PaymentForm";

const Routers = () => {
    return (
        <Routes>
            {/* Default Redirect to Home */}
            <Route path="/" element={<Navigate to='/home' />} />
            
            {/* Public Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tour/:id" element={<TourDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/tours/search" element={<SearchResultList />} />
            <Route path="/gallery" element={<MesonryImagesGallery />} />
            
            {/* Protected Routes */}
            <Route path="/bookingtour" element={<BookingTour />} />
            <Route path="/paymentform" element={<PaymentForm />} />
            <Route path="/mytour" element={<MyTour />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminPanel />}>
                <Route index element={<AdminTours />} />
                <Route path="adminBooking" element={<AdminBookingTours />} />
                <Route path="review" element={<AdminReview />} />
            </Route>
            
            {/* Tour Add Form (For both Add & Edit Tour) */}
            <Route path="/addtour" element={<Form />} />
            <Route path="/addtour/:id" element={<Form />} />
        </Routes>
    );
};

export default Routers;
