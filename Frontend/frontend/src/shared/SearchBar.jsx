import React, { useRef } from "react";
import './search-bar.css';
import { Col, Form, FormGroup } from 'reactstrap';
import { BASE_URL } from './../utils/config.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

const SearchBar = ({ onSearch }) => {
    const locationRef = useRef('');
    const distanceRef = useRef(0);
    const maxGroupRef = useRef(0);
    const navigate = useNavigate();

    const searchHandler = (event) => {
        event.preventDefault(); // Prevent default form submission

        const location = locationRef.current.value;

        // If location is empty, show an error
        if (location === '') {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Location is required'
            });
            return;
        }

        // Call the onSearch function passed from the parent component
        onSearch(location);
    };

    return (
        <Col lg='12'>
            <div className="search__bar">
                <Form className="d-flex align-items-center gap-4" onSubmit={searchHandler}>
                    <FormGroup className="d-flex gap-3 form__group form__group-fast ">
                        <span>
                            <i className="ri-map-pin-line"></i>
                        </span>
                        <div>
                            <h6>Search by Title</h6>
                            <input type="text" placeholder="Enter tour title..." ref={locationRef} />
                        </div>
                    </FormGroup>

                    <span className="search__icon" onClick={searchHandler}>
                        <i className="ri-search-line"></i>
                    </span>
                </Form>
            </div>
        </Col>
    );
};

export default SearchBar;
