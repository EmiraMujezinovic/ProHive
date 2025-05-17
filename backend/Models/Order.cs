using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int ServiceId { get; set; }

    public int ClientProfileId { get; set; }

    public int OrderStatusId { get; set; }

    public DateOnly DueDate { get; set; }

    public virtual ClientProfile ClientProfile { get; set; } = null!;

    public virtual OrderStatus OrderStatus { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Service Service { get; set; } = null!;
}
