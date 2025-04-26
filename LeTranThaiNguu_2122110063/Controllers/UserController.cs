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

        // POST: api/login
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

            var token = GenerateJwtToken(user);
            var userData = new
            {
                id = user.Id,
                username = user.UserName,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone ?? "",
                address = user.Address ?? "",
                roles = user.Role, // Chuẩn hóa thành 'roles'
                created_at = user.Create_at,
                updated_at = user.Update_at
            };

            return Ok(new { token, user = userData });
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

        // GET: api/public/User
        [HttpGet("public/User")]
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
                    u.Email,
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

        // GET: api/public/User/{id}
        [HttpGet("public/User/{id}")]
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
                    u.Email,
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

        // POST: api/public/User
        [HttpPost("public/User")]
        public async Task<ActionResult<object>> CreateUser(User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            user.Id = Guid.NewGuid().ToString();
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
                user.Email,
                user.Create_at,
                user.Create_by,
                user.Update_at,
                user.Update_by,
                user.Delete_at,
                user.Delete_by
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, createdUser);
        }

        // PUT: api/public/User/{id}
        [HttpPut("public/User/{id}")]
        public async Task<IActionResult> UpdateUser(string id, User user)
        {
            if (id != user.Id)
                return BadRequest(new { message = "ID không khớp" });

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
                user.Email,
                user.Create_at,
                user.Create_by,
                user.Update_at,
                user.Update_by,
                user.Delete_at,
                user.Delete_by
            };

            return Ok(updatedUser);
        }

        // DELETE: api/public/User/{id}
        [HttpDelete("public/User/{id}")]
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
