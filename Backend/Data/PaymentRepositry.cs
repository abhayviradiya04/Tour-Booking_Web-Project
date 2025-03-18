using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using TourBookingAPI.Model;

namespace TourBookingAPI.Data
{
    public interface IPaymentRepository
    {
        Task<PaymentModel> AddPayment(PaymentModel payment);
        Task<List<PaymentModel>> GetAllPayments();
        Task<PaymentModel> GetPaymentById(int id);
        Task<PaymentModel> GetPaymentByBookingId(int bookingId);
    }

    public class PaymentRepository : IPaymentRepository
    {
        private readonly string _connectionString;

        public PaymentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<PaymentModel> AddPayment(PaymentModel payment)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_AddPayment", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@TransactionId", payment.TransactionId);
                    cmd.Parameters.AddWithValue("@TourId", payment.TourId);
                    cmd.Parameters.AddWithValue("@Price", payment.Price);
                    cmd.Parameters.AddWithValue("@Status", payment.Status);
                    cmd.Parameters.AddWithValue("@BookingId", payment.BookingId);

                    var outputParam = cmd.Parameters.Add("@PaymentId", SqlDbType.Int);
                    outputParam.Direction = ParameterDirection.Output;

                    await connection.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();

                    payment.PaymentId = (int)outputParam.Value;
                    return payment;
                }
            }
        }

        public async Task<List<PaymentModel>> GetAllPayments()
        {
            List<PaymentModel> payments = new List<PaymentModel>();

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetAllPayments", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await connection.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            payments.Add(new PaymentModel
                            {
                                PaymentId = reader["PaymentId"] != DBNull.Value ? Convert.ToInt32(reader["PaymentId"]) : 0,
                                TransactionId = reader["Transaction_Id"] != DBNull.Value ? reader["Transaction_Id"].ToString() : null,
                                TourId = reader["Tour_Id"] != DBNull.Value ? Convert.ToInt32(reader["Tour_Id"]) : 0,
                                Price = reader["Price"] != DBNull.Value ? Convert.ToDecimal(reader["Price"]) : 0,
                                Status = reader["Status"] != DBNull.Value ? reader["Status"].ToString() : null,
                                BookingId = reader["tourBooking_Id"] != DBNull.Value ? Convert.ToInt32(reader["tourBooking_Id"]) : 0,
                                CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : DateTime.MinValue
                            });
                        }
                    }
                }
            }

            return payments;
        }

        public async Task<PaymentModel> GetPaymentById(int id)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetPaymentById", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@PaymentId", id);

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new PaymentModel
                            {
                                PaymentId = reader["PaymentId"] != DBNull.Value ? Convert.ToInt32(reader["PaymentId"]) : 0,
                                TransactionId = reader["Transaction_Id"] != DBNull.Value ? reader["Transaction_Id"].ToString() : null,
                                TourId = reader["Tour_Id"] != DBNull.Value ? Convert.ToInt32(reader["Tour_Id"]) : 0,
                                Price = reader["Price"] != DBNull.Value ? Convert.ToDecimal(reader["Price"]) : 0,
                                Status = reader["Status"] != DBNull.Value ? reader["Status"].ToString() : null,
                                BookingId = reader["tourBooking_Id"] != DBNull.Value ? Convert.ToInt32(reader["tourBooking_Id"]) : 0,
                                CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : DateTime.MinValue
                            };
                        }
                    }
                }
            }

            return null;
        }

        public async Task<PaymentModel> GetPaymentByBookingId(int bookingId)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                using (SqlCommand cmd = new SqlCommand("sp_GetPaymentByBookingId", connection))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@BookingId", bookingId);

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return new PaymentModel
                            {
                                PaymentId = reader["PaymentId"] != DBNull.Value ? Convert.ToInt32(reader["PaymentId"]) : 0,
                                TransactionId = reader["Transaction_Id"] != DBNull.Value ? reader["Transaction_Id"].ToString() : null,
                                TourId = reader["Tour_Id"] != DBNull.Value ? Convert.ToInt32(reader["Tour_Id"]) : 0,
                                Price = reader["Price"] != DBNull.Value ? Convert.ToDecimal(reader["Price"]) : 0,
                                Status = reader["Status"] != DBNull.Value ? reader["Status"].ToString() : null,
                                BookingId = reader["tourBooking_Id"] != DBNull.Value ? Convert.ToInt32(reader["tourBooking_Id"]) : 0,
                                CreatedAt = reader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(reader["CreatedAt"]) : DateTime.MinValue
                            };
                        }
                    }
                }
            }
            return null;
        }
    }
}