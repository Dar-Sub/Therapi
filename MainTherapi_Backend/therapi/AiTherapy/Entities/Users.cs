using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AiTherapy.Entities
{

    [Table("users")]
    public class Users
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("password")]
        public string Password { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("role_id")]
        public int RoleId { get; set; }

        [InverseProperty("Users")]
        public ICollection<Sessions> Sessions { get; set; }
    }
}
