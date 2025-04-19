using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
namespace LeTranThaiNguu_2122110063.Model

{
    public class OrderDetail
    {
        public int Id { get; set; }

        public int Order_id { get; set; }       // FK đến Order
        public int Product_id { get; set; }     // FK đến Product
        public int Quantity { get; set; }
        public double Price { get; set; }

        // Navigation
        [JsonIgnore]
        [ForeignKey("Order_id")]
        public Order? Order { get; set; }
        [JsonIgnore]
        [ForeignKey("Product_id")]
        public Product? Product { get; set; }
    }
}
