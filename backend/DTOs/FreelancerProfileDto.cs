namespace backend.DTOs
{
    public class FreelancerProfileDto
    {
        public int FreelancerProfileId { get; set; }
        public int UserId { get; set; }
        public string ExperianceLevel { get; set; } = null!;
        public string Bio { get; set; } = null!;
        public string Location { get; set; } = null!;
    }
}