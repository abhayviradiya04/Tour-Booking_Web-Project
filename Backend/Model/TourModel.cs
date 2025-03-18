namespace TourBookingAPI.Model
{
    public class TourModel
    {
        public int tour_Id { get; set; }
        public string Title { get; set; }
        public string City { get; set; }

        public string Address { get; set; }

        public int Distance { get; set; }
        public string Photo { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int MaxGroupSize { get; set; }
        public bool Featured { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
