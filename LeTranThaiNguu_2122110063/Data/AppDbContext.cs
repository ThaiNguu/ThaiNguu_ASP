using LeTranThaiNguu_2122110063.Model;
using LeTranThaiNguu_2122110063.Model.LeTranThaiNguu_2122110063.Model;
using Microsoft.EntityFrameworkCore;

namespace LeTranThaiNguu_2122110063.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        // Cấu hình quan hệ trong phương thức OnModelCreating
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Product – Category
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.Category_id)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Product – Brand
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Brand)
                .WithMany(b => b.Products)
                .HasForeignKey(p => p.Brand_id)
                .OnDelete(DeleteBehavior.Cascade); // hoặc .Restrict tùy bạn

            // Cấu hình quan hệ giữa Cart và User
            modelBuilder.Entity<Cart>()
                   .HasOne(c => c.User)
                   .WithMany(u => u.Carts)
                   .HasForeignKey(c => c.User_id)  // Đảm bảo User_id là kiểu string
                   .HasPrincipalKey(u => u.Id);   // Khóa chính của User là kiểu string

            // Cấu hình quan hệ giữa Cart và CartItem (thay vì Cart với Product)
            modelBuilder.Entity<Cart>()
        .HasMany(c => c.CartItems)        // Một Cart có thể có nhiều CartItem
        .WithOne(ci => ci.Cart)           // Mỗi CartItem chỉ thuộc về một Cart
        .HasForeignKey(ci => ci.Cart_id)  // Chỉ định khóa ngoại
        .OnDelete(DeleteBehavior.Cascade); // Tùy chọn: xóa CartItem khi Cart bị xóa

    // Cấu hình quan hệ giữa CartItem và Product
    modelBuilder.Entity<CartItem>()
        .HasOne(ci => ci.Product)         // Mỗi CartItem chỉ thuộc về một Product
        .WithMany()                        // Một Product có thể có nhiều CartItem
        .HasForeignKey(ci => ci.Product_id) // Chỉ định khóa ngoại
        .OnDelete(DeleteBehavior.Restrict); // Tùy chọn: không xóa CartItem khi Product bị xóa

            // Cấu hình quan hệ giữa Order và User
            modelBuilder.Entity<Order>()
        .HasOne(o => o.User)
        .WithMany(u => u.Orders)  // Chỉ ra rằng User có thể có nhiều Orders
        .HasForeignKey(o => o.User_id)  // Khóa ngoại trong Order phải là kiểu string
        .HasPrincipalKey(u => u.Id);  // Khóa chính của User là kiểu string
        }


    }
}
