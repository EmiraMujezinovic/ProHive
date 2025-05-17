using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class ServiceTag
{
    public int ServiceTagId { get; set; }

    public int ServiceId { get; set; }

    public int TagId { get; set; }

    public virtual Service Service { get; set; } = null!;

    public virtual Tag Tag { get; set; } = null!;
}
