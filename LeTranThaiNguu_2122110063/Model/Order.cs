using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace LeTranThaiNguu_2122110063.Model
{
    public class Order
    {
        public int Id { get; set; }
        [ForeignKey("Payment")]
        public int? Payment_id { get; set; }
        public string User_id { get; set; }        // FK đến User

        public DateTime OrderDate { get; set; } = DateTime.Now;
        public double TotalAmount { get; set; } // Tổng tiền
        public string Status { get; set; }      // Pending, Paid, Cancelled...

        public DateTime? Create_at { get; set; }
        public string Create_by { get; set; }
        public DateTime? Update_at { get; set; }
        public string Update_by { get; set; }
        public DateTime? Delete_at { get; set; }
        public string Delete_by { get; set; }

        // Navigation

        [JsonIgnore]
        [ForeignKey("User_id")]
        public User? User { get; set; }

        [JsonIgnore]
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

        [JsonIgnore]
        public Payment? Payment { get; set; }
    }
}
