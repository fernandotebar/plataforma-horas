/**
 * Footer con todos los botones de la vista de reporte de horas
 */
sap.ui.jsfragment("fragment.AppFooter", {
	createContent: function(oCon) {
		 
		var oView = oCon.getView();
		
		/*
		 * Boton para enviar el dia seleccionado en el calendario
		 */
		oView.enviarDia = new sap.m.Button({
			text: "{I18N>footerActions.enviarDia}",
			icon: "sap-icon://shortcut", 
			press: function(){oCon.enviarDia("E")},
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo", "/fueraDePlazoPasado"],
				formatter: function(status, fuera, fueraPasado){
				
					if(status == "E" ||status == "A" || status == "C" || status == "M" ||status == "N"){
						return false;
					}else if (fuera == true) {
						return false;
					}
					return true;
				}
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
							moveToOverflow :false,
							stayInOverflow : false,
							priority : sap.m.OverflowToolbarPriority.NeverOverflow,
							group : 0
			})
		});
		
		/*
		 * Boton para borrar los conceptos y observaciones del parte del dia seleccionado en el calendario
		 */
		oView.borrarDia = new sap.m.Button ({
			text: "{I18N>footerActions.borrarDia}",
			icon: "sap-icon://delete",
			press: function(oEvt){
				var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
				
				if(status != "E" && status != "M" && status != "A" && status != "C" && status != "N"){
					oCon.openConfirmationBorrarDialog();
				} else {
				sap.m.MessageToast.show(getI18nText("common.mensajes.borrarDiaEnviado"));
			}
				
			},
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"],
				formatter: function(status, fuera){
				
					if(status == "E" ||status == "A" || status == "C" || status == "M" ||status == "N"){
						return false;
					}else if (fuera == false )  { //|| (isGerProd() == true || isResponsable() == true)
						return true;
					}
					return false;
				}
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow :true,
				stayInOverflow : false,
				priority : sap.m.OverflowToolbarPriority.Low,
				group : 0
			})
		});
		
		/*
		 * Boton para desmarcar la funcion de pegar dia
		 */
		oView.quitarCopiarDia = new sap.m.Button({
			visible: "{/copiando}",
			icon: "sap-icon://sys-cancel",
			press: oCon.quitarCopiarDia
		});
		
		/*
		 * Boton para copiar los conceptos y las observaciones del parte del dia actual
		 */
		oView.copiarDia = new sap.m.ToggleButton ({
			text: "{I18N>footerActions.copiarDia}",
			icon: "sap-icon://save",
			press: oCon.copiarDia,
			enabled: true,
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow :true,
				stayInOverflow : false,
				priority : sap.m.OverflowToolbarPriority.Low,
				group : 1
			})
		});
		
		/*
		 * Boton para guardar el borrador del dia seleccionado en ell calendario
		 */
		oView.guardarBorrador = new sap.m.Button ({
			icon: "sap-icon://activate",
			text: "{I18N>footerActions.guardarBorrador}",
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"],
				formatter: function(status, fuera){
					if(status == "E" ||status == "A" || status == "C" || status == "M" ||status == "N"){
						return false;
					}else if (fuera == false)  {
						return true;
					}
					return false;
				}
			},
			press: function(){oCon.enviarDia("B", false)},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow :false,
				stayInOverflow : false,
				priority : sap.m.OverflowToolbarPriority.NeverOverflow,
				group : 0
			})
		});
		
		/*
		 * Boton para enviar el periodo actual
		 */
		oView.enviarMes = new sap.m.Button ({
			icon: "sap-icon://example",
			text: "{I18N>footerActions.enviarMes}",
			visible: {
				path : "/configuracion/REPORTE/REP_ACTIO001/BAR_EMES",
				formatter: util.Formatter.reactOnConfig
			},
			enabled: {
        		path: "/calendario/results",
        		formatter: function(calendario){
        			var todosEnviados = true;
        			var result = false;
        			if(calendario != undefined){
        			
	        			for(var i=0;i< calendario.length;i++){
	        				var date = util.Formatter.stringToDate(calendario[i].ZhrDatum);
	        				var hoy = new Date();
	        				hoy.setHours(0,0,0,0);
	        				if(calendario[i].Status_parte != "E" && calendario[i].Status_parte != "C" && calendario[i].Status_parte != "A" && calendario[i].Status_parte != "N" && calendario[i].Status_parte != "M"){
	        					todosEnviados = false
	        				}
	        				if(date.getTime() == hoy.getTime())
	        					result = true;
	        			}
	        			return result == true && todosEnviados == false;
        			}
        		}
        	},
			press: function(oEvt){
				oCon.openConfirmationMesDialog();
			},
			layoutData: new sap.m.OverflowToolbarLayoutData({
				moveToOverflow :true,
				stayInOverflow : false,
				priority : sap.m.OverflowToolbarPriority.Low,
				group : 1
			})
		});

		 oView.footerBar = new sap.m.OverflowToolbar({
			 active : false,
			 enabled : true,
			 design : sap.m.ToolbarDesign.Solid,
			 content : [
			            oView.enviarMes,
			            new sap.m.ToolbarSpacer,
						oView.enviarDia,
						oView.copiarDia,
						oView.quitarCopiarDia,
						oView.borrarDia,
						oView.guardarBorrador,
		            	]
            }).addStyleClass("appHeader appFooter");
	     return oView.footerBar;
	}
});