using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    }
}
