using Backend; // zbog ServiceRecommendationModel
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Models;
using System.Linq;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecommendationsController : ControllerBase
    {
        private readonly ProHiveContext _context;
        public RecommendationsController(ProHiveContext context)
        {
            _context = context;
        }

        // GET: api/recommendations/services
        // Vra?a preporu?ene servise za prijavljenog klijenta
        [HttpGet("services")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetRecommendedServicesForClient()
        {
            // Dobavi userId iz JWT tokena
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Dobavi sve servise iz baze
            var services = await _context.Services
                .Include(s => s.FreelancerProfile).ThenInclude(fp => fp.User)
                .Include(s => s.ServiceCategory)
                .Include(s => s.ServiceTags).ThenInclude(st => st.Tag)
                .ToListAsync();

            // (Opcionalno) Dobavi servise koje je korisnik ve? ocijenio
            var ratedServiceIds = await _context.Reviews
                .Where(r => r.ReviewerId == userId && r.ServiceId != null)
                .Select(r => r.ServiceId.Value)
                .ToListAsync();

            // Pripremi listu predikcija
            var predictions = new List<(Service service, float score)>();
            foreach (var service in services)
            {
                // (Opcionalno) Presko?i servise koje je korisnik ve? ocijenio
                if (ratedServiceIds.Contains(service.ServiceId))
                    continue;

                var input = new ServiceRecommendationModel.ModelInput
                {
                    UserId = userId,
                    ServiceId = service.ServiceId,
                    Rating = 0 // Rating nije bitan za predikciju
                };
                var output = ServiceRecommendationModel.Predict(input);
                predictions.Add((service, output.Score));
            }

            // Sortiraj po score i uzmi top 10
            var topServices = predictions
                .OrderByDescending(p => p.score)
                .Take(10)
                .Select(p => new
                {
                    p.service.ServiceId,
                    p.service.Title,
                    p.service.Description,
                    p.service.ServiceCategoryId,
                    Category = p.service.ServiceCategory?.Service,
                    p.service.Price,
                    p.service.DurationInDays,
                    p.service.CreatedAt,
                    Freelancer = p.service.FreelancerProfile != null ? new
                    {
                        p.service.FreelancerProfile.FreelancerProfileId,
                        p.service.FreelancerProfile.UserId,
                        p.service.FreelancerProfile.User?.Username,
                        p.service.FreelancerProfile.User?.FullName,
                        p.service.FreelancerProfile.User?.ProfileImageUrl
                    } : null,
                    Tags = p.service.ServiceTags?.Select(st => new { st.TagId, st.Tag.Tag1 }).ToList(),
                    RecommendationScore = p.score
                })
                .ToList();

            return Ok(topServices);
        }
    }
}
