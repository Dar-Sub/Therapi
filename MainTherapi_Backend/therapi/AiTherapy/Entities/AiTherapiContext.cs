using Microsoft.EntityFrameworkCore;

namespace AiTherapy.Entities
{
    public partial class AiTherapiContext : DbContext
    {
        public AiTherapiContext(DbContextOptions<AiTherapiContext> options) : base(options) { }

        public virtual DbSet<Sessions> Sessions { get; set; }

        public virtual DbSet<Users> Users { get; set; }
    }
}
