using System.ComponentModel.DataAnnotations;

namespace LeTranThaiNguu_2122110063.Model
{
    public class Banner
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }   // Tiêu đề banner

        public string Link { get; set; }    // Đường dẫn khi click vào banner

        public string Image { get; set; }   // Tên file hình ảnh

        public int Position { get; set; }   // Vị trí hiển thị (nếu có sắp xếp)

        public bool Status { get; set; }    // Trạng thái (hiển thị hoặc không)

        public DateTime? Create_at { get; set; }
        public string Create_by { get; set; }
        public DateTime? Update_at { get; set; }
        public string Update_by { get; set; }
        public DateTime? Delete_at { get; set; }
        public string Delete_by { get; set; }
    }
}
