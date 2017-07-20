	var oView;

sap.ui.controller("view.Login", {

	onInit : function(){
		
		oView = this.getView();
//		setPropertySAPUI5Model("/userInfo",new Object())
	},
	
	signInButtonTap : function() {	


		var oView = this.getView();
//		util.ErrorHandler.clearValidationError(oView);
		var username = oView.usernameInput.getValue() ? oView.usernameInput.getValue().trim(): "";
		var password = oView.passwordInput.getValue();
		var valid = this.newValidateLoginForm(username,password);
		if (valid) {
			this.login(username, password);
		}
	},
	
	login : function(username, password) {
		var data = callODataLoginService(username, password, this.loginSuccess, this.loginFailure);
		
	},
	
	newValidateLoginForm : function(userName, password) {
		var errorObject =null;		
		if (userName == "") {
			errorObject = {};		
			errorObject.userId = {Desc:"Please enter User ID"};
		}
		if (password == "") {
			if(errorObject==null)
				errorObject={};
			errorObject.pin = {Desc:"Please enter Password"};
		}
		if(errorObject!=null) {
			var view = sap.ui.getCore().byId(Common.Navigations.SIGN_IN).getController().getView();
//			util.ErrorHandler.showValidationError(errorObject,"authentication", view);
			return false;
		} 
		return true;
	},
	
	loginSuccess : function(request){		
		
		var oView = sap.ui.getCore().byId(Common.Navigations.LOGIN);
		var locale =  oView.idiomaInput.getSelectedKey();
		
		if(request.status == "200" && request.statusText == "OK"){
			
			var entorno, app ;
			// Local
			if(document.location.host.split(":")[0] == "localhost"){
				entorno = Local;
				app =  "../"+Local;
			} else {
				entorno = document.location.origin;
				app =  HostApp;
			}
			
			document.location.replace( app+ "?lang=" +locale);
		}
	},
	
	
	loginFailure : function(request){

		var oView = this.getView();
		var errorFrame= sap.ui.getCore().byId("frameError");
		errorFrame.setVisible(true);
		
		if(request.status == 401){
			oView.errorMessage.setText("El nombre de usuario o contraseña introducido no es valido");
			
			oView.usernameInput.setValueState("Error");
			oView.passwordInput.setValueState("Error");
			oView.addStyleClass("loginViewError");
		}else oView.errorMessage.setText("Ha ocurrido un error tratando de acceder");
		
	}
	
	
	
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Login
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Login
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Login
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Login
*/
//	onExit: function() {
//
//	}

});