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
    public class ProjectsController : ControllerBase
    {
        private readonly ProHiveContext _context;
        public ProjectsController(ProHiveContext context)
        {
            _context = context;
        }

        // POST: api/Projects
        // Allows the currently logged-in client to create a new project
        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> CreateProject([FromBody] ProjectDto dto)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            var project = new Project
            {
                ClientProfileId = clientProfile.ClientProfileId,
                Title = dto.Title,
                Description = dto.Description,
                Budget = dto.Budget,
                Deadline = dto.Deadline,
                ProjectStatus = "Open"
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project created successfully.", projectId = project.ProjectId });
        }

        // DELETE: api/Projects/{projectId}
        // Allows the currently logged-in client to delete their own project by projectId
        [HttpDelete("{projectId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> DeleteProject(int projectId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            // Find the project and check if it belongs to this client
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId && p.ClientProfileId == clientProfile.ClientProfileId);
            if (project == null)
                return NotFound(new { message = "Project not found or you do not have permission to delete it." });

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project deleted successfully." });
        }

        // PUT: api/Projects/{projectId}
        // Allows the currently logged-in client to update their own project (except IDs and ProjectStatus)
        [HttpPut("{projectId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> UpdateProjectPartial(int projectId, [FromBody] UpdateProjectDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId && p.ClientProfileId == clientProfile.ClientProfileId);
            if (project == null)
                return NotFound(new { message = "Project not found or you do not have permission to update it." });

            // Update only fields that are explicitly sent (not null/HasValue)
            if (dto.Title != null)
                project.Title = dto.Title;
            if (dto.Description != null)
                project.Description = dto.Description;
            if (dto.Budget.HasValue)
                project.Budget = dto.Budget.Value;
            if (dto.Deadline.HasValue)
                project.Deadline = dto.Deadline.Value;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Project updated successfully." });
        }

        // GET: api/Projects/my
        // Returns all projects for the currently logged-in client
        [HttpGet("my")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetMyProjects()
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            // Get all projects for this client profile
            var projects = await _context.Projects
                .Where(p => p.ClientProfileId == clientProfile.ClientProfileId)
                .Select(p => new ProjectDto
                {
                    ProjectId = p.ProjectId,
                    ClientProfileId = p.ClientProfileId,
                    Title = p.Title,
                    Description = p.Description,
                    Budget = p.Budget,
                    Deadline = p.Deadline,
                    ProjectStatus = p.ProjectStatus
                })
                .ToListAsync();

            return Ok(projects);
        }

        // GET: api/Projects/all
        // Returns all projects in the database
        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllProjects()
        {
            var projects = await _context.Projects
                .Select(p => new ProjectDto
                {
                    ProjectId = p.ProjectId,
                    ClientProfileId = p.ClientProfileId,
                    Title = p.Title,
                    Description = p.Description,
                    Budget = p.Budget,
                    Deadline = p.Deadline,
                    ProjectStatus = p.ProjectStatus
                })
                .ToListAsync();
            return Ok(projects);
        }

        // GET: api/Projects/{projectId}
        // Returns a project by projectId for any logged-in user
        [HttpGet("{projectId}")]
        [Authorize]
        public async Task<IActionResult> GetProjectById(int projectId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId);
            if (project == null)
                return NotFound(new { message = "Project not found." });

            var dto = new ProjectDto
            {
                ProjectId = project.ProjectId,
                ClientProfileId = project.ClientProfileId,
                Title = project.Title,
                Description = project.Description,
                Budget = project.Budget,
                Deadline = project.Deadline,
                ProjectStatus = project.ProjectStatus
            };
            return Ok(dto);
        }
    }
}
