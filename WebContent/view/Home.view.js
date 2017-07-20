//DEV

jQuery.sap.require("sap.ui.unified.CalendarLegendItem");
jQuery.sap.require("sap.ui.unified.CalendarLegend");
jQuery.sap.require("util.Formatter");
sap.ui.jsview("view.Home", {

    selectedKey: "1",
    mode: Common.Constants.EDIT,

    /** Specifies the Controller belonging to this View. 
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf view.Home
     */
    getControllerName: function() {
        return "view.Home";
    },


    onBeforeShow: function(oEvt) {

    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
    	var oController = oView.getController();
    	oController.onBeforeShowCalls();
    	var lang = getAttributeValue("/language");
        sap.ui.getCore().getConfiguration().setLanguage(lang);
    	
    	/**
    	 * funcion que captura si se ha pulsado la tecla Escape y reacciona cerrando el dialogo y restaurando
    	 * los valores antiguos del concepto en caso de que se estuviera editando o eliminando el concepto si
    	 * se estaba creando uno nuevo.
    	 */
    	$(document).keyup(function(e) {
            if (e.keyCode == 27) {

                var oDialog;
                if (oView.conceptoHoraDialog) {
                	if (oView.conceptoHoraDialog.isOpen() == true) {
                        oDialog = oView.conceptoHoraDialog;
                    }
                }
                
                if (oView.conceptoDiaDialog) {
                	if (oView.conceptoDiaDialog.isOpen() == true) {
                        oDialog = oView.conceptoDiaDialog;
                    }
                }

                var modoDialogo = getAttributeValue("/modoDialogo");

                if (modoDialogo == "E") {

                    oController.closeAddItemDialog();
                    var oldData = oDialog.getCustomData()[0].getValue();
                    var path = oDialog.getBindingContext().getPath();
                    setAttributeValue(path, oldData);
                }
                if (modoDialogo == "C") {

                    if (oDialog.getBindingContext() != undefined) {
                        oController.removeListItemConcepto(oDialog.getBindingContext(),true);
                    }
                    oController.closeAddItemDialog();
                }

                sap.ui.getCore().getModel().updateBindings();
            }
        });
    	
    	
    	
				
			

    },
    
    onAfterRendering : function(oEvt){
    	
    	var barraCompensaciones = getAttributeValue("/configuracion/REPORTE/REP_COMPE001/COM_BAR");
		
		if(barraCompensaciones == "X"){
			$('#Home section')[0].style.top = '8rem';
		} else {
			$('#Home section')[0].style.top = 'initial';
		}
    	
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
     * Since the Controller is given to this method, its event handlers can be attached right away. 
     * @memberOf view.Home
     */
    createContent: function(oController) {


        var oView = this;

        this.calendarFrame = sap.ui.jsfragment("fragment.InputCalendar", oController);

        var contenidoDia = sap.ui.jsfragment("fragment.InfoDia", oController);

        this.footer = sap.ui.jsfragment("fragment.AppFooter", oController);
        this.layout = new sap.ui.layout.Grid({content: [this.calendarFrame,contenidoDia]}).addStyleClass("mainGridImputar");

        this.header = sap.ui.jsfragment("fragment.AppHeader", oController);
        this.subheader = sap.ui.jsfragment("fragment.Compensaciones", oController);
        
        this.conceptoHoraDialog = sap.ui.jsfragment("fragment.DialogoHora", oController);
        
        this.mainPage = new sap.m.Page({
            showSubHeader: true,
            subHeader: this.subheader,
            customHeader: this.header,
            content: this.layout,
            footer: this.footer
        });

        return this.mainPage;
    },



    /**
     * Funcion para la creacion del dialogo de enviar mes
     */
    createConfirmationMesDialog: function(oCon) {

    	var oView = this;

    	oView.confirmationMesDialog = new sap.m.Dialog({
            showHeader: true,
//            draggable: true,
            title: "{I18N>common.confirmar}",
            type: 'Message',
            content: new sap.m.Text({
                text: "{I18N>common.mensajes.enviarMes}"
            }),
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                    oCon.enviarMes(oEvt);
                    oView.confirmationMesDialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "{I18N>common.cancelar}",
                press: function() {
                	oView.confirmationMesDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },
    
    /**
     * Funcion para la creacion del dialogo de recortar turno normal
     * @param oCon Controlador
     */
    createTurnoNormalModificadoDialog: function(oCon) {

    	var oView = this;

    	oView.turnoNormalModificadoDialog = new sap.m.Dialog({
            showHeader: true,
//            draggable: true,
            title: "{I18N>common.confirmar}",
            type: 'Message',
            content: new sap.m.Text({
                text: "{I18N>common.mensajes.turnoNormalMod}"
            }),
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                	oView.turnoNormalModificadoDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },
    
    /**
     * Funcion que crea el dialogo de HA generado
     * @param oCon Controlador
     */
    createHAPRDialog: function(oCon) {

        var oView = this;

        oView.haprDialog = new sap.m.Dialog({
            showHeader: true,
//            draggable: true,
            title: "{I18N>common.confirmar}",
            type: 'Message',
            content: new sap.m.Text({
                text: "{I18N>conceptosHora.mensajes.hapr}"
            }),
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                	oView.haprDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },
    
    /**
     * Funcion que crea el dialogo de borrar dia
     * @param oCon Controlador
     */
    createConfirmationBorrarDialog: function(oCon) {

        var oView = this;

        oView.confirmationBorrarDialog = new sap.m.Dialog({
            showHeader: true,
//            draggable: true,
            title: "{I18N>common.confirmar}",
            type: 'Message',
            content: new sap.m.Text({
                text: "{I18N>common.mensajes.borrar}"
            }),
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                    oCon.borrarDia(oEvt);
                    oView.confirmationBorrarDialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "{I18N>common.cancelar}",
                press: function() {
                	oView.confirmationBorrarDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },
    
    /**
     * Funcion que crea el dialogo de ausencia registrada para dia
     * @param oCon Controlador
     */
    createAusenciaDialog: function(oCon) {

        var oView = this;
        oView.ausenciaDialog = new sap.m.Dialog({
            showHeader: true,
//            draggable: true,
            content: new sap.m.Text().bindText("/infoAusenciaReporte"),
            title: "{I18N>common.confirmar}",
            type: 'Message',
            beforeClose: function(oEvt) {
            	oView.ausenciaDialog.removeAllContent();
            },
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                	oView.ausenciaDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },
    
    /**
     * Funcion que crea el dialogo de edicion de kilometros para conceptos diarios en forma de matriz
     * @param oCon Controlador
     */
    createKmsDialog: function(oCon) {

        var oView = this;
        oView.kmsDialog = new sap.m.Dialog({
            showHeader: true,
            content: [new sap.m.Text({text: "{I18N>common.km"}),
                      new sap.m.HBox({
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
			        	 items: [new sap.m.VBox({
				        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosDia.valor}"}).addStyleClass("titlesDialogConceptos"),
										new sap.m.Input({
											enabled: false,
											value: "{Betdy}"
										})
					        	          
					        	          ]
					          }).addStyleClass("formDialogContainer"),
					          new sap.m.VBox({
					        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosDia.divisa}"}).addStyleClass("titlesDialogConceptos"),
										new sap.m.Input({
											enabled: false,
											maxLength: 3,
											value: "EUR"
										})
					        	          
					        	          ]
					          }).addStyleClass("formDialogContainer")] 
			          }),
			          
			          new sap.m.HBox({
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	 items: [new sap.m.VBox({
					        	  items: [
						        	        new sap.m.Title({text: "{I18N>conceptosDia.cantidad}"}).addStyleClass("titlesDialogConceptos"),
											new sap.m.Input({
												maxLength: 5,
												enabled: {
													parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
													formatter: util.Formatter.modificarOnStahd
												},
												type: sap.m.InputType.Number,
												value: "{Anzdy}"
											})
						        	          
						        	          ]
						          }).addStyleClass("formDialogContainer"),
						          new sap.m.VBox({
						        	  items: [
						        	        new sap.m.Title({text: ""}).addStyleClass("titlesDialogConceptos"),
						        	        new sap.m.Button({
//						        	        	text: "{I18N>conceptosDia.calcImporte}",
						        	        	text: (sap.ui.Device.system.phone == false)?"{I18N>conceptosDia.calcImporte}" : "{I18N>conceptosDia.calcImporteA}", 
			        	        	        		  
						        	        	icon: "sap-icon://measure",
												enabled: {
													parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
													formatter: util.Formatter.modificarOnStahd
												},
						        	        	press: function(oEvt){
						        	        		
						        	        		var data = oView.kmsDialog.getBindingContext();
						        	        		var cantidadValue = data.getObject().Anzdy;
						        	        		if(cantidadValue >0){
							        	        		oCon.getKmsDiariosMatriz(data);
						        	        		}
						        	        	}
						        	        }).addStyleClass("conceptoDiaBotonCalcular")
						        	          
						        	          ]
						          }).addStyleClass("formDialogContainer")] 
				          })
                      
                      
                      ],
            title: "{I18N>common.confirmar}",
            type: 'Message',
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                	oView.kmsDialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "{I18N>common.cancelar}",
                press: function() {
                	oView.kmsDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },
    
    
    /**
     * Funcion que crea el dialogo de ausencia registrada para dia
     * @param oCon Controlador
     */
    createCambioCentroDialog: function(oCon) {

        var oView = this;
        oView.cambioCentroDialog = new sap.m.Dialog({
            showHeader: true,
            content: new sap.m.Text({
                text: "{I18N>common.mensajes.cambioCentro}"
            }),
            title: "{I18N>common.confirmar}",
            type: 'Message',
            beginButton: new sap.m.Button({
                text: "{I18N>common.aceptar}",
                press: function(oEvt) {
                    oCon.borrarParte(oEvt);
                    oView.cambioCentroDialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "{I18N>common.cancelar}",
                press: function() {
                	oView.cambioCentroDialog.close();
                }
            }),
            beforeOpen: function(){
            	if(window.pageYOffset > 0) {
         		   this.addStyleClass("moveCustomDialog")
         	   }else this.removeStyleClass("moveCustomDialog")
            }
        }).addStyleClass("customDialog");

    },



});