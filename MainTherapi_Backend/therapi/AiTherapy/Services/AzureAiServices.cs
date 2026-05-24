using AiTherapy.Entities;
using AiTherapy.IServices;
using AiTherapy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http.Headers;
using System.Text;


namespace AiTherapy.Services
{

    public class AzureAiServices : IAzureAiServices
    {
        private readonly IConfiguration _configuration;

        private readonly HttpClient _httpClient;
        private readonly string _openAIEndpoint;
        private readonly string _openAIKey;
        private readonly string _openAIModel;
        private readonly string _assistantId;
        private readonly string _deepSeekApiUrl;
        private readonly string _deepSeekApiKey;
        private readonly IUserServices _userServices;
        private readonly AiTherapiContext _aiTherapiContext;

        public AzureAiServices(IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            AiTherapiContext aiTherapiContext,
            IUserServices userServices)
        {
            _configuration = configuration;

            _userServices = userServices;
            var azureOptions = _configuration.GetSection("AzureOpenAI");
            _openAIEndpoint = azureOptions["Endpoint"];
            _openAIKey = azureOptions["Key"];
            _openAIModel = azureOptions["Model"];
            _assistantId = azureOptions["AssistantId"] ?? string.Empty;
            var deepSeekOptions = _configuration.GetSection("DeepSeek");
            _deepSeekApiUrl = deepSeekOptions["ApiUrl"] ?? "https://api.deepseek.com/chat/completions";
            _deepSeekApiKey = deepSeekOptions["ApiKey"] ?? string.Empty;
            _httpClient = httpClientFactory.CreateClient();
            _aiTherapiContext = aiTherapiContext;
        }


        public async Task UploadFileToAzureOpenAI(IFormFile formFile)
        {
            var client = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_openAIEndpoint}/openai/files?api-version=2024-08-01-preview");


            request.Headers.Add("api-key", _openAIKey);


            var content = new MultipartFormDataContent();
            content.Add(new StringContent("assistants"), "purpose");


            using (var stream = formFile.OpenReadStream())
            {
                content.Add(new StreamContent(stream), "file", formFile.FileName);
            }

            request.Content = content;
            var response = await client.SendAsync(request);

            response.EnsureSuccessStatusCode();
            Console.WriteLine(await response.Content.ReadAsStringAsync());
        }
        public async Task<string> CreateAssistant([FromBody] AssistantRequest request)
        {
            try
            {

                var payload = new
                {
                    instructions = request.Instructions,
                    tools = request.Tools.Select(tool => new { type = tool.Type }),
                    model = _openAIModel
                };

                var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_openAIEndpoint}openai/assistants?api-version=2024-08-01-preview")
                {
                    Content = JsonContent.Create(payload)
                };
                httpRequest.Headers.Add("api-key", _openAIKey);

                var response = await _httpClient.SendAsync(httpRequest);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<dynamic>();
                    return result?.id;
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return "";
                }
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
        public async Task AddThread(string name, string threadId)
        {
            var session = new Sessions
            {
                SessionName = name,
                ThreadId = threadId,
                CreatedDate = DateTime.Now,
                UserId = _userServices.UserID
            };
            _aiTherapiContext.Sessions.Add(session);
            await _aiTherapiContext.SaveChangesAsync();
        }
       
        //public async Task<string> FetchThreads()
        //{
        //    var client = new HttpClient();

        //    var request = new HttpRequestMessage(HttpMethod.Get, $"{_openAIEndpoint}/openai/threads?api-version=2024-08-01-preview");

        //    request.Headers.Add("api-key", $"{_openAIKey}");

        //    // Send the request
        //    var response = await client.SendAsync(request);

        //    response.EnsureSuccessStatusCode();

        //    string responseBody = await response.Content.ReadAsStringAsync();
        //    return responseBody;
        //}
        public async Task<List<ThreadResponse>> GetThreads()
        {
            return await _aiTherapiContext.Sessions.OrderByDescending(x => x.Id).Where(x => x.UserId == _userServices.UserID).Select(s => new ThreadResponse
            {
                Id = s.Id,
                Name = s.SessionName,
                CreatedDate = s.CreatedDate,
                ThreadId = s.ThreadId
            }).ToListAsync(); 

        }

