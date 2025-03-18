📌 Tour Booking Project
🚀 A full-stack tour booking platform built using ASP.NET Core Web API for the backend and React.js for the frontend. This project allows users to explore, book tours, and manage their profiles, while admins can oversee bookings, reviews, and payments.

📜 Features
👤 User Functionalities
✔️ Register/Login (with JWT Authentication)
✔️ Email Verification during registration 📧
✔️ View All Tours & Search for specific tours 🔍
✔️ Book a Tour & complete payment via Razorpay 💳
✔️ User Dashboard to view booked tours 📅
✔️ Receive Booking Confirmation Email 📩
✔️ Review Tours – Add, Edit, Delete ✍️

🔐 Admin Panel Functionalities
✔️ Manage Tours – Add, Edit, Delete 🏞️
✔️ Manage Bookings – View, Update Status 📜
✔️ Review Moderation – Approve/Delete User Reviews 📝
✔️ Check Payment Details 💰
✔️ Manage Users – View & Control Accounts 👥

🛠️ Tech Stack
Frontend (React.js) 🎨
React.js ⚛️
Tailwind CSS (Styling)
Backend (ASP.NET Core Web API) 🖥️
ASP.NET Core (C#)
SQL Server (Database)
JWT Authentication (User Authentication)
Razorpay API (Payment Gateway)
📸 UI Preview
🔹 Home Page

🔹 Tour Details Page

🔹 Booking Page

🔹 Admin Dashboard

🚀 How to Run the Project?
Backend (ASP.NET Core API) 🏗️
sh
Copy code
cd Backend/TourBookingApi
dotnet restore
dotnet run
👉 API runs on http://localhost:5049/api/Tour/GetTours

Frontend (React.js) 💻
sh
Copy code
cd Frontend/tour-management
npm install
npm start
👉 App runs on http://localhost:3000/

🔗 API Endpoints
Method	Endpoint	Description
GET	/api/Tour/GetTours	Get all tours
POST	/api/User/Register	User registration
POST	/api/User/Login	User login
POST	/api/Booking/Create	Book a tour
GET	/api/Booking/UserBookings	Get user bookings
POST	/api/Review/Add	Add a tour review
📬 Contact Me
📧 Email: abhayviradiya6236@gmail.com
🔗 GitHub Profile: Abhay Viradiya

🎯 Notes:
✔️ Added icons for a better UI experience ✨
✔️ Used tables for API endpoints 📊
✔️ Structured sections properly for better readability

🚀 Now, your README looks professional and well-formatted! Let me know if you need any changes. 😊
