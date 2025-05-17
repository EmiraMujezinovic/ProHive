using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int? OrderId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public int PaymentStatusId { get; set; }

    public int? ApplicationId { get; set; }

    public virtual ProjectApplication? Application { get; set; }

    public virtual Order? Order { get; set; }

    public virtual PaymentStatus PaymentStatus { get; set; } = null!;
}
