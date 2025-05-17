using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ServiceCategory
{
    public int ServiceCategoryId { get; set; }

    public string Service { get; set; } = null!;

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
