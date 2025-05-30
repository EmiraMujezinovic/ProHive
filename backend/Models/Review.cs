﻿using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int ReviewerId { get; set; }

    public int RevieweeId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = null!;

    public virtual User Reviewee { get; set; } = null!;

    public virtual User Reviewer { get; set; } = null!;
}
