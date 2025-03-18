
using Microsoft.Data.SqlClient;
using System.Data;
using TourBookingAPI.Model;


namespace TourBookingAPI.Data
{
    public class TourRepositry
    {
        private readonly string _connectionString;
        public TourRepositry(IConfiguration configuration)
        {
            _connectionString= configuration.GetConnectionString("DefaultConnection");
        }

        #region selectall
        public IEnumerable<TourModel> SelectAll()
        {
            var tour = new List<TourModel>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Tours_SelectAll", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    tour.Add(new TourModel()
                    {
                        tour_Id = Convert.ToInt32(reader["tour_Id"]),
                        Title = reader["Title"].ToString(),
                        City = reader["City"].ToString(),
                        Distance = Convert.ToInt32(reader["Distance"]),
                        Photo = reader["Photo"].ToString(),
                        Description = reader["Description"].ToString(),
                        Price = Convert.ToDecimal(reader["Price"]),
                        MaxGroupSize = Convert.ToInt32(reader["MaxGroupSize"]),
                        Featured = Convert.ToBoolean(reader["Featured"]),
                        // Check if the value is DBNull before converting to DateTime
                        CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : (DateTime?)null,
                        UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["UpdatedAt"]) : (DateTime?)null,
                        Address = reader["Address"].ToString()
                    });
                }
            }
            return tour;
        }

        #endregion

        public IEnumerable<TourModel> SelectById(int id)
        {
            var tour = new List<TourModel>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Tours_SelectByPK", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@tour_Id", id);
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    tour.Add(new TourModel()
                    {
                        tour_Id = Convert.ToInt32(reader["tour_Id"]),
                        Title = reader["Title"].ToString(),
                        City = reader["City"].ToString(),
                        Distance = Convert.ToInt32(reader["Distance"]),
                        Photo = reader["Photo"].ToString(),
                        Description = reader["Description"].ToString(),
                        Price = Convert.ToDecimal(reader["Price"]),
                        MaxGroupSize = Convert.ToInt32(reader["MaxGroupSize"]),
                        Featured = Convert.ToBoolean(reader["Featured"]),
                        // Check if the value is DBNull before converting to DateTime
                        CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : (DateTime?)null,
                        UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["UpdatedAt"]) : (DateTime?)null,

                        Address = reader["Address"].ToString()
                    });
                }
            }
            return tour;
        }

        public bool Add(TourModel tourModel)
        {
            try
            {
                int effect = 0;
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("PR_Tours_Insert", conn)
                    {
                        CommandType = System.Data.CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@Title", tourModel.Title);
                    cmd.Parameters.AddWithValue("@City", tourModel.City);
                    cmd.Parameters.AddWithValue("@Distance", tourModel.Distance);
                    cmd.Parameters.AddWithValue("@Photo", tourModel.Photo);
                    cmd.Parameters.AddWithValue("@Description", tourModel.Description);
                    cmd.Parameters.AddWithValue("@Price", tourModel.Price);
                    cmd.Parameters.AddWithValue("@MaxGroupSize", tourModel.MaxGroupSize);
                    cmd.Parameters.AddWithValue("@Featured", tourModel.Featured);
                    cmd.Parameters.AddWithValue("@Address", tourModel.Address);
                    conn.Open();
                    effect = cmd.ExecuteNonQuery();
                }
                return effect > 0;
            }
            catch (Exception ex)
            {
                // Log or return the exception message for debugging
                Console.WriteLine($"Error: {ex.Message}");
                return false;
            }
        }


        public bool Update(TourModel tourModel)
        {
            int effect = 0;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Tours_Update", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@tour_Id", tourModel.tour_Id);
                cmd.Parameters.AddWithValue("@Title", tourModel.Title);
                cmd.Parameters.AddWithValue("@City", tourModel.City);
                cmd.Parameters.AddWithValue("@Distance", tourModel.Distance);
                cmd.Parameters.AddWithValue("@Photo", tourModel.Photo);
                cmd.Parameters.AddWithValue("@Description", tourModel.Description);
                cmd.Parameters.AddWithValue("@Price", tourModel.Price);
                cmd.Parameters.AddWithValue("@MaxGroupSize", tourModel.MaxGroupSize);
                cmd.Parameters.AddWithValue("@Featured", tourModel.Featured);
                cmd.Parameters.AddWithValue("@Address", tourModel.Address);
                conn.Open();
                effect=cmd.ExecuteNonQuery();
            }
            return effect>0;
        }
        public bool Delete(int id)
        {
            int effect = 0;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_Tours_Delete", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@tour_Id", id);
                conn.Open();
                effect=cmd.ExecuteNonQuery();
            }
            return effect>0;
        }

        public IEnumerable<TourModel> SearchTours(string title)
        {
            var tours = new List<TourModel>();

            using (var connection = new SqlConnection(_connectionString))
            {
                using (var command = new SqlCommand("PR_SearchToursByTitle", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@Title", title);

                    connection.Open();
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var tour = new TourModel
                            {
                                tour_Id = (int)reader["tour_Id"],
                                Title = reader["Title"].ToString(),
                                City = reader["City"].ToString(),
                                Address = reader["Address"].ToString(),
                                Distance = (int)reader["Distance"],
                                Photo = reader["Photo"].ToString(),
                                Description = reader["Description"].ToString(),
                                Price = (decimal)reader["Price"],
                                MaxGroupSize = (int)reader["MaxGroupSize"],
                                Featured = (bool)reader["Featured"],
                                CreatedAt = reader["CreatedAt"] as DateTime?,
                                UpdatedAt = reader["UpdatedAt"] as DateTime?
                            };
                            tours.Add(tour);
                        }
                    }
                }
            }

            return tours;
        }

    }
}
