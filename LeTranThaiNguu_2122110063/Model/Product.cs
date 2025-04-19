using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using LeTranThaiNguu_2122110063.Model;
using LeTranThaiNguu_2122110063.Model.LeTranThaiNguu_2122110063.Model;

public class Product
{
    public int Id { get; set; }

    public int Category_id { get; set; }
    public int Brand_id { get; set; } // Thêm khóa ngoại Brand

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

    // Navigation Property
    [JsonIgnore]
    [ForeignKey("Category_id")]
    public Category? Category { get; set; }

    [JsonIgnore]
    [ForeignKey("Brand_id")]
    public Brand? Brand { get; set; }

}

