﻿namespace TourBookingAPI.Model
{
    public class OtpModel
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public DateTime ExpiryTime { get; set; }
    }
}
