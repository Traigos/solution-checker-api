# Upload Solution Checker Web Resources to Dataverse
# Requires: Microsoft.Xrm.Data.PowerShell module

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentUrl,

    [Parameter(Mandatory=$true)]
    [string]$PublisherPrefix,

    [Parameter(Mandatory=$false)]
    [string]$SolutionName = ""
)

# Install required module if not present
if (-not (Get-Module -ListAvailable -Name Microsoft.Xrm.Data.PowerShell)) {
    Write-Host "Installing Microsoft.Xrm.Data.PowerShell module..." -ForegroundColor Yellow
    Install-Module -Name Microsoft.Xrm.Data.PowerShell -Scope CurrentUser -Force
}

Import-Module Microsoft.Xrm.Data.PowerShell

# Connect to Dataverse
Write-Host "Connecting to Dataverse environment: $EnvironmentUrl" -ForegroundColor Cyan
try {
    $conn = Connect-CrmOnline -ServerUrl $EnvironmentUrl -ForceOAuth
    Write-Host "Connected successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to connect: $_" -ForegroundColor Red
    exit 1
}

# Define web resources to upload
$webResources = @(
    @{
        Path = "solution-checker/index.html"
        Name = "$PublisherPrefix/SolutionChecker/index.html"
        DisplayName = "Solution Checker - Main Page"
        Type = 1  # HTML
    },
    @{
        Path = "solution-checker/assets/app.js"
        Name = "$PublisherPrefix/SolutionChecker/assets/app.js"
        DisplayName = "Solution Checker - App Script"
        Type = 3  # JScript
    },
    @{
        Path = "solution-checker/assets/app.css"
        Name = "$PublisherPrefix/SolutionChecker/assets/app.css"
        DisplayName = "Solution Checker - App Styles"
        Type = 2  # CSS
    }
)

# Function to upload or update web resource
function Upload-WebResource {
    param(
        [Parameter(Mandatory=$true)]
        $Connection,
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        [Parameter(Mandatory=$true)]
        [string]$Name,
        [Parameter(Mandatory=$true)]
        [string]$DisplayName,
        [Parameter(Mandatory=$true)]
        [int]$Type
    )

    # Read file content and encode to base64
    $content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($FilePath))

    # Check if web resource already exists
    $fetch = @"
<fetch top='1'>
  <entity name='webresource'>
    <attribute name='webresourceid' />
    <filter>
      <condition attribute='name' operator='eq' value='$Name' />
    </filter>
  </entity>
</fetch>
"@

    $existingResource = Get-CrmRecordsByFetch -conn $Connection -Fetch $fetch

    if ($existingResource.CrmRecords.Count -gt 0) {
        # Update existing
        $webResourceId = $existingResource.CrmRecords[0].webresourceid
        Write-Host "  Updating existing web resource: $Name" -ForegroundColor Yellow

        $updateFields = @{
            "content" = $content
            "displayname" = $DisplayName
        }

        Set-CrmRecord -conn $Connection -EntityLogicalName webresource -Id $webResourceId -Fields $updateFields
        Write-Host "  Updated successfully!" -ForegroundColor Green

        return $webResourceId
    } else {
        # Create new
        Write-Host "  Creating new web resource: $Name" -ForegroundColor Yellow

        $fields = @{
            "name" = $Name
            "displayname" = $DisplayName
            "webresourcetype" = New-CrmOptionSetValue -Value $Type
            "content" = $content
        }

        $webResourceId = New-CrmRecord -conn $Connection -EntityLogicalName webresource -Fields $fields
        Write-Host "  Created successfully!" -ForegroundColor Green

        return $webResourceId
    }
}

# Upload each web resource
Write-Host "`nUploading web resources..." -ForegroundColor Cyan
$uploadedIds = @()

foreach ($resource in $webResources) {
    Write-Host "`nProcessing: $($resource.Path)" -ForegroundColor White

    if (-not (Test-Path $resource.Path)) {
        Write-Host "  ERROR: File not found: $($resource.Path)" -ForegroundColor Red
        continue
    }

    try {
        $id = Upload-WebResource -Connection $conn `
                                  -FilePath $resource.Path `
                                  -Name $resource.Name `
                                  -DisplayName $resource.DisplayName `
                                  -Type $resource.Type
        $uploadedIds += $id
    } catch {
        Write-Host "  ERROR: Failed to upload: $_" -ForegroundColor Red
    }
}

# Add to solution if specified
if ($SolutionName) {
    Write-Host "`nAdding web resources to solution: $SolutionName" -ForegroundColor Cyan

    foreach ($id in $uploadedIds) {
        try {
            Add-CrmRecordToSolution -conn $conn `
                                    -EntityLogicalName webresource `
                                    -RecordId $id `
                                    -SolutionUniqueName $SolutionName
            Write-Host "  Added web resource to solution" -ForegroundColor Green
        } catch {
            Write-Host "  WARNING: Could not add to solution: $_" -ForegroundColor Yellow
        }
    }
}

# Publish all customizations
Write-Host "`nPublishing customizations..." -ForegroundColor Cyan
try {
    Publish-CrmAllCustomization -conn $conn
    Write-Host "Published successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to publish: $_" -ForegroundColor Red
}

Write-Host "`n=== Upload Complete ===" -ForegroundColor Green
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "$EnvironmentUrl/WebResources/$PublisherPrefix/SolutionChecker/index.html" -ForegroundColor White

# Disconnect
Remove-CrmConnection -conn $conn
