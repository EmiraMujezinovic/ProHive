namespace backend.DTOs
{
    public class ProjectDto
    {
        public int ProjectId { get; set; }
        public int ClientProfileId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Budget { get; set; }
        public DateOnly Deadline { get; set; }
    }
}