using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AiTherapy.Entities
{
    [Table("role")]
    public class Role
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [InverseProperty("Role")]
        public Users Users { get; set; }
    }
}
