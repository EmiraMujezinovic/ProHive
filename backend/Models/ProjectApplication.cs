using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ProjectApplication
{
    public int ApplicationId { get; set; }

    public int ProjectId { get; set; }

    public int FreelancerProfileId { get; set; }

    public string Proposal { get; set; } = null!;

    public int ApplicationStatusId { get; set; }

    public virtual ApplicationStatus ApplicationStatus { get; set; } = null!;

    public virtual FreelancerProfile FreelancerProfile { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Project Project { get; set; } = null!;
}
