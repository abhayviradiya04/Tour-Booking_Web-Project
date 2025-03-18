using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TourBookingAPI.Data;
using TourBookingAPI.Model;

namespace TourBookingAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepository;

        public PaymentController(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        [HttpPost("Add")]
        public async Task<IActionResult> AddPayment([FromBody] PaymentModel payment)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _paymentRepository.AddPayment(payment);
                return Ok(new
                {
                    Success = true,
                    Message = "Payment added successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Error adding payment",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllPayments()
        {
            try
            {
                var payments = await _paymentRepository.GetAllPayments();
                return Ok(new
                {
                    Success = true,
                    Data = payments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Error retrieving payments",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            try
            {
                var payment = await _paymentRepository.GetPaymentById(id);
                if (payment == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = $"Payment with ID {id} not found"
                    });
                }

                return Ok(new
                {
                    Success = true,
                    Data = payment
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Error retrieving payment",
                    Error = ex.Message
                });
            }
        }
    }
}