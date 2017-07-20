sap.ui.jsview("view.ListadoBolsasAntiguas", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.ListadoBolsasAntiguas
	*/ 
	getControllerName : function() {
		return "view.ListadoBolsasAntiguas";
	},
	
	onBeforeShow : function(oEvt) {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.LIST_BOLSAS);
    	var oController = oView.getController();
    	
    	oController.onBeforeShow();
		
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.ListadoBolsasAntiguas
	*/ 
	createContent : function(oController) {

		
    	
		var containerBolsa = new sap.m.ColumnListItem({
			visible: {
				parts: ["Ktart", "/constantesUser/results/0/Werks"],
				formatter: function(concepto, sociedad) {
					if(sociedad == "EU01" && concepto != "90" && concepto != "91" && concepto != "92" && concepto != "93" ) {
						return false;
					} else return true;
				}
			},
			cells: [
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
			        new sap.m.Text({text: "{Ktart}"}),
			        new sap.m.Text({text: {
	        				parts: ["Ktart", "/textosBolsas/results", "/constantesUser/results/0/Werks"],
	        				formatter: function(ktart, textos, sociedad) {
	        					if(ktart == "94" && sociedad == "EU01"){
	        						ktart = "90";
	        					}
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
			        new sap.m.Text({text: {
                        parts: ["Ktart", "Valor", "/bolsasAntiguas/results", "/constantesUser/results/0/Werks"],
                        formatter: function(ktart, valor, bolsas , sociedad) {
                        	var oContext = this.getBindingContext().getObject();
                        	if(bolsas && sociedad == "EU01" && ktart == "90") {
                        		
                        		for(var i = 0; i < bolsas.length; i++) {
                        			if( bolsas[i].Begda == oContext.Begda && bolsas[i].Endda == oContext.Endda 
                        					&& bolsas[i].Ktart == "94"){
                        				valor = parseFloat(valor) + parseFloat(bolsas[i].Valor);
                        			}
                        		}
                        	}
                        	return util.Formatter.compensacionesDecimals(valor);
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
			        ]
		})
		
		
		var oTable = new sap.m.Table({
			columns: [
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: "Fecha inicio"})
			          }),
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: "Fecha fin"})
			          }),
			          new sap.m.Column({
			        	  visible: false,
			        	  width: "20%",header: new sap.m.Text({text: "Contingente"})
			          }),
			          new sap.m.Column({
			        	  width: "20%",header: new sap.m.Text({text: "Tipo de compensacion"})
			          }),
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: {
			        		  	parts: ["/reglas/HORS_JOR", "I18N>common.unidades.horas", "I18N>common.unidades.jornadas"],
			        		  	formatter: function(regla, horas, jornadas){
									if (regla)
										return jornadas +" restantes";
								else return horas +" restantes";
								}}})
			          }),
			          new sap.m.Column({
			        	  width: "20%",
			        	  header: new sap.m.Text({text: "Cobrar"})
			          })
			          
			          ]
		}).bindItems("/bolsasAntiguas/results", containerBolsa).addStyleClass("tableConfiguracionBolsas "); // tableConfiguracionBolsas
		
		
		this.header = sap.ui.jsfragment("fragment.AppHeader", this.getController());
		this.subHeader = this.createSubHeader(oController);
		
		var mainPage = new sap.m.Page({
            showSubHeader: true,
            subHeader : this.subHeader,
            showHeader: true,
			customHeader: this.header,
            enableScrolling: true,
            content:  oTable
        });
		
		return mainPage;
	},
	
	createSubHeader : function(oController){
		    	
		var subheader = new sap.m.Bar({
			contentLeft: [
						new sap.m.Button({
							icon: "sap-icon://nav-back",
							press: oController.onNavBack
						}).addStyleClass("atrasButtonEmpleado"),
			              ]
		}).addStyleClass("appSubHeader appSubHeaderManager appSubHeaderPluses");
		
		
		return subheader;
	}

});