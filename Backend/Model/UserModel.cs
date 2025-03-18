using System.ComponentModel.DataAnnotations;

namespace TourBookingAPI.Model
{
    public class UserModel
    {
        public int Id { get; set; }
    
        public string Username { get; set; }
     
        public string Email { get; set; }
        
        public string Password { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    public class LoginRequest
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }

}