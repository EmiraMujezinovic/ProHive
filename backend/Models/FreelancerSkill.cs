using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class FreelancerSkill
{
    public int FreelancerSkillsId { get; set; }

    public int FreelancerProfileId { get; set; }

    public int SkillId { get; set; }

    public virtual FreelancerProfile FreelancerProfile { get; set; } = null!;

    public virtual Skill Skill { get; set; } = null!;
}
