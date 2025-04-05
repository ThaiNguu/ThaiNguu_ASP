using System.ComponentModel.DataAnnotations.Schema;
using LeTranThaiNguu_2122110063.Model;

public class Product
{
    public int Id { get; set; }

    public int Category_id { get; set; } // Foreign Key

    public string Name { get; set; }
    public string Description { get; set; }
    public double Price { get; set; }
    public string Image { get; set; }

    public DateTime? Create_at { get; set; }
    public string Create_by { get; set; }
    public DateTime? Update_at { get; set; }
    public string Update_by { get; set; }
    public DateTime? Delete_at { get; set; }
    public string Delete_by { get; set; }

    // Navigation Property – sửa lỗi tạo thêm Category_id1
    [ForeignKey("Category_id")]
    public Category Category { get; set; }
}
