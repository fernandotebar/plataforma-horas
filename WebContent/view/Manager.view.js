	sap.ui.jsview("view.Manager", {


    /** Specifies the Controller belonging to this View. 
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf view.Manager
     */
    getControllerName: function() {
        return "view.Manager";
    },


    onBeforeFirstShow: function(oEvt) {

        var oController = this.getController();
        oController.getColumnas();

    },

    onBeforeShow: function(oEvt) {

    	var oController = this.getController();
    	oController.onBeforeShowCalls();
    	sap.ui.getCore().getConfiguration().setLanguage("en");
    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
     * Since the Controller is given to this method, its event handlers can be attached right away. 
     * @memberOf view.Manager
     */
    createContent: function(oController) {

        var oView = this;
        this.createTabla(oController);

        this.header = sap.ui.jsfragment("fragment.AppHeader", oController);
        this.footer = sap.ui.jsfragment("fragment.AppManagerFooter", oController);

        oView.subheader = sap.ui.jsfragment("fragment.FiltrosManager", oController);

        this.layout = new sap.ui.layout.Grid({
            content: [this.toolbar,this.empleadosTable]
        }).addStyleClass("mainGridImputar");

        return new sap.m.Page({
            customHeader: oView.header,
            showSubHeader: true,
            footer: this.footer,
            subHeader: oView.subheader,
            content: this.layout

        });
    },

    /**
     * Funcion que crea la tabla con los subordinados
     * @param oCon
     */
    createTabla: function(oCon) {

        var oView = this;
        
        
        oView.toolbar = new sap.m.Toolbar({
            layoutData: new sap.ui.layout.GridData({
                span: "L12 M12 S12"
            }),
            content: [ //new sap.m.ToolbarSpacer(),  
                      	new sap.m.Title({
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
	                        	
	                        	var leftPos2 = $('#managerTable').scrollLeft();
	                            $('#managerTable').animate({scrollLeft: leftPos2 - 250}, 400);
	                        	 
	                        }
	                    }),
	                    new sap.m.Button({
	                        icon: "sap-icon://navigation-right-arrow",
	                        press: function(oEvt){
	
	                        	var leftPos = $('#managerTable').scrollLeft();
	                            $("#managerTable").animate({scrollLeft: leftPos + 250}, 400);
	                        }
	                    }),
	                    new sap.m.Button({
	            			visible: {
	            				path : "/configuracion/MANAGER/MAN_G_CON001/CONFI_COL",
	            				formatter: util.Formatter.reactOnConfig
	            			},
	                        icon: "sap-icon://action-settings",
	                        press: oCon.openTableSettingsDialog
	                    })
	                ]
          }).addStyleClass("optionsToolbarCustomTable");

        var oTemplate = new sap.m.ColumnListItem({
            type: sap.m.ListType.Active,
            press: function(oEvt) {

                var app = sap.ui.getCore().byId(Common.App.Name);
                var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
                var contexto = this.getBindingContext().getObject();
                var lang = getAttributeValue("/language");
                contexto.Fecha = getAttributeValue("/manager/empleadoSelected/FECHA");
                setAttributeValue("/manager/empleadoSelected", contexto);

                sap.ui.getCore().getConfiguration().setLanguage(lang);
                app.toDetail(Common.Navigations.EMPLEADO, {
                    oData: contexto
                });
            },
            cells: [
                new sap.m.Text({
                    text: "{ENAME}"
                }).addStyleClass("nameItemEmpleados"),
                new sap.m.HBox({
                    items: [
                        new sap.m.Text({
				                text: {
				                    path: "DIAS_PEND",
				                    formatter: function(dias) {
				                        if (dias > 10) {
				                            this.addStyleClass("Critical");
				                        }
				                        if (dias > 1 && dias <= 10) {
				                            this.addStyleClass("Error");
				                        }
				                        if (dias == 0) {
				                            this.addStyleClass("Good");
				                        }
				                        return dias;
				                    }
				                }
                    }).addStyleClass("numDiasPendientesEmpleados headerTitleEmpleadoTabla")
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),               
                new sap.m.HBox({
                    items: [
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Dif90",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "DIF90",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Dif91",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "DIF91",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Dif92",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "DIF92",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Dif93",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "DIF93",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        })
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                new sap.m.HBox({
                    items: [
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Gen90",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "GEN90",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Comp90",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "COMP90",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Gen91",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "GEN91",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Comp91",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "COMP91",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Gen92",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "GEN92",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Comp92",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "COMP92",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Gen93",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "GEN93",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Comp93",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
    	            				else return false
	            				}
        	            	},
                            text: {
                                path: "COMP93",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        })
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),
                /*
                 * NUEVAS LIST ITEMS
                 */
                new sap.m.HBox({
                    items: [
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/COND_COMP",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "COND_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/COND_REAL",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "COND_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/COND_JORN",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "COND_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/DIRE_COMP",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "DIRE_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/DIRE_REAL",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "DIRE_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/DIRE_JORN",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "DIRE_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/MONT_COMP",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "MONT_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/MONT_REAL",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "MONT_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/MONT_JORN",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "MONT_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/REGU_COMP",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NAVE_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/REGU_REAL",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NAVE_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/REGU_JORN",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NAVE_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/VIAJ_COMP",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "VIAJ_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/VIAJ_REAL",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "VIAJ_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/VIAJ_JORN",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "VIAJ_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/TOTA_COMP",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "TOTA_COMP",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/TOTA_REAL",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "TOTA_REAL",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/TOTA_JORN",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "TOTA_JORN",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
						new sap.m.Text({
						    visible: {
								path : "/columnasManager/NUM_JOR_HOR",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "NUM_JOR_HOR",
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
        	            		path : "/columnasManager/Km",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "KM",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Dietas",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "DIETAS",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Comida",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "COMIDA",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Viaje",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "VIAJE",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Finde",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "FINDE",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Hacom",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "HACOM",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Jext",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "JEXT",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Ftra",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "FTRA",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Fspc",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "FSPC",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),
                        new sap.m.Text({
                            visible: {
        	            		path : "/columnasManager/Jevia",
        	            		formatter: function(valor){
        	            			if(valor == "X")
        	            				return true
                    				else return false
                				}
        	            	},
                            text: {
                                path: "JEVIA",
                                formatter: util.Formatter.compensacionesDecimals
                            }
                        }),

						new sap.m.Text({
						    visible: {
								path : "/columnasManager/PLUS_COND",
								formatter: util.Formatter.reactOnConfig
							},
						    text: {
						        path: "PLUS_COND",
						        formatter: util.Formatter.compensacionesDecimals
						    }
						}),
                    ]
                }).addStyleClass("headerContainerEmpleadoTabla"),

            ]
        }).addStyleClass("itemEmpleados");

        this.empleadosTable = new sap.m.Table("managerTable",{
        	visible: {
        		path: "/columnasManager/Pernr",
        		formatter: function (pernr) {
        			if(pernr == "00000000"){
        				return false;
        			}else return true;
        		}
        	},
            mode: sap.m.ListMode.MultiSelect,
            selectionChange: oCon.onSelectionChange,
            growing: true,
            growingThreshold: 15,
            growingScrollToLoad: true,
            layoutData: new sap.ui.layout.GridData({
                span: "L12 M12 S12"
            }),
            updateFinished : function() {
                var header = this.$().find('thead');
                var selectAllCb = header.find('.sapMCb');
                selectAllCb.remove();
                
                this.getItems().forEach(function(r) {
                  var obj = r.getBindingContext().getObject();
                  
                  var cb = r.$().find('.sapMCb');
                  var oCb = sap.ui.getCore().byId(cb.attr('id'));

                  if(obj.DIAS_PEND == 0){
                  	var fuera = getAttributeValue("/fueraDePlazoAprobacion")
                  		oCb.setEnabled(!fuera);
                  }else oCb.setEnabled(false);
                });
              },
            columns: [
                new sap.m.Column({
                    width: "25%",
                    header: new sap.m.Text({
                        text: ""
                    })
                }),
                new sap.m.Column({

                    width: "10%",
                    hAlign: sap.ui.core.TextAlign.Center,
                    minScreenWidth: "480px",
                    demandPopin: true,
                    popinDisplay: sap.m.PopinDisplay.Inline,
                    header: new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: "{I18N>manager.partes}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    (sap.ui.Device.system.phone == false) ? new sap.m.Text({
                                        text: "{I18N>manager.pendientes}"
                                    }) : new sap.m.Text({
                                        text: ""
                                    })
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")
                        ]
                    })
                }),
                new sap.m.Column({
                    visible: {
                        parts: ["/columnasManager/Dif90", "/columnasManager/Dif91", "/columnasManager/Dif92", "/columnasManager/Dif93"],
                        formatter: function(a, b, c, d) {
                            if (a == "X" || b == "X" || c == "X" || d == "X")
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
                                text: "{I18N>manager.diferencial}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Dif90", "/configuracion/MANAGER/MAN_G_DIF001/COL_HE_D"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.prolongacion}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Dif91", "/configuracion/MANAGER/MAN_G_DIF001/COL_JE_D"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.jornadaExtra}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Dif92", "/configuracion/MANAGER/MAN_G_DIF001/COL_FT_D"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("compensaciones.jornadas");
					        					else return getI18nText("compensaciones.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.festivo}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Dif93", "/configuracion/MANAGER/MAN_G_DIF001/COL_FS_D"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.festivoEspecial}"
                                    }),
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")
                        ]
                    })
                }),
                new sap.m.Column({
                    visible: {
                        parts: ["/columnasManager/Gen90", "/columnasManager/Gen91", "/columnasManager/Gen92", "/columnasManager/Gen93",
                                "/columnasManager/Comp90", "/columnasManager/Comp91", "/columnasManager/Comp92", "/columnasManager/Comp93"],
                        formatter: function(a, b, c, d,e,f,g,h) {
                            if (a == "X" || b == "X" || c == "X" || d == "X" || e == "X" || f == "X" || g == "X" || h == "X")
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
                                text: "{I18N>manager.saldosPeriodo}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Gen90", "/configuracion/MANAGER/MAN_G_SAL001/COL_HE_G"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.prolongacionG}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Comp90", "/configuracion/MANAGER/MAN_G_SAL001/COL_HE_C"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.prolongacionC}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Gen91", "/configuracion/MANAGER/MAN_G_SAL001/COL_JE_G"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.jornadaExtraG}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Comp91", "/configuracion/MANAGER/MAN_G_SAL001/COL_JE_C"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip:{
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.jornadaExtraC}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Gen92", "/configuracion/MANAGER/MAN_G_SAL001/COL_FT_G"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip:{
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.festivoG}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Comp92", "/configuracion/MANAGER/MAN_G_SAL001/COL_FT_C"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.festivoC}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Gen93", "/configuracion/MANAGER/MAN_G_SAL001/COL_FS_G"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.festivoEspecialG}"
                                    }),
                                    new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Comp93", "/configuracion/MANAGER/MAN_G_SAL001/COL_FS_C"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
                                        text: "{I18N>compensaciones.festivoEspecialC}"
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
                        parts: ["/columnasManager/NUM_JOR_HOR",
                                "/columnasManager/COND_COMP", "/columnasManager/COND_REAL","/columnasManager/COND_JORN",
                                "/columnasManager/DIRE_COMP", "/columnasManager/DIRE_REAL","/columnasManager/DIRE_JORN",
                                "/columnasManager/MONT_COMP", "/columnasManager/MONT_REAL","/columnasManager/MONT_JORN",
                                "/columnasManager/REGU_COMP", "/columnasManager/REGU_REAL","/columnasManager/REGU_JORN",
                                "/columnasManager/VIAJ_COMP", "/columnasManager/VIAJ_REAL","/columnasManager/VIAJ_JORN",
                                "/columnasManager/TOTA_COMP", "/columnasManager/TOTA_REAL","/columnasManager/TOTA_JORN"],
                        formatter: function(a, b, c, d,e,f,g,h,i,j,k, l,m,n,o,p,q,r,s) {
                            if (a == "X" || b == "X" || c == "X" || d == "X"|| e == "X"||f == "X"||
                            		g == "X"|| h == "X"|| i == "X"|| j == "X" || k == "X" || l == "X" ||
	                            		m == "X" || n == "X" || o == "X" || p == "X"|| q == "X"||r == "X"||s == "X")
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
                            new sap.m.Text({text: "{I18N>manager.saldosPeriodo}" }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
									
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/COND_COMP", "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_COM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/COND_REAL", "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_REA"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/COND_JORN", "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_JOR"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/DIRE_COMP", "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_COM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/DIRE_REAL", "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_REA"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/DIRE_JORN", "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_JOR"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/MONT_COMP", "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_COM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/MONT_REAL", "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_REA"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/MONT_JORN", "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_JOR"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/REGU_COMP", "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_COM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/REGU_REAL", "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_REA"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/REGU_JORN", "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_JOR"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/VIAJ_COMP", "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_COM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/VIAJ_REAL", "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_REA"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/VIAJ_JORN", "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_JOR"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/TOTA_COMP", "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_COM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/TOTA_REAL", "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_REA"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
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
			        	            		parts : ["/columnasManager/TOTA_JORN", "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_JOR"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.jornadas}",
									    text: {
									    	parts : ["I18N>manager.total", "I18N>manager.jornadas"],
									    	formatter: function(a, b) {
									    		return a + " " + b;
									    	}
									    }
									}),
									new sap.m.Text({
									    visible: {
											parts : ["/columnasManager/NUM_JOR_HOR", "/configuracion/MANAGER/MAN_G_SAL001/COL_JORN_PER"],
											formatter: function(valor,acceso){
												if(valor == "X" && acceso == "X")
													return true
												else return false
											}
										},
										tooltip: "{I18N>common.unidades.horas}",
									    text: {
									    	parts : ["I18N>common.unidades.jornadas", "I18N>manager.periodo"],
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
                        parts: ["/columnasManager/Km", "/columnasManager/Dietas", "/columnasManager/Comida", "/columnasManager/Viaje",
                                 "/columnasManager/Finde", "/columnasManager/Hacom", "/columnasManager/Jext", "/columnasManager/Ftra",
                                  "/columnasManager/Fspc", "/columnasManager/Jevia", "/columnasManager/Tcond", "/columnasManager/Ttime",
                                   "/columnasManager/PLUS_COND"],
                        formatter: function(a, b, c, d,e,f,g,h,i,j,k, l,m) {
                            if (a == "X" || b == "X" || c == "X" || d == "X"|| e == "X"||f == "X"||
                            		g == "X"|| h == "X"|| i == "X"|| j == "X" || k == "X" || l == "X" || m == "X")
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
                                text: "{I18N>manager.acumulado}"
                            }).addStyleClass("headerTitleEmpleadoTabla"),
                            new sap.m.HBox({
                                items: [
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Km", "/configuracion/MANAGER/MAN_G_ACU001/COL_KM"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euro}",
									    text: "{I18N>manager.importeKM}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Dietas", "/configuracion/MANAGER/MAN_G_ACU001/COL_DIET"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euro}",
									    text: "{I18N>manager.importeDietas}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Comida", "/configuracion/MANAGER/MAN_G_ACU001/COL_COMI"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euro}",
									    text: "{I18N>manager.acumuladoComida}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Viaje", "/configuracion/MANAGER/MAN_G_ACU001/COL_VIAJE"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euro}",
									    text: "{I18N>manager.acumuladoViajes}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Finde", "/configuracion/MANAGER/MAN_G_ACU001/COL_PLWE"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euro}",
									    text: "{I18N>manager.plusFinde}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Hacom", "/configuracion/MANAGER/MAN_G_ACU001/COL_HOCO"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
									    text: "{I18N>manager.horasComplementarias}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Jext", "/configuracion/MANAGER/MAN_G_ACU001/COL_IMJE"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.unidades}",
									    text: "{I18N>manager.jExtra}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Ftra", "/configuracion/MANAGER/MAN_G_ACU001/COL_IMFT"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.unidades}",
									    text: "{I18N>manager.festivo}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Fspc", "/configuracion/MANAGER/MAN_G_ACU001/COL_IMFE"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.unidades}",
									    text: "{I18N>manager.fEspecial}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Jevia", "/configuracion/MANAGER/MAN_G_ACU001/COL_JEVI"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euro}",
									    text: "{I18N>manager.jExtraViaje}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Tcond", "/configuracion/MANAGER/MAN_G_ACU001/COL_TCOND"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
									    text: "{I18N>manager.tiempoConduccion}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/Ttime", "/configuracion/MANAGER/MAN_G_ACU001/COL_TTIME"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: {
					        				path: "/reglas/HORS_JOR",
					        				formatter: function(regla){
					        					if (regla)
					        						return getI18nText("common.unidades.jornadas");
					        					else return getI18nText("common.unidades.horas");
					        				}
					        			},
									    text: "{I18N>manager.tiempoViaje}"
									}),
									new sap.m.Text({
                                        visible: {
			        	            		parts : ["/columnasManager/PLUS_COND", "/configuracion/MANAGER/MAN_G_ACU001/COL_PLUS_CON"],
			        	            		formatter: function(valor,acceso){
			        	            			if(valor == "X" && acceso == "X")
			        	            				return true
		        	            				else return false
	        	            				}
			        	            	},
										tooltip: "{I18N>common.unidades.euros}",
									    text: "{I18N>manager.plusConduccion}"
									}),
                                ]
                            }).addStyleClass("headerContainerEmpleadoTabla")
                        ]
                    })
                })

            ]
        }).bindItems("/empleados/results", oTemplate).addStyleClass("customTable");
        
        this.empleadosTable.addDelegate({
            onAfterRendering: function() {
              var header = this.$().find('thead');
              var selectAllCb = header.find('.sapMCb');
              selectAllCb.remove();
              
              this.getItems().forEach(function(r) {
                var obj = r.getBindingContext().getObject();
                
                var cb = r.$().find('.sapMCb');
                var oCb = sap.ui.getCore().byId(cb.attr('id'));

                if(obj.DIAS_PEND == 0){
                	var fuera = getAttributeValue("/fueraDePlazoAprobacion");
            		oCb.setEnabled(!fuera);
                }else oCb.setEnabled(false);
              });
            }
          }, this.empleadosTable);

    },
    
    /**
     * Funcion que crea el dialogo para la gestion de las columnas de la tabla del manager
     */
    createTableSettingsDialog : function(){
    	
    	var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
    	
    	oView.tableSettingsDialog = new sap.m.Dialog({
            title: "{I18N>manager.seleccionColumnas}",
            content: [
                new sap.m.VBox({
                    items: [

                        new sap.m.VBox({
                            items: [

                                new sap.m.Bar({
                                    contentLeft: new sap.m.Title({
                                        text: "Generales"
                                    }),
                                    contentRight: [
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(1, true)
                                            },
                                            text: "{I18N>manager.marcarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone"),
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(1, false)
                                            },
                                            text: "{I18N>manager.quitarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone")
                                    ]

                                }),
                                new sap.m.HBox({
                                    items: [
                                        new sap.m.CheckBox({
                                            selected: true,
                                            enabled: false,
                                            text: "{I18N>informes.nombre}"
                                        }),
                                        new sap.m.CheckBox({
                                        	enabled: false,
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/DiasPend", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/DiasPend",
				        	            		formatter: function(valor){
				        	            			if(valor == "X")
				        	            				return true
			        	            				else return false
		        	            				}
				        	            	},
                                            text: "{I18N>manager.pendientes}"
                                        })
                                    ]
                                }).addStyleClass("checkboxContainerSeleccionColumnas")
                            ]
                        }),
                        new sap.m.VBox({
                			visible: {
                				parts :[  "/configuracion/MANAGER/MAN_G_DIF001/COL_HE_D",
                				          "/configuracion/MANAGER/MAN_G_DIF001/COL_JE_D",
                				          "/configuracion/MANAGER/MAN_G_DIF001/COL_FT_D",
                				          "/configuracion/MANAGER/MAN_G_DIF001/COL_FS_D",],
                				formatter: function(acceso, acceso2,acceso3, acceso4) {
                					if(acceso == "X" || acceso2 == "X" || acceso3 == "X" || acceso4 == "X" ){
                						return true;
                					} else {
                						return false;
                					}
                			 	}
                			},
                            items: [
                                new sap.m.Bar({
                                    contentLeft: new sap.m.Title({
                                        text: {
                                        	parts: ["I18N>manager.diferencial", "/reglas/HORS_JOR"],
                                        	formatter: function(texto, magnitud) {
                                        		
                                        		if (magnitud)
                            						return texto +" (" +getI18nText("compensaciones.jornadas")+")";
                            					else return texto +" (" + getI18nText("compensaciones.horas")+")";
                                        		
                                        	}
                                        }
                                    }),
                                    contentRight: [

                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(2, true)
                                            },
                                            text: "{I18N>manager.marcarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone"),
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(2, false)
                                            },
                                            text: "{I18N>manager.quitarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone")
                                    ]
                                }),
                                new sap.m.HBox({
                                    items: [
                                        new sap.m.CheckBox({
											visible: {
												path : "/configuracion/MANAGER/MAN_G_DIF001/COL_HE_D",
												formatter: util.Formatter.reactOnConfig
											},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Dif90", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Dif90",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>common.tipoJornada.prolongacion}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_DIF001/COL_JE_D",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Dif91", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Dif91",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>common.tipoJornada.extra}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_DIF001/COL_FT_D",
	                            				formatter: util.Formatter.reactOnConfig
                            				},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Dif92", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path :"/columnasManager/Dif92",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>common.tipoJornada.festivo}"
                                        }),
                                        new sap.m.CheckBox({
		                            			visible: {
		                            				path : "/configuracion/MANAGER/MAN_G_DIF001/COL_FS_D",
		                            				formatter: util.Formatter.reactOnConfig
		                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Dif93", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Dif93",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>common.tipoJornada.especial}"
                                        })
                                    ]
                                }).addStyleClass("checkboxContainerSeleccionColumnas")
                            ]
                        }),
                        new sap.m.VBox({
                			visible: {
                				parts :[  "/configuracion/MANAGER/MAN_G_SAL001/COL_HE_G",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_HE_C",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_JE_G",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_JE_C",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_FT_G",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_FT_C",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_FS_G",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_FS_C",],
                				formatter: function(acceso, acceso2,acceso3, acceso4,acceso5, acceso6,acceso7, acceso8) {
                					if(acceso == "X" || acceso2 == "X" || acceso3 == "X" || acceso4 == "X" ||
                							acceso5 == "X" || acceso6 == "X" ||acceso7 == "X" || acceso8 == "X"){
                						return true;
                					} else {
                						return false;
                					}
                			 	}
                			},
                            items: [
                                new sap.m.Bar({
                                    contentLeft: new sap.m.Title({
                                        text: {
                                        	parts: ["I18N>manager.saldosPeriodo", "/reglas/HORS_JOR"],
                                        	formatter: function(texto, magnitud) {
                                        		
                                        		if (magnitud)
                            						return texto +" (" +getI18nText("compensaciones.jornadas")+")";
                            					else return texto +" (" + getI18nText("compensaciones.horas")+")";
                                        		
                                        	}
                                        }
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
		                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_HE_G",
		                            				formatter: util.Formatter.reactOnConfig
		                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Gen90", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Gen90",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.prolongacion", "I18N>compensaciones.generadasA"],
                                            	formatter: function(prol, gen){
                                            		return prol + " " + gen;
                                            	}
                                            	
                                            }
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_HE_C",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Comp90", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Comp90",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.prolongacion", "I18N>compensaciones.compensadasA"],
                                            	formatter: function(prol, com){
                                            		return prol + " " + com;
                                            	}
                                            	
                                            }
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_JE_G",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Gen91", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Gen91",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.extra", "I18N>compensaciones.generadasA"],
                                            	formatter: function(extra, gen){
                                            		return extra + " " + gen;
                                            	}
                                            }
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_JE_C",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Comp91", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Comp91",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.extra", "I18N>compensaciones.compensadasA"],
                                            	formatter: function(extra, com){
                                            		return extra + " " + com;
                                            	}
                                            }
                                      }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_FT_G",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Gen92", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Gen92",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.festivo", "I18N>compensaciones.generadasA"],
                                            	formatter: function(fest, gen){
                                            		return fest + " " + gen;
                                            	}
                                            }
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_FT_C",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Comp92", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Comp92",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.festivo", "I18N>compensaciones.compensadasA"],
                                            	formatter: function(fest, com){
                                            		return fest + " " + com;
                                            	}
                                            }
                                    }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_FS_G",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Gen93", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Gen93",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.especial", "I18N>compensaciones.generadasA"],
                                            	formatter: function(esp, gen){
                                            		return esp + " " + gen;
                                            	}
                                            }
                                        }),
                                      new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_FS_C",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Comp93", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Comp93",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text:{
                                            	parts: ["I18N>common.tipoJornada.especial", "I18N>compensaciones.compensadasA"],
                                            	formatter: function(esp, gen){
                                            		return esp + " " + gen;
                                            	}
                                            }
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
                				parts :[  "/configuracion/MANAGER/MAN_G_SAL001/COL_JORN_PER",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_COM",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_REA",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_JOR",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_COM",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_REA",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_JOR",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_COM",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_REA",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_JOR",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_COM",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_REA",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_JOR",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_COM",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_REA",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_JOR",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_COM",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_REA",
                				          "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_JOR"],
                				formatter: function(acceso, acceso2,acceso3, acceso4,acceso5, acceso6,acceso7, acceso8,acceso9,
                						acceso10,acceso11, acceso12,acceso13, acceso14,acceso15, acceso16, acceso17, acceso18) {
                					if(acceso == "X" || acceso2 == "X" || acceso3 == "X" || acceso4 == "X" ||
                							acceso5 == "X" || acceso6 == "X" ||acceso7 == "X" || acceso8 == "X" ||
                							acceso9 == "X" || acceso10 == "X" ||acceso11 == "X" || acceso12 == "X"||
                							acceso13 == "X" || acceso14 == "X" ||acceso15 == "X" || acceso16 == "X"||
                							acceso17 == "X" || acceso18 == "X"){
                						return true;
                					} else {
                						return false;
                					}
                			 	}
                			},
                            items: [
                                new sap.m.Bar({
                                    contentLeft: new sap.m.Title({text: "{I18N>manager.saldosPeriodo}"}),
                                    contentRight: [
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(4, true)
                                            },
                                            text: "{I18N>manager.marcarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone"),
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(4, false)
                                            },
                                            text: "{I18N>manager.quitarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone")
                                    ]
                                }),
                                new sap.m.HBox({
                                    items: [
										
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_COM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/COND_COMP", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/COND_COMP",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_REA",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/COND_REAL", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/COND_REAL",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_COND_JOR",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/COND_JORN", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/COND_JORN",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_COM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/DIRE_COMP", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/DIRE_COMP",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_REA",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/DIRE_REAL", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/DIRE_REAL",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_DIRE_JOR",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/DIRE_JORN", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/DIRE_JORN",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_COM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/MONT_COMP", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/MONT_COMP",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_REA",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/MONT_REAL", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/MONT_REAL",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_MONT_JOR",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/MONT_JORN", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/MONT_JORN",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_COM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/REGU_COMP", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/REGU_COMP",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_REA",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/REGU_REAL", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/REGU_REAL",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_REGU_JOR",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/REGU_JORN", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/REGU_JORN",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_COM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/VIAJ_COMP", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/VIAJ_COMP",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_REA",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/VIAJ_REAL", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/VIAJ_REAL",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_VIAJ_JOR",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/VIAJ_JORN", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/VIAJ_JORN",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_COM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/TOTA_COMP", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/TOTA_COMP",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_REA",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/TOTA_REAL", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/TOTA_REAL",
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
	                            				path : "/configuracion/MANAGER/MAN_G_SAL001/COL_TOTA_JOR",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
											select: function(oEvt){
												  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
											  sap.ui.getCore().getModel().setProperty("/columnasManager/TOTA_JORN", seleccionado);
											},
				        	            	selected: {
				        	            		path : "/columnasManager/TOTA_JORN",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: {
										    	parts : ["I18N>manager.total", "I18N>manager.jornadas"],
										    	formatter: function(a, b) {
										    		return a + " " + b;
										    	}
										    }
                                        }),
                                        new sap.m.CheckBox({
											visible: {
												path : "/configuracion/MANAGER/MAN_G_SAL001/COL_JORN_PER",
												formatter: util.Formatter.reactOnConfig
											},
											select: function(oEvt){
												  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
											  sap.ui.getCore().getModel().setProperty("/columnasManager/NUM_JOR_HOR", seleccionado);
											},
											selected: {
												path : "/columnasManager/NUM_JOR_HOR",
												formatter: util.Formatter.selectWhenColumnaSelected
											},
										    text: {
										    	parts : ["I18N>common.unidades.jornadas", "I18N>manager.periodo"],
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
                                    contentLeft: new sap.m.Title({
                                        text: "{I18N>manager.acumulado}"
                                    }),
                                    contentRight: [
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(5, true)
                                            },
                                            text: "{I18N>manager.marcarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone"),
                                        new sap.m.Link({
                                            press: function() {
                                                oController.seleccionarColumnas(5, false)
                                            },
                                            text: "{I18N>manager.quitarTodos}"
                                        }).addStyleClass("sapUiHideOnPhone")
                                    ]
                                }),
                                new sap.m.HBox({
                                    items: [
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_KM",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Km", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Km",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.importeKM}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_DIET",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Dietas", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Dietas",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.importeDietas}"
                                        }),
                                        new sap.m.CheckBox({
		                            			visible: {
		                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_COMI",
		                            				formatter: util.Formatter.reactOnConfig
		                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Comida", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Comida",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.acumuladoComida}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_VIAJE",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Viaje", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Viaje",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.acumuladoViajes}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_PLWE",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Finde", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Finde",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.plusFinde}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_HOCO",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Hacom", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Hacom",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.horasComplementarias}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_IMJE",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Jext", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Jext",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.jExtra}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_IMFT",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Ftra", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Ftra",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.festivo}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_IMFE",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Fspc", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Fspc",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.fEspecial}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_JEVI",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Jevia", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Jevia",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.jExtraViaje}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_TTIME",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Ttime", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Ttime",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.tiempoViaje}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_TCOND",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/Tcond", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/Tcond",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.tiempoConduccion}"
                                        }),
                                        new sap.m.CheckBox({
	                            			visible: {
	                            				path : "/configuracion/MANAGER/MAN_G_ACU001/COL_PLUS_CON",
	                            				formatter: util.Formatter.reactOnConfig
	                            			},
		        	        	        	  select: function(oEvt){
		        	        	        		  var seleccionado = oEvt.getParameter("selected") == false? "" : "X";
		        	        	        		  sap.ui.getCore().getModel().setProperty("/columnasManager/PLUS_COND", seleccionado);
		        	        	        	  },
				        	            	selected: {
				        	            		path : "/columnasManager/PLUS_COND",
				        	            		formatter: util.Formatter.selectWhenColumnaSelected
				        	            	},
                                            text: "{I18N>manager.plusConduccion}"
                                        }),
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
                    press: function(oEvt) {
						oController.enviarColumnas();
                        oView.tableSettingsDialog.close();
                    }
                }),
                new sap.m.Button({
                	visible: {
                		path: "/columnasManager",
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
        	   }
           }

        }).bindElement("/manager/columnas").addStyleClass("dialogSeleccionColumnas customDialog");
    	
    	
    },
    
    getSubheader : function(oCon) {
    	
    	
    	var oView = oCon.getView();

		
		var empleadosSuggestionTemplate = new sap.m.SuggestionItem({
			key: "{ENAME}",
			text: "{ENAME}"
		});
		
		oView.personaNavigator = new sap.m.SearchField({
        			placeholder: "{I18N>manager.empleado}",
//        			value : string
        			width : "200px",
        			enableSuggestions : true,
        			search: function (oEvt) {
        				oCon.searchUser(oEvt);
        			}
		}).bindAggregation("suggestionItems","/empleados/results", empleadosSuggestionTemplate).addStyleClass("searchFieldDesktopManager sapUiHideOnPhone");
		
		
		oView.pendientesButton = new sap.m.ToggleButton({
			press: function(oEvt){
				
				var anadir = oEvt.getParameter("pressed");
				if(anadir == true)
					oCon.setFilterPendientes();
				else oCon.removeFilterPendientes();
				
				
			},
			text: "{I18N>manager.diasPendientes}",
//			icon: "sap-icon://employee-approvals"
		}).addStyleClass("pendientesDesktopManager sapUiHideOnPhone")
		
		
		oView.tipoEmpleado = new sap.m.SegmentedButton({
			
			selectedKey: "2",
			select: function(oEvt){
				var key = oEvt.getParameter("key");
				var filter;
				var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
				var oldFilters = oView.empleadosTable.getBinding("items").aFilters;
				if(key == "1"){
					var filter = new sap.ui.model.Filter("DIRECTO", sap.ui.model.FilterOperator.EQ, "X");
					if(oView.empleadosTable.getBinding("items").aFilters.length != 1 ||
    						oView.empleadosTable.getBinding("items").aFilters.length == undefined){
    					oCon.setInitialFilter();
    				}
					oldFilters[0].aFilters.push(filter);
//					oCon.showAprobarRechazarButtonsOnRespGer(true);
					oView.empleadosTable.getBinding("items").filter(oldFilters);
					
				}else {
					for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
						if(oldFilters[0].aFilters[i].sPath == "DIRECTO"){
							oldFilters[0].aFilters.splice(i,1);
							i--;
						}
					}
//					oCon.showAprobarRechazarButtonsOnRespGer(false);
					if(oldFilters[0].aFilters.length == 0){
						oView.empleadosTable.getBinding("items").filter(undefined);
					}else oView.empleadosTable.getBinding("items").filter(oldFilters);
				}
			},
			items: [
			        new sap.m.SegmentedButtonItem({
			        	visible: {
			        		path: "/userInfo/Rol/results",
			        		formatter:function(roles){
			        			if(roles){
					        		if(isResponsable() == false && isGerProd() == true){
					        			this.getParent().addStyleClass("uniqueSegmentedDesktopManagerTodos");
					        			return false;
					        		}else return true;
			        			}
				        	}
			        	},
			        	key: "1",
			        	text: "{I18N>manager.subordinados}"
			        }),
			        new sap.m.SegmentedButtonItem({
			        	visible: true,
			        	key: "2",
			        	text: "{I18N>manager.todos}"
			        })
			        ]
		}).addStyleClass("segmentedDesktopManager sapUiHideOnPhone");
		
		
		var sociedadSuggestionTemplate = new sap.m.SuggestionItem({
			key: "",
			text: "",
			description: ""
		});
		
		oView.sociedadNavigator = new sap.m.SearchField({
			placeholder: "{I18N>manager.sociedad}",
//			value : string
			width : "200px",
			enableSuggestions : true
		}).bindAggregation("suggestionItems","/sociedades/", sociedadSuggestionTemplate).addStyleClass("searchFieldDesktopManager sapUiHideOnPhone");
				

		oView.dayNavigator = new sap.suite.ui.commons.HeaderCell({
        	north: new sap.suite.ui.commons.HeaderCellItem({
//    			height:"100%",
        		content: new sap.m.Label({text: "{I18N>manager.seleccionar}"})
        	}),
        	south: new sap.suite.ui.commons.HeaderCellItem({
//        			height:"100%",
        			content: new sap.m.NumericContent({
        				scale: "{I18N>common.mes."+(new Date()).getMonth()+"}",
        				value: (new Date()).getDate(),
        				press: function(){
        					oView.daySelectionPopover.openBy(this)
        				}})
        		})     
        }).addStyleClass("customHeaderCell sapUiHideOnPhone");
		

		
		
		oView.personasPhoneButton = new sap.m.Button({
			icon : "sap-icon://filter",
			text: "{I18N>manager.filtros}",
			press: function( oEvent ){
				var oButton = oEvent.getSource();
				var eDock = sap.ui.core.Popup.Dock;
        		
        		oView.personasPhoneMenu.open(false, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
			}
		}).addStyleClass("periodoPhoneButton sapUiVisibleOnlyOnPhone"); 
			
		
		oView.personasPhoneMenu = new sap.ui.unified.Menu({
			items: [
			        new sap.ui.unified.MenuItem({
			        	key: "1",
			        	text: "{I18N>manager.diasPendientes}",
			        	select: function(oEvt){
			        		var element = oEvt.getSource();
			        		var selected = element.getCustomData()[0];
			        		
			        		if(selected != undefined){
				        		if(selected.getProperty("value") == true){
				        			selected.setProperty("value",false);
				        			element.bindProperty("text","/I18N>manager.diasPendientes");
				        			oCon.removeFilterPendientes();
	//			        			element.removeStyleClass("menuPhoneSelected")
				        		}else {
				        			selected.setProperty("value",true);
				        			element.bindProperty("text","/I18N>manager.sinFiltroDias");
				        			oCon.setFilterPendientes();
//				        			element.addStyleClass("menuPhoneSelected");
				        		}
			        		}else{
		        				element.addCustomData(new sap.ui.core.CustomData({
			        				key: "selected",
			        				value: true
			        			}));
			        			element.bindProperty("text","/I18N>manager.sinFiltroDias");
			        			oCon.setFilterPendientes();
//		        				element.addStyleClass("menuPhoneSelected")
			        		}
			        	}
			        }),
			        new sap.ui.unified.MenuItem({
			        	key: "2",
			        	text: "{I18N>manager.empleados}",
			        	submenu: [
							new sap.ui.unified.Menu({
								items: [
								        new sap.ui.unified.MenuItem({
								        	key: "21",
								        	text: "{I18N>manager.subordinados}",
								        	select: function(oEvt){
												var filter;
												var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
												var oldFilters = oView.empleadosTable.getBinding("items").aFilters;
												
												var filter = new sap.ui.model.Filter("DIRECTO", sap.ui.model.FilterOperator.EQ, "X");
												if(oView.empleadosTable.getBinding("items").aFilters.length != 1 ||
							    						oView.empleadosTable.getBinding("items").aFilters.length == undefined){
							    					oCon.setInitialFilter();
							    				}
												oldFilters[0].aFilters.push(filter);
//												oCon.showAprobarRechazarButtonsOnRespGer(true);
												oView.empleadosTable.getBinding("items").filter(oldFilters);
								        	}
								        }),
								        new sap.ui.unified.MenuItem({
								        	key: "22",
								        	text: "{I18N>manager.todos}",
								        	select: function(oEvt){
								        		var filter;
												var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
												var oldFilters = oView.empleadosTable.getBinding("items").aFilters;
												
								        		
								        		for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
													if(oldFilters[0].aFilters[i].sPath == "DIRECTO"){
														oldFilters[0].aFilters.splice(i,1);
														i--;
													}
												}
												
												if(oldFilters[0].aFilters.length == 0){
													oView.empleadosTable.getBinding("items").filter(undefined);
												}else oView.empleadosTable.getBinding("items").filter(oldFilters);

//												oCon.showAprobarRechazarButtonsOnRespGer(false);
								        	}
								        }),
								        ]
			        	        		
								}),
								]
			        }),
			        new sap.ui.unified.MenuTextFieldItem({
			        	key: "3",
			        	icon: "sap-icon://filter",
			        	text: "{I18N>manager.empleado}",
			        	select: function(oEvt){
	        				oCon.searchUser(oEvt);
			        	}
			        }),
			        ]
		}).addStyleClass("periodoPhoneButton sapUiVisibleOnlyOnPhone"); 
		
		
		oView.buttonsPeriodo =  new sap.m.SegmentedButton({
			selectedKey: {
				path: "/periodoManager/results",
				formatter: function(calendarioManager){
					
					var anterior = true;
					var today = util.Formatter.dateToString(new Date());
					
					if(calendarioManager != undefined){
						for(var i = 0; i<calendarioManager.length; i++){
							var actual = util.Formatter.stringToString(calendarioManager[i].ZhrDatum);
							if(actual == today){
								return "2";
							}
						}
						return "1";
					}
					
				}
			},
			items: [
			        new sap.m.SegmentedButtonItem({
			        	key: "1",
			        	enabled: {
			        		path: "/periodoManager/results",
			        		formatter: function(calendario){
			        			if(calendario != undefined){
			        				// Si estamos en diciembre no podremos navegar al mes anterior
			        				if(calendario[0].ZhrDatum.indexOf("2017-01") != -1 ){
			        					return false;
			        				}else return true;
			        				
			        				for(var i=0;i< calendario.length;i++){
				        				var date = util.Formatter.stringToDate(calendario[i].ZhrDatum);
				        				var hoy = new Date();
				        				hoy.setHours(0,0,0,0)
				        				
				        				if(date.getTime() == hoy.getTime())
				        					return true;
				        				
				        			}
				        			return false;
			        			}
			        		}
			        	},
//			        	icon: "sap-icon://arrow-left",
			        	text: "{I18N>common.periodo.anterior}",
			        	press: function(oEvt){
			        		
			        		
			        		var firstDate = getAttributeValue("/periodoManager/results")[0].ZhrDatum;
			        		var today = new Date(); //new Date(2016,10,22)
			        		
			        		var maxDate = util.Formatter.stringToDate(firstDate);
			        		maxDate.setDate(maxDate.getDate()-1);
			        		var newMaxDate = util.Formatter.dateToString(maxDate);
			        		oCon.getCalendarioManager(newMaxDate);
			        	}
			        		
			        }),
			        new sap.m.SegmentedButtonItem({
			        	key: "2",
			        	enabled: {
			        		path: "/periodoManager/results",
			        		formatter: function(calendario){
			        			
			        		}
			        	},
//			        	icon: "sap-icon://arrow-right",
			        	text: "{I18N>common.periodo.actual}",
			        	press: function(oEvt){
			        		
			        		var periodoLength = getAttributeValue("/periodoManager/results").length;
			        		var lastDate = getAttributeValue("/periodoManager/results")[periodoLength-1].ZhrDatum;
			        		var today = new Date(); //new Date(2016,10,22)
			        		
			        		var maxDate = util.Formatter.stringToDate(lastDate);
			        		maxDate.setDate(maxDate.getDate()+1);
			        		var newMaxDate = util.Formatter.dateToString(maxDate);
			        		
			        		var calendario = getAttributeValue("/periodoManager/results");
			        		
			        		for(var i=0;i< calendario.length;i++){
		        				var date = util.Formatter.stringToDate(calendario[i].ZhrDatum);
		        				var hoy = new Date();
		        				hoy.setHours(0,0,0,0)
		        				
		        				if(date.getTime() == hoy.getTime())
		        					return false;
		        				
		        			}
		        			oCon.getCalendarioManager(newMaxDate);
			        	}
			        })
			        ]
		}).addStyleClass("buttonsPeriodo buttonsPeriodoManager")
		
		
		var subheader = new sap.m.Bar({
			contentLeft:[
				        // Dia
				        oView.buttonsPeriodo,],
			contentRight: [// Empleado por nombre
//					         oView.sociedadNavigator,
					         oView.personaNavigator,
					        // Subordinados				        
					        oView.tipoEmpleado,
					        // Con horas pendientes
					        oView.pendientesButton,
					        oView.personasPhoneButton
						        ]
		}).addStyleClass("appSubHeader appSubHeaderManager");
		
		return subheader;
		
    }
    


});