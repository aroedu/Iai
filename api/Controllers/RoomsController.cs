using api.Contracts;
using api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/rooms")]
public sealed class RoomsController(ReservationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RoomResponse>>> GetRooms(
        CancellationToken cancellationToken)
    {
        var rooms = await dbContext.Rooms
            .AsNoTracking()
            .OrderBy(room => room.Name)
            .Select(room => new RoomResponse(room.RoomId, room.Name))
            .ToListAsync(cancellationToken);

        return Ok(rooms);
    }
}
