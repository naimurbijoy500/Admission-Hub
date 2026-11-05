-- =========================================================================
-- Admission Hub Bangladesh — SQL Server Database Schema (ASP.NET Core Ready)
-- Target DBMS: Microsoft SQL Server (T-SQL) / Azure SQL
-- Clean Architecture Domain Entities:
--   1. Universities        (Master list of 55+ public universities & logos)
--   2. AdmissionCirculars  (Session circulars, dates, GPA, fees, seats)
--   3. CircularUnits       (Unit-wise GPA & subject requirements: A, B, C...)
--   4. CircularNotices     (Auto-discovered notices & PDFs from BackgroundService)
--   5. UserBookmarks       (Saved circulars & notification subscriptions)
-- =========================================================================

CREATE TABLE dbo.Universities (
    UniversityId       INT IDENTITY(1,1) PRIMARY KEY,
    Code               NVARCHAR(20)  NOT NULL UNIQUE,   -- e.g., 'DU', 'BUET', 'GST'
    NameBangla         NVARCHAR(200) NOT NULL,          -- e.g., N'ঢাকা বিশ্ববিদ্যালয়'
    NameEnglish        NVARCHAR(200) NOT NULL,          -- e.g., 'University of Dhaka'
    Category           NVARCHAR(50)  NOT NULL,          -- 'general', 'engineering', 'medical', 'cluster', 'science_tech', 'specialized'
    OfficialUrl        NVARCHAR(500) NOT NULL,
    AdmissionPortalUrl NVARCHAR(500) NULL,
    LogoUrl            NVARCHAR(500) NULL,
    StrictKeywordMode  BIT           NOT NULL DEFAULT 1,
    LastCheckedAt      DATETIME2     NULL,
    IsMonitorHealthy   BIT           NOT NULL DEFAULT 1,
    LastErrorMessage   NVARCHAR(500) NULL,
    CreatedAt          DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE dbo.AdmissionCirculars (
    CircularId         INT IDENTITY(1,1) PRIMARY KEY,
    UniversityId       INT           NOT NULL REFERENCES dbo.Universities(UniversityId) ON DELETE CASCADE,
    AcademicSession    NVARCHAR(20)  NOT NULL,          -- e.g., '2026-27'
    UnitsSummary       NVARCHAR(300) NOT NULL,          -- e.g., N'ক, খ, গ, চ ইউনিট'
    ApplyStartDate     DATE          NULL,
    ApplyDeadlineDate  DATE          NULL,
    ExamDate           DATE          NULL,
    MinSscGpa          DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    MinHscGpa          DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    MinTotalGpa        DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    AllowedGroupsCsv   NVARCHAR(100) NOT NULL DEFAULT 'science,arts,commerce',
    ApplicationFeeText NVARCHAR(100) NULL,              -- e.g., N'১,০৫০ টাকা'
    TotalSeatsText     NVARCHAR(100) NULL,              -- e.g., N'৭,১২৮ টি'
    SummaryBangla      NVARCHAR(MAX) NULL,
    SourcePdfUrl       NVARCHAR(500) NULL,
    IsAiVerified       BIT           NOT NULL DEFAULT 0,
    UpdatedAt          DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Circular_University_Session UNIQUE (UniversityId, AcademicSession)
);
GO

CREATE TABLE dbo.CircularUnits (
    UnitId             INT IDENTITY(1,1) PRIMARY KEY,
    CircularId         INT           NOT NULL REFERENCES dbo.AdmissionCirculars(CircularId) ON DELETE CASCADE,
    UnitCode           NVARCHAR(20)  NOT NULL,          -- e.g., 'A', 'B', 'Ka'
    UnitTitleBangla    NVARCHAR(150) NOT NULL,
    ExamDate           DATETIME2     NULL,
    MinSscGpa          DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    MinHscGpa          DECIMAL(3,2)  NOT NULL DEFAULT 0.00,
    MinTotalGpa        DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    EligibleGroup      NVARCHAR(30)  NOT NULL           -- 'science', 'arts', 'commerce', 'all'
);
GO

CREATE TABLE dbo.CircularNotices (
    NoticeId           BIGINT IDENTITY(1,1) PRIMARY KEY,
    UniversityId       INT           NOT NULL REFERENCES dbo.Universities(UniversityId) ON DELETE CASCADE,
    ContentHash        CHAR(16)      NOT NULL UNIQUE,
    Title              NVARCHAR(400) NOT NULL,
    NoticeUrl          NVARCHAR(600) NOT NULL,
    IsPdf              BIT           NOT NULL DEFAULT 0,
    IsAiProcessed      BIT           NOT NULL DEFAULT 0,
    DetectedAt         DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_CircularNotices_DetectedAt ON dbo.CircularNotices(DetectedAt DESC);
CREATE INDEX IX_AdmissionCirculars_Dates ON dbo.AdmissionCirculars(ApplyDeadlineDate, ExamDate);
GO
