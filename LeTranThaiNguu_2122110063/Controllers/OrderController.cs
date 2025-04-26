using Microsoft.AspNetCore.Mvc;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Data;
using Microsoft.AspNetCore.Authorization;

namespace LeTranThaiNguu_2122110063.Controllers
{
    [Route("api")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả đơn hàng chưa xóa
        [Authorize(Roles = "admin")]
        [HttpGet("admin/Order")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            var orders = await _context.Orders
                .Where(o => o.Delete_at == null)
                .Include(o => o.User)
                .Include(o => o.Payment)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .ToListAsync();

            return Ok(orders);
        }

        // Lấy đơn hàng theo ID
        [Authorize(Roles = "admin")]
        [HttpGet("admin/Order/{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Where(o => o.Delete_at == null)
                .Include(o => o.User)
                .Include(o => o.Payment)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound("Order not found or has been deleted.");
            }

            return Ok(order);
        }

        // Lấy đơn hàng theo UserId
        [HttpGet("public/Order/user/{userId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrderByUserId(string userId)
        {
            var orders = await _context.Orders
                .Where(o => o.User_id == userId && o.Delete_at == null)
                .Include(o => o.User)
                .Include(o => o.Payment)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .OrderByDescending(o => o.Create_at)
                .ToListAsync();

            if (orders == null || !orders.Any())
            {
                return NotFound(new { message = "No orders found for this user." });
            }

            return Ok(orders);
        }

        // Tạo đơn hàng mới
        [HttpPost("public/Order")]
        public async Task<ActionResult<Order>> PostOrder([FromBody] Order order)
        {
            // Kiểm tra xem user_id có tồn tại không
            var userExists = await _context.Users.AnyAsync(u => u.Id == order.User_id);
            if (!userExists)
            {
                return BadRequest("User with the specified user_id does not exist.");
            }

            // Kiểm tra delivery_address
            if (string.IsNullOrWhiteSpace(order.Delivery_address))
            {
                return BadRequest("Delivery address is required.");
            }

            // Kiểm tra product_id trong orderDetails
            foreach (var detail in order.OrderDetails)
            {
                var productExists = await _context.Products.AnyAsync(p => p.Id == detail.Product_id);
                if (!productExists)
                {
                    return BadRequest($"Product with ID {detail.Product_id} does not exist.");
                }
                if (detail.Quantity <= 0)
                {
                    return BadRequest("Quantity must be greater than 0.");
                }
                if (detail.Price < 0)
                {
                    return BadRequest("Price cannot be negative.");
                }
            }

            // Kiểm tra totalAmount
            var calculatedTotal = order.OrderDetails.Sum(od => od.Quantity * od.Price);
            if (order.TotalAmount != calculatedTotal)
            {
                return BadRequest($"TotalAmount ({order.TotalAmount}) does not match calculated total ({calculatedTotal}).");
            }

            // Đặt các giá trị mặc định
            order.Create_at = DateTime.Now;
            order.Create_by = User?.Identity?.Name ?? "system";
            order.Update_at = null;
            order.Update_by = "";
            order.Delete_at = null;
            order.Delete_by = "";
            order.Id = 0; // Bỏ ID cho Order

            // Xử lý Payment
            if (order.Payment != null)
            {
                order.Payment.Payment_id = 0; // Bỏ ID cho Payment
                _context.Payments.Add(order.Payment);
                await _context.SaveChangesAsync();
                order.Payment_id = order.Payment.Payment_id;
            }
            else if (order.Payment_id.HasValue && order.Payment_id.Value > 0)
            {
                var paymentExists = await _context.Payments.AnyAsync(p => p.Payment_id == order.Payment_id.Value);
                if (!paymentExists)
                {
                    return BadRequest($"Payment with ID {order.Payment_id.Value} does not exist.");
                }
            }
            else
            {
                order.Payment_id = null;
            }

            // Xử lý OrderDetails
            foreach (var detail in order.OrderDetails)
            {
                detail.Id = 0;
                detail.Order_id = 0;
            }

            // Thêm đơn hàng
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Tải lại dữ liệu để trả về response đầy đủ
            var createdOrder = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Payment)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == order.Id);

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, createdOrder);
        }

        // Cập nhật đơn hàng
        [Authorize(Roles = "admin")]
        [HttpPut("admin/Order/{id}")]
        public async Task<IActionResult> PutOrder(int id, [FromBody] Order order)
        {
            if (id != order.Id)
            {
                return BadRequest("Order ID mismatch.");
            }

            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null || existingOrder.Delete_at != null)
            {
                return NotFound("Order not found or has been deleted.");
            }

            // Kiểm tra delivery_address
            if (string.IsNullOrWhiteSpace(order.Delivery_address))
            {
                return BadRequest("Delivery address is required.");
            }

            // Cập nhật các trường
            existingOrder.OrderDate = order.OrderDate;
            existingOrder.TotalAmount = order.TotalAmount;
            existingOrder.Status = order.Status;
            existingOrder.Delivery_address = order.Delivery_address; // Cập nhật địa chỉ
            existingOrder.Update_at = DateTime.Now;
            existingOrder.Update_by = User?.Identity?.Name ?? "system";

            _context.Entry(existingOrder).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // Xóa đơn hàng (soft delete)
        [Authorize(Roles = "admin")]
        [HttpDelete("admin/Order/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.Delete_at != null)
            {
                return NotFound("Order not found or already deleted.");
            }

            order.Delete_at = DateTime.Now;
            order.Delete_by = User?.Identity?.Name ?? "system";
            _context.Entry(order).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }
}