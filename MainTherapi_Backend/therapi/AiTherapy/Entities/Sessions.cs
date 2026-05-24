using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace AiTherapy.Entities
{
    [Table("sessions")]
    public class Sessions
    {
  
        [Key,Column("id")]
        public int Id { get; set; }

        [Column("thread_id")]
        public string ThreadId { get; set; }

        [Column("session_name")]
        public string SessionName { get; set; }

        [Column("created_date")]
        public DateTime CreatedDate { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        [InverseProperty("Sessions")]
        public Users Users { get; set; }
    }
}
