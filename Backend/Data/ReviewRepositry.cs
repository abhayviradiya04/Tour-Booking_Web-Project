using Microsoft.Data.SqlClient;
using TourBookingAPI.Model;

namespace TourBookingAPI.Data
{
    public class ReviewRepositry
    {
        private readonly string _connectionString;
        public ReviewRepositry(IConfiguration configuration)
        {             _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        #region SelectALL
        public IEnumerable<ReviewModel> SelectAll()
        {
            var reviews = new List<ReviewModel>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Review_SelectAll", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    reviews.Add(new ReviewModel
                    {
                        Review_Id = reader["Review_Id"] != DBNull.Value ? (int)reader["Review_Id"] : 0, // Default to 0
                        UserName = reader["UserName"]?.ToString(),
                        ReviewText = reader["ReviewText"]?.ToString(),
                        Rating = reader["Rating"] != DBNull.Value ? Convert.ToDouble(reader["Rating"]) : 0.0, // Default to 0.0
                        CreatedAt = reader["CreatedAt"] != DBNull.Value ? (DateTime)reader["CreatedAt"] : DateTime.MinValue, // Default date
                        UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? (DateTime)reader["UpdatedAt"] : DateTime.MinValue,
                        userId = reader["userId"] != DBNull.Value ? (int)reader["userId"] : 0, // Default to 0
                        tour_Id = reader["tour_Id"] != DBNull.Value ? (int)reader["tour_Id"] : 0, // Default to 0
                        TourName = reader["TourName"]?.ToString() ?? "N/A" // Added TourName
                    });
                }
            }
            return reviews;
        }


        #endregion

        #region SelectBYPK
        public ReviewModel SelectByPK(int id)
        {
            ReviewModel review = null; // Initialize as null to handle cases where no record is found
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Review_SelectByPK", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@Review_Id", id);
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read()) // Use if instead of while, as this retrieves one record by primary key
                {
                    review = new ReviewModel
                    {
                        Review_Id = (int)reader["Review_Id"],
                        UserName = reader["UserName"].ToString(),
                        ReviewText = reader["ReviewText"].ToString(),
                        Rating = reader["Rating"] != DBNull.Value ? Convert.ToDouble(reader["Rating"]) : 0.0, // Handle NULL values for Rating
                        CreatedAt = reader["CreatedAt"] != DBNull.Value ? (DateTime)reader["CreatedAt"] : DateTime.MinValue, // Handle NULL for CreatedAt
                        UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? (DateTime)reader["UpdatedAt"] : DateTime.MinValue, // Handle NULL for UpdatedAt
                        userId = reader["userId"] != DBNull.Value ? (int)reader["userId"] : 0, // Handle NULL for UserId
                        tour_Id = reader["tour_Id"] != DBNull.Value ? (int)reader["tour_Id"] : 0 // Handle NULL for tour_Id
                    };
                    

                }
            }
            return review;
        }

        #endregion

        #region Delete
        public bool Delete(int id)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Review_Delete", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@Review_Id", id);
                conn.Open();
                int rowAffected = cmd.ExecuteNonQuery();
                return rowAffected > 0;
            }
        }
        #endregion

        #region Add
        public bool Add(ReviewModel reviewModel)
        {
            int effect = 0;
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("PR_Review_Insert", conn)
                    {
                        CommandType = System.Data.CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@UserName", reviewModel.UserName);
                    cmd.Parameters.AddWithValue("@ReviewText", reviewModel.ReviewText);
                    cmd.Parameters.AddWithValue("@Rating", reviewModel.Rating);
                   
                    cmd.Parameters.AddWithValue("@userId", reviewModel.userId);
                    cmd.Parameters.AddWithValue("@tour_Id", reviewModel.tour_Id);
                    conn.Open();
                    effect = cmd.ExecuteNonQuery();
                }
            }
            catch (Exception e)
            {

               Console.WriteLine(e.Message);
            }
            return effect > 0;
        }
        #endregion

        #region Update
        public bool Update(ReviewModel reviewModel)
        {
            int effect = 0;
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("PR_Review_Update", conn)
                    {
                        CommandType = System.Data.CommandType.StoredProcedure
                    };

                    cmd.Parameters.AddWithValue("@Review_Id", reviewModel.Review_Id);
                    cmd.Parameters.AddWithValue("@ReviewText", reviewModel.ReviewText);
                    cmd.Parameters.AddWithValue("@Rating", reviewModel.Rating);

                    // If the UpdatedAt is not set, it will default to NULL, and the stored procedure will use GETDATE()
                    if (reviewModel.UpdatedAt != null)
                    {
                        cmd.Parameters.AddWithValue("@UpdatedAt", reviewModel.UpdatedAt);
                    }

                    conn.Open();
                    effect = cmd.ExecuteNonQuery();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }
            return effect > 0;
        }

        #endregion

        #region reviewbytourid
        public List<ReviewModel> GetReviewsByTourId(int tourId)  // Removed async
    {
        var reviews = new List<ReviewModel>();

        using (SqlConnection connection = new SqlConnection(_connectionString))
        {
            connection.Open();

            using SqlCommand command = new SqlCommand("PR_Review_GetReviewsByTourId", connection);
            command.CommandType = System.Data.CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@TourId", tourId);

            using SqlDataReader reader = command.ExecuteReader();
            while (reader.Read())
            {
                var review = new ReviewModel
                {
                    Review_Id = reader.GetInt32(reader.GetOrdinal("Review_Id")),
                    tour_Id = reader.GetInt32(reader.GetOrdinal("tour_Id")),
                    UserName = reader.GetString(reader.GetOrdinal("UserName")),
                    ReviewText = reader.GetString(reader.GetOrdinal("ReviewText")),
                    Rating = Convert.ToDouble(reader["Rating"]), // Changed to double
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    userId = reader.GetInt32(reader.GetOrdinal("UserID"))
                };
                reviews.Add(review);
            }
        }

        return reviews;
    }
     #endregion
    }}


