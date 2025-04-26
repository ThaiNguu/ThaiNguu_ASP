using Microsoft.AspNetCore.Mvc;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Data;
using Microsoft.AspNetCore.Authorization;

namespace LeTranThaiNguu_2122110063.Controllers
{
    [Route("api")]
    [ApiController]
    public class OrderDetailController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrderDetailController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả OrderDetails
        [Authorize(Roles = "admin")]
        [HttpGet("admin/OrderDetail")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails()
        {
            var orderDetails = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .ToListAsync();

            return Ok(orderDetails);
        }

        // Lấy OrderDetail theo ID
        [Authorize(Roles = "admin")]
        [HttpGet("admin/OrderDetail/{id}")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .FirstOrDefaultAsync(od => od.Id == id);

            if (orderDetail == null)
            {
                return NotFound("OrderDetail not found.");
            }

            return Ok(orderDetail);
        }

        // Tạo một OrderDetail
        [HttpPost("public/OrderDetail")]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail([FromBody] OrderDetail orderDetail)
        {
            if (orderDetail == null)
            {
                return BadRequest("OrderDetail is required.");
            }

            // Kiểm tra order_id và product_id
            var orderExists = await _context.Orders.AnyAsync(o => o.Id == orderDetail.Order_id && o.Delete_at == null);
            if (!orderExists)
            {
                return BadRequest("Order with the specified order_id does not exist or has been deleted.");
            }

            var productExists = await _context.Products.AnyAsync(p => p.Id == orderDetail.Product_id);
            if (!productExists)
            {
                return BadRequest("Product with the specified product_id does not exist.");
            }

            if (orderDetail.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0.");
            }

            if (orderDetail.Price < 0)
            {
                return BadRequest("Price cannot be negative.");
            }

            orderDetail.Id = 0; // Bỏ ID cho OrderDetail
            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();

            var createdOrderDetail = await _context.OrderDetails
                .Include(od => od.Order)
                .Include(od => od.Product)
                .FirstOrDefaultAsync(od => od.Id == orderDetail.Id);

            return CreatedAtAction(nameof(GetOrderDetail), new { id = orderDetail.Id }, createdOrderDetail);
        }

        // Tạo nhiều OrderDetails
        [HttpPost("public/OrderDetails")]
        public async Task<ActionResult> PostMultipleOrderDetails([FromBody] List<OrderDetail> orderDetails)
        {
            if (orderDetails == null || !orderDetails.Any())
            {
                return BadRequest("OrderDetails list cannot be empty.");
            }

            foreach (var orderDetail in orderDetails)
            {
                var orderExists = await _context.Orders.AnyAsync(o => o.Id == orderDetail.Order_id && o.Delete_at == null);
                if (!orderExists)
                {
                    return BadRequest($"Order with ID {orderDetail.Order_id} does not exist or has been deleted.");
                }

                var productExists = await _context.Products.AnyAsync(p => p.Id == orderDetail.Product_id);
                if (!productExists)
                {
                    return BadRequest($"Product with ID {orderDetail.Product_id} does not exist.");
                }

                if (orderDetail.Quantity <= 0)
                {
                    return BadRequest("Quantity must be greater than 0.");
                }

                if (orderDetail.Price < 0)
                {
                    return BadRequest("Price cannot be negative.");
                }

                orderDetail.Id = 0;
            }

            _context.OrderDetails.AddRange(orderDetails);
            await _context.SaveChangesAsync();

            return Ok(new { message = "OrderDetails created successfully.", data = orderDetails });
        }

        // Cập nhật OrderDetail
        [Authorize(Roles = "admin")]
        [HttpPut("admin/OrderDetail/{id}")]
        public async Task<IActionResult> PutOrderDetail(int id, [FromBody] OrderDetail orderDetail)
        {
            if (id != orderDetail.Id)
            {
                return BadRequest("OrderDetail ID mismatch.");
            }

            var existingOrderDetail = await _context.OrderDetails.FindAsync(id);
            if (existingOrderDetail == null)
            {
                return NotFound("OrderDetail not found.");
            }

            // Kiểm tra order_id và product_id
            var orderExists = await _context.Orders.AnyAsync(o => o.Id == orderDetail.Order_id && o.Delete_at == null);
            if (!orderExists)
            {
                return BadRequest("Order with the specified order_id does not exist or has been deleted.");
            }

            var productExists = await _context.Products.AnyAsync(p => p.Id == orderDetail.Product_id);
            if (!productExists)
            {
                return BadRequest("Product with the specified product_id does not exist.");
            }

            if (orderDetail.Quantity <= 0)
            {
                return BadRequest("Quantity must be greater than 0.");
            }

            if (orderDetail.Price < 0)
            {
                return BadRequest("Price cannot be negative.");
            }

            _context.Entry(existingOrderDetail).CurrentValues.SetValues(orderDetail);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderDetailExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // Xóa OrderDetail
        [Authorize(Roles = "admin")]
        [HttpDelete("admin/OrderDetail/{id}")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null)
            {
                return NotFound("OrderDetail not found.");
            }

            _context.OrderDetails.Remove(orderDetail);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderDetailExists(int id)
        {
            return _context.OrderDetails.Any(e => e.Id == id);
        }
    }
}