using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ProHiveContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ProHiveContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/register/client
        [HttpPost("register/client")]
        public async Task<IActionResult> RegisterClient([FromBody] RegisterClientDto dto)
        {
            // Check if username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return BadRequest("Username or email already exists.");

            // Hash password and store in PasswordHash
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create user
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                ProfileImageUrl = dto.ProfileImageUrl, // Now used only for image path
                PasswordHash = passwordHash, // Store hash here
                RoleId = await GetRoleId("Client"),
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create client profile
            var clientProfile = new ClientProfile
            {
                UserId = user.UserId,
                CompanyName = dto.CompanyName,
                JobTitle = dto.JobTitle,
                Description = dto.Description,
                Location = dto.Location
            };
            _context.ClientProfiles.Add(clientProfile);
            await _context.SaveChangesAsync();

            // Set primary role
            var userRole = new UserRole
            {
                UserId = user.UserId,
                RoleId = user.RoleId,
                IsPrimary = true
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return Ok("Client registered successfully.");
        }

        // POST: api/Auth/register/freelancer
        [HttpPost("register/freelancer")]
        public async Task<IActionResult> RegisterFreelancer([FromBody] RegisterFreelancerDto dto)
        {
            // Check if username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return BadRequest("Username or email already exists.");

            // Hash password and store in PasswordHash
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create user
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                ProfileImageUrl = dto.ProfileImageUrl, // Now used only for image path
                PasswordHash = passwordHash, // Store hash here
                RoleId = await GetRoleId("Freelancer"),
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create freelancer profile
            var freelancerProfile = new FreelancerProfile
            {
                UserId = user.UserId,
                ExperianceLevel = dto.ExperianceLevel,
                Bio = dto.Bio,
                Location = dto.Location
            };
            _context.FreelancerProfiles.Add(freelancerProfile);
            await _context.SaveChangesAsync();

            // Set primary role
            var userRole = new UserRole
            {
                UserId = user.UserId,
                RoleId = user.RoleId,
                IsPrimary = true
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return Ok("Freelancer registered successfully.");
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null)
                return Unauthorized("Invalid username or password.");

            // Verify password using PasswordHash
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password.");

            // Get primary role
            var primaryRole = await _context.UserRoles.Include(ur => ur.Role)
                .Where(ur => ur.UserId == user.UserId && ur.IsPrimary)
                .Select(ur => ur.Role.Role1)
                .FirstOrDefaultAsync();

            // Generate JWT token
            var token = GenerateJwtToken(user, primaryRole);
            return Ok(new { token, role = primaryRole });
        }

        // Helper to get role id by name
        private async Task<int> GetRoleId(string roleName)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Role1 == roleName);
            if (role == null)
            {
                role = new Role { Role1 = roleName };
                _context.Roles.Add(role);
                await _context.SaveChangesAsync();
            }
            return role.RoleId;
        }

        // Helper to generate JWT token
        private string GenerateJwtToken(User user, string? role)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("role", role ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // DTO for login with username
    public class LoginDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
