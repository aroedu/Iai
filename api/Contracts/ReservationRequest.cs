using System.ComponentModel.DataAnnotations;

namespace api.Contracts;

public sealed class ReservationRequest
{
    [Range(1, int.MaxValue)]
    public int RoomId { get; init; }

    [Required]
    [StringLength(200)]
    public string Title { get; init; } = string.Empty;

    [Required]
    public DateTime? StartsAt { get; init; }

    [Required]
    public DateTime? EndsAt { get; init; }

    [Required]
    [StringLength(200)]
    public string BookerName { get; init; } = string.Empty;
}
