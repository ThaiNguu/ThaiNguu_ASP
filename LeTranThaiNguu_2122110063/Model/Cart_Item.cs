using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LeTranThaiNguu_2122110063.Model
{
    public class CartItem
    {
        public int Id { get; set; }             // Khóa chính

        public int Cart_id { get; set; }        // FK tới Cart

        public int Product_id { get; set; }     // FK tới Product

        public int Quantity { get; set; }       // Số lượng sản phẩm trong Cart

        public double ProductPrice { get; set; } // Giá sản phẩm tại thời điểm thêm vào giỏ hàng

        public double Discount { get; set; }    // Giảm giá áp dụng cho sản phẩm trong giỏ hàng

        public double TotalPrice { get; set; }  // Tổng giá của sản phẩm trong Cart Item (Price * Quantity - Discount)

        // Quan hệ điều hướng
        [JsonIgnore]
        [ForeignKey("Cart_id")]
        public Cart? Cart { get; set; }
        [JsonIgnore]
        [ForeignKey("Product_id")]
        public Product? Product { get; set; }
    }
}
