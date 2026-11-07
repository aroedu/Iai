namespace api.Contracts;

public sealed record ReservationResponse(
    int ReservationId,
    int RoomId,
    string Title,
    DateTime StartsAt,
    DateTime EndsAt,
    string BookerName);
