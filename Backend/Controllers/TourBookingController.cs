using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourBookingAPI.Data;
using TourBookingAPI.Model;
using TourBookingAPI.Services;

namespace TourBookingAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]/[Action]")]
    [ApiController]
    public class TourBookingController : ControllerBase
    {
        private readonly TourBookingRepository _tourBookingRepository;
        private readonly IEmailService _emailService;
        private readonly IPaymentRepository _paymentRepository;

        public TourBookingController(TourBookingRepository tourBookingRepository, IEmailService emailService, IPaymentRepository paymentRepository)
        {
            _tourBookingRepository = tourBookingRepository;
            _emailService = emailService;
            _paymentRepository = paymentRepository;

        }

        // Get all tour bookings
        [HttpGet]
        public IActionResult GetTourBookings()
        {
            var bookings = _tourBookingRepository.SelectAll();
            return Ok(bookings);
        }

        // Get a specific tour booking by ID
        [HttpGet("{id}")]
        public IActionResult GetTourBooking(int id)
        {
            var booking = _tourBookingRepository.SelectById(id);
            if (booking == null)
            {
                return NotFound("Booking not found");
            }
            return Ok(booking);
        }

        // Add a new tour booking
        [HttpPost]
        public IActionResult Add([FromBody] TourBookingModel bookingModel)
        {
            if (bookingModel == null)
            {
                return BadRequest("Booking data is null");
            }
           


            var isAdded = _tourBookingRepository.Add(bookingModel);

            if (!isAdded)
            {
                return BadRequest("Failed to add the booking");
            }

            return Ok(new { message = "Booking added successfully", data = bookingModel });
        }

        [HttpPut]
        public IActionResult Update([FromBody] TourBookingModel bookingModel)
        {
            if (bookingModel == null)
            {
                return BadRequest("Booking data is null");
            }

            var isUpdated = _tourBookingRepository.Update(bookingModel);

            if (!isUpdated)
            {
                return NotFound("Booking not found for updating");
            }

            return Ok(new { message = "Booking updated successfully", data = bookingModel });
        }

        // Delete a tour booking by ID
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var isDeleted = _tourBookingRepository.Delete(id);
            if (!isDeleted)
            {
                return NotFound("Booking not found for deletion");
            }

            return Ok("Booking deleted successfully");
        }

        [HttpGet]
        public async Task<IActionResult> GetLatestBooking()
        {
            try
            {
                var booking = await _tourBookingRepository.GetLatestBooking();
                return Ok(booking);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = "Error retrieving latest booking", Error = ex.Message });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetBookingsWithUser(int userId)
        {
            try
            {
                var bookings = await _tourBookingRepository.GetBookingsByUserId(userId);
                if (bookings == null || !bookings.Any())
                {
                    return NotFound(new { message = "No bookings found for this user" });
                }
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error retrieving bookings", error = ex.Message });
            }
        }


        #region EmailSend
        [HttpPost]
        public async Task<IActionResult> SendBookingConfirmation()
        {
            try
            {
                
                var latestBooking = await _tourBookingRepository.GetLatestBooking();
                if (latestBooking == null)
                {
                   
                    return NotFound(new { success = false, message = "No bookings found." });
                }

                var payment = await _paymentRepository.GetPaymentByBookingId(latestBooking.tourBooking_id);
                if (payment == null)
                {
                   
                    return NotFound(new { success = false, message = "Payment details not found." });
                }

                
                if (string.IsNullOrEmpty(payment.TransactionId))
                {
                    
                    return BadRequest(new { success = false, message = "TransactionId is required." });
                }

                
                await _emailService.SendBookingConfirmation(latestBooking, payment);

                
                return Ok(new { success = true, message = "Booking confirmation email sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        #endregion


    }
}
    

