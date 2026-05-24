using AiTherapy.Models;

namespace AiTherapy.IServices
{
    public interface IAccountServices
    {
        string Decipher(string password);
        Task<ServiceResponse<LoginResponse>> Login(AccountsModel accountsModel);
        Task<ApiResponse> RegisterUser(AccountsModel accountsModel);
    }
}
