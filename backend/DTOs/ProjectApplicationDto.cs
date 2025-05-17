namespace backend.DTOs
{
    public class ProjectApplicationDto
    {
        public int ApplicationId { get; set; }
        public int ProjectId { get; set; }
        public int FreelancerProfileId { get; set; }
        public string Proposal { get; set; } = null!;
        public int ApplicationStatusId { get; set; }
    }
}