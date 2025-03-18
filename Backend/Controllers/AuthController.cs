using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TourBookingAPI.Data;
using TourBookingAPI.Model;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public AuthController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { message = "Invalid request data" });
        }

        try
        {
            var (user, token) = await _userRepository.Login(request.Username, request.Password);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(new
            {
                user,
                token,
                expiresAt = DateTime.UtcNow.AddHours(1) // Token expiry time
            });
        }
        catch (Exception ex)
        {
            // Log the exception
            return StatusCode(500, new { message = "An error occurred while processing your request" });
        }
    }
}