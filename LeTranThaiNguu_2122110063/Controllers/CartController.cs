using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Model;
using LeTranThaiNguu_2122110063.Data;


namespace LeTranThaiNguu_2122110063.Controllers
{
   
    [Route("api")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Cart
        [HttpGet("admin/Cart")]
        public async Task<ActionResult<IEnumerable<Cart>>> GetCarts()
        {
            return await _context.Carts
                .Include(c => c.User)
                .Include(c => c.CartItems)
                .ToListAsync();
        }

        // GET: api/Cart/5
        [HttpGet("admin/Cart/{id}")]
        public async Task<ActionResult<Cart>> GetCart(int id)
        {
            var cart = await _context.Carts
                .Include(c => c.User)
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cart == null)
                return NotFound();

            return cart;
        }
        // GET: api/public/Cart/user/{userId}
        [HttpGet("public/Cart/user/{userId}")]
        public async Task<ActionResult<Cart>> GetCartByUserId(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.User)
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.User_id == userId);

            if (cart == null)
                return NotFound();

            return cart;
        }

        // POST: api/Cart
        [HttpPost("public/Cart")]
        public async Task<ActionResult<Cart>> PostCart(Cart cart)
        {
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCart), new { id = cart.Id }, cart);
        }

        // PUT: api/Cart/5
        [HttpPut("admin/Cart/{id}")]
        public async Task<IActionResult> PutCart(int id, Cart cart)
        {
            if (id != cart.Id)
                return BadRequest();

            _context.Entry(cart).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Carts.Any(c => c.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Cart/5
        [HttpDelete("admin/Cart{id}")]
        public async Task<IActionResult> DeleteCart(int id)
        {
            var cart = await _context.Carts.FindAsync(id);
            if (cart == null)
                return NotFound();

            _context.Carts.Remove(cart);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
