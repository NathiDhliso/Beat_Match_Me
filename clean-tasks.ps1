$content = Get-Content 'Tasks.md' -Raw
$pattern = '(?s)<<<<<<< HEAD[\r\n]+(.*?)[\r\n]+=======[\r\n]+.*?[\r\n]+>>>>>>> [a-f0-9]+[\r\n]+'
$cleaned = $content -replace $pattern, '$1'
Set-Content 'Tasks.md' -Value $cleaned -NoNewline
Write-Host 'Merge conflicts resolved!'
