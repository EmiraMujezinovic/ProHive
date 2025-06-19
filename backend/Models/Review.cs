using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int ReviewerId { get; set; }

    public int? RevieweeId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = null!;

    public int? ServiceId { get; set; }

    public int? ProjectId { get; set; }

    public virtual Project? Project { get; set; }

    public virtual User? Reviewee { get; set; }

    public virtual User Reviewer { get; set; } = null!;

    public virtual Service? Service { get; set; }
}
