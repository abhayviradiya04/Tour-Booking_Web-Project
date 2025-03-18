using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourBookingAPI.Data;
using TourBookingAPI.Model;

namespace TourBookingAPI.Controllers
{
    
    [Route("api/[controller]/")]
    [ApiController]
    public class UserController : ControllerBase
    {
        
        private readonly UserRepository _userRepository;
        private readonly IOtpService _otpService;
        public UserController(UserRepository userRepository, IOtpService otpService)
        {
            _userRepository = userRepository;
            _otpService = otpService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
                return BadRequest(new { message = "Username and password are required" });

            var (user, token) = await _userRepository.Login(model.Username, model.Password);

            if (user == null)
                return Unauthorized(new { message = "Invalid username or password" });

            return Ok(new
            {
                message = "Login successful",
                token, // ✅ Include token
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Role
                }
            });
        }




        [HttpPost("register")]
        public async Task<IActionResult> Register(UserModel model)
        {
            if (string.IsNullOrEmpty(model.Username) ||
                string.IsNullOrEmpty(model.Email) ||
                string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            // Check if the user already exists
            if (await _userRepository.UserExists(model.Username, model.Email))
            {
                return BadRequest(new { message = "Username or email already exists." });
            }

            try
            {
                var result = await _userRepository.Register(model.Username, model.Email, model.Password);
                if (!result)
                {
                    return StatusCode(500, new { message = "Error registering user" });
                }

                return Ok(new { message = "User registered successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during registration: {ex.Message}");
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var otp = await _otpService.GenerateOtpAsync(request.Email);
            return Ok(new { message = "OTP sent successfully." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] OtpVerificationRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp))
            {
                return BadRequest(new { message = "Email and OTP are required." });
            }

            var isValid = await _otpService.VerifyOtpAsync(request.Email, request.Otp);
            if (isValid)
            {
                return Ok(new { message = "OTP verified successfully." });
            }

            return BadRequest(new { message = "Invalid or expired OTP." });
        }
    }

    public class OtpRequest
    {
        public string Email { get; set; }
    }

    public class OtpVerificationRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }
} 