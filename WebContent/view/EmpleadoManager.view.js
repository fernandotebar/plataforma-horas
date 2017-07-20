sap.ui.jsview("view.EmpleadoManager", {

    selectedKey: "1",

    /** Specifies the Controller belonging to this View. 
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf view.EmpleadoManager
     */
    getControllerName: function() {
        return "view.EmpleadoManager";
    },

    onBeforeFirstShow: function(oEvt) {
        var oController = this.getController();
        oController.getColumnas();
    },

    onBeforeShow: function(oEvt) {

    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
    	var oController = oView.getController();
    	var oViewEmpleado = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
    	var oControllerEmpleado = oViewEmpleado.getController();
    	oControllerEmpleado.onBeforeShowCalls();
    	
    	
    	/**
    	 * funcion que captura si se ha pulsado la tecla Escape y reacciona cerrando el dialogo y restaurando
    	 * los valores antiguos del concepto en caso de que se estuviera editando o eliminando el concepto si
    	 * se estaba creando uno nuevo.
    	 */
    	$(document).keyup(function(e) {
            if (e.keyCode == 27) {

                var oDialog;
                if(oView.conceptoHoraDialog)
	                if (oView.conceptoHoraDialog.isOpen() == true) {
	                    oDialog = oView.conceptoHoraDialog;
	                }
                if(oView.conceptoDiaDialog)
	                if (oView.conceptoDiaDialog.isOpen() == true) {
	                    oDialog = oView.conceptoDiaDialog;
	                }

                var modoDialogo = getAttributeValue("/modoDialogo");

                if (modoDialogo == "E") {

                    oController.closeAddItemDialog();
                    var oldData = oDialog.getCustomData()[0].getValue();
                    var path = oDialog.getBindingContext().getPath();
                    sap.ui.getCore().getModel().setProperty(path, oldData);
                }
                if (modoDialogo == "C") {

                    if (oDialog.getBindingContext() != undefined) {
                        oController.removeListItemConcepto(oDialog.getBindingContext());
                    }
                    oController.closeAddItemDialog();
                }

                sap.ui.getCore().getModel().updateBindings();
            }
        });
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
     * Since the Controller is given to this method, its event handlers can be attached right away. 
     * @memberOf view.EmpleadoManager
     */
    createContent: function(oController) {

        this.createDiasTable(oController);
        this.header = sap.ui.jsfragment("fragment.AppHeader", oController);
        this.subheader = sap.ui.jsfragment("fragment.FiltrosEmpleado", oController);
        this.footer = sap.ui.jsfragment("fragment.AppEmpleadoFooter", oController);
        this.createDayDialog(oController);

        return new sap.m.Page({
            showSubHeader: true,
            customHeader: this.header,
            footer: this.footer,
            subHeader: this.subheader,
            content: [this.toolbar, this.diasTable]
        });
    },

    /**
     * Funcion que crea el dialogo de visualizacion del parte
     * @param oController
     */
    createDayDialog: function(oController) {

        var oView = this
        var home = sap.ui.getCore().byId(Common.Navigations.HOME);
        var homeController = home.getController();

        oView.dayDialog = new sap.m.Dialog({
        	showHeader: false,
         content: new sap.ui.jsfragment("fragment.InfoDia", homeController),
            buttons: [
                new sap.m.Button({
        			visible: {
        				path : "/configuracion/MANAGER/MAN_R_ACT001/BAR_UNDDO",
        				formatter: util.Formatter.reactOnConfig
        			},
                    text: "{I18N>common.deshacer}",
                    enabled: {
                        parts: ["/informacionDia/detalleparte/results/0/Stahd", "/responsableEdita", "/fueraDePlazoAprobacion"],
                        formatter: function(estado, responsable, fueraPlazo) {

                            if ((estado == "A" || estado == "N") && responsable == true && fueraPlazo == false) {
                                this.setVisible(true);
                                return true;
                            } else {
                                this.setVisible(false);
                                return false;
                            }
                        }
                    },
                    
                    press: function(oEvt) {
                        oController.deshacerDia();
                        oView.dayDialog.close();
                    }
                }),
                new sap.m.Button({
                    text: "{I18N>common.aprobar}",
                    visible: {
                        parts: ["/informacionDia/detalleparte/results/0/Stahd", "/manager/empleadoSelected/DIRECTO", "/responsableEdita"],
                        formatter: util.Formatter.aprobarRechazar
                    },
                    enabled: {
                        parts: ["/informacionDia/detalleparte/results/0/Stahd", "/manager/empleadoSelected/DIRECTO", "/responsableEdita"],
                        formatter: util.Formatter.aprobarRechazar
                    },
                    press: function(oEvt) {
                        oController.enviarDia(true);
                        oView.dayDialog.close();
                    }
                }),
                new sap.m.Button({
                    text: "{I18N>common.rechazar}",
                    visible: {
                        parts: ["/informacionDia/detalleparte/results/0/Stahd", "/manager/empleadoSelected/DIRECTO", "/responsableEdita"],
                        formatter: util.Formatter.aprobarRechazar
                    },
                    enabled: {
                        parts: ["/informacionDia/detalleparte/results/0/Stahd", "/manager/empleadoSelected/DIRECTO", "/responsableEdita"],
                        formatter: util.Formatter.aprobarRechazar
                    },
                    press: function() {
                    	oController.aprobarRechazarPartes(true,false);
                        oView.dayDialog.close();
                    }
                }),
                new sap.m.Button({
                    text: "{I18N>common.guardar}",
        			visible: {
        				path : "/configuracion/MANAGER/MAN_R_ACT001/BAR_SAVE",
        				formatter: util.Formatter.reactOnConfig
        			},
                    enabled: {
                        parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita", "/responsableEdita"],
                        formatter: util.Formatter.modificarOnStahd
                    },
                    press: function() {
                        oController.enviarDia();
                        oView.dayDialog.close();
                    }
                }),
                new sap.m.Button({
                    text: "{I18N>common.salir}",
                    press: function() {
                        oView.dayDialog.close();

                    }
                })
            ],
           beforeOpen: function(){
        	   
        	   if(window.pageYOffset > 0) {
        		   this.addStyleClass("moveCustomDialog")
        	   }else this.removeStyleClass("moveCustomDialog")
           }
        }).addStyleClass("customDialog");


    },

    
    /**
     * Funcion para crear la tabla de los dias
     * @param oController
     */
    createDiasTable: function(oController) {

        var oView = this;
        
        
        oView.toolbar = new sap.m.Toolbar({
            layoutData: new sap.ui.layout.GridData({
                span: "L12 M12 S12"
            }),
            content: [new sap.m.Title({
			          		text: {
			          			path: "/periodoManager/results",
			          			formatter : function(periodo) {                      				
			          				if(periodo != undefined) {
			          					
			          					var fechaIni = periodo[0].ZhrDatum;
			          					var fechaFin = periodo[periodo.length-1].ZhrDatum;
			          					
			          					fechaIni = util.Formatter.stringToDate(fechaIni);
			          					fechaFin = util.Formatter.stringToDate(fechaFin);
			          					return util.Formatter.dateToString4(fechaIni) +" - "+util.Formatter.dateToString4(fechaFin);
			          				}
			          				
			          			}
			          		}
			          	}).addStyleClass("titleOptionsToolbarCustomTable"),
	                    new sap.m.ToolbarSpacer(),                    
	                    new sap.m.Button({
	                        icon: "sap-icon://navigation-left-arrow",
	                        press: function(oEvt){
	                        	
	                        	var leftPos2 = $('#empleadosTable').scrollLeft();
	                            $('#empleadosTable').animate({scrollLeft: leftPos2 - 250}, 400);
	                        	 
	                        }
	                    }),
	                    new sap.m.Button({
	                        icon: "sap-icon://navigation-right-arrow",
	                        press: function(oEvt){
	
	                        	var leftPos = $('#empleadosTable').scrollLeft();
	                            $("#empleadosTable").animate({scrollLeft: leftPos + 250}, 400);
	                        }
	                    }),
	                    new sap.m.Button({
	            			visible: {
	            				path : "/configuracion/MANAGER/MAN_D_CON001/CONFI_COL",
	            				formatter: util.Formatter.reactOnConfig
	            			},
	                        icon: "sap-icon://action-settings",
	                        press: oController.openTableSettingsDialog
	                    })
	                ]
          }).addStyleClass("optionsToolbarCustomTable");

        var oTemplate = new sap.m.ColumnListItem({
            type: sap.m.ListType.Active,
            press: oController.onPressItem,
            cells: [
                new sap.m.Text({
                    visible: true,
                    text: {
                        path: "FECHA", 
                        formatter: util.Formatter.abapDatetoShow3
                    }
                }),
//                Turno teorico
                new sap.m.VBox({
                	items: [
							new sap.m.Text({
							    text: {
							        parts: ["FECHA", "/manager/turnoEmpleadoSelected/results/0"],
							        formatter: oController.getHorarioEnDiaSemanaInicio
							    }
							}).addStyleClass("horarioTeoricoEmpleado"),
							new sap.m.Text({
							    text: {
							        parts: ["FECHA", "/manager/turnoEmpleadoSelected/results/0"],
							        formatter: oController.getHorarioEnDiaSemanaFin
							    }
							}).addStyleClass("horarioTeoricoEmpleado"),
                	        
                	        ]
                }),
                // Horario dingo
                new sap.m.VBox({
                	items: [
//							new sap.m.Text({
//							    visible: true,
//							    text: {
//							        parts: ["FECHA", "/manager/turnoEmpleadoSelected"],
//							        formatter: oController.getHorarioEnDiaSemanaInicio
//							    }
//							}).addStyleClass("horarioTeoricoEmpleado"),
//							new sap.m.Text({
//							    visible: true,
//							    text: {
//							        parts: ["FECHA", "/manager/turnoEmpleadoSelected"],
//							        formatter: oController.getHorarioEnDiaSemanaFin
//							    }
//							}).addStyleClass("horarioTeoricoEmpleado"),
                	        
                	        ]
                }),  
                new sap.m.Text({
                    visible: {
	            		path : "/columnasEmpleado/Stahd",
	            		formatter: util.Formatter.reactOnConfig
	            	},
                    text: {
                        parts: ["STAHD", "/estadosParte/results"],
                        formatter: function(codigo, conceptos) {
                            // Descomentar cuando recuperemos bien los conceptos horarios
                            for (var i = 0; i < conceptos.length; i++) {
                                if (codigo == conceptos[i].DOMVALUE_L) {
                                    this.setTooltip(conceptos[i].DDTEXT);
                                    return conceptos[i].DDTEXT;
                                }
                            }
                        }
                    }
                }),
                new sap.m.Text({
                    visible: {
	            		path : "/columnasEmpleado/Cumul",
	            		formatter: util.Formatter.reactOnConfig
	            	},
                    text: {
                        path: "CUMUL",
                        formatter: util.Formatter.compensacionesDecimals
                    }
                }),
                new sap.m.HBox({
                    visible: {
	            		path : "/columnasEmpleado/Gencomp90",
	            		formatter: util.Formatter.reactOnConfig
	            	},
                    items: [
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp90", "/configuracion/MANAGER/MAN_D_HEXT/COL_HE_G"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "GENE90",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),

                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp90", "/configuracion/MANAGER/MAN_D_HEXT/COL_HE_C"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "COMP90",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                new sap.m.HBox({
                    visible: {
	            		path : "/columnasEmpleado/Gencomp91",
	            		formatter: util.Formatter.reactOnConfig
	            	},
                    items: [
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp91", "/configuracion/MANAGER/MAN_D_JEXT/COL_JE_G"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "GENE91",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp91", "/configuracion/MANAGER/MAN_D_JEXT/COL_JE_C"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "COMP91",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                new sap.m.HBox({
                    visible: {
	            		path : "/columnasEmpleado/Gencomp92",
	            		formatter: util.Formatter.reactOnConfig
	            	},
                    items: [
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp92", "/configuracion/MANAGER/MAN_D_FTRA/COL_FT_G"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "GENE92",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp92", "/configuracion/MANAGER/MAN_D_FTRA/COL_FT_C"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "COMP92",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                new sap.m.HBox({
                    visible: {
	            		path : "/columnasEmpleado/Gencomp93",
	            		formatter: util.Formatter.reactOnConfig
	            	},
                    items: [
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp93", "/configuracion/MANAGER/MAN_D_FSPC/COL_FS_G"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "GENE93",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Gencomp93", "/configuracion/MANAGER/MAN_D_FSPC/COL_FS_C"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "COMP93",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                /*
                 * NUEVAS LIST ITEMS
                 */
                new sap.m.HBox({
                    items: [
						new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/COND_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_COM"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
						    text: {
						        path: "COND_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/COND_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_REA"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
						    text: {
						        path: "COND_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/COND_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_JOR"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
						    text: {
						        path: "COND_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/DIRE_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_COM"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "DIRE_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/DIRE_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_REA"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "DIRE_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/DIRE_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_JOR"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "DIRE_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/MONT_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_JOR"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "MONT_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/MONT_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_REA"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "MONT_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/MONT_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_JOR"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "MONT_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/REGU_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_COM"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NAVE_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/REGU_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_REA"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NAVE_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/REGU_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_JOR"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NAVE_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/VIAJ_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_COM"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "VIAJ_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/VIAJ_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_REA"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "VIAJ_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/VIAJ_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_JOR"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "VIAJ_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/TOTA_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_COM"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "TOTA_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/TOTA_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_REA"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "TOTA_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
        	            		parts : [ "/columnasEmpleado/TOTA_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_JOR"],
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "TOTA_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
                            
                            
                            ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                /*
                 * NUEVAS LIST ITEMS
                 */
                new sap.m.HBox({
                    items: [
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Km", "/configuracion/MANAGER/MAN_D_ACU001/COL_KM"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "KM",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Dietas", "/configuracion/MANAGER/MAN_D_ACU001/COL_DIET"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "DIETAS",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Comida", "/configuracion/MANAGER/MAN_D_ACU001/COL_COMI"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "COMIDA",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Viaje", "/configuracion/MANAGER/MAN_D_ACU001/COL_VIAJE"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "VIAJE",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Finde", "/configuracion/MANAGER/MAN_D_ACU001/COL_PLWE"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "FINDE",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Hacom", "/configuracion/MANAGER/MAN_D_ACU001/COL_HOCO"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "HACOM",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Jext", "/configuracion/MANAGER/MAN_D_ACU001/COL_IMJE"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "JEXT",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Ftra", "/configuracion/MANAGER/MAN_D_ACU001/COL_IMFT"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text:{
                                path: "FTRA",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Fspc", "/configuracion/MANAGER/MAN_D_ACU001/COL_IMFS"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "FSPC",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                        	visible: {
        	            		parts : [ "/columnasEmpleado/Jevia", "/configuracion/MANAGER/MAN_D_ACU001/COL_JEVI"],
        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
        	            	},
                            text: {
                                path: "JEVIA",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
						    visible: {
						    	parts : [ "/columnasEmpleado/PLUS_COND", "/configuracion/MANAGER/MAN_D_ACU001/COL_PLUS_CON"],
								formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
							},
						    text: {
						        path: "PLUS_COND",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),


            ]
        }).attachBrowserEvent("mouseover", oController.reactToHoverItem).addStyleClass("itemParteEmpleado")

        this.diasTable = new sap.m.Table("empleadosTable",{
        	visible: {
        		path: "/columnasEmpleado/Pernr",
        		formatter: function (pernr) {
        			if(pernr == "00000000"){
        				return false;
        			}else return true;
        		}
        	},
            mode: {
                parts: ["/responsableEdita", "/gerenteEdita"],
                formatter: function(responsable, gerente) {
                    if (responsable == true) {
                        return sap.m.ListMode.MultiSelect;
                    } else if (gerente == true) {
                        return sap.m.ListMode.None;
                    } else return sap.m.ListMode.None;

                }

            },
            selectionChange: oController.onSelectParte,
            layoutData: new sap.ui.layout.GridData({
                span: "L12 M12 S12"
            }),
            columns: [
                new sap.m.Column({
//                    width: "10%",
                    hAlign: sap.ui.core.TextAlign.Center,
                    header: new sap.m.Text({
                        text: "{I18N>common.fecha}"
                    }).addStyleClass("headerTitleEmpleadoTabla")
                }),
                new sap.m.Column({
//                	visible: false,
//                  width: "10%",
               	 visible: {
	            		parts : ["/columnasEmpleado/HorTeor","/configuracion/MANAGER/MAN_D_GEN001/COL_HOR_TEOR"],
	            		formatter: function(valor, acceso){
	            			if(valor == "X" && acceso == "X")
	            				return true;
          				else return false;
      				}
	            	},
                  hAlign: sap.ui.core.TextAlign.Center,
                  header: new sap.m.Text({
                      text: "{I18N>empleado.horarioTeorico}"
                  }).addStyleClass("headerTitleEmpleadoTabla")
              }),
              new sap.m.Column({
//                width: "10%",
             	 visible: {
	            		parts : ["/columnasEmpleado/HorDingo","/configuracion/MANAGER/MAN_D_GEN001/COL_HOR_DING"],
	            		formatter: function(valor, acceso){
	            			if(valor == "X" && acceso == "X")
	            				return true;
        				else return false;
    				}
	            	},
                hAlign: sap.ui.core.TextAlign.Center,
                header: new sap.m.Text({
                    text: "{I18N>empleado.horarioDingo}"
                }).addStyleClass("headerTitleEmpleadoTabla")
            }),
                new sap.m.Column({
//                    width: "15%",
                    visible: {
	            		path : "/columnasEmpleado/Stahd",
	            		formatter: function(valor){
	            			if(valor == "X")
	            				return true
            				else return false
        				}
	            	},
                    hAlign: sap.ui.core.TextAlign.Center,
                    //			        	  width: "10%",
                    header: new sap.m.Text({
                        text: "{I18N>parte.estadoParte}"
                    }).addStyleClass("headerTitleEmpleadoTabla")
                }),
                new sap.m.Column({
                	 visible: {
 	            		parts : ["/columnasEmpleado/Cumul","/configuracion/MANAGER/MAN_D_ACU001/COL_CUMUL"],
 	            		formatter: function(valor, acceso){
 	            			if(valor == "X" && acceso == "X")
 	            				return true;
             				else return false;
         				}
 	            	},
                    hAlign: sap.ui.core.TextAlign.Center,
                    //			        	  width: "10%",
                    header: new sap.m.Text({
                        text: {
                        	parts: ["/reglas/HORS_JOR", "I18N>common.unidades.horas", "I18N>common.unidades.jornadas", "I18N>manager.totalPorDia"],
                        	formatter: function(regla, horas, jornadas,  trabajadas){
                        		if (regla)
            						return jornadas +" " + trabajadas;
            					else return horas +" " + trabajadas ;
                        	}
                        }
                    }).addStyleClass("headerTitleEmpleadoTabla")
                }),
                new sap.m.Column({
        			visible: {
        				parts : ["/columnasEmpleado/Gencomp90","/configuracion/MANAGER/MAN_D_HEXT/COL_HE_G","/configuracion/MANAGER/MAN_D_HEXT/COL_HE_C"],
        				formatter : function(valor, acceso, acceso2){
	            			if(valor == "X" && ( acceso == "X" || acceso2 == "X"))
	            				return true;
            				else return false;
        				}
        			},
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({ text: "{I18N>common.tipoJornada.prolongacion}" }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_HEXT/COL_HE_G",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.generadasA}"
                                    }),
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_HEXT/COL_HE_C",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.compensadasA}"
                                    })
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")

                        ]
                    })
                }),
                new sap.m.Column({
        			visible: {
        				parts : ["/columnasEmpleado/Gencomp91","/configuracion/MANAGER/MAN_D_JEXT/COL_JE_G","/configuracion/MANAGER/MAN_D_JEXT/COL_JE_C"],
        				formatter : function(valor,acceso,acceso2){
        					if(valor == "X" && ( acceso == "X" || acceso2 == "X"))
	            				return true;
            				else return false;
        				}
        			},
//			        width: "10%",
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: "{I18N>common.tipoJornada.extra}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_JEXT/COL_JE_G",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.generadasA}"
                                    }),
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_JEXT/COL_JE_C",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: getI18nText("compensaciones.compensadasA")
                                    })
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")

                        ]
                    })
                }),
                new sap.m.Column({
        			visible: {
        				parts : ["/columnasEmpleado/Gencomp92","/configuracion/MANAGER/MAN_D_FTRA/COL_FT_G","/configuracion/MANAGER/MAN_D_FTRA/COL_FT_C"],
        				formatter : function(valor,acceso,acceso2){
        					if(valor == "X" && ( acceso == "X" || acceso2 == "X"))
	            				return true;
            				else return false;
        				}
        			},
                    //			        	  width: "10%",
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: "{I18N>common.tipoJornada.festivo}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_FTRA/COL_FT_G",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.generadasA}"
                                    }),
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_FTRA/COL_FT_C",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.compensadasA}"
                                    })
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")

                        ]
                    })
                }),
                new sap.m.Column({
        			visible: {
        				parts : ["/columnasEmpleado/Gencomp93","/configuracion/MANAGER/MAN_D_FSPC/COL_FS_G","/configuracion/MANAGER/MAN_D_FSPC/COL_FS_C"],
        				formatter : function(valor,acceso,acceso2){
        					if(valor == "X" && ( acceso == "X" || acceso2 == "X"))
	            				return true;
            				else return false;
        				}
        			},
                    //			        	  width: "10%",
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: "{I18N>common.tipoJornada.especial}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_FSPC/COL_FS_G",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.generadasA}"
                                    }),
                                    new sap.m.Text({
        		            			visible: {
        		            				path : "/configuracion/MANAGER/MAN_D_FSPC/COL_FS_C",
        		            				formatter : util.Formatter.reactOnConfig
        		            			},
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.compensadasA}"
                                    })
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")

                        ]
                    })
                }),
                /**
                 * NUEVO
                 */
                
                new sap.m.Column({
                	visible: {
                        parts: ["/columnasEmpleado/COND_COMP", "/columnasEmpleado/COND_REAL","/columnasEmpleado/COND_JORN",
                                "/columnasEmpleado/DIRE_COMP", "/columnasEmpleado/DIRE_REAL","/columnasEmpleado/DIRE_JORN",
                                "/columnasEmpleado/MONT_COMP", "/columnasEmpleado/MONT_REAL","/columnasEmpleado/MONT_JORN",
                                "/columnasEmpleado/REGU_COMP", "/columnasEmpleado/REGU_REAL","/columnasEmpleado/REGU_JORN",
                                "/columnasEmpleado/VIAJ_COMP", "/columnasEmpleado/VIAJ_REAL","/columnasEmpleado/VIAJ_JORN",
                                "/columnasEmpleado/TOTA_COMP", "/columnasEmpleado/TOTA_REAL","/columnasEmpleado/TOTA_JORN"],
                        formatter: function(a, b, c, d,e,f,g,h,i,j,k, l,m,n,o,p,q,r,s) {
                            if (a == "X" || b == "X" || c == "X" || d == "X"|| e == "X"||f == "X"||
                            		g == "X"|| h == "X"|| i == "X"|| j == "X" || k == "X" || l == "X" ||
	                            		m == "X" || n == "X" || o == "X" || p == "X"|| q == "X"||r == "X")
                                return true;
                            else return false;
                        }
                    },
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({text: "{I18N>manager.saldosPeriodo}"}).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/COND_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_COM"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.conduccion", "I18N>manager.computo"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/COND_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_REA"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.conduccion", "I18N>manager.real"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/COND_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_JOR"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.conduccion", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/DIRE_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_COM"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.directo", "I18N>manager.computo"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/DIRE_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_REA"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.directo", "I18N>manager.real"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/DIRE_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_JOR"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.directo", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/MONT_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_COM"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.montaje", "I18N>manager.computo"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/MONT_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_REA"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.montaje", "I18N>manager.real"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/MONT_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_JOR"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.montaje", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/REGU_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_COM"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.regu", "I18N>manager.computo"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/REGU_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_REA"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.regu", "I18N>manager.real"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/REGU_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_JOR"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.regu", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/VIAJ_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_COM"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.viaje", "I18N>manager.computo"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/VIAJ_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_REA"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.viaje", "I18N>manager.real"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/VIAJ_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_JOR"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.viaje", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/TOTA_COMP", "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_COM"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.total", "I18N>manager.computo"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/TOTA_REAL", "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_REA"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>manager.total", "I18N>manager.real"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/TOTA_JORN", "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_JOR"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.total", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")
                        ]
                    })
                }),
                
                
                
                /**
                 * NUEVO
                 */
                
                new sap.m.Column({
                    visible: {
                        parts: ["/columnasEmpleado/Km", "/columnasEmpleado/Dietas", "/columnasEmpleado/Comida", "/columnasEmpleado/Viaje",
                                 "/columnasEmpleado/Finde", "/columnasEmpleado/Hacom", "/columnasEmpleado/Jext", "/columnasEmpleado/Ftra",
                                  "/columnasEmpleado/Fspc", "/columnasEmpleado/Jevia", "/columnasEmpleado/PLUS_COND" ],
                        formatter: function(a, b, c, d, e, f, g, h, i, j, k, l) {
                            if (a == "X" || b == "X" || c == "X" || d == "X"|| e == "X"|| f == "X"||
                            		g == "X"|| h == "X"|| i == "X"|| j == "X"|| k == "X")
                                return true;
                            else return false;
                        }
                    },
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: "{I18N>manager.importe}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.euro}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Km", "/configuracion/MANAGER/MAN_D_ACU001/COL_KM"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.importeKM}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.euro}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Dietas", "/configuracion/MANAGER/MAN_D_ACU001/COL_DIET"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.importeDietas}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.euro}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Comida", "/configuracion/MANAGER/MAN_D_ACU001/COL_COMI"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.acumuladoComida}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.euro}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Viaje", "/configuracion/MANAGER/MAN_D_ACU001/COL_VIAJE"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.acumuladoViajes}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.euro}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Finde", "/configuracion/MANAGER/MAN_D_ACU001/COL_PLWE"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.plusFinde}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Hacom", "/configuracion/MANAGER/MAN_D_ACU001/COL_HOCO"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.horasComplementarias}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.unidades}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Jext", "/configuracion/MANAGER/MAN_D_ACU001/COL_IMJE"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.jExtra}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.unidades}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Ftra", "/configuracion/MANAGER/MAN_D_ACU001/COL_IMFT"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.festivo}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.unidades}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Fspc", "/configuracion/MANAGER/MAN_D_ACU001/COL_IMFE"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.fEspecial}"
                                    }),
                                    new sap.m.Text({
                    					tooltip: "{I18N>common.unidades.euro}",
                                        visible: {
                    	            		parts : [ "/columnasEmpleado/Jevia", "/configuracion/MANAGER/MAN_D_ACU001/COL_JEVIA"],
                    	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
                    	            	},
                                        text: "{I18N>manager.jExtraViaje}"
                                    }),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasEmpleado/PLUS_COND", "/configuracion/MANAGER/MAN_D_ACU001/COL_PLUS_CON"],
			        	            		formatter: util.Formatter.selectWhenColumnaConfiguracionSelected
			        	            	},
										tooltip: "{I18N>common.unidades.euros}",
									    text: "{I18N>manager.plusConduccion}"
									})
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")

                        ]
                    })
                })
            ]

        }).bindItems("/manager/empleadoSelected/INFO/Periodo/results", oTemplate).addStyleClass("customTable");
        
        
        oView.diasTable.addDelegate({
            onAfterRendering: function() {
              var header = this.$().find('thead');
              var selectAllCb = header.find('.sapMCb');
              selectAllCb.remove();
              
              this.getItems().forEach(function(r) {
                var obj = r.getBindingContext().getObject();
                
                var cb = r.$().find('.sapMCb');
                var oCb = sap.ui.getCore().byId(cb.attr('id'));
                var fuera = getAttributeValue("/fueraDePlazoAprobacion");
                if(oCb != undefined)
                	oCb.setEnabled(!fuera);
              });
            }
          }, oView.diasTable);
    },
    
    /**
     * Funcion que crea el dialogo para la gestion de las columnas de la tabla del empleado
     */
    createTableSettingsDialog : function(){
    	
    	var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		
			
		oView.tableSettingsDialog = new sap.m.Dialog({
			title: "{I18N>manager.seleccionColumnas}",
			content: [
			          new sap.m.VBox({
			        	  items: [
			        	          
			        	          new sap.m.VBox({
			        	        	  items: [
			        	        	      
			        	        	      new sap.m.Bar({
			        	        	    	  contentLeft: new sap.m.Title({text: "Generales"}),
			        	        	    	  contentRight: [
			        	        	    	                 new sap.m.Link({
			        	        	    	                	 press: function(){oController.seleccionarColumnas(1,true)},
							        	        	    		  text: "{I18N>manager.marcarTodos}"
							        	        	    	}),
							        	        	    	new sap.m.Link({
			        	        	    	                	 press: function(){oController.seleccionarColumnas(1,false)},
							        	        	    		text: "{I18N>manager.quitarTodos}"
					        	        	    			})]
			        	        	      	
			        	        	      }),
			        	        	      new sap.m.HBox({
			        	        	    	  items: [
				        	        	          new sap.m.CheckBox({
				        	        	        	  select: function(oEvt){
				        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
				        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Stahd", seleccionado);
				        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/Stahd",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
							        	            	text: "{I18N>parte.estadoParte}"
							        	            }),
							        	            new sap.m.CheckBox({
							        	            	visible: false,
//								            			visible: {
//								            				path : "/configuracion/MANAGER/MAN_D_GEN001/COL_HOR_TEOR",
//							        	            		formatter: util.Formatter.selectWhenColumnaSelected
//								            			},
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/HorTeor", seleccionado);
					        	        	        	  },
				        	        	        	  selected: {
							        	            		path : "/columnasEmpleado/HorTeor",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
														text: "{I18N>empleado.horarioTeorico}"
													}),
													new sap.m.CheckBox({
														visible: false,
//								            			visible: {
//								            				path : "/configuracion/MANAGER/MAN_D_GEN001/COL_HOR_DING",
//							        	            		formatter: util.Formatter.selectWhenColumnaSelected
//								            			},
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/HorDingo", seleccionado);
					        	        	        	  },
				        	        	        	  selected: {
							        	            		path : "/columnasEmpleado/HorDingo",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
														text: "{I18N>empleado.horarioDingo}"
													}),
							        	            new sap.m.CheckBox({
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Cumul", seleccionado);
					        	        	        	  },
					        	        	        	  visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_CUMUL",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
							        	            	selected: {
							        	            		path : "/columnasEmpleado/Cumul",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	
							        	            	},
							        	            	text: {
							                            	parts: ["/reglas/HORS_JOR", "I18N>common.unidades.horas", "I18N>common.unidades.jornadas", "I18N>manager.totalPorDia"],
							                            	formatter: function(regla, horas, jornadas,  trabajadas){
							                            		if (regla)
							                						return jornadas +" " + trabajadas;
							                					else return horas +" " + trabajadas ;
							                            	}
							                            }
							        	            })
				        	        	          ]
					        	          }).addStyleClass("checkboxContainerSeleccionColumnas")
	        	        	          ]
			        	          }),
			        	          new sap.m.VBox({
			        	        	  visible: {
			        	        		  parts : ["/configuracion/MANAGER/MAN_D_HEXT/COL_HE_G",
			        	        		           "/configuracion/MANAGER/MAN_D_HEXT/COL_HE_C",
			        	        		           "/configuracion/MANAGER/MAN_D_JEXT/COL_JE_G",
			        	        		           "/configuracion/MANAGER/MAN_D_JEXT/COL_JE_C",
			        	        		           "/configuracion/MANAGER/MAN_D_FTRA/COL_FT_G",
			        	        		           "/configuracion/MANAGER/MAN_D_FTRA/COL_FT_C",
			        	        		           "/configuracion/MANAGER/MAN_D_FSPC/COL_FS_G",
			        	        		           "/configuracion/MANAGER/MAN_D_FSPC/COL_FS_C"],
			        	        		  formatter: function(value1, value2,value3, value4,value5, value6,value7, value8) {
			        	        			  
			        	        			  if(value1 == "X" || value2 == "X" || value3 == "X" || value4 == "X" || 
			        	        					  value5 == "X" || value6 == "X" || value7 == "X" || value8 == "X"){
			        	        				  return true;
			        	        			  } else return false;
			        	        		  }
			        	        	  },
			        	        	  items: [
		        	        	          	new sap.m.Bar({
		        	        	          		contentLeft: new sap.m.Title({
		        	        	          			text:{
		        	        	          				parts: ["I18N>compensaciones.generadas", "I18N>compensaciones.compensadas"],
		        	        	          				formatter: function(gen, comp){
		        	        	          					return gen +" - " + comp;
		        	        	          				}
		        	        	          			}}),
	        	        	          			contentRight: [
			        	        	    	                 
			        	        	    	                 new sap.m.Link({
			        	        	    	                	 press: function(){oController.seleccionarColumnas(2,true)},
			        	        	    	                	 text: "{I18N>manager.marcarTodos}"
			        	        	    	                 }),
		        	        	    	                	 new sap.m.Link({
			        	        	    	                	 press: function(){oController.seleccionarColumnas(2,false)},
		        	        	    	                		 text: "{I18N>manager.quitarTodos}"
	    	        	    	                			 })
			        	        	    	                 ]
		        	        	          	}),
		        	        	          	new sap.m.HBox({
				        	        	    	  items: [
														new sap.m.CheckBox({
									            			visible: {
									            				parts : ["/configuracion/MANAGER/MAN_D_HEXT/COL_HE_G","/configuracion/MANAGER/MAN_D_HEXT/COL_HE_C"],
									            				formatter : function(acceso,acceso2){
								        	            			if(acceso == "X" || acceso2 == "X")
								        	            				return true
							        	            				else return false
						        	            				}
									            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Gencomp90", seleccionado);
						        	        	        	  },
					        	        	        	  selected: {
								        	            		path : "/columnasEmpleado/Gencomp90",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
															text: "{I18N>common.tipoJornada.prolongacion}"
														}),
														new sap.m.CheckBox({
									            			visible: {
									            				parts : ["/configuracion/MANAGER/MAN_D_JEXT/COL_JE_G","/configuracion/MANAGER/MAN_D_JEXT/COL_JE_C"],
									            				formatter : function(acceso,acceso2){
								        	            			if(acceso == "X" || acceso2 == "X")
								        	            				return true
							        	            				else return false
						        	            				}
									            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Gencomp91", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Gencomp91",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
															text: "{I18N>common.tipoJornada.extra}"
														}),
														new sap.m.CheckBox({
									            			visible: {
									            				parts : ["/configuracion/MANAGER/MAN_D_FTRA/COL_FT_G","/configuracion/MANAGER/MAN_D_FTRA/COL_FT_C"],
									            				formatter : function(acceso,acceso2){
								        	            			if(acceso == "X" || acceso2 == "X")
								        	            				return true
							        	            				else return false
						        	            				}
									            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Gencomp92", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Gencomp92",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
															text: "{I18N>common.tipoJornada.festivo}"
														}),
														new sap.m.CheckBox({
									            			visible: {
									            				parts : ["/configuracion/MANAGER/MAN_D_FSPC/COL_FS_G","/configuracion/MANAGER/MAN_D_FSPC/COL_FS_C"],
									            				formatter : function(acceso,acceso2){
								        	            			if(acceso == "X" || acceso2 == "X")
								        	            				return true
							        	            				else return false
						        	            				}
									            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Gencomp93", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Gencomp93",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
															text: "{I18N>common.tipoJornada.especial}"
														})
														]
						        	          }).addStyleClass("checkboxContainerSeleccionColumnas")
	        	        	          ]
			        	          }),
			        	          /**
			                         * NUEVAS COLUMNAS
			                         */
			                        new sap.m.VBox({
			                        	visible: {
			                				parts :[  "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_COM",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_REA",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_JOR",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_COM",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_REA",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_JOR",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_COM",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_REA",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_JOR",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_COM",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_REA",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_JOR",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_COM",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_REA",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_JOR",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_COM",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_REA",
			                				          "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_JOR"],
			                				formatter: function(acceso, acceso2,acceso3, acceso4,acceso5, acceso6,acceso7, acceso8,acceso9,
			                						acceso10,acceso11, acceso12,acceso13, acceso14,acceso15, acceso16, acceso17) {
			                					if(acceso == "X" || acceso2 == "X" || acceso3 == "X" || acceso4 == "X" ||
			                							acceso5 == "X" || acceso6 == "X" ||acceso7 == "X" || acceso8 == "X" ||
			                							acceso9 == "X" || acceso10 == "X" ||acceso11 == "X" || acceso12 == "X"||
			                							acceso13 == "X" || acceso14 == "X" ||acceso15 == "X" || acceso16 == "X"||
			                							acceso17 == "X" ){
			                						return true;
			                					} else {
			                						return false;
			                					}
			                			 	}
			                			},
			                            items: [
			                                new sap.m.Bar({
			                                    contentLeft: new sap.m.Title({
			                                        text: "{I18N>manager.saldosPeriodo}"
			                                    }),
			                                    contentRight: [
			                                        new sap.m.Link({
			                                            press: function() {
			                                                oController.seleccionarColumnas(3, true)
			                                            },
			                                            text: "{I18N>manager.marcarTodos}"
			                                        }).addStyleClass("sapUiHideOnPhone"),
			                                        new sap.m.Link({
			                                            press: function() {
			                                                oController.seleccionarColumnas(3, false)
			                                            },
			                                            text: "{I18N>manager.quitarTodos}"
			                                        }).addStyleClass("sapUiHideOnPhone")
			                                    ]
			                                }),
			                                new sap.m.HBox({
			                                    items: [
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_COM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/COND_COMP", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/COND_COMP",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.conduccion", "I18N>manager.computo"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_REA",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/COND_REAL", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/COND_REAL",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.conduccion", "I18N>manager.real"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_COND_JOR",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/COND_JORN", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/COND_JORN",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.conduccion", "I18N>manager.jornadas"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_COM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/DIRE_COMP", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/DIRE_COMP",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.directo", "I18N>manager.computo"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_REA",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/DIRE_REAL", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/DIRE_REAL",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.directo", "I18N>manager.real"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_DIRE_JOR",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/DIRE_JORN", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/DIRE_JORN",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.directo", "I18N>manager.jornadas"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_COM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/MONT_COMP", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/MONT_COMP",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.montaje", "I18N>manager.computo"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_REA",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/MONT_REAL", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/MONT_REAL",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.montaje", "I18N>manager.real"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_MONT_JOR",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/MONT_JORN", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/MONT_JORN",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.montaje", "I18N>manager.jornadas"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_COM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/REGU_COMP", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/REGU_COMP",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.regu", "I18N>manager.computo"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_REA",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/REGU_REAL", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/REGU_REAL",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.regu", "I18N>manager.real"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_REGU_JOR",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/REGU_JORN", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/REGU_JORN",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.regu", "I18N>manager.jornadas"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_COM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/VIAJ_COMP", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/VIAJ_COMP",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.viaje", "I18N>manager.computo"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_REA",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/VIAJ_REAL", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/VIAJ_REAL",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.viaje", "I18N>manager.real"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_VIAJ_JOR",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/VIAJ_JORN", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/VIAJ_JORN",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.viaje", "I18N>manager.jornadas"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_COM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/TOTA_COMP", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/TOTA_COMP",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.total", "I18N>manager.computo"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_REA",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
					        	        	        	  select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/TOTA_REAL", seleccionado);
					        	        	        	  },
							        	            	selected: {
							        	            		path : "/columnasEmpleado/TOTA_REAL",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text:{
													    	parts : ["I18N>manager.total", "I18N>manager.real"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                        new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_SAL001/COL_TOTA_JOR",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
														select: function(oEvt){
															  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
														  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/TOTA_JORN", seleccionado);
														},
							        	            	selected: {
							        	            		path : "/columnasEmpleado/TOTA_JORN",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
			                                            text: {
													    	parts : ["I18N>manager.total", "I18N>manager.jornadas"],
													    	formatter: function(a, b) {
													    		return a + " " + b;
													    	}
													    }
			                                        }),
			                                    ]
			                                }).addStyleClass("checkboxContainerSeleccionColumnas")
			                            ]
			                        }),
			                        
			                        /**
			                         * FIN NUEVAS COLUMNAS
			                         */
			        	          new sap.m.VBox({
			        	        	  items: [
		        	        	          new sap.m.Bar({
		        	        	        	  contentLeft: new sap.m.Title({text:"{I18N>manager.acumulado}"}),
			        	        	    	  contentRight: [
			        	        	    	                 new sap.m.Link({
			        	        	    	                	 press: function(){oController.seleccionarColumnas(4,true)},
			        	        	    	                	 text: "{I18N>manager.marcarTodos}"
			        	        	    	                 }),
		        	        	    	                	 new sap.m.Link({
			        	        	    	                	 press: function(){oController.seleccionarColumnas(4,false)},
		        	        	    	                		 text: "{I18N>manager.quitarTodos}"
	    	        	    	                			 })]
		        	        	          }),
		        	        	          new sap.m.HBox({
					        	        	  items: [
													new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_KM",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Km", seleccionado);
					        	        	        	  },
														selected: {
							        	            		path : "/columnasEmpleado/Km",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
							        	            	text: "{I18N>manager.importeKM}"}),
													new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_DIET",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Dietas", seleccionado);
					        	        	        	  },
														selected: {
							        	            		path : "/columnasEmpleado/Dietas",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
							        	            	text:"{I18N>manager.importeDietas}"}),
													new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_COMI",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Comida", seleccionado);
					        	        	        	  },
														selected: {
							        	            		path : "/columnasEmpleado/Comida",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
							        	            	text:"{I18N>manager.acumuladoComida}"}),
													new sap.m.CheckBox({
				                            			visible: {
				                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_VIAJE",
				                            				formatter: util.Formatter.reactOnConfig
				                            			},
							        	            	select: function(oEvt){
					        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
					        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Viaje", seleccionado);
					        	        	        	  },
														selected: {
							        	            		path : "/columnasEmpleado/Viaje",
							        	            		formatter: util.Formatter.selectWhenColumnaSelected
							        	            	},
							        	            	text:"{I18N>manager.acumuladoViajes}"}),
							        	            	new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_PLWE",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Finde", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Finde",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
								        	            	text: "{I18N>manager.plusFinde}"
						        	            		}),
														new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_HOCO",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Hacom", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Hacom",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
								        	            	text:"{I18N>manager.horasComplementarias}"
						        	            		}),
														new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_IMJE",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Jext", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Jext",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
								        	            	text:"{I18N>manager.jExtra}"
						        	            		}),
						        	            		new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_IMFT",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Ftra", seleccionado);
						        	        	        	  },
						        	            			selected: {
								        	            		path : "/columnasEmpleado/Ftra",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
								        	            	text:"{I18N>manager.festivo}"
						        	            		}),
						        	            		new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_IMFE",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Fspc", seleccionado);
						        	        	        	  },
						        	            			selected: {
								        	            		path : "/columnasEmpleado/Fspc",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
								        	            	text:"{I18N>manager.fEspecial}"
						        	            		}),
														new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_JEVI",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
								        	            	select: function(oEvt){
						        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
						        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/Jevia", seleccionado);
						        	        	        	  },
															selected: {
								        	            		path : "/columnasEmpleado/Jevia",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
								        	            	text:"{I18N>manager.jExtraViaje}"
						        	            		}),
				                                        new sap.m.CheckBox({
					                            			visible: {
					                            				path : "/configuracion/MANAGER/MAN_D_ACU001/COL_PLUS_CON",
					                            				formatter: util.Formatter.reactOnConfig
					                            			},
															  select: function(oEvt){
																  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
															  sap.ui.getCore().getModel().setProperty("/columnasEmpleado/PLUS_COND", seleccionado);
															  },
								        	            	selected: {
								        	            		path : "/columnasEmpleado/PLUS_COND",
								        	            		formatter: util.Formatter.selectWhenColumnaSelected
								        	            	},
				                                            text: "{I18N>manager.plusConduccion}"
				                                        }),
											]
					        	          }).addStyleClass("checkboxContainerSeleccionColumnas"),
					        	          new sap.m.HBox({
					        	        	  items: [
													
											]
					        	          }).addStyleClass("checkboxContainerSeleccionColumnas")
	        	        	          ]
			        	          })
			        	            ]
			          }).addStyleClass("bigContainerSeleccionColumnas")
			          
			          ],
			          buttons: [
								new sap.m.Button({
									text: "{I18N>common.guardar}",
									press: function (oEvt) {
										oController.enviarColumnas();
										oView.tableSettingsDialog.close();
									}
								}),
			                    new sap.m.Button({
			                    	visible: {
			                    		path: "/columnasEmpleado",
			                    		formatter: function (columnas) {
			                    			if(columnas.Pernr == "00000000")
			                    				return false;
			                    			else return true;
			                    		}
			                    	},
									text: "{I18N>common.salir}",
									press: function (oEvt) {
										oView.tableSettingsDialog.close();
									}
			                    })
			                    ],
	     	           beforeOpen: function(){
	     	        	  if(window.pageYOffset > 0) {
	     	        		   this.addStyleClass("moveCustomDialog")
	     	        	   }else this.removeStyleClass("moveCustomDialog")
	    	           }
		
		}).addStyleClass("dialogSeleccionColumnas customDialog"); // .bindElement("/columnasEmpleado")
		
		
    },
    
    
    
    
    createSubheader : function(oController){
		var oView = this;

		var home = sap.ui.getCore().byId(Common.Navigations.HOME);
		var homeController = home.getController();
		oView.atrasButton = new sap.m.Button({
			icon: "sap-icon://nav-back",
//			text: "{I18N>empleado.irEmpleados}",
			press: oController.onNavBack
		}).addStyleClass("atrasButtonEmpleado"); 
			
		
		oView.horasCompensadas = new sap.m.ToggleButton({
			text: "{I18N>empleado.conCompensadas}",
			press: function(oEvt){
				
				var anadir = oEvt.getParameter("pressed");
				if(anadir == true)
					oController.setCompensadasFilter();
				else oController.removeCompensadasFilter();
			}
		}).addStyleClass("pendientesDesktopManager sapUiHideOnPhone");
		
		oView.horasGeneradas = new sap.m.ToggleButton({
			text: "{I18N>empleado.conGeneradas}",
			press: function(oEvt){
				var anadir = oEvt.getParameter("pressed");
				if(anadir == true)
					oController.setGeneradasFilter();
				else oController.removeGeneradasFilter();
			}
		}).addStyleClass("pendientesDesktopManager sapUiHideOnPhone");
		
		
		var horasContainer = new sap.m.VBox({
			items : [oView.horasGeneradas, oView.horasCompensadas]
		}).addStyleClass("containerGeneradasCompensadas sapUiHideOnPhone")
		
		
		var suggestionTemplateEstado = new sap.m.SuggestionItem({
	    	   key: "{DOMVALUE_L}",
				text: "{DDTEXT}",
		})
		
		oView.estadoSearch = new sap.m.SearchField({
        	placeholder: "{I18N>empleado.estado}",
        	search: function(oEvt){
        		
        		var element = oEvt.getParameter("suggestionItem");
        		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        		var oldFilters = oView.diasTable.getBinding("items").aFilters;
        		
        		if(element != undefined || oEvt.getParameter("clearButtonPressed") == true){
        		
        			
        			
					// Para la llamada inicial
					if(oView.diasTable.getBinding("items").aFilters.length == 0){
						oController.setInitialFilter();
					}
					
					
					if(oldFilters[0].aFilters != undefined){
						for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
							if(oldFilters[0].aFilters[i].sPath == "STAHD"){
								oldFilters[0].aFilters.splice(i,1);
								i--;
							}
						}
					}
				
        		}
				
				if(element != undefined && oEvt.getParameter("clearButtonPressed") == false){
					var selectedKey = oEvt.getParameter("suggestionItem").getKey();
					
					var filter = new sap.ui.model.Filter("STAHD", sap.ui.model.FilterOperator.EQ, selectedKey);
					oldFilters[0].aFilters.push(filter);
					oView.diasTable.getBinding("items").filter(oldFilters);
				}	
				
				if(oldFilters[0].aFilters.length == 0){
					oView.diasTable.getBinding("items").filter(undefined);
				}
				
				sap.ui.getCore().getModel().updateBindings();
				
        	},
        	enableSuggestions: true,
        	maxLength: 9999,
        	suggest: function(event){
        		var value = event.getParameter("suggestValue");
    			var filters = [];
    			if (value) {
    				filters = new sap.ui.model.Filter("DDTEXT", sap.ui.model.FilterOperator.Contains,value)
    			}
     
    			oView.estadoSearch.getBinding("suggestionItems").filter(filters);
    			oView.estadoSearch.suggest();
        	}
    }).bindAggregation("suggestionItems", "/estadosParte/results", suggestionTemplateEstado).addStyleClass("searchEstadoEmpleado sapUiVisibleOnlyOnPhone");
	
		
		
		
		
		var oTemplateEstado = new sap.ui.core.Item({
			key: "{DOMVALUE_L}",
			text: "{DDTEXT}"
		})
		
		oView.selectEstado = new sap.m.Select({
			forceSelection: false,
			change : function(oEvt){
				var selectedKey = oEvt.getParameter("selectedItem").getProperty("key");
				
				var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
				var oldFilters = oView.diasTable.getBinding("items").aFilters;
				
				// Para la llamada inicial
				if(oView.diasTable.getBinding("items").aFilters.length == 0){
					oController.setInitialFilter();
				}
				
				
				if(oldFilters[0].aFilters != undefined){
					for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
						if(oldFilters[0].aFilters[i].sPath == "STAHD"){
							oldFilters[0].aFilters.splice(i,1);
							i--;
						}
					}
				}
				
				// Si seleccionan la vacía
				if(selectedKey != ""){
					var filter = new sap.ui.model.Filter("STAHD", sap.ui.model.FilterOperator.EQ, selectedKey);
					oldFilters[0].aFilters.push(filter);
				}
				
				
				oView.diasTable.getBinding("items").filter(oldFilters);
				
			}
		}).bindItems("/estadosParte/results", oTemplateEstado).addStyleClass("selectEstadoEmpleado")
		
		var titleSelect = new sap.m.Text({text: "Estado"});
		var borrarSelect = new sap.m.Button({
			icon: "sap-icon://sys-cancel",
			press: function(oEvt){
				oView.selectEstado.setSelectedKey("");
				oController.removeEstadoFilter();
			}
		});
		
		var containerTitleSelect = new sap.m.HBox({
			items: [titleSelect, borrarSelect]
		}).addStyleClass("titleSelectContainer");
		
		var selectContainer = new sap.m.VBox({
			items : [containerTitleSelect, oView.selectEstado]
		}).addStyleClass("containerSelect sapUiHideOnPhone")
		
		
		oView.buttonsFiltros =  new sap.m.SegmentedButton({
			selectedKey: "2",
			items: [
			        new sap.m.SegmentedButtonItem({
			        	key: "1",
//			        	icon: "sap-icon://arrow-left",
			        	text: "{I18N>empleado.diasSinEnviar}",
			        	press: function(oEvt){
			        		oController.setSinEnviarFilter();
			        	}
			        		
			        }),
			        new sap.m.SegmentedButtonItem({
			        	key: "2",
//			        	icon: "sap-icon://arrow-right",
			        	text: "{I18N>empleado.diasTodos}",
			        	press: function(oEvt){


			        		oController.setTodosFilter();
			        	}
			        })
			        ]
		}).addStyleClass("segmentedDesktopManager sapUiHideOnPhone")
		
		
		oView.filtrosPhoneButton = new sap.m.Button({
			icon : "sap-icon://filter",
			text: "{I18N>manager.filtros}",
			press: function( oEvent ){
				var oButton = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
        		
        		oView.filtrosPhoneMenu.open(false, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
			}
		}).addStyleClass("periodoPhoneButton sapUiVisibleOnlyOnPhone"); 
		
		oView.filtrosPhoneMenu = new sap.ui.unified.Menu({
			items: [
					new sap.ui.unified.MenuItem({
						key: "3",
						text: "{I18N>empleado.horas}",
						submenu: [
							new sap.ui.unified.Menu({
								items: [
										new sap.ui.unified.MenuItem({
											key: "1",
											text: "{I18N>empleado.conCompensadas}",
											select: function(oEvt){
												oController.setCompensadasFilter();
											}
										}),
										new sap.ui.unified.MenuItem({
											key: "2",
											text: "{I18N>empleado.conGeneradas}",
											select: function(oEvt){
												oController.setGeneradasFilter();
											}
										}),
										new sap.ui.unified.MenuItem({
											key: "2",
											text: "{I18N>empleado.borrarHoras}",
											select: function(oEvt){
												oController.removeCompensadasFilter();
												oController.removeGeneradasFilter();
											}
										}),
								        ]
							})]
					}),
			        
			        
			        new sap.ui.unified.MenuItem({
			        	key: "3",
			        	text: "{I18N>parte.estadoParte}",
			        	submenu: [
							new sap.ui.unified.Menu({
								items: [
								        new sap.ui.unified.MenuItem({
								        	key: "31",
								        	text: "{I18N>empleado.diasSinEnviar}",
								        	select: function(oEvt){
								        		oController.setSinEnviarFilter();
								        	}
								        }),
								        new sap.ui.unified.MenuItem({
								        	key: "32",
								        	text: "{I18N>empleado.diasTodos}",
								        	select: function(oEvt){
								        		oController.setTodosFilter();
								        	}
								        }),
								        ]
			        	        		
								}),
								]
			        })
			        ]
		}).addStyleClass("periodoPhoneButton"); 
		
		
		
		
		
		
		var subheader = new sap.m.Bar({
			contentLeft:[
			             oView.atrasButton,
					        new sap.m.Text({
					        	text: "{ENAME}"
					        }).bindElement("/manager/empleadoSelected").addStyleClass("titleEmpleadoSelected"),
			             ],
	        contentMiddle: oView.estadoSearch,
			contentRight: [
			               
		               	selectContainer,
			               horasContainer,
			               	oView.buttonsFiltros,
			               	oView.filtrosPhoneButton
						        ]
		}).addStyleClass("appSubHeader appSubHeaderManager");
		
		return subheader;
	}


});