# 🏗️ Enterprise Migration Blueprint: ASP.NET Core Web API + React + SQL Server

This project (`Admission Hub`) is architected so that its JSON data contracts (`data/*.json`) and service layer (`API_CONFIG` in `app.js`) map **1-to-1** to an **ASP.NET Core 8/9 Web API**, **Entity Framework Core + SQL Server**, and a **React (Vite / Next.js)** frontend.

---

## 1. Data Contract Mapping (JSON → SQL Server → C# DTOs)

| Current JSON File | SQL Server Table (`architecture/database-schema.sql`) | ASP.NET Core Endpoint |
|---|---|---|
| `data/sources.json` | `dbo.Universities` | `GET /api/v1/universities` |
| `data/circulars.json` | `dbo.AdmissionCirculars` + `dbo.CircularUnits` | `GET /api/v1/circulars` |
| `data/updates.json` | `dbo.CircularNotices` | `GET /api/v1/notices/recent` |
| `data/status.json` | `dbo.Universities (LastCheckedAt, IsMonitorHealthy)` | `GET /api/v1/monitor/status` |

---

## 2. Recommended ASP.NET Core Solution Structure

```text
AdmissionHub.sln
├── src/
│   ├── AdmissionHub.Domain/              # Entities: University, AdmissionCircular, CircularNotice
│   ├── AdmissionHub.Application/         # DTOs, Interfaces (ICircularExtractor, IUniversityMonitor)
│   ├── AdmissionHub.Infrastructure/      # EF Core DbContext, GeminiAiExtractorService, ScraperWorker
│   └── AdmissionHub.WebApi/              # Controllers, SignalR Hub (Live Notifications), Program.cs
└── client-react/                         # React + TypeScript Frontend
```

---

## 3. ASP.NET Core Background Worker (`IHostedService`)

What `scripts/monitor.js` currently does on GitHub Actions translates directly into an ASP.NET Core `BackgroundService`:

```csharp
public class UniversityMonitorWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<NotificationHub> _hubContext;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            using var scope = _scopeFactory.CreateScope();
            var monitor = scope.ServiceProvider.GetRequiredService<IUniversityMonitorService>();
            var newNotices = await monitor.CheckAllUniversitiesAsync(stoppingToken);

            // Push real-time alert to connected React clients via SignalR
            foreach (var notice in newNotices)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveNewCircular", notice, stoppingToken);
            }
        }
    }
}
```

---

## 4. Switching Frontend to ASP.NET Core API

In `app.js` (or your React `.env`), simply update `API_CONFIG`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://your-aspnet-api.com/api/v1',
  ENDPOINTS: {
    CIRCULARS: 'circulars',
    SOURCES: 'universities',
    STATUS: 'monitor/status',
    UPDATES: 'notices/recent'
  }
};
```
