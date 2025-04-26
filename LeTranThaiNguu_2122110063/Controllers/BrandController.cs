using LeTranThaiNguu_2122110063.Data;
using LeTranThaiNguu_2122110063.Model;
using LeTranThaiNguu_2122110063.Model.LeTranThaiNguu_2122110063.Model;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeTranThaiNguu_2122110063.Controllers
{
  
    [ApiController]
    [Route("api")]
    public class BrandController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BrandController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/brand
        [HttpGet("public/Brand")]
        public async Task<ActionResult<IEnumerable<Brand>>> GetBrands()
        {
            // Chỉ trả về các trường của Brand, không bao gồm các sản phẩm
            var brands = await _context.Brands
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Create_at,
                    b.Create_by,
                    b.Update_at,
                    b.Update_by,
                    b.Delete_at,
                    b.Delete_by
                })
                .ToListAsync();

            return Ok(brands);
        }

        // GET: api/brand/5
        [HttpGet("public/Brand/{id}")]
        public async Task<ActionResult<Brand>> GetBrand(int id)
        {
            var brand = await _context.Brands
                .Where(b => b.Id == id)
                .Select(b => new
                {
                    b.Id,
                    b.Name,
                    b.Create_at,
                    b.Create_by,
                    b.Update_at,
                    b.Update_by,
                    b.Delete_at,
                    b.Delete_by
                })
                .FirstOrDefaultAsync();

            if (brand == null)
                return NotFound();

            return Ok(brand);
        }

        // POST: api/brand
        [HttpPost("public/Brand")]
        public async Task<ActionResult<Brand>> CreateBrand(Brand brand)
        {
            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();

            // Trả về các trường cần thiết sau khi lưu vào cơ sở dữ liệu
            var createdBrand = new
            {
                brand.Id,
                brand.Name,
                brand.Create_at,
                brand.Create_by,
                brand.Update_at,
                brand.Update_by,
                brand.Delete_at,
                brand.Delete_by
            };

            return CreatedAtAction(nameof(GetBrand), new { id = brand.Id }, createdBrand);
        }

        // PUT: api/brand/5
        [HttpPut("public/Brand/{id}")]
        public async Task<IActionResult> UpdateBrand(int id, Brand brand)
        {
            if (id != brand.Id)
                return BadRequest();

            _context.Entry(brand).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Trả về các trường cần thiết sau khi cập nhật
            var updatedBrand = new
            {
                brand.Id,
                brand.Name,
                brand.Create_at,
                brand.Create_by,
                brand.Update_at,
                brand.Update_by,
                brand.Delete_at,
                brand.Delete_by
            };

            return Ok(updatedBrand);
        }

        // DELETE: api/brand/5
        [HttpDelete("public/Brand/{id}")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null)
                return NotFound();

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
