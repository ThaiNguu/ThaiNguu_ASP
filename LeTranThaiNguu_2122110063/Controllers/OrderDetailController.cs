using Microsoft.AspNetCore.Mvc;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Data;


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

        // Lấy tất cả OrderDetail
        [HttpGet("admin/OrderDetail")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails()
        {
            return await _context.OrderDetails.Include(od => od.Order).Include(od => od.Product).ToListAsync();
        }

        // Lấy OrderDetail theo ID
        [HttpGet("admin/OrderDetail/{id}")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails.Include(od => od.Order)
                                                         .Include(od => od.Product)
                                                         .FirstOrDefaultAsync(od => od.Id == id);

            if (orderDetail == null)
            {
                return NotFound();
            }

            return orderDetail;
        }

        // Tạo OrderDetail mới
        [HttpPost("public/OrderDetail")]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail(OrderDetail orderDetail)
        {
            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrderDetail), new { id = orderDetail.Id }, orderDetail);
        }

        // Cập nhật thông tin OrderDetail
        [HttpPut("admin/OrderDetail/{id}")]
        public async Task<IActionResult> PutOrderDetail(int id, OrderDetail orderDetail)
        {
            if (id != orderDetail.Id)
            {
                return BadRequest();
            }

            _context.Entry(orderDetail).State = EntityState.Modified;

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
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // Xóa OrderDetail
        [HttpDelete("admin/OrderDetail/{id}")]
        public async Task<IActionResult> DeleteOrderDetail(int id)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(id);
            if (orderDetail == null)
            {
                return NotFound();
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
