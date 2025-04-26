using LeTranThaiNguu_2122110063.Data;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;

namespace LeTranThaiNguu_2122110063.Controllers
{
    [Route("api")]
    [ApiController]
    public class BannerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public BannerController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/public/Banner
        [HttpGet("public/Banner")]
        public async Task<ActionResult<IEnumerable<Banner>>> GetBanners()
        {
            return await _context.Banners.ToListAsync();
        }

        // GET: api/public/Banner/{id}
        [HttpGet("public/Banner/{id}")]
        public async Task<ActionResult<Banner>> GetBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);

            if (banner == null)
                return NotFound();

            return banner;
        }

        // POST: api/public/Banner
        // POST: api/public/Banner
        [HttpPost("public/Banner")]
        public async Task<ActionResult<Banner>> PostBanner([FromForm] BannerCreateDto bannerDto)
        {
            if (bannerDto == null || bannerDto.Image == null)
            {
                return BadRequest(new { message = "Dữ liệu banner hoặc hình ảnh không hợp lệ." });
            }

            // Xử lý file ảnh
            string imageFileName = null;
            if (bannerDto.Image != null)
            {
                var rootPath = Directory.GetCurrentDirectory();
                var uploadsFolder = Path.Combine(rootPath, "images", "banners");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(bannerDto.Image.FileName);
                var filePath = Path.Combine(uploadsFolder, imageFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await bannerDto.Image.CopyToAsync(fileStream);
                }
            }

            // Tạo banner mới
            var banner = new Banner
            {
                Title = bannerDto.Title,
                Link = bannerDto.Link,
                Image = imageFileName,
                Status = bannerDto.Status,
                Position = bannerDto.Position, // Gán giá trị Position
                Create_at = DateTime.UtcNow,
                Create_by = bannerDto.Create_by ?? "string",
                Update_at = DateTime.UtcNow,
                Update_by = "string",
                Delete_by = "string"
            };

            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBanner), new { id = banner.Id }, banner);
        }

        // PUT: api/public/Banner/{id}
        // PUT: api/public/Banner/{id}
        [HttpPut("public/Banner/{id}")]
        public async Task<IActionResult> PutBanner(int id, [FromForm] BannerUpdateDto bannerDto)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound();

            // Xử lý file ảnh nếu có
            string imageFileName = banner.Image;
            if (bannerDto.Image != null)
            {
                var rootPath = Directory.GetCurrentDirectory();
                var uploadsFolder = Path.Combine(rootPath, "images", "banners");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                imageFileName = Guid.NewGuid().ToString() + Path.GetExtension(bannerDto.Image.FileName);
                var filePath = Path.Combine(uploadsFolder, imageFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await bannerDto.Image.CopyToAsync(fileStream);
                }
            }

            // Cập nhật banner
            banner.Title = bannerDto.Title;
            banner.Link = bannerDto.Link;
            banner.Image = imageFileName;
            banner.Status = bannerDto.Status;
            banner.Position = bannerDto.Position; // Gán giá trị Position
                                                  // Giữ nguyên Create_by
            banner.Update_by = bannerDto.Update_by ?? "string";
            banner.Update_at = DateTime.UtcNow;
            banner.Delete_by = banner.Delete_by ?? "string";

            _context.Entry(banner).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/public/Banner/{id}
        [HttpDelete("public/Banner/{id}")]
        public async Task<IActionResult> DeleteBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null)
                return NotFound();

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // DTO để nhận dữ liệu tạo banner
    public class BannerCreateDto
    {
        public string Title { get; set; }
        public string Link { get; set; }
        public IFormFile Image { get; set; }
        public bool Status { get; set; }
        public int Position { get; set; } // Thêm trường Position
        public string Create_by { get; set; }
    }

    // DTO để nhận dữ liệu cập nhật banner
    public class BannerUpdateDto
    {
        public string Title { get; set; }
        public string Link { get; set; }
        public IFormFile Image { get; set; }
        public bool Status { get; set; }
        public int Position { get; set; } // Thêm trường Position
        public string Update_by { get; set; }
    }
}