using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ProHiveContext _context;

        public OrdersController(ProHiveContext context)
        {
            _context = context;
        }

        // GET: api/Orders/clientorders
        // Returns all orders for the currently logged-in client (by their clientProfileId)
        [HttpGet("clientOrders")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetMyOrders()
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            // Get all orders for this client profile
            var orders = await _context.Orders
                .Where(o => o.ClientProfileId == clientProfile.ClientProfileId)
                .Include(o => o.Service)
                .Include(o => o.OrderStatus)
                .Select(o => new {
                    o.OrderId,
                    o.ServiceId,
                    o.ClientProfileId,
                    o.OrderStatusId,
                    o.DueDate,
                    Service = new {
                        o.Service.ServiceId,
                        o.Service.Title,
                        o.Service.Description,
                        o.Service.Price
                    },
                    OrderStatus = new {
                        o.OrderStatus.OrderStatusId,
                        o.OrderStatus.Status
                    }
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/Orders/freelancer-orders
        // Returns all orders for services belonging to the currently logged-in freelancer
        [HttpGet("freelancer-orders")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> GetOrdersForFreelancer()
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find freelancer profile for this user
            var freelancerProfile = await _context.FreelancerProfiles.FirstOrDefaultAsync(fp => fp.UserId == userId);
            if (freelancerProfile == null)
                return BadRequest("Freelancer profile not found.");

            // Get all orders for services belonging to this freelancer
            var orders = await _context.Orders
                .Include(o => o.Service)
                .Include(o => o.OrderStatus)
                .Include(o => o.ClientProfile)
                .Where(o => o.Service.FreelancerProfileId == freelancerProfile.FreelancerProfileId)
                .Select(o => new {
                    o.OrderId,
                    o.ServiceId,
                    o.ClientProfileId,
                    o.OrderStatusId,
                    o.DueDate,
                    Service = new {
                        o.Service.ServiceId,
                        o.Service.Title,
                        o.Service.Description,
                        o.Service.Price
                    },
                    OrderStatus = new {
                        o.OrderStatus.OrderStatusId,
                        o.OrderStatus.Status
                    },
                    ClientProfile = new {
                        o.ClientProfile.ClientProfileId,
                        o.ClientProfile.CompanyName,
                        o.ClientProfile.JobTitle,
                        o.ClientProfile.Description,
                        o.ClientProfile.Location
                    }
                })
                .ToListAsync();

            return Ok(orders);
        }

        // POST: api/Orders
        // Allows the currently logged-in client to create a new order. Only creates if there is no active order (status 1 or 2) for this client and service.
        [HttpPost]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> CreateOrder([FromBody] int serviceId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            // Check if the service exists
            var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == serviceId);
            if (service == null)
                return NotFound("Service not found.");

            // Check for existing order for this client and service with status 1 or 2
            var existingOrder = await _context.Orders.FirstOrDefaultAsync(o => o.ServiceId == serviceId && o.ClientProfileId == clientProfile.ClientProfileId && (o.OrderStatusId == 1 || o.OrderStatusId == 2));
            if (existingOrder != null)
            {
                return BadRequest(new { message = "Order already placed for this service." });
            }

            // Create new order if not exists or if previous order is completed/cancelled/expired
            var order = new Order
            {
                ServiceId = serviceId,
                ClientProfileId = clientProfile.ClientProfileId,
                OrderStatusId = 1, // Default status
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5))
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order created successfully.", orderId = order.OrderId });
        }

        // POST: api/Orders/cancel/{orderId}
        // Cancels the order by updating OrderStatusId to 4 for the given orderId. Does not create a new order.
        [HttpPost("cancel/{orderId}")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
                return NotFound(new { message = "Order with the given ID does not exist." });

            order.OrderStatusId = 4; // 4 = cancelled
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order cancelled successfully." });
        }

        // POST: api/Orders/check-duedate/{orderId}
        // Checks the due date for the given order and updates OrderStatusId to 5 if expired (unless it was 3). Does not create a new order.
        [HttpPost("check-duedate/{orderId}")]
        [Authorize]
        public async Task<IActionResult> CheckDueDate(int orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
                return NotFound(new { message = "Order with the given ID does not exist." });

            // If the order status was 3, do not change it
            if (order.OrderStatusId == 3)
                return Ok(new { message = "Order status is 3, no update performed." });

            // If due date has passed, set status to 5
            if (order.DueDate < DateOnly.FromDateTime(DateTime.UtcNow))
            {
                order.OrderStatusId = 5; // 5 = expired
                await _context.SaveChangesAsync();
                return Ok(new { message = "Order status set to expired (5)." });
            }

            return Ok(new { message = "Order due date has not passed. No update performed." });
        }

        // POST: api/Orders/accept/{orderId}
        // Accepts the order by updating OrderStatusId to 2 and setting DueDate to now + service.DurationInDays. Only updates existing order.
        [HttpPost("accept/{orderId}")]
        [Authorize(Roles = "Freelancer")]
        public async Task<IActionResult> AcceptOrder(int orderId)
        {
            var order = await _context.Orders.Include(o => o.Service).FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
                return NotFound(new { message = "Order with the given ID does not exist." });

            // Update order status and due date
            order.OrderStatusId = 2; // 2 = accepted
            order.DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(order.Service.DurationInDays));
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order accepted successfully." });
        }

        // POST: api/Orders/complete/{orderId}
        // Allows the logged-in user to set an order as complete and creates a payment entry.
        [HttpPost("complete/{orderId}")]
        [Authorize]
        public async Task<IActionResult> CompleteOrder(int orderId)
        {
            var order = await _context.Orders.Include(o => o.Service).FirstOrDefaultAsync(o => o.OrderId == orderId);
            if (order == null)
                return NotFound(new { message = "Order with the given ID does not exist." });

            // If already completed, do not update
            if (order.OrderStatusId == 3)
                return Ok(new { message = "Order already completed." });

            // Update order status to complete
            order.OrderStatusId = 3; // 3 = complete

            // Create new payment
            var payment = new Payment
            {
                OrderId = order.OrderId,
                Amount = order.Service.Price,
                PaymentDate = DateOnly.FromDateTime(DateTime.UtcNow),
                PaymentStatusId = 2, // 2 = completed
                ApplicationId = null
            };
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order marked as complete and payment created successfully." });
        }

        // DELETE: api/Orders/{orderId}
        // Allows the currently logged-in client to delete an order they created by orderId
        [HttpDelete("{orderId}")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            // Get userId from JWT token
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            // Find the client profile for this user
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
            if (clientProfile == null)
                return BadRequest("Client profile not found.");

            // Find the order and check if it belongs to this client
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId && o.ClientProfileId == clientProfile.ClientProfileId);
            if (order == null)
                return NotFound(new { message = "Order not found or you do not have permission to delete it." });

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order deleted successfully." });
        }
    }
}
