namespace TourBookingAPI.Model
{
    public class TourBookingModel
    {
        public int tourBooking_id { get; set; }
        public string TourName { get; set; }
        public string CustomerName { get; set; }
        public int GuestSize { get; set; }
        public string Phone { get; set; }
        public DateTime? BookAt{ get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; }
        public int tour_id { get; set; }
       
    }
}
