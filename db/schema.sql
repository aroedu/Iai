USE [iai];
GO

IF OBJECT_ID(N'dbo.Rooms', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Rooms
    (
        RoomId INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Rooms PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        CONSTRAINT UQ_Rooms_Name UNIQUE (Name),
        CONSTRAINT CK_Rooms_Name_NotEmpty CHECK (LEN(LTRIM(RTRIM(Name))) > 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.Reservations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reservations
    (
        ReservationId INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Reservations PRIMARY KEY,
        RoomId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        StartsAt DATETIME2(0) NOT NULL,
        EndsAt DATETIME2(0) NOT NULL,
        BookerName NVARCHAR(200) NOT NULL,
        CONSTRAINT FK_Reservations_Rooms
            FOREIGN KEY (RoomId) REFERENCES dbo.Rooms (RoomId),
        CONSTRAINT CK_Reservations_Title_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(Title))) > 0),
        CONSTRAINT CK_Reservations_BookerName_NotEmpty
            CHECK (LEN(LTRIM(RTRIM(BookerName))) > 0),
        CONSTRAINT CK_Reservations_EndAfterStart
            CHECK (EndsAt > StartsAt),
        CONSTRAINT CK_Reservations_SameDay
            CHECK (CONVERT(date, StartsAt) = CONVERT(date, EndsAt))
    );
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Reservations')
      AND name = N'IX_Reservations_RoomId_StartsAt'
)
BEGIN
    CREATE INDEX IX_Reservations_RoomId_StartsAt
        ON dbo.Reservations (RoomId, StartsAt)
        INCLUDE (EndsAt, Title, BookerName);
END;
GO
