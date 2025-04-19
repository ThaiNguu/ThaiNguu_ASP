namespace LeTranThaiNguu_2122110063.Model
{
    using System.ComponentModel.DataAnnotations;
    using System.Text.Json.Serialization;

    namespace LeTranThaiNguu_2122110063.Model
    {
        public class Brand
        {
            public int Id { get; set; }

            [Required]
            public string Name { get; set; }
            public DateTime? Create_at { get; set; }
            public string Create_by { get; set; }
            public DateTime? Update_at { get; set; }
            public string Update_by { get; set; }
            public DateTime? Delete_at { get; set; }
            public string Delete_by { get; set; }

            [JsonIgnore]
            public ICollection<Product> Products { get; set; } = new List<Product>();
        }
    }

}
