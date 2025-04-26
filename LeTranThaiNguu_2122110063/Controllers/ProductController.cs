using LeTranThaiNguu_2122110063.Data;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;

[ApiController]
[Route("api")]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ProductController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // GET: api/public/Product
    [HttpGet("public/Product")]
    public async Task<ActionResult<IEnumerable<object>>> GetProducts()
    {
        var products = await _context.Products
            .Select(p => new
            {
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

    // GET: api/public/Product/{id}
    [HttpGet("public/Product/{id}")]
    public async Task<ActionResult<object>> GetProduct(int id)
    {
        var product = await _context.Products
            .Where(p => p.Id == id)
            .Select(p => new
            {
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

    // GET: api/public/Product/category/{id}
    [HttpGet("public/Product/category/{id}")]
    public async Task<ActionResult<IEnumerable<object>>> GetProductByCategoryId(int id)
    {
        var products = await _context.Products
            .Where(p => p.Category_id == id)
            .Select(p => new
            {
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

    // POST: api/public/Product
    [HttpPost("public/Product")]
    public async Task<ActionResult<object>> CreateProduct([FromForm] ProductCreateDto productDto)
    {
        if (productDto == null || productDto.Image == null)
        {
            return BadRequest(new { message = "Dữ liệu sản phẩm hoặc hình ảnh không hợp lệ." });
        }

        // Kiểm tra Category_id và Brand_id
        if (productDto.Category_id <= 0 || productDto.Brand_id <= 0)
        {
            return BadRequest(new { message = "Danh mục hoặc thương hiệu không hợp lệ." });
        }

        // Kiểm tra Create_by
        if (string.IsNullOrEmpty(productDto.Create_by) || productDto.Create_by == "string")
        {
            return BadRequest(new { message = "Create_by không hợp lệ. Vui lòng cung cấp ID người dùng hợp lệ." });
        }

        // Xử lý file ảnh
        string imageFileName = null;
        if (productDto.Image != null)
        {
            var rootPath = Directory.GetCurrentDirectory();
            var uploadsFolder = Path.Combine(rootPath, "images", "products");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(productDto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, imageFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await productDto.Image.CopyToAsync(fileStream);
            }
        }

        // Tạo sản phẩm mới
        var product = new Product
        {
            Name = productDto.Name,
            Description = productDto.Description,
            Price = productDto.Price,
            Image = imageFileName,
            Category_id = productDto.Category_id,
            Brand_id = productDto.Brand_id,
            Create_by = productDto.Create_by,
            Create_at = DateTime.UtcNow,
            Update_at = DateTime.UtcNow,
            Update_by = "string", // Gán giá trị mặc định theo yêu cầu
            Delete_by = "string"  // Gán giá trị mặc định theo yêu cầu
        };

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
            product.Brand_id,
            product.Create_by
        });
    }

    // PUT: api/public/Product/{id}
    [HttpPut("public/Product/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductUpdateDto productDto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        if (productDto.Category_id <= 0 || productDto.Brand_id <= 0)
        {
            return BadRequest(new { message = "Danh mục hoặc thương hiệu không hợp lệ." });
        }

        // Xử lý file ảnh nếu có
        string imageFileName = product.Image;
        if (productDto.Image != null)
        {
            var rootPath = Directory.GetCurrentDirectory();
            var uploadsFolder = Path.Combine(rootPath, "images", "products");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(productDto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, imageFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await productDto.Image.CopyToAsync(fileStream);
            }
        }

        // Cập nhật sản phẩm
        product.Name = productDto.Name;
        product.Description = productDto.Description;
        product.Price = productDto.Price;
        product.Image = imageFileName;
        product.Category_id = productDto.Category_id;
        product.Brand_id = productDto.Brand_id;
        // Giữ nguyên Create_by
        product.Update_by = productDto.Update_by ?? "string"; // Cho phép thay đổi, mặc định là "string" nếu không cung cấp
        product.Update_at = DateTime.UtcNow;
        product.Delete_by = product.Delete_by ?? "string"; // Giữ giá trị hiện tại hoặc mặc định

        _context.Entry(product).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/admin/Product/{id}
    [HttpDelete("public/Product/{id}")]
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

// DTO để nhận dữ liệu từ form
public class ProductCreateDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public double Price { get; set; }
    public IFormFile Image { get; set; }
    public int Category_id { get; set; }
    public int Brand_id { get; set; }
    public string Create_by { get; set; }
}

// DTO để cập nhật sản phẩm
public class ProductUpdateDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public double Price { get; set; }
    public IFormFile Image { get; set; }
    public int Category_id { get; set; }
    public int Brand_id { get; set; }
    public string Update_by { get; set; }
}