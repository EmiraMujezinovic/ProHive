using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly ProHiveContext _context;
        public ServicesController(ProHiveContext context)
        {
            _context = context;
        }

        // POST: api/services
        // Kreira novi servis za prijavljenog freelancera
        [HttpPost]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            // Dobavi userId iz tokena
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Prona?i freelancer profil
            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            // Kreiraj novi servis
            var service = new Service
            {
                FreelancerProfileId = freelancerProfile.FreelancerProfileId,
                Title = dto.Title,
                Description = dto.Description,
                ServiceCategoryId = dto.ServiceCategoryId,
                Price = dto.Price,
                DurationInDays = dto.DurationInDays,
                CreatedAt = DateTime.UtcNow
            };
            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            // Dodaj tagove
            if (dto.TagIds != null && dto.TagIds.Any())
            {
                foreach (var tagId in dto.TagIds)
                {
                    var serviceTag = new ServiceTag
                    {
                        ServiceId = service.ServiceId,
                        TagId = tagId
                    };
                    _context.ServiceTags.Add(serviceTag);
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Service created successfully.", serviceId = service.ServiceId });
        }

        // GET: api/services/categories
        // Vra?a sve service kategorije
        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetServiceCategories()
        {
            var categories = await _context.ServiceCategories
                .Select(c => new { c.ServiceCategoryId, c.Service })
                .ToListAsync();
            return Ok(categories);
        }

        // GET: api/services/tags
        // Vra?a sve tagove
        [HttpGet("tags")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTags()
        {
            var tags = await _context.Tags
                .Select(t => new { t.TagId, t.Tag1 })
                .ToListAsync();
            return Ok(tags);
        }

        // GET: api/services/my
        // Vra?a sve servise prijavljenog freelancera
        [HttpGet("my")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> GetMyServices()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            var services = await _context.Services
                .Where(s => s.FreelancerProfileId == freelancerProfile.FreelancerProfileId)
                .Include(s => s.ServiceCategory)
                .Include(s => s.ServiceTags).ThenInclude(st => st.Tag)
                .Select(s => new {
                    s.ServiceId,
                    s.Title,
                    s.Description,
                    s.ServiceCategoryId,
                    Category = s.ServiceCategory.Service,
                    s.Price,
                    s.DurationInDays,
                    s.CreatedAt,
                    Tags = s.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
                })
                .ToListAsync();

            return Ok(services);
        }

        // GET: api/services/{id}
        // Vra?a sve podatke o servisu po id-u (zašti?eno, ali bez role)
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetServiceById(int id)
        {
            var service = await _context.Services
                .Include(s => s.ServiceCategory)
                .Include(s => s.ServiceTags).ThenInclude(st => st.Tag)
                .Include(s => s.FreelancerProfile).ThenInclude(fp => fp.User)
                .FirstOrDefaultAsync(s => s.ServiceId == id);
            if (service == null)
                return NotFound();

            return Ok(new
            {
                service.ServiceId,
                service.Title,
                service.Description,
                service.ServiceCategoryId,
                Category = service.ServiceCategory.Service,
                service.Price,
                service.DurationInDays,
                service.CreatedAt,
                Freelancer = new {
                    service.FreelancerProfile.FreelancerProfileId,
                    service.FreelancerProfile.UserId,
                    service.FreelancerProfile.User.Username,
                    service.FreelancerProfile.User.ProfileImageUrl
                },
                Tags = service.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
            });
        }

        // PUT: api/services/{id}
        // Ažurira samo ona polja koja su eksplicitno poslana (ostala ostaju nepromijenjena)
        [HttpPut("{id}")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> UpdateServicePartial(int id, [FromBody] UpdateServiceDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            var service = await _context.Services.Include(s => s.ServiceTags)
                .FirstOrDefaultAsync(s => s.ServiceId == id && s.FreelancerProfileId == freelancerProfile.FreelancerProfileId);
            if (service == null)
                return NotFound("Service not found or not owned by you.");

            // Ažuriraj samo ona polja koja su eksplicitno poslana (ne null)
            if (dto.Title != null)
                service.Title = dto.Title;
            if (dto.Description != null)
                service.Description = dto.Description;
            if (dto.ServiceCategoryId.HasValue)
            {
                var categoryExists = await _context.ServiceCategories.AnyAsync(c => c.ServiceCategoryId == dto.ServiceCategoryId.Value);
                if (!categoryExists)
                    return BadRequest("Selected service category does not exist.");
                service.ServiceCategoryId = dto.ServiceCategoryId.Value;
            }
            if (dto.Price.HasValue)
                service.Price = dto.Price.Value;
            if (dto.DurationInDays.HasValue)
                service.DurationInDays = dto.DurationInDays.Value;

            // Tagovi (ako su eksplicitno poslani)
            if (dto.TagIds != null)
            {
                _context.ServiceTags.RemoveRange(service.ServiceTags);
                foreach (var tagId in dto.TagIds)
                {
                    var serviceTag = new ServiceTag
                    {
                        ServiceId = service.ServiceId,
                        TagId = tagId
                    };
                    _context.ServiceTags.Add(serviceTag);
                }
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service updated successfully." });
        }
        // DELETE: api/services/{id}
        // Briše servis prijavljenog freelancera
        [HttpDelete("{id}")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            var service = await _context.Services.Include(s => s.ServiceTags)
                .FirstOrDefaultAsync(s => s.ServiceId == id && s.FreelancerProfileId == freelancerProfile.FreelancerProfileId);
            if (service == null)
                return NotFound("Service not found or not owned by you.");

            // Remove tags first (if any)
            _context.ServiceTags.RemoveRange(service.ServiceTags);
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service deleted successfully." });
        }

    }


    // DTO za kreiranje servisa
    public class CreateServiceDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int ServiceCategoryId { get; set; }
        public decimal Price { get; set; }
        public int DurationInDays { get; set; }
        public List<int>? TagIds { get; set; }
    }

    // DTO za ažuriranje servisa
    public class UpdateServiceDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? ServiceCategoryId { get; set; }
        public decimal? Price { get; set; }
        public int? DurationInDays { get; set; }
        public List<int>? TagIds { get; set; }
    }
}
