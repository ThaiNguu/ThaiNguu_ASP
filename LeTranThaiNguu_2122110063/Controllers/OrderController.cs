using Microsoft.AspNetCore.Mvc;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Data;


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

        // Lấy tất cả đơn hàng
        [HttpGet("admin/Order")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
        {
            return await _context.Orders.Include(o => o.User).Include(o => o.OrderDetails).ToListAsync();
        }

        // Lấy đơn hàng theo ID
        [HttpGet("admin/Order/{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.User)
                                              .Include(o => o.OrderDetails)
                                              .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // Tạo đơn hàng mới
        [HttpPost("public/Order")]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            order.Create_at = DateTime.Now;
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // Cập nhật thông tin đơn hàng
        [HttpPut("admin/Order/{id}")]
        public async Task<IActionResult> PutOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                return BadRequest();
            }

            order.Update_at = DateTime.Now;
            _context.Entry(order).State = EntityState.Modified;

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
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // Xóa đơn hàng
        [HttpDelete("admin/Order/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }
    }
}
