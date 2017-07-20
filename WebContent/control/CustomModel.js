jQuery.sap.require("sap.ui.model.odata.ODataModel");  
jQuery.sap.declare("control.CustomModel"); 
sap.ui.model.odata.ODataModel.extend("control.CustomModel", { 
	customModelParameters:undefined,
	getCustomModelParameters:function(){
		return this.customModelParameters;
	},
	setCustomModelParameters:function(){
		return this.customModelParameters;
	},
});
