namespace backend.DTOs
{
    public class ClientProfileDto
    {
        public int ClientProfileId { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = null!;
        public string JobTitle { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
    }
}