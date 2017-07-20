sap.ui.jsview("view.ConfigBolsas", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.ConfigBolsas
	*/ 
	getControllerName : function() {
		return "view.ConfigBolsas";
	},
	

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.ConfigBolsas
	*/ 
	createContent : function(oController) {
		
		var containerBolsa = new sap.m.ColumnListItem({
			visible: {
				parts: ["Ktart", "/constantesUser/results/0/Werks", "Begda"],
				formatter: function(concepto, sociedad, begda) {
					if(sociedad == "EU01" && ( concepto != "90" && concepto != "91" && concepto != "92" && concepto != "93" ) || begda == null) {
						return false;
					} else return true;
				}
			},
			cells: [
			        new sap.m.Text({text: "{Ktart}"}),
			        new sap.m.Text({text: {
        				parts: ["Ktart", "/textosBolsas/results", "/constantesUser/results/0/Werks"],
        				formatter: function(ktart, textos, sociedad) {
        					if(textos){
	        					for(var i = 0;i<textos.length;i++) {
	        						if(textos[i].KTART == ktart){
	        							return textos[i].KTEXT;
	        						}
	        					}
        					}
        				}
        				}
			        }),
			        new sap.m.CheckBox({
			        	selected: {
			        		path: "Cobrar",
			        		formatter: function(cobrar) {
			        			return cobrar == "X";
			        		}
			        	},
			        	select: oController.onSelectCheckBoxBolsa
			        }),
			        new sap.m.Text({
			        	text: {
			        		path: "Begda",
			        		formatter: function(fecha) {
			        			if(fecha) {
				        			fecha = parseInt(fecha.substring(6, 19));
	              					fecha = new Date(fecha);                 
	              					return util.Formatter.dateToString4(fecha);
			        			}
			        		}
			        	}
	        		}),
	        		new sap.m.Text({
			        	text: {
			        		path: "Endda",
			        		formatter: function(fecha) {
			        			if(fecha) {
				        			fecha = parseInt(fecha.substring(6, 19));
	              					fecha = new Date(fecha);
	              					return util.Formatter.dateToString4(fecha);
			        			}
			        		}
			        	}
	        		}),
			        ]
		})
		

		
		
		var oTable = new sap.m.Table({
			noDataText: "No hay bolsas creadas en este mes",
			headerText: "{I18N>common.periodoActualContab}",
			columns: [
			          new sap.m.Column({
			        	  width: "10%",
			        	  visible: false,
			        	  header: new sap.m.Text()
			        		  
			          .addStyleClass("titleTablaConfiguracionBolsa")
			          }),
			          new sap.m.Column({
			        	  width: "40%",
			        	  header: new sap.m.Text()
			          }),
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: "{I18N>conceptosHora.cobrar}"})
			          }),
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: "Fecha inicio"})
			          }),
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: "Fecha fin"})
			          }),
			          
			          ]
		}).bindItems("/bolsas/results", containerBolsa).addStyleClass("tableConfiguracionBolsas");
		
		var mainPage = new sap.m.Page({
            showSubHeader: false,
            showHeader: false,
            enableScrolling: false,
            content:  [oTable,
                       new sap.m.Text({
                    	   text: "{I18N>common.mensajes.cobrarBolsaActual}"
            		   }).addStyleClass("tableConfiguracionBolsas")
                       ]
        });
		
		return mainPage;
	}

});