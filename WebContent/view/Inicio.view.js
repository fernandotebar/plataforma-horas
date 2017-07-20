jQuery.sap.require("control.CustomModel");

sap.ui.jsview("view.Inicio", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Inicio
	*/ 
	getControllerName : function() {
		return "view.Inicio";
	},
	
	onBeforeFirstShow : function(oEvt){
		
		var oController = this.getController();
		oController.callsAfterSuccessfulLogin(oEvt);
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Inicio
	*/ 
	createContent : function(oController) {
		
		this.header = sap.ui.jsfragment("fragment.AppHeader", this.getController());
		
		this.tiles = this.createTiles();
						
 		return new sap.m.Page({
 			customHeader: this.header,
			title: "Title",
			content: this.tiles,
			
		}).addStyleClass("inicioPage");
	},
	
	
	createTiles: function(oController){
				
		var oTileContainer = new sap.m.TileContainer({
			tiles: [
			        new sap.m.StandardTile({
			        	title : getI18nText("view.imputarHoras.menu"),
						icon : "sap-icon://create-entry-time",
			        	visible: {
			        		  parts: ["/configuracion/ACCESOS/REP_AUT001/ICO_REP","/userInfo/Rol/results"],
			        		  formatter: function(acceso, roles){
			        			  if(acceso == "X") {
			        				  if(isEmpleado() == true){
				        				  return true;
				        			  }else return false; 
			        			  }else return false;
			        		  }
			        	},
						press: function(){
								var app = sap.ui.getCore().byId(Common.App.Name);
								app.toDetail(Common.Navigations.HOME);
	        				
						}
			        }).addStyleClass("newTiles"),	
			        new sap.m.StandardTile({
			        	visible: {
			        		parts: ["/configuracion/ACCESOS/MAN_AUT001/ICO_MAN","/userInfo/Rol/results"],
			        		  formatter: function(acceso,roles){
			        			  if(acceso == "X") {
				        			  if(isGerProd(roles) == true || isResponsable(roles) == true){
				        				  return true;
				        			  }else return false;
			        			  }else return false;
			        		  }
			        	},
			        	title : getI18nText("view.manager.menu"),
						icon : "sap-icon://manager",
						press: function(){
								var app = sap.ui.getCore().byId(Common.App.Name);
								app.toDetail(Common.Navigations.MANAGER);
	        				
						},
			        }).addStyleClass("newTiles"),
			        new sap.m.StandardTile({
			        	visible: {
			        		parts: ["/configuracion/ACCESOS/LIST_AUT001/ICO_INF","/userInfo/Rol/results"],
			        		  formatter: function(acceso, roles){
			        			  if(acceso == "X") {
			        				  return true;
			        			  }else return false;
			        		  }
			        	},
			        	title : getI18nText("view.informes.title"),
						icon : "sap-icon://activity-items",
						press: function(){
								var app = sap.ui.getCore().byId(Common.App.Name);
								app.toDetail(Common.Navigations.INFORMES);
	        				
						},
			        }).addStyleClass("newTiles")
			        
			        ]
		});
		
		return oTileContainer;
	}

});