using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Service
{
    public int ServiceId { get; set; }

    public int FreelancerProfileId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int ServiceCategoryId { get; set; }

    public decimal Price { get; set; }

    public int DurationInDays { get; set; }

    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual FreelancerProfile FreelancerProfile { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ServiceCategory ServiceCategory { get; set; } = null!;

    public virtual ICollection<ServiceTag> ServiceTags { get; set; } = new List<ServiceTag>();
}
