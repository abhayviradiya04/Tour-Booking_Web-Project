namespace TourBookingAPI.Model
{
    public class ReviewModel
    {
        public int Review_Id { get; set; }
        public string UserName { get; set; }
        public string ReviewText { get; set; }
        public double Rating { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int userId { get; set; }
        public int tour_Id { get; set; }
        public string? TourName { get; set; }

    }
}
