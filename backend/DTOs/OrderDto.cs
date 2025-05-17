namespace backend.DTOs
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public int ServiceId { get; set; }
        public int ClientProfileId { get; set; }
        public int OrderStatusId { get; set; }
        public DateOnly DueDate { get; set; }
    }
}