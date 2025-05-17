namespace backend.DTOs
{
    public class PaymentStatusDto
    {
        public int PaymentStatusId { get; set; }
        public string Status { get; set; } = null!;
    }
}