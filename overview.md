# Display HTML Reports

This extension can be used in Azure devops to publish HTML reports as a seperate tab in Build Pipelines. 

### 1. Use the extension in your azure devops pipeline to publish this report on Azdo.

```
- task: displayhtmlreport@1
  inputs:
    htmlPath: '$(Build.SourcesDirectory)/lighthouse-html-reports,$(Build.SourcesDirectory)/cucumber-html-reports'
    reportTitle: 'Test Automation Reports'
```