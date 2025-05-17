using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Skill
{
    public int SkillId { get; set; }

    public string Skill1 { get; set; } = null!;

    public virtual ICollection<FreelancerSkill> FreelancerSkills { get; set; } = new List<FreelancerSkill>();
}
