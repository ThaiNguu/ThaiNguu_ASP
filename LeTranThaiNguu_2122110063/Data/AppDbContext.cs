using LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;

namespace LeTranThaiNguu_2122110063.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }

        // Cấu hình quan hệ trong phương thức OnModelCreating
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình quan hệ giữa Product và Category
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)          // Một sản phẩm chỉ có một thể loại
                .WithMany(c => c.Products)        // Một thể loại có thể có nhiều sản phẩm
                .HasForeignKey(p => p.Category_id) // Chỉ định khóa ngoại
                .OnDelete(DeleteBehavior.Cascade); // Tùy chọn: xóa sản phẩm khi thể loại bị xóa

            // Nếu cần cấu hình thêm các quan hệ khác, bạn có thể làm tương tự ở đây
        }
    }
}
