# Fix Leads.tsx - Reemplazar caracteres corruptos
$leads = Get-Content "src\pages\Leads.tsx" -Raw
$leads = $leads -replace "Tel�fono", "Teléfono"
$leads = $leads -replace "Pr�xima Acci�n", "Próxima Acción"  
$leads = $leads -replace "Fecha Acci�n", "Fecha Acción"
[System.IO.File]::WriteAllText("$PWD\src\pages\Leads.tsx", $leads, [System.Text.Encoding]::UTF8)
Write-Host "Leads.tsx arreglado"

# Verificar
npm run build