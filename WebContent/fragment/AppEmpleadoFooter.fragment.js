/**
 * Footer con todos los botones de la vista de días de un empleado
 */
sap.ui.jsfragment("fragment.AppEmpleadoFooter", {
	createContent: function(oCon) {
		 
		var oView = oCon.getView();
		
		oView.aprobar = new sap.m.Button({
			text: "{I18N>footerActions.aprobarTodos}",
			icon: "sap-icon://accept", //accept
			press: function(){
				oCon.aprobarRechazarPartes(false, true);
				oView.diasTable.removeSelections(true);
			},
			enabled: true,
			
			layoutData: new sap.m.OverflowToolbarLayoutData({
							moveToOverflow :false,
							stayInOverflow : false,
							priority : sap.m.OverflowToolbarPriority.NeverOverflow,
							group : 0
						})
		}).addStyleClass("footerButtonEnviar");
		
		oView.rechazar = new sap.m.Button ({
			text: "{I18N>footerActions.rechazarTodos}",
			icon: "sap-icon://decline",
			enabled: true,
			press: function(oEvt){
				oCon.aprobarRechazarPartes(true, true);
				oView.diasTable.removeSelections(true);
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow :false,
				stayInOverflow : false,
				priority : sap.m.OverflowToolbarPriority.NeverOverflow,
				group : 0
			})
		}).addStyleClass("footerButtonBorrar");
		
		
		 oView.footerBar = new sap.m.OverflowToolbar({
			 active : false,
			 enabled : true,
			 visible: {
					path: "/userInfo/Rol/results",
					formatter: function(roles, directo){
						return isResponsable() == true;
					}
				},
			 design : sap.m.ToolbarDesign.Solid,
			 content : [
			            new sap.m.ToolbarSpacer,
			            oView.aprobar,
						oView.rechazar,
		            	]
            }).addStyleClass("appHeader appFooter");
	     return oView.footerBar;
	}
});