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

            // Pronadji freelancer profil
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
        // Vraca sve service kategorije
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
        // Vraca sve tagove
        [HttpGet("tags")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTags()
        {
            var tags = await _context.Tags
                .Select(t => new { t.TagId, t.Tag1 })
                .ToListAsync();
            return Ok(tags);
        }
        // GET: api/services/all
        // Vraca sve servise zajedno s informacijama o freelanceru koji ih je kreirao
        [HttpGet("all")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllServicesWithFreelancer()
        {
            var services = await _context.Services
                .Include(s => s.FreelancerProfile)
                    .ThenInclude(fp => fp.User)
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
                    Freelancer = new
                    {
                        s.FreelancerProfile.FreelancerProfileId,
                        s.FreelancerProfile.UserId,
                        s.FreelancerProfile.User.Username,
                        s.FreelancerProfile.User.FullName,
                        s.FreelancerProfile.User.ProfileImageUrl
                    },
                    Tags = s.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
                })
                .ToListAsync();

            return Ok(services);
        }
        // GET: api/services/my
        // Vraca sve servise prijavljenog freelancera
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
        // Vraca sve podatke o servisu po id-u (zasticeno, ali bez role)
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
                Freelancer = new
                {
                    service.FreelancerProfile.FreelancerProfileId,
                    service.FreelancerProfile.UserId,
                    service.FreelancerProfile.User.Username,
                    service.FreelancerProfile.User.ProfileImageUrl
                },
                Tags = service.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
            });
        }

        // GET: api/services/my/search
        // Pretrazuje servise prijavljenog freelancera po naslovu
        [HttpGet("my/search")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> SearchMyServices([FromQuery] string title)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            var services = await _context.Services
                .Where(s => s.FreelancerProfileId == freelancerProfile.FreelancerProfileId &&
                            EF.Functions.Like(s.Title.ToLower(), "%" + title.ToLower() + "%"))
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
        // GET: api/services/search/title
        // Pretrazuje sve servise po naslovu
        [HttpGet("search/title")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchAllServicesByTitle([FromQuery] string title)
        {
            var services = await _context.Services
                .Include(s => s.FreelancerProfile).ThenInclude(fp => fp.User)
                .Include(s => s.ServiceCategory)
                .Include(s => s.ServiceTags).ThenInclude(st => st.Tag)
                .Where(s => EF.Functions.Like(s.Title.ToLower(), "%" + title.ToLower() + "%"))
                .Select(s => new {
                    s.ServiceId,
                    s.Title,
                    s.Description,
                    s.ServiceCategoryId,
                    Category = s.ServiceCategory.Service,
                    s.Price,
                    s.DurationInDays,
                    s.CreatedAt,
                    Freelancer = new
                    {
                        s.FreelancerProfile.FreelancerProfileId,
                        s.FreelancerProfile.UserId,
                        s.FreelancerProfile.User.Username,
                        s.FreelancerProfile.User.FullName,
                        s.FreelancerProfile.User.ProfileImageUrl
                    },
                    Tags = s.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
                })
                .ToListAsync();
            return Ok(services);
        }
        // GET: api/services/search/category
        // Pretrazuje sve servise po kategoriji
        [HttpGet("search/category")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchAllServicesByCategory([FromQuery] int categoryId)
        {
            var services = await _context.Services
                .Include(s => s.FreelancerProfile).ThenInclude(fp => fp.User)
                .Include(s => s.ServiceCategory)
                .Include(s => s.ServiceTags).ThenInclude(st => st.Tag)
                .Where(s => s.ServiceCategoryId == categoryId)
                .Select(s => new {
                    s.ServiceId,
                    s.Title,
                    s.Description,
                    s.ServiceCategoryId,
                    Category = s.ServiceCategory.Service,
                    s.Price,
                    s.DurationInDays,
                    s.CreatedAt,
                    Freelancer = new
                    {
                        s.FreelancerProfile.FreelancerProfileId,
                        s.FreelancerProfile.UserId,
                        s.FreelancerProfile.User.Username,
                        s.FreelancerProfile.User.FullName,
                        s.FreelancerProfile.User.ProfileImageUrl
                    },
                    Tags = s.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
                })
                .ToListAsync();
            return Ok(services);
        }
        // PUT: api/services/{id}
        // Azurira samo ona polja koja su eksplicitno poslana (ostala ostaju nepromijenjena)
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

            // Azuriraj samo ona polja koja su eksplicitno poslana (ne null)
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
        // Brise servis prijavljenog freelancera
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

        // POST: api/services/favorite/{serviceId}
        // Dodaje servis u favorite za prijavljenog korisnika (klijenta)
        [HttpPost("favorite/{serviceId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> AddServiceToFavorites(int serviceId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Provjeri postoji li vec u favoritima
            var alreadyFavorite = await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.ServiceId == serviceId);
            if (alreadyFavorite)
                return BadRequest("Service is already in favorites.");

            // Provjeri postoji li servis
            var serviceExists = await _context.Services.AnyAsync(s => s.ServiceId == serviceId);
            if (!serviceExists)
                return NotFound("Service not found.");

            var favorite = new Favorite
            {
                UserId = userId,
                ServiceId = serviceId
            };
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service added to favorites." });
        }

        // GET: api/services/favorites/{userId}
        // Vraca sve servise koje je korisnik dodao u favorite
        [HttpGet("favorites/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetFavoriteServicesByUser(int userId)
        {
            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Service)
                    .ThenInclude(s => s.FreelancerProfile)
                        .ThenInclude(fp => fp.User)
                .Include(f => f.Service.ServiceCategory)
                .Include(f => f.Service.ServiceTags).ThenInclude(st => st.Tag)
                .Select(f => new {
                    f.Service.ServiceId,
                    f.Service.Title,
                    f.Service.Description,
                    f.Service.ServiceCategoryId,
                    Category = f.Service.ServiceCategory.Service,
                    f.Service.Price,
                    f.Service.DurationInDays,
                    f.Service.CreatedAt,
                    Freelancer = new
                    {
                        f.Service.FreelancerProfile.FreelancerProfileId,
                        f.Service.FreelancerProfile.UserId,
                        f.Service.FreelancerProfile.User.Username,
                        f.Service.FreelancerProfile.User.FullName,
                        f.Service.FreelancerProfile.User.ProfileImageUrl
                    },
                    Tags = f.Service.ServiceTags.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList()
                })
                .ToListAsync();

            return Ok(favorites);
        }
        // DELETE: api/services/favorite/{serviceId}
        // Uklanja servis iz favorita za prijavljenog korisnika (usera)
        [HttpDelete("favorite/{serviceId}")]
        [Authorize]
        public async Task<IActionResult> RemoveServiceFromFavorites(int serviceId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ServiceId == serviceId);

            if (favorite == null)
                return NotFound("Favorite not found for this user and service.");

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service removed from favorites." });
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

    // DTO za azuriranje servisa
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
