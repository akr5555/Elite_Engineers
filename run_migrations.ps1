# Elite Engineers - Database Migration Runner
# Applies pending SQL migrations to the database

param(
    [string]$MigrationFile = ""
)

$password = '@Nitish@6250'
$env:PGPASSWORD = $password
$psqlPath = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
$dbName = 'elite_db'
$dbUser = 'postgres'
$dbHost = 'localhost'
$dbPort = '5432'

Write-Host "🗄️  Elite Engineers - Database Migration Tool" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

if ($MigrationFile -ne "") {
    # Run specific migration
    Write-Host "Running migration: $MigrationFile" -ForegroundColor Yellow
    
    if (Test-Path $MigrationFile) {
        & $psqlPath -U $dbUser -d $dbName -h $dbHost -p $dbPort -f $MigrationFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migration completed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Migration failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Migration file not found: $MigrationFile" -ForegroundColor Red
        exit 1
    }
} else {
    # Run all migrations in order
    $migrationsDir = "ai-engine\migrations"
    
    if (Test-Path $migrationsDir) {
        $migrations = Get-ChildItem -Path $migrationsDir -Filter "*.sql" | Sort-Object Name
        
        if ($migrations.Count -eq 0) {
            Write-Host "No migrations found in $migrationsDir" -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host "Found $($migrations.Count) migration(s)" -ForegroundColor Green
        Write-Host ""
        
        foreach ($migration in $migrations) {
            Write-Host "Applying: $($migration.Name)" -ForegroundColor Yellow
            
            & $psqlPath -U $dbUser -d $dbName -h $dbHost -p $dbPort -f $migration.FullName
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Success" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Failed" -ForegroundColor Red
                Write-Host ""
                Write-Host "Migration stopped at: $($migration.Name)" -ForegroundColor Red
                exit 1
            }
            Write-Host ""
        }
        
        Write-Host "✅ All migrations completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Migrations directory not found: $migrationsDir" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
