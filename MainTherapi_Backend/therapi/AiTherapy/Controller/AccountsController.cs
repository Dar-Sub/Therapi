using AiTherapy.IServices;
using AiTherapy.Models;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace AiTherapy.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController(IAccountServices accountServices) : ControllerBase
    {
        private readonly IAccountServices _accountServices = accountServices;

        [HttpPost("[action]")]
        public async Task<ApiResponse> RegisterUser(AccountsModel accountsModel)
        {
            return await _accountServices.RegisterUser(accountsModel);
        }

        [HttpPost("[action]")]
        public async Task<ServiceResponse<LoginResponse>> Login(AccountsModel accountsModel)
        {
            return await _accountServices.Login(accountsModel);
        }

        //[HttpGet("[action]")]
        //public  string Decipher(string password)
        //{
        //    return  _accountServices.Decipher(password);
        //}
    }
}
