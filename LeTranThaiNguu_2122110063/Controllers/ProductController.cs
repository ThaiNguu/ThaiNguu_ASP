using LeTranThaiNguu_2122110063.Data;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeTranThaiNguu_2122110063.Controllers
{
    [ApiController]
    [Route("api")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Product
        [HttpGet("admin/Product")]
        public async Task<ActionResult<IEnumerable<object>>> GetProducts()
        {
            var products = await _context.Products
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Image,
                    p.Create_at,
                    p.Create_by,
                    p.Update_at,
                    p.Update_by,
                    p.Delete_at,
                    p.Delete_by,
                    Category_id = p.Category_id,
                    Brand_id = p.Brand_id
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/Product/5
        [HttpGet("admin/Product/{id}")]
        public async Task<ActionResult<object>> GetProduct(int id)
        {
            var product = await _context.Products
                .Where(p => p.Id == id)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Image,
                    p.Create_at,
                    p.Create_by,
                    p.Update_at,
                    p.Update_by,
                    p.Delete_at,
                    p.Delete_by,
                    Category_id = p.Category_id,
                    Brand_id = p.Brand_id
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound();

            return Ok(product);
        }

        // GET: api/public/Product/category/5
        [HttpGet("public/Product/category/{id}")]
        public async Task<ActionResult<IEnumerable<object>>> GetProductByCategoryId(int id)
        {
            var products = await _context.Products
                .Where(p => p.Category_id == id)
                .Select(p => new {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Image,
                    p.Create_at,
                    p.Create_by,
                    p.Update_at,
                    p.Update_by,
                    p.Delete_at,
                    p.Delete_by,
                    Category_id = p.Category_id,
                    Brand_id = p.Brand_id
                })
                .ToListAsync();

            if (!products.Any())
                return NotFound(new { message = "Không tìm thấy sản phẩm nào cho danh mục này" });

            return Ok(products);
        }

        // POST: api/Product
        [HttpPost("public/Product")]
        public async Task<ActionResult<object>> CreateProduct(Product product)
        {
            if (product.Category_id <= 0 || product.Brand_id <= 0)
            {
                return BadRequest(new { message = "Invalid Category or Brand ID." });
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new
            {
                product.Id,
                product.Name,
                product.Description,
                product.Price,
                product.Image,
                product.Category_id,
                product.Brand_id
            });
        }

        // PUT: api/Product/5
        [HttpPut("admin/Product/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product product)
        {
            if (id != product.Id)
                return BadRequest();

            if (product.Category_id <= 0 || product.Brand_id <= 0)
            {
                return BadRequest(new { message = "Invalid Category or Brand ID." });
            }

            _context.Entry(product).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Product/5
        [HttpDelete("admin/Product/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}