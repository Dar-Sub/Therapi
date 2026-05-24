using AiTherapy.IServices;
using AiTherapy.Models;
using AiTherapy.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AiTherapy.Controller
{
    [Route("api/[controller]")]
    [ApiController, Authorize]
    public class AzureAiController : ControllerBase
    {
        private readonly IAzureAiServices _azureAiServices;

       public AzureAiController(IAzureAiServices azureAiServices)
        {
            _azureAiServices = azureAiServices;
        }


        [HttpPost("[action]")]
        public async Task<string> CreateAssistant([FromBody] AssistantRequest request)
        {
            return await _azureAiServices.CreateAssistant(request);
        }

        [HttpGet("[action]")]
        public async Task<List<ThreadResponse>> GetThreads()
        {
            return await _azureAiServices.GetThreads();
        }

        [HttpPost("[action]")]
        public async Task<ThreadResponse> CreateThreadAsync(string name)
        {
            return await _azureAiServices.CreateThreadAsync(name);
        }

        [HttpPost("[action]")]
        public async Task<List<MessageResponse>> CreateMessageAsync(string threadId, string messageContent)
        {
            return await _azureAiServices.CreateMessageAsync(threadId,messageContent);
        }

        [HttpGet("[action]")]
        public async Task<List<MessageResponse>> GetMessages(string threadId)
        {
            return await _azureAiServices.GetMessages(threadId);
        }

        [HttpGet("[action]")]
        [AllowAnonymous]
        public async Task<DeepSeekResponse> GetDeepSeekMessage(string userMessage)
        {
            return await _azureAiServices.GetDeepSeekMessage(userMessage);
        }
    }
}
