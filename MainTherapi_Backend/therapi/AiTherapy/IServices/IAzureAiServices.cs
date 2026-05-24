using AiTherapy.Models;
using AiTherapy.Services;
using Microsoft.AspNetCore.Mvc;

namespace AiTherapy.IServices
{
    public interface IAzureAiServices
    {
        Task<string> CreateAssistant([FromBody] AssistantRequest request);
        Task<List<MessageResponse>> CreateMessageAsync(string threadId, string messageContent);
        Task<ThreadResponse> CreateThreadAsync(string name);
        Task<List<MessageResponse>> GetMessages(string threadId);

        //Task<string> FetchThreads();
        Task<List<MessageResponse>> GetMessagesWithRetryAsync(string threadId, string runId, int maxRetries = 1, int delayMs = 2000);
         Task<List<ThreadResponse>> GetThreads();

        Task<DeepSeekResponse> GetDeepSeekMessage(string userMessage);

    }
}
