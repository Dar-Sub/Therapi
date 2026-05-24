using Newtonsoft.Json;

namespace AiTherapy.Models
{
    public class ReponseModel
    {
    }

    public class Message
    {
        [JsonProperty("run_id")]
        public string RunId { get; set; }

        [JsonProperty("role")]
        public string Role { get; set; }

        [JsonProperty("content")]
        public List<MessageContent> Content { get; set; }
    }

    public class MessageContent
    {
        [JsonProperty("text")]
        public TextContent Text { get; set; }
    }

    public class TextContent
    {
        [JsonProperty("value")]
        public string Value { get; set; }
    }

    public class MessageResponse
    {
        [JsonProperty("role")]
        public string Role { get; set; }

        [JsonProperty("content")]
        public string Content { get; set; }
    }

    public class AzureResponse
    {
        [JsonProperty("data")]
        public List<Message> Data { get; set; }
    }

    public class ThreadResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ThreadId { get; set; }
        public DateTime CreatedDate { get; set; }
    }

}
