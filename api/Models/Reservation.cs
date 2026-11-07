namespace api.Models;

public sealed class Reservation
{
    public int ReservationId { get; set; }
    public int RoomId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string BookerName { get; set; } = string.Empty;
    public Room Room { get; set; } = null!;
}
