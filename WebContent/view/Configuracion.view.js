sap.ui.jsview("view.Configuracion", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Configuracion
	*/ 
	getControllerName : function() {
		return "view.Configuracion";
	},
	
	onBeforeShow: function(oEvt){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.CONFIG);
    	var oController = oView.getController();
    	
    	oController.onBeforeShow();
		
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Configuracion
	*/ 
	createContent : function(oController) {

		this.header = sap.ui.jsfragment("fragment.AppHeader", oController);
		
		var checkBolsasContainer;
		
		var configuracionTurno = sap.ui.jsview(Common.Navigations.TURNO, "view.ConfigTurno"); // Turno
		var configuracionBolsasActuales = sap.ui.jsview(Common.Navigations.BOLSAS, "view.ConfigBolsas"); // Bolsas actuales
		
		var tabbarConceptos= new sap.m.IconTabBar({
			expandable: false,
			items:[
			       
					new sap.m.IconTabFilter({
						visible: {
							path : "/configuracion/ACCESOS/CON_AUT002/MENU_TURN",
							formatter: util.Formatter.reactOnConfig
						},
						key: "1",
					   text: "Modificar turno",
					   content: configuracionTurno
					}),
			       new sap.m.IconTabFilter({
						visible: {
							path : "/configuracion/ACCESOS/CON_AUT002/MENU_BOLS",
							formatter: util.Formatter.reactOnConfig
						},
			    	   key: "2",
			    	   text: "Monetizar horas",
			    	   content: configuracionBolsasActuales
			       })
			       ]
		}).addStyleClass("iconTabConceptos ");
		
		this.mainPage = new sap.m.Page({
            showSubHeader: false,
            customHeader: this.header,
            content: tabbarConceptos,
            footer: this.footer
        });

        return this.mainPage;
	},
	

});