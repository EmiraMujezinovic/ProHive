using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Linq;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ProHiveContext _context;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        private const string ProfileImagesFolder = "profile-images";
        private const string DefaultImageName = "default.png";

        public AuthController(ProHiveContext context, IConfiguration configuration, IWebHostEnvironment env)
        {
            _context = context;
            _configuration = configuration;
            _env = env;
        }

        // POST: api/Auth/register/client
        [HttpPost("register/client")]
        [RequestSizeLimit(10_000_000)] // Limit upload size to 10MB
        public async Task<IActionResult> RegisterClient([FromForm] RegisterClientDto dto)
        {
            // Check if username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return BadRequest("Username or email already exists.");

            // Hash password and store in PasswordHash
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create user first to get UserId
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash,
                RoleId = await GetRoleId("Client"),
                ProfileImageUrl = string.Empty // Will set after file save
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Handle profile image upload
            string imageFileName = DefaultImageName;
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                imageFileName = $"{user.UserId}{Path.GetExtension(dto.ProfileImage.FileName)}";
                var savePath = Path.Combine(_env.WebRootPath, ProfileImagesFolder, imageFileName);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }
            }
            // Set profile image url (relative path)
            user.ProfileImageUrl = $"/{ProfileImagesFolder}/{imageFileName}";
            _context.Users.Update(user);
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
        [RequestSizeLimit(10_000_000)] // Limit upload size to 10MB
        public async Task<IActionResult> RegisterFreelancer([FromForm] RegisterFreelancerDto dto)
        {
            // Check if username or email already exists
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return BadRequest("Username or email already exists.");

            // Hash password and store in PasswordHash
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Create user first to get UserId
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                FullName = dto.FullName,
                PhoneNumber = dto.PhoneNumber,
                PasswordHash = passwordHash,
                RoleId = await GetRoleId("Freelancer"),
                ProfileImageUrl = string.Empty // Will set after file save
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Handle profile image upload
            string imageFileName = DefaultImageName;
            if (dto.ProfileImage != null && dto.ProfileImage.Length > 0)
            {
                imageFileName = $"{user.UserId}{Path.GetExtension(dto.ProfileImage.FileName)}";
                var savePath = Path.Combine(_env.WebRootPath, ProfileImagesFolder, imageFileName);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    await dto.ProfileImage.CopyToAsync(stream);
                }
            }
            user.ProfileImageUrl = $"/{ProfileImagesFolder}/{imageFileName}";
            _context.Users.Update(user);
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

            // Save selected skills in FreelancerSkills table
            if (dto.SkillIds != null && dto.SkillIds.Any())
            {
                foreach (var skillId in dto.SkillIds)
                {
                    var freelancerSkill = new FreelancerSkill
                    {
                        FreelancerProfileId = freelancerProfile.FreelancerProfileId,
                        SkillId = skillId
                    };
                    _context.FreelancerSkills.Add(freelancerSkill);
                }
                await _context.SaveChangesAsync();
            }

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
