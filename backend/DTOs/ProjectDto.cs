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
        public string ProjectStatus { get; set; } = null!;
    }

    // DTO za azuriranje projekta
    public class UpdateProjectDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? Budget { get; set; }
        public DateOnly? Deadline { get; set; }
    }
}