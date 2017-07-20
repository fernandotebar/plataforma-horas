jQuery.sap.require("control.MenuControl");
sap.ui.jsview("view.MenuControl", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.MenuControl
	*/ 
	getControllerName : function() {
		return "view.MenuControl";
	},
	

	
	onBeforeShow : function(oEvt){
		
		var oController = sap.ui.getCore().byId(Common.Navigations.INICIO).getController();
		oController.callsAfterSuccessfulLogin();
    	controlDelegar();
		
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.MenuControl
	*/ 
	createContent : function(oController) {
		
		var userNameTitle = new sap.m.Text("userNameTitle").bindText({
			parts: ["/userInfo/NOMBRE", "/userInfo/APELLIDO1", "/userInfo/APELLIDO2"],
			formatter : function(nombre, apellido1, apellido2){
				return nombre+" " + apellido1+" "+ apellido2;
			}
		});
		
		var app = sap.ui.getCore().byId(Common.App.Name);
		
		var menu = new control.MenuControl();
		
 		return new sap.m.Page({
			customHeader: new sap.m.Bar({
				contentMiddle: userNameTitle
			}).addStyleClass("appHeader"),
			content: [
			          menu
			]
		}).addStyleClass("masterPage")
	}

});