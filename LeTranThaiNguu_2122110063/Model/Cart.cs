using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LeTranThaiNguu_2122110063.Model
{
    public class Cart
    {
        public int Id { get; set; }

        public string User_id { get; set; }  // Kiểu khóa ngoại phải là int để tương thích với khóa chính của User

        public double TotalPrice { get; set; } // Tổng giá trị đơn hàng

        // Quan hệ điều hướng
        [JsonIgnore]
        [ForeignKey("User_id")]
        public User? User { get; set; }

        [JsonIgnore]
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }

}
