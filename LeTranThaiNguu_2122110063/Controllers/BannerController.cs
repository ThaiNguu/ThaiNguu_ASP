using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeTranThaiNguu_2122110063.Model;
using LeTranThaiNguu_2122110063.Data;
using Microsoft.AspNetCore.Authorization;

namespace LeTranThaiNguu_2122110063.Controllers
{
    
    [Route("api")]
    [ApiController]
    public class BannerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BannerController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Banner
        [HttpGet("admin/Banner")]
        public async Task<ActionResult<IEnumerable<Banner>>> GetBanners()
        {
            return await _context.Banners.ToListAsync();
        }

        // GET: api/Banner/5
        [HttpGet("admin/Banner/{id}")]
        public async Task<ActionResult<Banner>> GetBanner(int id)
        {
            var banner = await _context.Banners.FindAsync(id);

            if (banner == null)
                return NotFound();

            return banner;
        }

        // POST: api/Banner
        [HttpPost("public/Banner")]
        public async Task<ActionResult<Banner>> PostBanner(Banner banner)
        {
            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBanner), new { id = banner.Id }, banner);
        }

        // PUT: api/Banner/5
        [HttpPut("admin/Banner/{id}")]
        public async Task<IActionResult> PutBanner(int id, Banner banner)
        {
            if (id != banner.Id)
                return BadRequest();

            _context.Entry(banner).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Banners.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Banner/5
        [HttpDelete("admin/Banner/{id}")]
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
}
