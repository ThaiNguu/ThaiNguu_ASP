using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Security.Claims;

namespace LeTranThaiNguu_2122110063.Middleware
{
    public class PathBasedAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public PathBasedAuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLower();

            // Yêu cầu xác thực và vai trò admin cho các đường dẫn /api/admin/*
            if (path != null && path.StartsWith("/api/admin/"))
            {
                // Kiểm tra xem người dùng đã xác thực chưa
                if (!context.User.Identity.IsAuthenticated)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("{\"message\": \"Yêu cầu xác thực cho các API admin\"}");
                    return;
                }

                // Kiểm tra vai trò của người dùng
                var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("{\"message\": \"Chỉ admin mới được phép truy cập API này\"}");
                    return;
                }
            }

            // Tiếp tục pipeline
            await _next(context);
        }
    }

    // Extension method để đăng ký middleware
    public static class PathBasedAuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UsePathBasedAuthentication(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<PathBasedAuthenticationMiddleware>();
        }
    }
}