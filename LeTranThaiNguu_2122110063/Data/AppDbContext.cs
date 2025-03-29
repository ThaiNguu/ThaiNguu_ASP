using LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;
namespace LeTranThaiNguu_2122110063.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Product> Products { get; set; }
    }
}
