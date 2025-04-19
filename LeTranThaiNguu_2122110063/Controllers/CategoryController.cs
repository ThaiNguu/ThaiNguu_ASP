using LeTranThaiNguu_2122110063.Data;
using LeTranThaiNguu_2122110063.Model;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeTranThaiNguu_2122110063.Controllers
{
    
    [ApiController]
    [Route("api")]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/category
        [HttpGet("admin/Category")]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            // Chỉ trả về các trường của category, không bao gồm các sản phẩm
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.Category_id,
                    c.Category_name,
                    c.Create_at,
                    c.Create_by,
                    c.Update_at,
                    c.Update_by,
                    c.Delete_at,
                    c.Delete_by
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/category/5
        [HttpGet("admin/Category/{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Category_id == id)
                .Select(c => new
                {
                    c.Category_id,
                    c.Category_name,
                    c.Create_at,
                    c.Create_by,
                    c.Update_at,
                    c.Update_by,
                    c.Delete_at,
                    c.Delete_by
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound();

            return Ok(category); // Trả về dữ liệu đã được select
        }


        // POST: api/category
        [HttpPost("public/Category")]
        public async Task<ActionResult<Category>> CreateCategory(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Trả về các trường cần thiết sau khi lưu vào cơ sở dữ liệu
            var createdCategory = new
            {
                category.Category_id,
                category.Category_name,
                category.Create_at,
                category.Create_by,
                category.Update_at,
                category.Update_by,
                category.Delete_at,
                category.Delete_by
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Category_id }, createdCategory);
        }



        // PUT: api/category/5
        [HttpPut("admin/Category/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            if (id != category.Category_id)
                return BadRequest();

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Trả về các trường cần thiết sau khi cập nhật
            var updatedCategory = new
            {
                category.Category_id,
                category.Category_name,
                category.Create_at,
                category.Create_by,
                category.Update_at,
                category.Update_by,
                category.Delete_at,
                category.Delete_by
            };

            return Ok(updatedCategory);
        }

        // DELETE: api/category/5
        [HttpDelete("admin/Category/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
