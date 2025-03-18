using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using TourBookingAPI.Model;

namespace TourBookingAPI.Data
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp);
    }

    public class OtpService : IOtpService
    {
        private readonly IMemoryCache _cache;

        public OtpService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public async Task<string> GenerateOtpAsync(string email)
        {
            _cache.Remove(email); // Remove any existing OTP for the email

            // Generate a random 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();
            var expiryTime = DateTime.UtcNow.AddMinutes(5); // OTP valid for 5 minutes

          


            // Store OTP in cache
            _cache.Set(email, new OtpModel { Email = email, Otp = otp, ExpiryTime = expiryTime });

            // Send OTP via email
            await SendOtpEmail(email, otp);

            return otp;
        }

        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            if (_cache.TryGetValue(email, out OtpModel otpModel))
            {


                // Check if OTP is expired
                if (otpModel.ExpiryTime > DateTime.UtcNow && otpModel.Otp == otp)
                {
                    // OTP is valid
                    _cache.Remove(email); // Remove OTP after successful verification
                    return true;
                }
            }
            return false; // OTP is invalid or expired
        }

        private async Task SendOtpEmail(string email, string otp)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("adaajaipur2010@gmail.com", "dwii hhqb qkbq xwem"), // Use your actual email password or app password
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress("adaajaipur2010@gmail.com"),
                Subject = "Your OTP Code",
                Body = $"<h1>Your OTP Code</h1><p>Your OTP code is: <strong>{otp}</strong></p>",
                IsBodyHtml = true,
            };
            mailMessage.To.Add(email);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}