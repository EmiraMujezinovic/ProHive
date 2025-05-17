namespace backend.DTOs
{
    public class OrderStatusDto
    {
        public int OrderStatusId { get; set; }
        public string Status { get; set; } = null!;
    }
}