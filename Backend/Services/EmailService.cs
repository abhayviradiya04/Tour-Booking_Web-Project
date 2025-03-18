using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;
using TourBookingAPI.Model;

namespace TourBookingAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly SmtpClient _smtpClient;
        private readonly string _fromEmail;

        public EmailService(IConfiguration configuration)
        {
            _smtpClient = new SmtpClient(configuration["EmailSettings:Host"])
            {
                Port = int.Parse(configuration["EmailSettings:Port"]),
                Credentials = new NetworkCredential(
                    configuration["EmailSettings:Username"],
                    configuration["EmailSettings:Password"]),
                EnableSsl = true,
            };
            _fromEmail = configuration["EmailSettings:FromEmail"];

            // Enable debugging
            _smtpClient.EnableSsl = true;
            _smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
            _smtpClient.UseDefaultCredentials = false;
            _smtpClient.EnableSsl = true;
            _smtpClient.Timeout = 20000;
            _smtpClient.SendCompleted += (sender, e) =>
            {
                Console.WriteLine("Email sent successfully.");
            };
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            if (string.IsNullOrEmpty(toEmail))
            {
                
                throw new ArgumentException("Email address cannot be null or empty.", nameof(toEmail));
            }

            try
            {
               
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_fromEmail),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                
                await _smtpClient.SendMailAsync(mailMessage);
              
            }
            catch (Exception ex)
            {
               
                throw; // Re-throw the exception to propagate it
            }
        }

        public async Task SendBookingConfirmation(TourBookingModel booking, PaymentModel payment)
        {
            var subject = $"Booking Confirmation - {booking.TourName}";
            var body = GenerateBookingEmailContent(booking, payment);

           
            await SendEmailAsync(booking.UserEmail, subject, body); // Ensure booking has CustomerEmail
            
        }


        private string GenerateBookingEmailContent(TourBookingModel booking, PaymentModel payment)
        {
            return $@"
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .header {{ color: #9400FF; font-size: 24px; }}
                .details {{ margin-top: 20px; }}
                .details li {{ margin-bottom: 10px; }}
                .footer {{ margin-top: 30px; color: #666; }}
            </style>
        </head>
        <body>
            <h1 class='header'>Booking Confirmation</h1>
            <p>Dear {booking.CustomerName},</p>
            <p>Your booking has been successfully confirmed. Here are your booking details:</p>
            
            <div class='details'>
                <h3>Booking Information:</h3>
                <ul>
                    <li><strong>Booking ID:</strong> {booking.tourBooking_id}</li>
                    <li><strong>Tour Name:</strong> {booking.TourName}</li>
                    <li><strong>Number of Guests:</strong> {booking.GuestSize}</li>
                    <li><strong>Booking Date:</strong> {booking.BookAt?.ToString("dd MMM yyyy")}</li>
                    <li><strong>Transaction ID:</strong> {payment.TransactionId}</li>
                    <li><strong>Transaction Date:</strong> {payment.CreatedAt.ToString("dd MMM yyyy hh:mm tt")}</li>
                    <li><strong>Total Amount:</strong> ₹{payment.Price.ToString("0.00")}</li> <!-- Format the price -->
                </ul>
            </div>

            <div class='footer'>
                <p>Thank you for choosing us!</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </body>
        </html>";
        }
    }
}