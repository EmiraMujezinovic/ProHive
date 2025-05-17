namespace backend.DTOs
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int? OrderId { get; set; }
        public decimal Amount { get; set; }
        public DateOnly PaymentDate { get; set; }
        public int PaymentStatusId { get; set; }
        public int? ApplicationId { get; set; }
    }
}