        public async Task<ThreadResponse> CreateThreadAsync(string name)
        {
            var client = new HttpClient();
            var requestUrl = $"{_openAIEndpoint}openai/threads?api-version=2024-08-01-preview";

            var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Headers =
            {
                { "api-key", _openAIKey }
            },
                Content = new StringContent("{}", Encoding.UTF8, "application/json")
            };

            try
            {

                var response = await client.SendAsync(request);


                response.EnsureSuccessStatusCode();


                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Response Content: " + responseContent);


                dynamic responseData = JsonConvert.DeserializeObject(responseContent);
                string threadId = responseData?.id;
                Console.WriteLine("Thread ID: " + threadId);
             
               await AddThread(name, threadId);
                return await GetThread(threadId);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error creating thread: " + ex.Message);
                return null;
            }
        }

        public async Task<ThreadResponse> GetThread(string threadId)
        {
            var thread = new ThreadResponse();

            var session = await _aiTherapiContext.Sessions.FirstOrDefaultAsync(s => s.ThreadId == threadId);

            if (session != null)
            {
                thread.Id = session.Id;
                thread.Name =session.SessionName;
                thread.ThreadId = session.ThreadId;
                thread.CreatedDate = session.CreatedDate;
            }
            return thread;
        }
        public async Task<List<MessageResponse>> CreateMessageAsync(string threadId, string messageContent)
        {
            var client = new HttpClient();
            var requestUrl = $"{_openAIEndpoint}openai/threads/{threadId}/messages?api-version=2024-08-01-preview";

            var payload = new
            {
                role = "user",
                content = messageContent
            };

            var jsonPayload = JsonConvert.SerializeObject(payload);

            var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Headers =
            {
                { "api-key", _openAIKey }
            },
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };

            try
            {

                var response = await client.SendAsync(request);


                response.EnsureSuccessStatusCode();


                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Response Content: " + responseContent);


                dynamic responseData = Newtonsoft.Json.JsonConvert.DeserializeObject(responseContent);
                string messageId = responseData?.id;
                Console.WriteLine("Message ID: " + messageId);

                var runId = await RunAssistantOnThreadAsync(threadId, _assistantId);
                var message =  await GetMessagesWithRetryAsync(threadId, runId);
                return message;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error sending message: " + ex.Message);
                return null;
            }

            {

            }
        }
        public async Task<string> RunAssistantOnThreadAsync(string threadId, string assistantId)
        {
            var client = new HttpClient();
            var requestUrl = $"{_openAIEndpoint}openai/threads/{threadId}/runs?api-version=2024-08-01-preview";

            var payload = new
            {
                assistant_id = assistantId
            };

            var jsonPayload = JsonConvert.SerializeObject(payload);

            var request = new HttpRequestMessage(HttpMethod.Post, requestUrl)
            {
                Headers =
            {
                { "api-key", _openAIKey }
            },
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };

            try
            {

                var response = await client.SendAsync(request);


                response.EnsureSuccessStatusCode();


                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Response Content: " + responseContent);

                dynamic responseData = Newtonsoft.Json.JsonConvert.DeserializeObject(responseContent);
                string runId = responseData?.id;
                Console.WriteLine("Run ID: " + runId);

                return runId;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error running assistant on thread: " + ex.Message);
                return null;
            }
        }

        public async Task<MessageResponse> GetMessageByIdAsync(string threadId, string messageId)
        {
            try
            {

                var requestUrl = $"{_openAIEndpoint}openai/threads/{threadId}/messages/{messageId}?api-version=2024-08-01-preview";


                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
                request.Headers.Add("api-key", _openAIKey);
                request.Headers.Add("Content-Type", "application/json");


                var response = await client.SendAsync(request);


                response.EnsureSuccessStatusCode();


                var responseContent = await response.Content.ReadAsStringAsync();
                var message = JsonConvert.DeserializeObject<Message>(responseContent);


                if (message != null && message.Content != null)
                {
                    foreach (var content in message.Content)
                    {
                        return new MessageResponse
                        {
                            Role = message.Role,
                            Content = content.Text.Value
                        };
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error fetching message by ID: {ex.Message}");
                return null;
            }
        }

        public async Task<List<MessageResponse>> GetMessages(string threadId)
        {
            int attempt = 0;
            var client = new HttpClient();

            try
            {
                var requestUrl = $"{_openAIEndpoint}openai/threads/{threadId}/messages?api-version=2024-08-01-preview";

                var request = new HttpRequestMessage(HttpMethod.Get, requestUrl)
                {
                    Headers =
                {
                  { "api-key", _openAIKey }
                }
                };

                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseData = JsonConvert.DeserializeObject<AzureResponse>(responseContent);

                var messages = responseData?.Data ?? new List<Message>();

                var messageContent = new List<MessageResponse>();
                foreach (var message in messages)
                {
                    if (message.Content != null)
                    {
                        foreach (var content in message.Content)
                        {
                            messageContent.Add(new MessageResponse
                            {
                                Role = message.Role,
                                Content = content.Text.Value
                            });
                        }
                    }
                }

                if (messageContent.Count > 0)
                {
                    return messageContent;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching messages: {ex.Message}");
            }

            return new List<MessageResponse>
            {
                new MessageResponse
                {
                    Role = "assistant",
                    Content = "Hello, welcome to THERAPi, your AI therapist. Do you wanna start by telling me more about yourself and what brings you here today?"
                }
            };
        }


        public async Task<List<MessageResponse>> GetMessagesWithRetryAsync(string threadId, string runId, int maxRetries = 5, int delayMs = 1000)
        {
            int attempt = 0;
            var client = new HttpClient();
         
            while (attempt < maxRetries)
            {
                try
                {

                    var requestUrl = $"{_openAIEndpoint}openai/threads/{threadId}/messages?api-version=2024-08-01-preview";


                    var request = new HttpRequestMessage(HttpMethod.Get, requestUrl)
                    {
                        Headers =
                          {
                              { "api-key", _openAIKey }

                          },

                    };
                    var emptyContent = new StringContent(string.Empty);
                    emptyContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    request.Content = emptyContent;

                    var response = await client.SendAsync(request);
                    response.EnsureSuccessStatusCode();

                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseData = JsonConvert.DeserializeObject<AzureResponse>(responseContent);

                    var messages = responseData?.Data ?? new List<Message>();
                    var filteredMessages = !string.IsNullOrEmpty(runId)
                        ? messages.FindAll(msg => msg.RunId == runId)
                        : messages;


                    var messageContent = new List<MessageResponse>();
                    foreach (var message in filteredMessages)
                    {
                        if (message.Content != null)
                        {
                            foreach (var content in message.Content)
                            {
                                messageContent.Add(new MessageResponse
                                {
                                    Role = message.Role,
                                    Content = content.Text.Value
                                });
                            }
                        }
                    }

                
                    if (messageContent.Count > 0)
                    {
                        return messageContent;
                    }

                    await Task.Delay(delayMs);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Attempt {attempt + 1} failed: {ex.Message}");
                    await Task.Delay(delayMs);
                }

                attempt++;
            }

            Console.WriteLine($"Max retries reached ({maxRetries}). Returning null.");
            return null;
        }


        public async Task<DeepSeekResponse> GetDeepSeekMessage(string userMessage)
        {
            var requestBody = new
            {
                model = "deepseek-chat",
                messages = new[]
                {
                            new { role = "system", content = "You are a helpful assistant." },
                            new { role = "user", content = userMessage }
                },
                stream = false
            };

            string jsonRequest = JsonConvert.SerializeObject(requestBody);
            var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _deepSeekApiKey);

            var response = await _httpClient.PostAsync(_deepSeekApiUrl, content);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Error calling DeepSeek API: {response.StatusCode}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            return JsonConvert.DeserializeObject<DeepSeekResponse>(jsonResponse);
        }
        

    }

    public class AIRequest
    {
        public string Message { get; set; }
        public string FileUrl { get; set; }
    }

    public class AssistantRequest
    {
        public string Instructions { get; set; }
        public List<Tool> Tools { get; set; }
    }

    public class Tool
    {
        public string Type { get; set; }
    }

    public class DeepSeekResponse
    {
        public string Model { get; set; }
        public List<DeepSeekMessage> Messages { get; set; }
    }

    public class DeepSeekMessage
    {
        public string Role { get; set; }
        public string Content { get; set; }
    }


}

