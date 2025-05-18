using Microsoft.AspNetCore.Http;

namespace backend.DTOs
{
    // DTO for registering a client
    public class RegisterClientDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        // Profile image file (optional)
        public IFormFile? ProfileImage { get; set; }
        // ClientProfile fields
        public string CompanyName { get; set; } = null!;
        public string JobTitle { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Location { get; set; } = null!;
    }

    // DTO for registering a freelancer
    public class RegisterFreelancerDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        // Profile image file (optional)
        public IFormFile? ProfileImage { get; set; }
        // FreelancerProfile fields
        public string ExperianceLevel { get; set; } = null!;
        public string Bio { get; set; } = null!;
        public string Location { get; set; } = null!;
    }
}