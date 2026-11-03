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

$null = git diff --cached --quiet --no-ext-diff --no-textconv
if ($LASTEXITCODE -eq 0) {
  Write-Host "No changes to commit."

}
elseif ($LASTEXITCODE -ne 1) {
  throw "git diff --cached failed with exit code $LASTEXITCODE"
}

if ($LASTEXITCODE -eq 1) {
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "git commit failed with exit code $LASTEXITCODE"
}

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

