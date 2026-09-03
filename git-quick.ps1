param(
  [string]$Message
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

git add .
if ($LASTEXITCODE -ne 0) {
  throw "git add failed with exit code $LASTEXITCODE"
}

$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace(($status | Out-String))) {
  Write-Host "No changes to commit."
  exit 0
}

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "git commit failed with exit code $LASTEXITCODE"
}

$branch = git rev-parse --abbrev-ref HEAD
$upstream = git config --get "branch.$branch.merge"
if ([string]::IsNullOrWhiteSpace(($upstream | Out-String))) {
  git push -u origin $branch
}
else {
  git push
}

if ($LASTEXITCODE -ne 0) {
  throw "git push failed with exit code $LASTEXITCODE"
}
