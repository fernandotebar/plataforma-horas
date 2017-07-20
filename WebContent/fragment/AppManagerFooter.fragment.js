
/**
 * Barra inferior de la vista del manager
 */
sap.ui.jsfragment("fragment.AppManagerFooter", {
	createContent: function(oCon) {
		 
		var oView = oCon.getView();
		
		
		/*
		 * Boton para aprobar todos los usuarios seleccionados en la tabla
		 */
		oView.aprobarTodos = new sap.m.Button({
			text: "{I18N>footerActions.aprobarTodos}",
			icon: "sap-icon://shortcut", //accept
			press: function(){
				oCon.aprobarRechazarPersonas(false);
			},
//			enabled: {
//				path: "/periodoManager/results",
//				formatter: function(periodo){
//					var fechaMaxAprobacion = getConstante("FIN_APRO");
//					return util.Formatter.getEnabledFromConstante(fechaMaxAprobacion);
//				}	
//			},
			visible: {
				path: "/userInfo/Rol/results",
				formatter: isResponsable
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
							moveToOverflow :false,
							stayInOverflow : false,
							priority : sap.m.OverflowToolbarPriority.NeverOverflow,
							group : 0
						})
		}).addStyleClass("footerButtonEnviar");
		
		/*
		 * Botón para rechazar todos los usuarios seleccionados en la tabla
		 */
		oView.rechazarTodos = new sap.m.Button ({
			text: "{I18N>footerActions.rechazarTodos}",
			icon: "sap-icon://delete",
			press: function(oEvt){
				oCon.aprobarRechazarPersonas(true)
			},
			visible: {
				path: "/userInfo/Rol/results",
				formatter: isResponsable
			},
//			enabled: {
//				path: "/periodoManager/results",
//				formatter: function(periodo){
//					var fechaMaxAprobacion = getConstante("FIN_APRO");
//					return util.Formatter.getEnabledFromConstante(fechaMaxAprobacion);
//				}	
//			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow :false,
				stayInOverflow : false,
				priority : sap.m.OverflowToolbarPriority.NeverOverflow,
				group : 0
			})
		}).addStyleClass("footerButtonBorrar");
		
		/*
		 * Boton para informar a los gerentes de todos los usuarios seleccionados en la tabla
		 */
		oView.informarGerente = new sap.m.Button({
			text: "{I18N>footerActions.informarGerente}",
			icon: "sap-icon://shortcut", //accept
			press: function(){
				oCon.informarGerente(false)
			},
			enabled: true,
			visible: {
				parts : ["/responsableEdita", "/configuracion/MANAGER/MAN_G_ACT001/BAR_INFG"],
				formatter: function(responsable, acceso){
					if(responsable == true && acceso == "X"){
						return true;
					} else return false;
				}
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
							moveToOverflow :true,
							stayInOverflow : false,
							priority : sap.m.OverflowToolbarPriority.Low,
							group : 0
						})
		}).addStyleClass("footerButtonEnviar");
		
		/*
		 * Boton para informar a los responsables de todos los usuarios seleccionados en la tabla
		 */
		oView.informarResponsable = new sap.m.Button({
			text: "{I18N>footerActions.informarResponsable}",
			icon: "sap-icon://shortcut", //accept
			press: function(){
				oCon.informarResponsable(false)
			},
			enabled: true,
			visible: {
				parts : ["/gerenteEdita", "/configuracion/MANAGER/MAN_G_ACT001/BAR_INFR"],
				formatter: function(gerente, acceso){
					if(gerente == true && acceso == "X"){
						return true;
					} else return false;
				}
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
							moveToOverflow :true,
							stayInOverflow : false,
							priority : sap.m.OverflowToolbarPriority.Low,
							group : 0
						})
		}).addStyleClass("footerButtonEnviar");
		
		
		 oView.footerBar = new sap.m.OverflowToolbar({
			 active : false,
			 enabled : true,
			 design : sap.m.ToolbarDesign.Solid,
			 content : [
			            oView.informarGerente,
			            oView.informarResponsable,
			            new sap.m.ToolbarSpacer,
			            oView.aprobarTodos,
						oView.rechazarTodos,
						
		            	
		            	
		            	
		            	]
            }).addStyleClass("appHeader appFooter");
	     return oView.footerBar;
	}
});