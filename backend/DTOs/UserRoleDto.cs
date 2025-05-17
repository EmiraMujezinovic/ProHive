namespace backend.DTOs
{
    public class UserRoleDto
    {
        public int UserRoleId { get; set; }
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public bool IsPrimary { get; set; }
    }
}