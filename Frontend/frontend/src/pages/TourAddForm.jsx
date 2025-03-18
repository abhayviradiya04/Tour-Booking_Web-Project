import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../style/tour-details.css";
import { Container } from "reactstrap";
import { BASE_URL } from "../utils/config";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

const Form = () => {
  const param = useParams();
  const navigate = useNavigate();
  const token=localStorage.getItem('token');
  const [tour, setTour] = useState({
    title: "",
    city: "",
    address: "",
    distance: "",
    price: "",
    maxGroupSize: "",
    desc: "",
    photo: "",
  });

  useEffect(() => {
    const fetchTourData = async () => {
      if (param.id !== "0") {
        try {
          console.log("Fetching tour with ID:", param.id);
          const response = await fetch(`${BASE_URL}/api/Tour/GetTour/${param.id}`,{
            headers:{
              Authorization:`Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch tour: ${response.status}`);
          }

          const data = await response.json();
          const tourData = data[0];

          if (tourData) {
            const formData = {
              title: tourData.title,
              city: tourData.city,
              address: tourData.address,
              distance: tourData.distance.toString(),
              price: tourData.price.toString(),
              maxGroupSize: tourData.maxGroupSize.toString(),
              desc: tourData.description,
              photo: tourData.photo,
            };
            setTour(formData);
          }
        } catch (error) {
          console.error("Error fetching tour data:", error);
          alert("Failed to load tour data. Please try again.");
        }
      }
    };

    fetchTourData();
  }, [param.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tourData = {
        title: tour.title,
        city: tour.city,
        address: tour.address,
        distance: parseFloat(tour.distance),
        price: parseFloat(tour.price),
        maxGroupSize: parseInt(tour.maxGroupSize),
        description: tour.desc,
        photo: tour.photo,
        featured: true,
      };

      if (param.id !== "0") {
        const response = await fetch(`${BASE_URL}/api/Tour/Update/${param.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(tourData),
        });

        if (!response.ok) {
          throw new Error("Failed to update tour");
        }

        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Tour updated successfully!',
          confirmButtonColor: '#9400FF',
        });
      } else {
        const response = await fetch(`${BASE_URL}/api/Tour/Add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(tourData),
        });

        if (!response.ok) {
          throw new Error("Failed to add tour");
        }

        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Tour added successfully!',
          confirmButtonColor: '#9400FF',
        });
      }

      navigate("/admin");
    } catch (error) {
      console.error("Error submitting tour:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save tour. Please try again.',
        confirmButtonColor: '#9400FF',
      });
    }
  };

  return (
    <Container className="form-container mt-5">
      <form className="tour-form" onSubmit={handleSubmit}>
        <h2 className="text-center mb-4">Tour Details</h2>

        <div className="form-group">
          <label htmlFor="title">Tour Name:</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={tour.title}
            onChange={(e) => setTour({ ...tour, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            className="form-control"
            value={tour.city}
            onChange={(e) => setTour({ ...tour, city: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            className="form-control"
            value={tour.address}
            onChange={(e) => setTour({ ...tour, address: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="distance">Distance (km):</label>
          <input
            type="number"
            id="distance"
            className="form-control"
            value={tour.distance}
            onChange={(e) => setTour({ ...tour, distance: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (USD):</label>
          <input
            type="number"
            id="price"
            className="form-control"
            value={tour.price}
            onChange={(e) => setTour({ ...tour, price: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxGroupSize">Max Group Size:</label>
          <input
            type="number"
            id="maxGroupSize"
            className="form-control"
            value={tour.maxGroupSize}
            onChange={(e) => setTour({ ...tour, maxGroupSize: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="desc">Description:</label>
          <textarea
            id="desc"
            className="form-control"
            rows="4"
            value={tour.desc}
            onChange={(e) => setTour({ ...tour, desc: e.target.value })}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="photo">Image URL:</label>
          <input
            type="text"
            id="photo"
            className="form-control"
            value={tour.photo}
            onChange={(e) => setTour({ ...tour, photo: e.target.value })}
            required
          />
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-submit">
            Submit
          </button>
          
          <button 
            type="button" 
            className="btn btn-cancel"
            onClick={() => navigate("/admin")}
          >
            Cancel
          </button> 
        </div>
      </form>

      <style jsx>{`
        .form-container {
          border: 2px solid #9400FF;
          border-radius: 8px;
          padding: 20px;
          background-color: #f9f9ff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .tour-form {
          max-width: 600px;
          margin: 0 auto;
        }

        .btn-submit {
          margin-top: 20px;
          background-color: #9400FF;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        }

        .btn-submit:hover {
          background-color: #7a00cc;
        }
          
      `}</style>
    </Container>
  );
};

export default Form;
