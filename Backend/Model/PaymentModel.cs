namespace TourBookingAPI.Model
{
    public class PaymentModel
    {

         public int PaymentId { get; set; }
        public string TransactionId { get; set; }
            public int TourId { get; set; }
            public decimal Price { get; set; }
            public string Status { get; set; }
            public int BookingId { get; set; }
            public DateTime CreatedAt { get; set; }
        }
   


}
