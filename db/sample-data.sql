USE [iai];
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

INSERT INTO dbo.Rooms (Name)
SELECT samples.Name
FROM (VALUES
    (N'Room 01'),
    (N'Room 02'),
    (N'Room 03'),
    (N'Room 04'),
    (N'Room 05'),
    (N'Room 06'),
    (N'Room 07'),
    (N'Room 08'),
    (N'Room 09'),
    (N'Room 10')
) AS samples(Name)
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Rooms AS rooms WITH (UPDLOCK, HOLDLOCK)
    WHERE rooms.Name = samples.Name
);

INSERT INTO dbo.Reservations (RoomId, Title, StartsAt, EndsAt, BookerName)
SELECT rooms.RoomId, samples.Title, samples.StartsAt, samples.EndsAt, samples.BookerName
FROM (VALUES
    (N'Room 01', N'Weekly planning',       CONVERT(DATETIME2(0), '2026-11-09T09:00:00'), CONVERT(DATETIME2(0), '2026-11-09T10:00:00'), N'Alice Cohen'),
    (N'Room 01', N'Design review',         CONVERT(DATETIME2(0), '2026-11-09T10:00:00'), CONVERT(DATETIME2(0), '2026-11-09T11:00:00'), N'Dan Levi'),
    (N'Room 02', N'Product sync',          CONVERT(DATETIME2(0), '2026-11-09T09:30:00'), CONVERT(DATETIME2(0), '2026-11-09T10:30:00'), N'Maya Cohen'),
    (N'Room 02', N'Customer interview',    CONVERT(DATETIME2(0), '2026-11-09T11:00:00'), CONVERT(DATETIME2(0), '2026-11-09T12:00:00'), N'Noam Bar'),
    (N'Room 03', N'Architecture meeting',  CONVERT(DATETIME2(0), '2026-11-09T08:30:00'), CONVERT(DATETIME2(0), '2026-11-09T09:30:00'), N'Eli Shachar'),
    (N'Room 03', N'Backend review',       CONVERT(DATETIME2(0), '2026-11-09T10:00:00'), CONVERT(DATETIME2(0), '2026-11-09T11:30:00'), N'Yael David'),
    (N'Room 04', N'Sprint retrospective',  CONVERT(DATETIME2(0), '2026-11-09T09:00:00'), CONVERT(DATETIME2(0), '2026-11-09T10:00:00'), N'Roni Katz'),
    (N'Room 04', N'UX research review',    CONVERT(DATETIME2(0), '2026-11-09T10:30:00'), CONVERT(DATETIME2(0), '2026-11-09T11:30:00'), N'Tamar Azulay'),
    (N'Room 05', N'API planning',          CONVERT(DATETIME2(0), '2026-11-09T09:00:00'), CONVERT(DATETIME2(0), '2026-11-09T10:30:00'), N'Yoni Green'),
    (N'Room 05', N'Project kickoff',       CONVERT(DATETIME2(0), '2026-11-09T11:00:00'), CONVERT(DATETIME2(0), '2026-11-09T12:00:00'), N'Sara Mizrahi')
) AS samples(RoomName, Title, StartsAt, EndsAt, BookerName)
JOIN dbo.Rooms AS rooms ON rooms.Name = samples.RoomName
WHERE NOT EXISTS
(
    SELECT 1
    FROM dbo.Reservations AS reservations WITH (UPDLOCK, HOLDLOCK)
    WHERE reservations.RoomId = rooms.RoomId
      AND reservations.Title = samples.Title
      AND reservations.StartsAt = samples.StartsAt
      AND reservations.EndsAt = samples.EndsAt
      AND reservations.BookerName = samples.BookerName
);

COMMIT TRANSACTION;
GO
