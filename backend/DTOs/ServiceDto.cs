namespace backend.DTOs
{
    public class ServiceDto
    {
        public int ServiceId { get; set; }
        public int FreelancerProfileId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int ServiceCategoryId { get; set; }
        public decimal Price { get; set; }
        public int DurationInDays { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}