using Microsoft.Data.SqlClient;
using System.Data;
using TourBookingAPI.Model;

namespace TourBookingAPI.Data
{
    public class TourBookingRepository
    {
        private readonly string _connectionString;

        public TourBookingRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        #region SelectAll
        public IEnumerable<TourBookingModel> SelectAll()
        {
            var bookings = new List<TourBookingModel>();
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_TourBooking_SelectAll", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    bookings.Add(new TourBookingModel()
                    {
                        tourBooking_id = reader["tourBooking_id"] != DBNull.Value ? Convert.ToInt32(reader["tourBooking_id"]) : 0,
                        TourName = reader["TourName"] != DBNull.Value ? reader["TourName"].ToString() : string.Empty,
                        CustomerName = reader["CustomerName"] != DBNull.Value ? reader["CustomerName"].ToString() : string.Empty,
                        GuestSize = reader["GuestSize"] != DBNull.Value ? Convert.ToInt32(reader["GuestSize"]) : 0,
                        Phone = reader["Phone"] != DBNull.Value ? reader["Phone"].ToString() : string.Empty,
                        BookAt = reader["BookAt"] != DBNull.Value ? Convert.ToDateTime(reader["BookAt"]) : (DateTime?)null,
                        UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["UpdatedAt"]) : (DateTime?)null,
                        UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : 0,
                        UserEmail = reader["UserEmail"] != DBNull.Value ? reader["UserEmail"].ToString() : string.Empty,
                        tour_id = reader["tour_id"] != DBNull.Value ? Convert.ToInt32(reader["tour_id"]) : 0

                    });
                }
            }
            return bookings;
        }
        #endregion

        #region SelectById
        public TourBookingModel SelectById(int id)
        {
            TourBookingModel booking = null;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                SqlCommand cmd = new SqlCommand("PR_TourBooking_SelectByPK", conn)
                {
                    CommandType = System.Data.CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@tourBooking_id", id);
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read())
                {
                    booking = new TourBookingModel()
                    {
                        tourBooking_id = Convert.ToInt32(reader["tourBooking_id"]),
                        TourName = reader["TourName"].ToString(),
                        CustomerName = reader["CustomerName"].ToString(),
                        GuestSize = Convert.ToInt32(reader["GuestSize"]),
                        Phone = reader["Phone"].ToString(),
                        BookAt = reader["BookAt"] != DBNull.Value ? Convert.ToDateTime(reader["BookAt"]) : (DateTime?)null,
                        UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["UpdatedAt"]) : (DateTime?)null,
                        UserId = Convert.ToInt32(reader["UserId"]),
                        UserEmail = reader["UserEmail"].ToString(),
                        tour_id = Convert.ToInt32(reader["tour_id"]) // Ensure it's treated as an integer
                    };
                }
            }
            return booking;
        }
        #endregion

        public bool Add(TourBookingModel booking)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("PR_TourBooking_Insert", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@TourName", booking.TourName);
                    cmd.Parameters.AddWithValue("@CustomerName", booking.CustomerName);
                    cmd.Parameters.AddWithValue("@GuestSize", booking.GuestSize);
                    cmd.Parameters.AddWithValue("@Phone", booking.Phone);
                    cmd.Parameters.AddWithValue("@BookAt", booking.BookAt ?? DateTime.Now);
                    cmd.Parameters.AddWithValue("@UserId", booking.UserId);
                    cmd.Parameters.AddWithValue("@UserEmail", booking.UserEmail);
                    cmd.Parameters.AddWithValue("@tour_Id", booking.tour_id);

                    conn.Open();
                    int effect = cmd.ExecuteNonQuery();

                    return effect > 0; // Return true if at least one row was inserted
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Add: {ex.Message}");
                return false;
            }
        }

        public bool Update(TourBookingModel booking)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    SqlCommand cmd = new SqlCommand("PR_TourBooking_Update", conn)
                    {
                        CommandType = CommandType.StoredProcedure
                    };
                    cmd.Parameters.AddWithValue("@tourBooking_Id", booking.tourBooking_id);
                    cmd.Parameters.AddWithValue("@TourName", booking.TourName);
                    cmd.Parameters.AddWithValue("@CustomerName", booking.CustomerName);
                    cmd.Parameters.AddWithValue("@GuestSize", booking.GuestSize);
                    cmd.Parameters.AddWithValue("@Phone", booking.Phone);
                    cmd.Parameters.AddWithValue("@UpdatedAt", booking.UpdatedAt ?? DateTime.Now);
                    cmd.Parameters.AddWithValue("@UserId", booking.UserId);
                    cmd.Parameters.AddWithValue("@UserEmail", booking.UserEmail);
                    cmd.Parameters.AddWithValue("@tour_Id", booking.tour_id);

                    conn.Open();
                    int effect = cmd.ExecuteNonQuery();

                    return effect > 0; // Return true if at least one row was updated
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Update: {ex.Message}");
                return false;
            }
        }


        #region Delete
        public bool Delete(int id)
        {
            int effect = 0;
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                using (SqlTransaction transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // First delete related payments
                        SqlCommand deletePaymentCmd = new SqlCommand("SP_Payment_DeleteByBookingId", conn, transaction)
                        {
                            CommandType = System.Data.CommandType.StoredProcedure
                        };
                        deletePaymentCmd.Parameters.AddWithValue("@tourBooking_id", id);
                        deletePaymentCmd.ExecuteNonQuery();

                        // Then delete the booking
                        SqlCommand deleteBookingCmd = new SqlCommand("SP_TourBooking_Delete", conn, transaction)
                        {
                            CommandType = System.Data.CommandType.StoredProcedure
                        };
                        deleteBookingCmd.Parameters.AddWithValue("@tourBooking_id", id);
                        effect = deleteBookingCmd.ExecuteNonQuery();

                        transaction.Commit();
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
            return effect > 0;
        }
        #endregion

        public async Task<TourBookingModel> GetLatestBooking()
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetLatestBooking", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await connection.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new TourBookingModel
                            {
                                tourBooking_id = reader["tourBooking_id"] != DBNull.Value ? Convert.ToInt32(reader["tourBooking_id"]) : 0,
                                TourName = reader["TourName"] != DBNull.Value ? reader["TourName"].ToString() : null,
                                CustomerName = reader["CustomerName"] != DBNull.Value ? reader["CustomerName"].ToString() : null,
                                GuestSize = reader["GuestSize"] != DBNull.Value ? Convert.ToInt32(reader["GuestSize"]) : 0,
                                Phone = reader["Phone"] != DBNull.Value ? reader["Phone"].ToString() : null,
                                BookAt = reader["BookAt"] != DBNull.Value ? Convert.ToDateTime(reader["BookAt"]) : DateTime.MinValue,
                                UserId = reader["UserId"] != DBNull.Value ? Convert.ToInt32(reader["UserId"]) : 0,
                                UserEmail = reader["UserEmail"] != DBNull.Value ? reader["UserEmail"].ToString() : null,
                                tour_id = reader["tour_id"] != DBNull.Value ? Convert.ToInt32(reader["tour_id"]) : 0

                            };
                        }
                    }
                }
            }
            return null;
        }

        public async Task<IEnumerable<TourBookingModel>> GetBookingsByUserId(int userId)
        {
            var bookings = new List<TourBookingModel>();

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("PR_TourBooking_GetByUserId", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserId", userId);

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            bookings.Add(new TourBookingModel
                            {
                                tourBooking_id = Convert.ToInt32(reader["tourBooking_Id"]),
                                TourName = reader["TourName"].ToString(),
                                CustomerName = reader["CustomerName"].ToString(),
                                GuestSize = Convert.ToInt32(reader["GuestSize"]),
                                Phone = reader["Phone"].ToString(),
                                BookAt = reader["BookAt"] != DBNull.Value ? Convert.ToDateTime(reader["BookAt"]) : null,
                                UpdatedAt = reader["UpdatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["UpdatedAt"]) : null,
                                UserId = Convert.ToInt32(reader["UserId"]),
                                UserEmail = reader["UserEmail"].ToString(),
                                tour_id = Convert.ToInt32(reader["tour_id"])
                            });
                        }
                    }
                }
            }

            return bookings;
        }


    }
}
