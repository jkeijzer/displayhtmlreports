import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs')
import path = require('path')

// Make an async function that gets executed immediately
(async ()=>{
    // Our starting point
    try {

        console.log( "Starting Script...");

        const reportsDirectories: string | undefined = tl.getInput('htmlPath', true);
        if (reportsDirectories == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        console.log( "Directory Inputs: '%s'", reportsDirectories);
        
        for (let reportsDirectoryPath of reportsDirectories!.split(',')) 
        {
            let reportsDirectory: string = reportsDirectoryPath.trim()
            console.log( "Searching for HTML files in folder '%s'", reportsDirectory);
            
            // Get the html files in the directory as an array and filter for HTML files only
            const allFiles = await fs.promises.readdir( reportsDirectory! );
            const htmlFiles = allFiles.filter(function(e){
                  return path.extname(e).toLowerCase() === '.html'
            } );

            console.log( "HTML Files Found: '%s'", htmlFiles.length);
    
            // Loop through HTML files and add them as attachment to the task
            for( const file of htmlFiles ) {

                // Get the full paths
                const filePath = path.join( reportsDirectory!, file );
    
                // Stat the file to see if we have a file or dir
                const stat = await fs.promises.stat( filePath );
    
                if( stat.isFile() ) {
                    tl.addAttachment('htmlreport', file, filePath)
                }
               
            }
        }

        const reportTitle: string | undefined = tl.getInput('reportTitle', false);
        tl.setVariable('reportTitle', reportTitle!)
        console.log( "Setting report title: '%s", reportTitle! )

        console.log("Listing all Env Variables")
        console.log(process.env);

        console.log( "We are done!" );
    }
    catch( err ) {
        let errorMessage = "Failed to do something exceptional..";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        // Catch anything bad that happens
        tl.setResult(tl.TaskResult.Failed, errorMessage);
    }
}
)(); 