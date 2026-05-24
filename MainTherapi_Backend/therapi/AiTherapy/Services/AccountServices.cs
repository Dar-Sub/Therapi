using AiTherapy.Entities;
using AiTherapy.Global;
using AiTherapy.IServices;
using AiTherapy.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AiTherapy.Services
{
    public class AccountServices(AiTherapiContext aiTherapiContext,IConfiguration configuration) : IAccountServices
    {
        private readonly AiTherapiContext _context  = aiTherapiContext;
        private readonly IConfiguration _configuration = configuration;
            
        public async Task<ApiResponse> RegisterUser(AccountsModel accountsModel)
        {
            var checkEmail = await _context.Users.AnyAsync(x => x.Email == accountsModel.Email);
            if(checkEmail)
            {
                return new("email already exist", 400);
            }
            var user = new Users                  
            {
                Name = accountsModel.Name,
                Email = accountsModel.Email,
                Password =Encipher(accountsModel.Password),
                RoleId = (int)Roles.User
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return new("sucsess",200);
        }


        public async Task<ServiceResponse<LoginResponse>> Login(AccountsModel accountsModel)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == accountsModel.Email);
            if(user == null)
            {
                return new(400, "email not found", null);
            }if(Decipher(user.Password) != accountsModel.Password)
            {
                return new(400, "incorrect password", null);
            }
            LoginResponse response = new()
            {
                UserName = user.Name,
                AccessToken = AccessToken(user.Id,user.Name),
                ExpiresIn = 43200000,
                TokenType = "bearer",
                
            };
            return new(200, "sucsess", response);
        }

        private string AccessToken(int appUserId,string userName)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var sec = _configuration.GetValue<string>("JwtOptions:SecurityKey");
            var key = Encoding.ASCII.GetBytes(_configuration.GetValue<string>("JwtOptions:SecurityKey"));
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = _configuration.GetValue<string>("JwtOptions:Issuer"),
                Audience = _configuration.GetValue<string>("JwtOptions:Audience"),
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, $"{appUserId}"),
                    new Claim(ClaimTypes.Name, $"{userName}"),

                }),
                Expires = DateTime.UtcNow.AddHours(12),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
           
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static string Encipher(string password)
        {
            string key = "abcdefghijklmnopqrstuvwxyz1234567890";
            byte[] bytesBuff = Encoding.Unicode.GetBytes(password);
            using (System.Security.Cryptography.Aes aes = System.Security.Cryptography.Aes.Create())
            {
                Rfc2898DeriveBytes crypto = new(key,
                    new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                aes.Key = crypto.GetBytes(32);
                aes.IV = crypto.GetBytes(16);
                using MemoryStream mStream = new();
                using (CryptoStream cStream = new(mStream, aes.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    cStream.Write(bytesBuff, 0, bytesBuff.Length);
                    cStream.Close();
                }
                password = Convert.ToBase64String(mStream.ToArray());
            }
            return password;
        }
        public  string Decipher(string password)
        {
            string key = "abcdefghijklmnopqrstuvwxyz1234567890";
            password = password.Replace(" ", "+");
            byte[] bytesBuff = Convert.FromBase64String(password);
            using (Aes aes = Aes.Create())
            {
                Rfc2898DeriveBytes crypto = new(key,
                new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                aes.Key = crypto.GetBytes(32);
                aes.IV = crypto.GetBytes(16);
                using MemoryStream mStream = new();
                using (CryptoStream cStream = new(mStream, aes.CreateDecryptor(), CryptoStreamMode.Write))
                {
                    cStream.Write(bytesBuff, 0, bytesBuff.Length);
                    cStream.Close();
                }
                password = Encoding.Unicode.GetString(mStream.ToArray());
            }
            return password;
        }

    }
}
