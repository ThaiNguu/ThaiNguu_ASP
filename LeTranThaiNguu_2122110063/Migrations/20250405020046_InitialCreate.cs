using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeTranThaiNguu_2122110063.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Category_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category_name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Create_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Create_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Update_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Update_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Delete_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Delete_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Category_id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category_id = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<double>(type: "float", nullable: false),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Create_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Create_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Update_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Update_by = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Delete_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Delete_by = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_Category_id",
                        column: x => x.Category_id,
                        principalTable: "Categories",
                        principalColumn: "Category_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_Category_id",
                table: "Products",
                column: "Category_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
