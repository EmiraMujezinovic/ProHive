namespace backend.DTOs
{
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int ReviewerId { get; set; }
        public int? RevieweeId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
        public int? ServiceId { get; set; }
        public int? ProjectId { get; set; }
    }
}