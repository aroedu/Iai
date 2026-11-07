# Meeting room reservations API

## Run

The API uses the existing `iai` database on `(localdb)\MSSQLLocalDB`. Create the
tables with `db/schema.sql` from the repository root before starting the API.

```powershell
dotnet run --project .\api\api.csproj
```

In Development, the API listens on `http://localhost:5128` and exposes its
OpenAPI document at `/openapi/v1.json`.

## Endpoints

- `GET /api/rooms` — list rooms.
- `GET /api/reservations?roomId=1&date=2026-11-09` — list a room's reservations
  for one day, ordered by start time.
- `GET /api/reservations/{id}` — get a reservation.
- `POST /api/reservations` — create a reservation.
- `DELETE /api/reservations/{id}` — cancel a reservation.

Example request body:

```json
{
  "roomId": 1,
  "title": "Planning",
  "startsAt": "2026-11-10T09:00:00",
  "endsAt": "2026-11-10T10:00:00",
  "bookerName": "Alex"
}
```

Invalid input returns `400`, an unknown room or reservation returns `404`, and
an overlapping reservation returns `409`. Adjacent reservations are allowed.
The development CORS policy allows Angular at `http://localhost:4200`.

The SQL Server connection string is in `appsettings.json` and can be overridden
with the standard `ConnectionStrings__DefaultConnection` environment variable.

## Angular client

Start the client from the repository root in a second terminal:

```powershell
cd .\client
npm install
npm start
```

Open `http://localhost:4200`. See `client/README.md` for client details.
