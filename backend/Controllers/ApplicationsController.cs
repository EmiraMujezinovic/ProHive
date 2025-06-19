using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationsController : ControllerBase
    {
        private readonly ProHiveContext _context;
        public ApplicationsController(ProHiveContext context)
        {
            _context = context;
        }

        // POST: api/Applications
        // Allows a logged-in freelancer to create a project application
        [HttpPost]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> CreateProjectApplication([FromBody] CreateProjectApplicationDto dto)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find freelancer profile for this user
            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            // Check if the project exists
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == dto.ProjectId);
            if (project == null)
                return NotFound("Project not found.");

            var application = new ProjectApplication
            {
                ProjectId = dto.ProjectId,
                FreelancerProfileId = freelancerProfile.FreelancerProfileId,
                Proposal = dto.Proposal,
                ApplicationStatusId = 1
            };
            _context.ProjectApplications.Add(application);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Application submitted successfully.", applicationId = application.ApplicationId });
        }

        // PUT: api/Applications/accept/{applicationId}
        // Allows a logged-in client to accept a project application (set status to 2)
        [HttpPut("accept/{applicationId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> AcceptApplication(int applicationId)
        {
            // Find the application
            var application = await _context.ProjectApplications.Include(a => a.Project).FirstOrDefaultAsync(a => a.ApplicationId == applicationId);
            if (application == null)
                return NotFound("Application not found.");

            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Check if the logged-in client owns the project
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null || application.Project.ClientProfileId != clientProfile.ClientProfileId)
                return Forbid();

            application.ApplicationStatusId = 2;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Application accepted." });
        }

        // PUT: api/Applications/reject/{applicationId}
        // Allows a logged-in client to reject a project application (set status to 3)
        [HttpPut("reject/{applicationId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> RejectApplication(int applicationId)
        {
            var application = await _context.ProjectApplications.Include(a => a.Project).FirstOrDefaultAsync(a => a.ApplicationId == applicationId);
            if (application == null)
                return NotFound("Application not found.");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null || application.Project.ClientProfileId != clientProfile.ClientProfileId)
                return Forbid();

            application.ApplicationStatusId = 3;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Application rejected." });
        }

        // PUT: api/Applications/withdraw/{applicationId}
        // Allows a logged-in freelancer to withdraw their application (set status to 4)
        [HttpPut("withdraw/{applicationId}")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> WithdrawApplication(int applicationId)
        {
            var application = await _context.ProjectApplications.Include(a => a.FreelancerProfile).FirstOrDefaultAsync(a => a.ApplicationId == applicationId);
            if (application == null)
                return NotFound("Application not found.");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (freelancerProfile == null || application.FreelancerProfileId != freelancerProfile.FreelancerProfileId)
                return Forbid();

            application.ApplicationStatusId = 4;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Application withdrawn." });
        }

        // PUT: api/Applications/cancel/{applicationId}
        // Allows a logged-in client to cancel an application (set status to 5)
        [HttpPut("cancel/{applicationId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> CancelApplication(int applicationId)
        {
            var application = await _context.ProjectApplications.Include(a => a.Project).FirstOrDefaultAsync(a => a.ApplicationId == applicationId);
            if (application == null)
                return NotFound("Application not found.");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null || application.Project.ClientProfileId != clientProfile.ClientProfileId)
                return Forbid();

            application.ApplicationStatusId = 5;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Application cancelled." });
        }

        // PUT: api/Applications/complete/{applicationId}
        // Allows a logged-in user to complete a project application (set status to 6, finish project, create payment)
        [HttpPut("complete/{applicationId}")]
        [Authorize]
        public async Task<IActionResult> CompleteApplication(int applicationId)
        {
            // Find the application
            var application = await _context.ProjectApplications.Include(a => a.Project).FirstOrDefaultAsync(a => a.ApplicationId == applicationId);
            if (application == null)
                return NotFound("Application not found.");

            // Set application status to 6 (completed)
            application.ApplicationStatusId = 6;

            // Set project status to "Finished"
            if (application.Project != null)
            {
                application.Project.ProjectStatus = "Finished";
            }

            // Create payment for this application
            var payment = new Payment
            {
                OrderId = null,
                Amount = application.Project?.Budget ?? 0,
                PaymentDate = DateOnly.FromDateTime(DateTime.UtcNow),
                PaymentStatusId = 2,
                ApplicationId = applicationId
            };
            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Application completed, project finished, and payment created." });
        }

        // GET: api/Applications/my-project-applications
        // Returns all project applications for projects created by the logged-in client
        [HttpGet("my-project-applications")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetApplicationsForMyProjects()
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            // Get all project applications for projects owned by this client
            var applications = await _context.ProjectApplications
                .Include(a => a.Project)
                .Include(a => a.FreelancerProfile)
                .Where(a => a.Project.ClientProfileId == clientProfile.ClientProfileId)
                .Select(a => new {
                    a.ApplicationId,
                    a.ProjectId,
                    ProjectTitle = a.Project.Title,
                    a.FreelancerProfileId,
                    Freelancer = new {
                        a.FreelancerProfile.FreelancerProfileId,
                        a.FreelancerProfile.UserId
                    },
                    a.Proposal,
                    a.ApplicationStatusId
                })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/Applications/my-applications
        // Vraca sve project applications koje je kreirao prijavljeni freelancer
        [HttpGet("my-applications")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> GetMyProjectApplications()
        {
            // Dobavi userId iz JWT tokena
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Pronadji freelancer profil
            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            // Vrati sve aplikacije koje je kreirao ovaj freelancer
            var applications = await _context.ProjectApplications
                .Include(a => a.Project)
                .Include(a => a.ApplicationStatus)
                .Where(a => a.FreelancerProfileId == freelancerProfile.FreelancerProfileId)
                .Select(a => new {
                    a.ApplicationId,
                    a.ProjectId,
                    ProjectTitle = a.Project.Title,
                    a.Proposal,
                    a.ApplicationStatusId,
                    ApplicationStatus = a.ApplicationStatus.Status
                })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/Applications/{applicationId}
        // Omogucuje prijavljenom korisniku da dobavi project application po applicationId
        [HttpGet("{applicationId}")]
        [Authorize]
        public async Task<IActionResult> GetProjectApplicationById(int applicationId)
        {
            var application = await _context.ProjectApplications
                .Include(a => a.Project).ThenInclude(p => p.ClientProfile)
                .Include(a => a.FreelancerProfile)
                .Include(a => a.ApplicationStatus)
                .FirstOrDefaultAsync(a => a.ApplicationId == applicationId);
            if (application == null)
                return NotFound("Application not found.");

            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Dozvoli pristup ako je korisnik vlasnik aplikacije (freelancer) ili vlasnik projekta (client)
            bool isFreelancer = application.FreelancerProfile.UserId == userId;
            bool isClient = application.Project.ClientProfile != null && application.Project.ClientProfile.UserId == userId;
            if (!isFreelancer && !isClient)
                return Forbid();

            return Ok(new {
                application.ApplicationId,
                application.ProjectId,
                ProjectTitle = application.Project.Title,
                application.FreelancerProfileId,
                Freelancer = new {
                    application.FreelancerProfile.FreelancerProfileId,
                    application.FreelancerProfile.UserId
                },
                application.Proposal,
                application.ApplicationStatusId,
                ApplicationStatus = application.ApplicationStatus.Status
            });
        }

        // GET: api/Applications/by-project/{projectId}
        // Omogucuje prijavljenom korisniku da dobavi sve project applications za dati projectId
        [HttpGet("by-project/{projectId}")]
        [Authorize]
        public async Task<IActionResult> GetApplicationsByProjectId(int projectId)
        {
            // Provjeri postoji li projekat
            var project = await _context.Projects
                .Include(p => p.ClientProfile)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null)
                return NotFound("Project not found.");

            // Dobavi userId iz JWT tokena
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Dozvoli pristup ako je korisnik vlasnik projekta (client) ili je freelancer koji je aplicirao na projekat
            var clientProfile = project.ClientProfile;
            bool isClient = clientProfile != null && clientProfile.UserId == userId;
            bool isFreelancer = await _context.FreelancerProfiles.AnyAsync(fp => fp.UserId == userId && _context.ProjectApplications.Any(pa => pa.ProjectId == projectId && pa.FreelancerProfileId == fp.FreelancerProfileId));
            if (!isClient && !isFreelancer)
                return Forbid();

            var applications = await _context.ProjectApplications
                .Include(a => a.FreelancerProfile)
                .Include(a => a.ApplicationStatus)
                .Where(a => a.ProjectId == projectId)
                .Select(a => new {
                    a.ApplicationId,
                    a.ProjectId,
                    a.FreelancerProfileId,
                    Freelancer = new {
                        a.FreelancerProfile.FreelancerProfileId,
                        a.FreelancerProfile.UserId
                    },
                    a.Proposal,
                    a.ApplicationStatusId,
                    ApplicationStatus = a.ApplicationStatus.Status
                })
                .ToListAsync();

            return Ok(applications);
        }
    }

    // DTO for creating a project application
    public class CreateProjectApplicationDto
    {
        public int ProjectId { get; set; }
        public string Proposal { get; set; } = null!;
    }
}
