import Controls = require("VSS/Controls");
import VSS_Service = require("VSS/Service");
import TFS_Build_Contracts = require("TFS/Build/Contracts");
import TFS_Build_Extension_Contracts = require("TFS/Build/ExtensionContracts");
import DT_Client = require("TFS/DistributedTask/TaskRestClient");
import { data } from "jquery";

export class InfoTab extends Controls.BaseControl {
	constructor() {
		super();
	}

	public initialize(): void {
		super.initialize();
		// Get configuration that's shared between extension and the extension host
		var sharedConfig: TFS_Build_Extension_Contracts.IBuildResultsViewExtensionConfig = VSS.getConfiguration();
		var vsoContext = VSS.getWebContext();
		if (sharedConfig) {
			// register the extension with host through callback
			sharedConfig.onBuildChanged((build: TFS_Build_Contracts.Build): void => {
				this._initBuildInfo(build);

				const taskClient = DT_Client.getClient();

				var menuSelector = $("#htmlfilesMenu");
				var contentSelector = $("#htmlfilesContent");

				menuSelector.empty();
				contentSelector.empty();

				taskClient.getPlanAttachments(vsoContext.project.id, "build", build.orchestrationPlan.planId, "htmlreport").then((taskAttachments) => {
					if (taskAttachments.length > 0) {
						$.each(taskAttachments, (index, taskAttachment) => {

							console.log('task: ' + taskAttachment.name)
	
							var recId = taskAttachment.recordId;
							var timelineId = taskAttachment.timelineId;
							var taskName = taskAttachment.name;
							var taskID = taskName.replace(/[^a-zA-Z0-9]/g, '');
	
							//Append Menu Item
							if (index == 0){
								menuSelector.append('<li class="nav-item"><a href="#v-'+taskID+'" class="nav-link active" id="v-'+taskID+'-tab" data-bs-toggle="tab" data-bs-target="#v-'+taskID+'" type="button" role="tab" aria-controls="v-'+taskID+'" aria-selected="true">'+taskName+'</a></li>');
							}
							else{ 
								menuSelector.append('<li class="nav-item"><a href="#v-'+taskID+'" class="nav-link" id="v-'+taskID+'-tab" data-bs-toggle="tab" data-bs-target="#v-'+taskID+'" type="button" role="tab" aria-controls="v-'+taskID+'" aria-selected="false">'+taskName+'</a></li>');
							}
	
							//Append Content
							taskClient.getAttachmentContent(vsoContext.project.id, "build", build.orchestrationPlan.planId, timelineId, recId, "htmlreport", taskAttachment.name).then((attachementContent) => {
								var reportContent = this.escapeHtml(this.arrayBufferToString(attachementContent));

								if (index == 0){
									contentSelector.append('<div class="tab-pane fade show active" id="v-'+taskID+'" role="tabpanel" aria-labelledby="v-'+taskID+'-tab"><iframe srcdoc="'+reportContent+'" class="iframeContent" sandbox="allow-scripts"></div>');
								}
								else{ 
									contentSelector.append('<div class="tab-pane fade" id="v-'+taskID+'" role="tabpanel" aria-labelledby="v-'+taskID+'-tab"><iframe srcdoc="'+reportContent+'" class="iframeContent" sandbox="allow-scripts"></iframe></div>');
								}
	
							});
						});
					}
					else { 
						contentSelector.append('<li class="nav-item">No reports found...</li>');
					}
				});

				// Get Metadata
				console.log('Get Metadata...');
				taskClient.getPlanAttachments(vsoContext.project.id, "build", build.orchestrationPlan.planId, "metadata").then((taskAttachment) => {
					if (taskAttachment.length > 0) {
						var metaDataFile = taskAttachment[0]
						//Get Content
						taskClient.getAttachmentContent(vsoContext.project.id, "build", build.orchestrationPlan.planId, metaDataFile.timelineId, metaDataFile.recordId, "metadata", metaDataFile.name).then((attachementContent) => {
							var data = JSON.parse(this.arrayBufferToString(attachementContent));
							var newTitle = data.reportTitle || 'Reports';
							$("#reportTitle").text(newTitle);
						});
					}
					else {
						console.log('No metadata found...');
					}
				});
			});
		}
	}

	private _initBuildInfo(build: TFS_Build_Contracts.Build) {

	}

	private arrayBufferToString(buffer: ArrayBuffer): string {
		let newstring = '';
		const arr = new Uint8Array(buffer);
		const len = arr.byteLength;
		for (var i = 0; i < len; i++) {
			newstring += String.fromCharCode(arr[i]);
		}
		return newstring;
	}

	private escapeHtml(result : string) : string	{
		return result
			 .replace(/&/g, "&amp;")
			 .replace(/</g, "&lt;")
			 .replace(/>/g, "&gt;")
			 .replace(/"/g, "&quot;")
			 .replace(/'/g, "&#039;");
	}
}

InfoTab.enhance(InfoTab, $(".wrapper"), {});

// Notify the parent frame that the host has been loaded
VSS.notifyLoadSucceeded();
