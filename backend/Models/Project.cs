using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Project
{
    public int ProjectId { get; set; }

    public int ClientProfileId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal Budget { get; set; }

    public DateOnly Deadline { get; set; }

    public virtual ClientProfile ClientProfile { get; set; } = null!;

    public virtual ICollection<ProjectApplication> ProjectApplications { get; set; } = new List<ProjectApplication>();
}
