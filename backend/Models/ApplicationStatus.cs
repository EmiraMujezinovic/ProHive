using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ApplicationStatus
{
    public int ApplicationStatusId { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<ProjectApplication> ProjectApplications { get; set; } = new List<ProjectApplication>();
}
