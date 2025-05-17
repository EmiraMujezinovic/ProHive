namespace backend.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public int RoleId { get; set; }
        public string ProfileImageUrl { get; set; } = null!;
        public string Username { get; set; } = null!;
    }
}