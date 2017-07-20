sap.ui.jsview("view.Informes", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Informes
	*/ 
	getControllerName : function() {
		return "view.Informes";
	},
	
	onBeforeShow : function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.INFORMES);
    	var oController = oView.getController();
	    	
    	
			
    	var lang = getAttributeValue("/language");
        sap.ui.getCore().getConfiguration().setLanguage(lang);
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Informes
	*/ 
	createContent : function(oController) {
		
		this.header = sap.ui.jsfragment("fragment.AppHeader", this.getController());
		var fn = this;
		var tiles = this.createTiles(oController);
		
 		return new sap.m.Page({
			customHeader: this.header,
			content: tiles
		});
	},
	
	createTiles : function(oController) {
				
		var container = new sap.m.TileContainer({
			tiles : [
			         new sap.m.StandardTile({
            			visible: {
            				path : "/configuracion/INFORMES/LIST_MAN001/LIS_PLU",
            				formatter: function(accesoPluses) {
            					
            					if (accesoPluses == "X" && (isResponsable() == true || isGerProd() == true)) {
            						return true;
            					} else return false;
            				}
            			},
			        	 title: "{I18N>view.pluses.tile}",
			        	 icon: "sap-icon://money-bills",
			        	 press: function(oEvt){
			        		 var app = sap.ui.getCore().byId(Common.App.Name);
			        		 app.toDetail(Common.Navigations.PLUSES);
			        	 }
			         }).addStyleClass("tilesInformes"),
			         new sap.m.StandardTile({
						visible: {
							path : "/configuracion/INFORMES/LIST_EMP001/LIS_BOLS_CAD",
							formatter: function(accesoPluses) {
            					
            					if (accesoPluses == "X" && isEmpleado() == true ) {
            						return true;
            					} else return false;
            				}
						},
						 title: "{I18N>view.bolsas.tile}",
						 icon: "sap-icon://time-overtime",
						 press: function(oEvt){
			        		 var app = sap.ui.getCore().byId(Common.App.Name);
			        		 app.toDetail(Common.Navigations.LIST_BOLSAS);
						 }
			         }).addStyleClass("tilesInformes")
			         
			         ]
		});
		
		return container;
	}

});