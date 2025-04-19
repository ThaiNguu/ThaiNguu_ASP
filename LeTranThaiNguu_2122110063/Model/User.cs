using System.Text.Json.Serialization;

namespace LeTranThaiNguu_2122110063.Model
{
    public class User
    {
        public string Id { get; set; } // Tự định nghĩa Id, có thể là string hoặc int tùy yêu cầu
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Role { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; } // Lưu mật khẩu băm nếu cần quản lý xác thực

        public DateTime? Create_at { get; set; }
        public string Create_by { get; set; }
        public DateTime? Update_at { get; set; }
        public string Update_by { get; set; }
        public DateTime? Delete_at { get; set; }
        public string Delete_by { get; set; }

        [JsonIgnore]
        public ICollection<Cart> Carts { get; set; } = new List<Cart>();
        [JsonIgnore]
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}