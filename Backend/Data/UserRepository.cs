using Microsoft.Data.SqlClient;

using TourBookingAPI.Model;


namespace TourBookingAPI.Data
{
    public class UserRepository 
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;
        private readonly JwtToken _jwtToken;

        public UserRepository(IConfiguration configuration,JwtToken jwtToken)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _configuration = configuration;
            _jwtToken = jwtToken;
        }
        public async Task<(UserModel user, string token)> Login(string username, string password)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand("PR_User_LogIn", connection))
                    {
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@Username", username);
                        cmd.Parameters.AddWithValue("@Password", password); // Ideally, use a hashed password

                        await connection.OpenAsync();
                        using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                var user = new UserModel
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    Username = reader["Username"].ToString(),
                                    Email = reader["Email"].ToString(),
                                    Role = reader["Role"].ToString(),
                                    CreatedAt = Convert.ToDateTime(reader["CreatedAt"]),
                                    UpdatedAt = Convert.ToDateTime(reader["UpdatedAt"])
                                };

                                // ✅ Generate JWT Token with role
                                string token = _jwtToken.GenerateToken(user.Username);
                                return (user, token);
                            }
                            return (null, null); // User not found
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                throw new Exception("An error occurred while logging in.", ex);
            }
        }



        public async Task<bool> UserExists(string username, string email)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("PR_Users_CheckExists", connection))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", username);
                    cmd.Parameters.AddWithValue("@Email", email);

                    try
                    {
                        await connection.OpenAsync();
                        var result = await cmd.ExecuteScalarAsync();
                        return (result != null); // If result is not null, user exists
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error checking user existence: {ex.Message}");
                        throw new Exception("An error occurred while checking user existence.");
                    }
                }
            }
        }

        public async Task<bool> Register(string username, string email, string password)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("PR_Users_Register", connection))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@Username", username);
                    cmd.Parameters.AddWithValue("@Email", email);
                    cmd.Parameters.AddWithValue("@Password", password); // Store password as is (not recommended)

                    try
                    {
                        await connection.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                        return true; // Registration successful
                    }
                    catch (SqlException ex)
                    {
                        Console.WriteLine($"SQL Error during registration: {ex.Message}");
                        throw new Exception("Error registering user. Please try again later.");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error during registration: {ex.Message}");
                        throw new Exception("An unexpected error occurred. Please try again later.");
                    }
                }
            }
        }
    }
} 
