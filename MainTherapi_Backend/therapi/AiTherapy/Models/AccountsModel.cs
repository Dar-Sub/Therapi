using Newtonsoft.Json;

namespace AiTherapy.Models
{
    public class AccountsModel
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("password")]
        public string Password { get; set; }
    }

    public class ApiResponse
    {
        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("statusCode")]
        public long StatusCode { get; set; }

        public ApiResponse(string message, long statusCode)
        {
            Message = message;
            StatusCode = statusCode;
        }
    }

    public class ServiceResponse<T> : ApiResponse
    {
        [JsonProperty("data")]
        public T Data { get; set; }

        public ServiceResponse(long statusCode, string message, T data)
            : base(message, statusCode)
        {
            Data = data;
        }
    }

    public class LoginResponse
    {
        [JsonProperty("accessToken")]
        public string AccessToken { get; set; }

        [JsonProperty("expiresIn")]
        public int ExpiresIn { get; set; }


        [JsonProperty("role")]
        public string Role { get; set; }

        [JsonProperty("tokenType")]
        public string TokenType { get; set; }

        [JsonProperty("userName")]
        public string UserName { get; set; }


    }


}
