using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SkillsController : ControllerBase
    {
        private readonly ProHiveContext _context;
        public SkillsController(ProHiveContext context)
        {
            _context = context;
        }

        // GET: api/Skills
        // Returns all available skills for selection during freelancer registration
        [HttpGet]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _context.Skills
                .Select(s => new { s.SkillId, s.Skill1 })
                .ToListAsync();
            return Ok(skills);
        }
    }
}
