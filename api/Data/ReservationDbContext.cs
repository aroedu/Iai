using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Data;

public sealed class ReservationDbContext(DbContextOptions<ReservationDbContext> options)
    : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>(entity =>
        {
            entity.ToTable("Rooms", "dbo");
            entity.HasKey(room => room.RoomId);
            entity.Property(room => room.Name).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.ToTable("Reservations", "dbo");
            entity.HasKey(reservation => reservation.ReservationId);
            entity.Property(reservation => reservation.Title).HasMaxLength(200).IsRequired();
            entity.Property(reservation => reservation.BookerName).HasMaxLength(200).IsRequired();
            entity.Property(reservation => reservation.StartsAt).HasColumnType("datetime2(0)");
            entity.Property(reservation => reservation.EndsAt).HasColumnType("datetime2(0)");
            entity.HasOne(reservation => reservation.Room)
                .WithMany(room => room.Reservations)
                .HasForeignKey(reservation => reservation.RoomId);
            entity.HasIndex(reservation => new { reservation.RoomId, reservation.StartsAt })
                .HasDatabaseName("IX_Reservations_RoomId_StartsAt");
        });
    }
}
