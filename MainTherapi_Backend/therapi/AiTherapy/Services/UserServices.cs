
using AiTherapy.IServices;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AiTherapy.Services
{
    public class UserServices : IUserServices
    {
        private readonly IHttpContextAccessor _httpContext;
        public UserServices(IHttpContextAccessor httpContextAccessor)
        {
            _httpContext = httpContextAccessor;
        }

        public int UserID => int.Parse(_httpContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);


        public string UserCode => (_httpContext.HttpContext.User.FindFirst(ClaimTypes.Name).Value).ToString();
    }
}
