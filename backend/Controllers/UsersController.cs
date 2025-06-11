using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ProHiveContext _context;

        public UsersController(ProHiveContext context)
        {
            _context = context;
        }

        // GET: api/Users/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
                return NotFound();

            // Return basic user info including profile image url
            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.ProfileImageUrl,
                user.RoleId
            });
        }

        // GET: api/Users/check-username?username=someusername
        // Checks if a username is already taken (for frontend async validation)
        [HttpGet("check-username")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckUsername([FromQuery] string username)
        {
            // Check if any user exists with the given username
            var exists = await _context.Users.AnyAsync(u => u.Username == username);
            return Ok(new { exists });
        }

        // GET: api/Users/{id}/profile-image
        // Returns the profile image path for the user (only for authenticated users)
        [HttpGet("{id}/profile-image")]
        [Authorize]
        public async Task<IActionResult> GetProfileImage(int id)
        {
            // Get user from database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
                return NotFound();

            // Get logged-in user's id from JWT
            var loggedInUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var loggedInUserRole = User.FindFirstValue(ClaimTypes.Role);

            // Allow only the user themselves or (optionally) an admin to access
            if (loggedInUserId != id /* && loggedInUserRole != "Admin" */)
                return Forbid();

            return Ok(new { profileImageUrl = user.ProfileImageUrl });
        }

        // GET: api/Users/freelancer-profile-image/{freelancerProfileId}
        // Vraca profilnu sliku freelancera na osnovu freelancerProfileId (samo za prijavljenog klijenta)
        [HttpGet("freelancer-profile-image/{freelancerProfileId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetFreelancerProfileImage(int freelancerProfileId)
        {
            var freelancerProfile = await _context.FreelancerProfiles
                .FirstOrDefaultAsync(fp => fp.FreelancerProfileId == freelancerProfileId);

            if (freelancerProfile == null)
                return NotFound("Freelancer profile not found.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == freelancerProfile.UserId);

            if (user == null)
                return NotFound("User not found.");

            return Ok(new { profileImageUrl = user.ProfileImageUrl });
        }

        // GET: api/Users/user-freelancer-info
        // Vraca informacije iz Users i FreelancerProfile tablice na osnovu userId ili freelancerProfileId
        [HttpGet("user-freelancer-info")]
        [Authorize]
        public async Task<IActionResult> GetUserAndFreelancerInfo([FromQuery] int? userId, [FromQuery] int? freelancerProfileId)
        {
            if (userId == null && freelancerProfileId == null)
                return BadRequest("You must provide either userId or freelancerProfileId.");

            // Prvo pokusaj preko freelancerProfileId
            if (freelancerProfileId != null)
            {
                var freelancerProfile = await _context.FreelancerProfiles
                    .Include(fp => fp.User)
                    .FirstOrDefaultAsync(fp => fp.FreelancerProfileId == freelancerProfileId.Value);

                if (freelancerProfile == null)
                    return NotFound("Freelancer profile not found.");

                return Ok(new
                {
                    freelancerProfile.FreelancerProfileId,
                    freelancerProfile.UserId,
                    freelancerProfile.Bio,
                    freelancerProfile.ExperianceLevel,
                    freelancerProfile.Location,
                    User = new
                    {
                        freelancerProfile.User.UserId,
                        freelancerProfile.User.Username,
                        freelancerProfile.User.Email,
                        freelancerProfile.User.FullName,
                        freelancerProfile.User.PhoneNumber,
                        freelancerProfile.User.ProfileImageUrl
                    }
                });
            }
            else // Ako je proslijedjen userId
            {
                var user = await _context.Users
                    .Include(u => u.FreelancerProfiles)
                    .FirstOrDefaultAsync(u => u.UserId == userId.Value);

                if (user == null)
                    return NotFound("User not found.");

                // Uzmi prvi freelancer profil ako postoji
                var freelancerProfile = user.FreelancerProfiles.FirstOrDefault();

                return Ok(new
                {
                    User = new
                    {
                        user.UserId,
                        user.Username,
                        user.Email,
                        user.FullName,
                        user.PhoneNumber,
                        user.ProfileImageUrl
                    },
                    FreelancerProfile = freelancerProfile != null ? new
                    {
                        freelancerProfile.FreelancerProfileId,
                        freelancerProfile.UserId,
                        freelancerProfile.Bio,
                        freelancerProfile.ExperianceLevel,
                        freelancerProfile.Location
                    } : null
                });
            }
        }

        // GET: api/Users/client-profile/{clientProfileId}
        // Returns all client and user data for the given clientProfileId (for the logged-in user)
        [HttpGet("client-profile/{clientProfileId}")]
        [Authorize]
        public async Task<IActionResult> GetClientProfileWithUser(int clientProfileId)
        {
            var clientProfile = await _context.ClientProfiles
                .Include(cp => cp.User)
                .FirstOrDefaultAsync(cp => cp.ClientProfileId == clientProfileId);

            if (clientProfile == null)
                return NotFound("Client profile not found.");

            return Ok(new
            {
                ClientProfile = new
                {
                    clientProfile.ClientProfileId,
                    clientProfile.UserId,
                    clientProfile.CompanyName,
                    clientProfile.JobTitle,
                    clientProfile.Description,
                    clientProfile.Location
                },
                User = new
                {
                    clientProfile.User.UserId,
                    clientProfile.User.Username,
                    clientProfile.User.Email,
                    clientProfile.User.FullName,
                    clientProfile.User.PhoneNumber,
                    clientProfile.User.ProfileImageUrl
                }
            });
        }
    }
}
