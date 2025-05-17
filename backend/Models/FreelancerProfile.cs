using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class FreelancerProfile
{
    public int FreelancerProfileId { get; set; }

    public int UserId { get; set; }

    public string ExperianceLevel { get; set; } = null!;

    public string Bio { get; set; } = null!;

    public string Location { get; set; } = null!;

    public virtual ICollection<FreelancerSkill> FreelancerSkills { get; set; } = new List<FreelancerSkill>();

    public virtual ICollection<ProjectApplication> ProjectApplications { get; set; } = new List<ProjectApplication>();

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();

    public virtual User User { get; set; } = null!;
}
