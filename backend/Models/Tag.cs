using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Tag
{
    public int TagId { get; set; }

    public string Tag1 { get; set; } = null!;

    public virtual ICollection<ServiceTag> ServiceTags { get; set; } = new List<ServiceTag>();
}
