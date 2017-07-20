//jQuery.sap.require("util.ErrorHandler");
sap.ui.jsview("view.Login", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Login
	*/ 
	getControllerName : function() {
		return "view.Login";
	},
	
	onBeforeShow: function(oEvt){
		var oController = this.getController();
		$(document).keypress(function(e) {
		    if(e.which == 13) {
		    	oController.signInButtonTap(oController);
		    }
		});
		
		
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Login
	*/ 
	createContent : function(oController) {
		
		var mainFrame = this.createMainFrame(oController);
		
 		return new sap.m.Page({
			title: "Title",
			showHeader: false,
			content: [
			mainFrame
			]
		});
	},
	
	createMainFrame : function(oController){
		
		this.usernameInput = new sap.m.Input({placeholder: "Usuario"}).addStyleClass("loginInput");
		
		this.passwordInput = new sap.m.Input({placeholder: "Password", type: sap.m.InputType.Password}).addStyleClass("loginInput");
		
		this.idiomaInput = new sap.m.Select({
			items: [
			        new sap.ui.core.Item("idiomaCas",{
			        	key: "es",
			        	text: "Castellano"
			        }),
			        new sap.ui.core.Item("idiomaCat",{
			        	key: "ca",
			        	text: "Català"
			        })
			        ]
		});
		
		this.errorMessage = new sap.m.Text().addStyleClass("errorMessage")
		
		var bigFrame = new sap.m.VBox({
			items:[			       
    	           new sap.m.Bar({
    	        	   contentMiddle: new sap.m.Text({
    	        		   					text: "Login"
    	        		   					}).addStyleClass("loginTitle ")
   					}).addStyleClass("smallFramesNoPadding loginBarTitle appHeader"),
   					
    	           new sap.m.HBox({
    	        	   items: [
                               new sap.ui.core.Icon({src: "sap-icon://employee"}).addStyleClass("iconLogin iconLoginError"),
                               this.usernameInput
                               ]
    	           }).addStyleClass("smallFramesNoPadding smallFramesMiddle"),
    	           new sap.m.HBox({
    	        	   items: [
                               new sap.ui.core.Icon({src: "sap-icon://locked"}).addStyleClass("iconLogin iconLoginError"),
                               this.passwordInput
                               ]
    	           }).addStyleClass("smallFramesNoPadding smallFramesMiddle"),
    	           new sap.m.HBox({
    	        	   items: [
                               new sap.ui.core.Icon({src: "sap-icon://geographic-bubble-chart"}).addStyleClass("iconLogin"),
                               this.idiomaInput
                               ]
    	           }).addStyleClass("smallFramesNoPadding smallFramesMiddle"),
                               
    	           new sap.m.Button({
                	   text: "ENTRAR",
                	   press: [oController.signInButtonTap,  oController]
                	   }).addStyleClass("smallFramesNoPadding  smallFramesMiddle buttonLogin buttonEntrarLogin") , 
            	   new sap.m.HBox("frameError",{
  						visible: false,
    	        	   items: [
                               new sap.ui.core.Icon({src: "sap-icon://alert"}).addStyleClass("iconLogin errorIcon"),
                               this.errorMessage
                               ]
    	           }).addStyleClass("frameError smallFramesNoPadding smallFramesMiddle")
//			       new sap.m.Link({text: getI18nText("view.login.olvido")}).addStyleClass("linkInput")
			       
			       
			       ]
		}).addStyleClass("mainFrameLogin")
		
		
		
		return bigFrame;
	}

});