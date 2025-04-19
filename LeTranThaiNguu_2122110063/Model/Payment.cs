using System.ComponentModel.DataAnnotations;

namespace LeTranThaiNguu_2122110063.Model
{
    public class Payment
    {
        [Key]
        public int Payment_id { get; set; }  // Khóa chính cho Payment

        public string Payment_method { get; set; }  // Phương thức thanh toán (PayPal, COD, CreditCard, etc.)
    }
}
