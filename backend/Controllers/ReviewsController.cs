using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ProHiveContext _context;
        public ReviewsController(ProHiveContext context)
        {
            _context = context;
        }

        // GET: api/Reviews/service/{serviceId}
        // Returns all reviews for a given serviceId
        [HttpGet("service/{serviceId}")]
        [Authorize]
        public async Task<IActionResult> GetReviewsByService(int serviceId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ServiceId == serviceId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    ReviewerId = r.ReviewerId,
                    RevieweeId = r.RevieweeId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    ServiceId = r.ServiceId,
                    ProjectId = r.ProjectId
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/reviewee/{revieweeId}
        // Returns all reviews for a given revieweeId (userId of the reviewee)
        [HttpGet("reviewee/{revieweeId}")]
        [Authorize]
        public async Task<IActionResult> GetReviewsByReviewee(int revieweeId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.RevieweeId == revieweeId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    ReviewerId = r.ReviewerId,
                    RevieweeId = r.RevieweeId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    ServiceId = r.ServiceId,
                    ProjectId = r.ProjectId
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/reviewer/{reviewerId}
        // Returns all reviews for a given reviewerId (userId of the reviewer)
        [HttpGet("reviewer/{reviewerId}")]
        [Authorize]
        public async Task<IActionResult> GetReviewsByReviewer(int reviewerId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ReviewerId == reviewerId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    ReviewerId = r.ReviewerId,
                    RevieweeId = r.RevieweeId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    ServiceId = r.ServiceId,
                    ProjectId = r.ProjectId
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/{reviewId}
        // Returns a single review by reviewId for the logged-in user (must be reviewer or reviewee)
        [HttpGet("{reviewId}")]
        [Authorize]
        public async Task<IActionResult> GetReviewById(int reviewId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the review and check if user is reviewer or reviewee
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && (r.ReviewerId == userId || r.RevieweeId == userId));
            if (review == null)
                return NotFound(new { message = "Review not found or you do not have permission to view it." });

            var dto = new ReviewDto
            {
                ReviewId = review.ReviewId,
                ReviewerId = review.ReviewerId,
                RevieweeId = review.RevieweeId,
                Rating = review.Rating,
                Comment = review.Comment,
                ServiceId = review.ServiceId,
                ProjectId = review.ProjectId
            };
            return Ok(dto);
        }

        // GET: api/Reviews/exists/{reviewId}
        // Returns true/false if a review with the given reviewId exists for the logged-in user (as reviewer or reviewee)
        [HttpGet("exists/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> ReviewExists(int reviewId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Check if review exists for this user (as reviewer or reviewee)
            var exists = await _context.Reviews.AnyAsync(r => r.ReviewId == reviewId && (r.ReviewerId == userId || r.RevieweeId == userId));
            return Ok(new { exists });
        }

        // GET: api/Reviews/average-rating/service/{serviceId}
        // Returns the average rating for a given serviceId
        [HttpGet("average-rating/service/{serviceId}")]
        [Authorize]
        public async Task<IActionResult> GetAverageRatingForService(int serviceId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.ServiceId == serviceId)
                .Select(r => (int?)r.Rating)
                .ToListAsync();

            if (ratings == null || ratings.Count == 0)
                return Ok(new { averageRating = 0 });

            var average = ratings.Average() ?? 0;
            return Ok(new { averageRating = average });
        }

        // GET: api/Reviews/average-rating/reviewee/{revieweeId}
        // Returns the average rating for a given revieweeId (userId)
        [HttpGet("average-rating/reviewee/{revieweeId}")]
        [Authorize]
        public async Task<IActionResult> GetAverageRatingForReviewee(int revieweeId)
        {
            var ratings = await _context.Reviews
                .Where(r => r.RevieweeId == revieweeId)
                .Select(r => (int?)r.Rating)
                .ToListAsync();

            if (ratings == null || ratings.Count == 0)
                return Ok(new { averageRating = 0 });

            var average = ratings.Average() ?? 0;
            return Ok(new { averageRating = average });
        }

        // GET: api/Reviews/by-project/{projectId}
        // Omogu?ava prijavljenom korisniku da dobavi svoj review za dati projekat
        [HttpGet("by-project/{projectId}")]
        [Authorize]
        public async Task<IActionResult> GetMyReviewByProjectId(int projectId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Prona?i review za dati projekat i ovog korisnika
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ProjectId == projectId && r.ReviewerId == userId);
            if (review == null)
                return NotFound(new { message = "You have not left a review for this project." });

            var dto = new ReviewDto
            {
                ReviewId = review.ReviewId,
                ReviewerId = review.ReviewerId,
                RevieweeId = review.RevieweeId,
                Rating = review.Rating,
                Comment = review.Comment,
                ServiceId = review.ServiceId,
                ProjectId = review.ProjectId
            };
            return Ok(dto);
        }

        // POST: api/Reviews
        // Allows a logged-in client to leave a review for a service
        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> LeaveReview([FromBody] ReviewDto dto)
        {
            // Validate rating
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "Review is not valid. Rating must be between 1 and 5." });

            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest(new { message = "Client profile not found." });

            // Check if the service exists
            var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == dto.ServiceId);
            if (service == null)
                return NotFound(new { message = "Service not found." });

            try
            {
                var review = new Review
                {
                    ReviewerId = userId,
                    RevieweeId = null, // Not set for this scenario
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    ServiceId = dto.ServiceId,
                    ProjectId = null // Explicitly set
                };
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Review submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the review.", error = ex.Message });
            }
        }

        // POST: api/Reviews/freelancer-to-client
        // Allows a logged-in freelancer to leave a review for a client (revieweeId is the client's userId, serviceId is null)
        [HttpPost("freelancer-to-client")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> LeaveReviewForClient([FromBody] ReviewDto dto)
        {
            // Validate rating
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "Review is not valid. Rating must be between 1 and 5." });

            // Get userId from JWT token (freelancer)
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find freelancer profile for this user
            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest(new { message = "Freelancer profile not found." });

            // Check if the client user exists
            var clientUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == dto.RevieweeId);
            if (clientUser == null)
                return NotFound(new { message = "Client user not found." });

            try
            {
                var review = new Review
                {
                    ReviewerId = userId,
                    RevieweeId = dto.RevieweeId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    ServiceId = null, // Not set for this scenario
                    ProjectId = null // Explicitly set
                };
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Review for client submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the review.", error = ex.Message });
            }
        }

        // POST: api/Reviews/freelancer-to-project
        // Allows a logged-in freelancer to leave a review for a project
        [HttpPost("freelancer-to-project")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> LeaveReviewForProject([FromBody] ReviewDto dto)
        {
            // Validate rating
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest(new { message = "Review is not valid. Rating must be between 1 and 5." });

            // Get userId from JWT token (freelancer)
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find freelancer profile for this user
            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest(new { message = "Freelancer profile not found." });

            // Check if the project exists
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == dto.ProjectId);
            if (project == null)
                return NotFound(new { message = "Project not found." });

            // Check if review already exists for this freelancer and project
            var alreadyReviewed = await _context.Reviews.AnyAsync(r => r.ProjectId == dto.ProjectId && r.ReviewerId == userId);
            if (alreadyReviewed)
                return BadRequest(new { message = "You have already left a review for this project." });

            try
            {
                var review = new Review
                {
                    ReviewerId = userId,
                    RevieweeId = null,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    ServiceId = null,
                    ProjectId = dto.ProjectId
                };
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Review for project submitted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the review.", error = ex.Message });
            }
        }

        // DELETE: api/Reviews/{reviewId}
        // Allows the logged-in user to delete their own review by reviewId
        [HttpDelete("{reviewId}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the review and check if it belongs to this user
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.ReviewerId == userId);
            if (review == null)
                return NotFound(new { message = "Review not found or you do not have permission to delete it." });

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review deleted successfully." });
        }
    }
}
