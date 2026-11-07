using System.Data;
using api.Contracts;
using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/reservations")]
public sealed class ReservationsController(ReservationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReservationResponse>>> GetReservations(
        [FromQuery] int? roomId,
        [FromQuery] DateOnly? date,
        CancellationToken cancellationToken)
    {
        if (roomId is null or <= 0 || date is null)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Both a positive roomId and a date (YYYY-MM-DD) are required.");
        }

        if (!await dbContext.Rooms.AnyAsync(room => room.RoomId == roomId, cancellationToken))
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: $"Room {roomId} was not found.");
        }

        var dayStart = date.Value.ToDateTime(TimeOnly.MinValue);
        var nextDay = dayStart.AddDays(1);
        var reservations = await dbContext.Reservations
            .AsNoTracking()
            .Where(reservation =>
                reservation.RoomId == roomId &&
                reservation.StartsAt >= dayStart &&
                reservation.StartsAt < nextDay)
            .OrderBy(reservation => reservation.StartsAt)
            .Select(reservation => ToResponse(reservation))
            .ToListAsync(cancellationToken);

        return Ok(reservations);
    }

    [HttpGet("{id:int}", Name = nameof(GetReservation))]
    public async Task<ActionResult<ReservationResponse>> GetReservation(
        int id,
        CancellationToken cancellationToken)
    {
        var reservation = await dbContext.Reservations
            .AsNoTracking()
            .Where(item => item.ReservationId == id)
            .Select(item => ToResponse(item))
            .SingleOrDefaultAsync(cancellationToken);

        return reservation is null ? NotFound() : Ok(reservation);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationResponse>> CreateReservation(
        ReservationRequest request,
        CancellationToken cancellationToken)
    {
        var startsAt = request.StartsAt!.Value;
        var endsAt = request.EndsAt!.Value;

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            ModelState.AddModelError(nameof(request.Title), "Title is required.");
        }

        if (string.IsNullOrWhiteSpace(request.BookerName))
        {
            ModelState.AddModelError(nameof(request.BookerName), "Booker name is required.");
        }

        if (endsAt <= startsAt)
        {
            ModelState.AddModelError(nameof(request.EndsAt), "End time must be later than start time.");
        }
        else if (startsAt.Date != endsAt.Date)
        {
            ModelState.AddModelError(nameof(request.EndsAt), "A reservation must start and end on the same day.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var roomExists = await dbContext.Rooms
            .AnyAsync(room => room.RoomId == request.RoomId, cancellationToken);

        if (!roomExists)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: $"Room {request.RoomId} was not found.");
        }

        var overlaps = await dbContext.Reservations.AnyAsync(reservation =>
            reservation.RoomId == request.RoomId &&
            reservation.StartsAt < endsAt &&
            reservation.EndsAt > startsAt,
            cancellationToken);

        if (overlaps)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "The room already has a reservation that overlaps this time.");
        }

        var reservation = new Reservation
        {
            RoomId = request.RoomId,
            Title = request.Title.Trim(),
            StartsAt = startsAt,
            EndsAt = endsAt,
            BookerName = request.BookerName.Trim()
        };

        dbContext.Reservations.Add(reservation);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var response = ToResponse(reservation);
        return CreatedAtRoute(
            nameof(GetReservation),
            new { id = reservation.ReservationId },
            response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> CancelReservation(int id, CancellationToken cancellationToken)
    {
        var reservation = await dbContext.Reservations
            .SingleOrDefaultAsync(item => item.ReservationId == id, cancellationToken);

        if (reservation is null)
        {
            return NotFound();
        }

        dbContext.Reservations.Remove(reservation);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static ReservationResponse ToResponse(Reservation reservation) =>
        new(
            reservation.ReservationId,
            reservation.RoomId,
            reservation.Title,
            reservation.StartsAt,
            reservation.EndsAt,
            reservation.BookerName);
}
