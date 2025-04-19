using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Model;
using LeTranThaiNguu_2122110063.Data;


namespace LeTranThaiNguu_2122110063.Controllers
{
   
    [Route("api")]
    [ApiController]
    public class CartItemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartItemController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/CartItem
        [HttpGet("admin/CartItem")]
        public async Task<ActionResult<IEnumerable<CartItem>>> GetCartItems()
        {
            return await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Product)
                .ToListAsync();
        }

        // GET: api/CartItem/5
        [HttpGet("admin/CartItem{id}")]
        public async Task<ActionResult<CartItem>> GetCartItem(int id)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == id);

            if (cartItem == null)
                return NotFound();

            return cartItem;
        }

        // POST: api/CartItem
        [HttpPost("public/CartItem")]
        public async Task<ActionResult<CartItem>> CreateCartItem(CartItem cartItem)
        {
            // Tính lại totalPrice trước khi lưu
            cartItem.TotalPrice = (cartItem.ProductPrice * cartItem.Quantity) - cartItem.Discount;

            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();

            // Gợi ý: Cập nhật tổng lại cho Cart sau khi thêm item
            var cart = await _context.Carts.FindAsync(cartItem.Cart_id);
            if (cart != null)
            {
                cart.TotalPrice = _context.CartItems
                    .Where(ci => ci.Cart_id == cart.Id)
                    .Sum(ci => ci.TotalPrice);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetCartItem), new { id = cartItem.Id }, cartItem);
        }


        // PUT: api/CartItem/5
        [HttpPut("admin/CartItem/{id}")]
        public async Task<IActionResult> PutCartItem(int id, CartItem cartItem)
        {
            if (id != cartItem.Id)
                return BadRequest();

            _context.Entry(cartItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CartItems.Any(ci => ci.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/CartItem/5
        [HttpDelete("admin/CartItem/{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var cartItem = await _context.CartItems.FindAsync(id);
            if (cartItem == null)
                return NotFound();

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
