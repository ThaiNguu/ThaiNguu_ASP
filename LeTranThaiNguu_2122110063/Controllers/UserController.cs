using LeTranThaiNguu_2122110063.Data;
using LeTranThaiNguu_2122110063.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace LeTranThaiNguu_2122110063.Controllers
{
    [ApiController]
    [Route("api")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UserController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/user/login
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginModel loginModel)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginModel.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginModel.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
            }

            // Check if the user's role is "admin"
            if (user.Role != "admin")
            {
                return Unauthorized(new { message = "Chỉ có vai trò admin mới được phép đăng nhập" });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        // Hàm tạo JWT token
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiryInMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // GET: api/User
        [HttpGet("admin/User")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.FullName,
                    u.Phone,
                    u.Address,
                    u.Role,
                    u.Create_at,
                    u.Create_by,
                    u.Update_at,
                    u.Update_by,
                    u.Delete_at,
                    u.Delete_by
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/User/5
        [HttpGet("admin/User/{id}")]
        public async Task<ActionResult<object>> GetUser(string id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.FullName,
                    u.Phone,
                    u.Address,
                    u.Role,
                    u.Create_at,
                    u.Create_by,
                    u.Update_at,
                    u.Update_by,
                    u.Delete_at,
                    u.Delete_by
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // POST: api/user
        [HttpPost("public/User")]
        public async Task<ActionResult<object>> CreateUser(User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            // Băm mật khẩu trước khi lưu
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            user.Id = Guid.NewGuid().ToString(); // Tạo ID duy nhất
            user.Create_at = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var createdUser = new
            {
                user.Id,
                user.UserName,
                user.FullName,
                user.Phone,
                user.Address,
                user.Role,
                user.Create_at,
                user.Create_by,
                user.Update_at,
                user.Update_by,
                user.Delete_at,
                user.Delete_by
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, createdUser);
        }

        // PUT: api/User/5
        [HttpPut("admin/User/{id}")]
        public async Task<IActionResult> UpdateUser(string id, User user)
        {
            if (id != user.Id)
                return BadRequest(new { message = "ID không khớp" });

            // Băm lại mật khẩu nếu được cung cấp
            if (!string.IsNullOrEmpty(user.PasswordHash))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            user.Update_at = DateTime.UtcNow;
            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                    return NotFound();
                throw;
            }

            var updatedUser = new
            {
                user.Id,
                user.UserName,
                user.FullName,
                user.Phone,
                user.Address,
                user.Role,
                user.Create_at,
                user.Create_by,
                user.Update_at,
                user.Update_by,
                user.Delete_at,
                user.Delete_by
            };

            return Ok(updatedUser);
        }

        // DELETE: api/user/5
        [HttpDelete("admin/User/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Delete_at = DateTime.UtcNow;
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}