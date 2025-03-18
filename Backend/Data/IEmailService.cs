using System.Threading.Tasks;
using TourBookingAPI.Model;

namespace TourBookingAPI.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendBookingConfirmation(TourBookingModel booking, PaymentModel payment);
    }
}