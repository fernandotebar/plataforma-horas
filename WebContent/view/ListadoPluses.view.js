sap.ui.jsview("view.ListadoPluses", {

	
	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Informes
	*/ 
	getControllerName : function() {
		return "view.ListadoPluses";
	},
	
	onBeforeShow: function(oEvt) {

    	var oController = this.getController();
    	oController.onBeforeShowCalls();
    	controlDelegar(this);

    },

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Informes
	*/ 
	createContent : function(oController) {
		
		this.header = sap.ui.jsfragment("fragment.AppHeader", this.getController());
		var fn = this;
		var subHeader = fn.createSubheader(oController);
		var contentPluses = this.createTable(oController);

		var selectionContainer
		if(sap.ui.Device.system.phone == true){
			selectionContainer = this.createSelectionContainerPhone(oController);
		}
		
 		return new sap.m.Page({
			customHeader: this.header,
			showSubHeader: true,
			subHeader: subHeader,
			content: [
			          selectionContainer,
			          contentPluses
			          ]
		});
	},
	
	createSubheader : function(oController){
		
		var oView = this;
		
		var oTemplate = new sap.ui.core.Item({
        	key: "{Begda}",
        	text: {
        		parts: ["Begda", "Endda"],
        		formatter: function(inicio, fin){
        			
        			inicio = inicio.substring(6,19)
        			fin = fin.substring(6,19)
        			
        			var dateIni = new Date(parseInt(inicio));
        			var dateFin = new Date(parseInt(fin));
        			
        			return util.Formatter.dateToString4(dateIni) +" - "+util.Formatter.dateToString4(dateFin);
        		}
        	}
		})
		
		oView.periodoSelect = new sap.m.Select({
			selectedKey: function(){
				
				var today = new Date();
				var mes = today.getMonth();
				return mes;
			}(),
		}).bindItems("/periodoListados/results", oTemplate).addStyleClass("appSubHeaderPlusesPicker appSubHeaderPlusesSelect");
		
		oView.buttonConsultar = new sap.m.Button({
			text: "Consultar",
			icon: "sap-icon://display",
			press: oController.getListadoPluses
		}).addStyleClass("buttonAccionPluses")
		
		oView.buttonDescargar = new sap.m.Button({
	  		  icon: "sap-icon://download",
	  		  text: "Descargar",
			  press: function(oEvt){
				  
				  var seleccionado = oView.buttonsConceptos.getSelectedKey()
				  
				  if(seleccionado == "3" || seleccionado == "2"){
					  oView.confirmationDownloadDialog.open();
				  }else oController.exportar();
			  },
			  enabled: {
				  path: "/listadoPluses",
				  formatter: function(table){
					  
					  if(table == undefined || table.length == 0){
						  return false;
					  }else return true;
				  }
			  }
		  }).addStyleClass("buttonAccionPluses");
		
		oView.buttonsEmpleados =  new sap.m.SegmentedButton({
			selectedKey: "2",
			select: function(oEvt){
				var key = oEvt.getParameter("key");
				var filter;
				var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
				var oldFilters = oView.plusesTable.getBinding("items").aFilters;
				if(key == "1"){
					var filter = new sap.ui.model.Filter("DIRECTO", sap.ui.model.FilterOperator.EQ, "X");
					if(oView.plusesTable.getBinding("items").aFilters.length != 1 ||
    						oView.plusesTable.getBinding("items").aFilters.length == undefined){
    				}
					
				}else {
					for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
						if(oldFilters[0].aFilters[i].sPath == "DIRECTO"){
							oldFilters[0].aFilters.splice(i,1);
							i--;
						}
					}
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
			        	text: "{I18N>manager.subordinados}",
//			        	press: 
			        		
			        }),
			        new sap.m.SegmentedButtonItem({
			        	visible: {
			        		path: "/userInfo/Rol/results",
			        		formatter:function(roles){
			        			if(roles){
					        		if(isResponsable() == true && isGerProd() == false){
					        			oView.buttonsEmpleados.setSelectedKey("1");
					        			this.getParent().addStyleClass("uniqueSegmentedDesktopManagerPendientes");
					        			return false;
					        		}else return true;
			        			}
				        	}
			        	},
			        	key: "2",
			        	text: "{I18N>manager.todos}",
//			        	press: 
			        	
			        })
			        ]
		}).addStyleClass("segmentedDesktopManager sapUiHideOnPhone");
		
		oView.buttonsConceptos =  new sap.m.SegmentedButton({
			selectedKey: "1",
			items: [
			        new sap.m.SegmentedButtonItem({
			        	key: "1",
			        	text: "{I18N>informes.pluses.gastos}",
			        	press: oController.setPlusesGeneradosFilter
			        		
			        }),
			        new sap.m.SegmentedButtonItem({
			        	key: "2",
			        	text: "{I18N>informes.pluses.pluses}",
			        	press: oController.setGastosJornadaFilter
			        }),
			        new sap.m.SegmentedButtonItem({
			        	key: "3",
			        	text: "{I18N>informes.pluses.todos}",
			        	press: oController.setTodosFilter
			        })
			        ]
		}).addStyleClass("segmentedDesktopPluses sapUiHideOnPhone");
		
		var oBar = new sap.m.Bar({
			contentLeft:[  new sap.m.Button({
								icon: "sap-icon://nav-back",
				//				text: "{I18N>empleado.irEmpleados}",
								press: function(){
									var app = sap.ui.getCore().byId(Common.App.Name);
									app.backDetail();
								}
							}).addStyleClass("atrasButtonEmpleado"),
							new sap.m.HBox({
								items: [
								        oView.periodoSelect,
								        (sap.ui.Device.system.phone == true)? undefined : [oView.buttonConsultar,oView.buttonDescargar],
						        		
								        ]
							})
			],
			contentRight: [oView.buttonsEmpleados,
			        		oView.buttonsConceptos]
          }).addStyleClass("appSubHeader appSubHeaderManager appSubHeaderPluses");
		
		return oBar;
		
	},
	
	createSelectionContainerPhone : function(oController){
		
		var radioButtonsContainer = new sap.m.VBox({
			items: [
			        new sap.m.VBox({
			        	items : [
			        	         new sap.m.Label({text: "{I18N>manager.empleados}"}),
						          new sap.m.RadioButtonGroup({
						        	  columns: 1,
						        	  buttons: [
						        	            new sap.m.RadioButton({
						        	            	text: "{I18N>manager.subordinados}"
						        	            }),
						        	            new sap.m.RadioButton({
						        	            	text: "{I18N>manager.todos}"
						        	            })
						        	            ]
						          })
			        	]
			        }),
			        new sap.m.VBox({
			        	items: [
			        	        new sap.m.Label({text: "{I18N>common.conceptos}"}),
						          new sap.m.RadioButtonGroup({
						        	  columns: 1,
						        	  buttons: [
						        	             new sap.m.RadioButton({
						        	            	text: "{I18N>informes.pluses.gastos}"
						        	            }),
						        	            new sap.m.RadioButton({
						        	            	text: "{I18N>informes.pluses.pluses}"
						        	            }),
						        	            new sap.m.RadioButton({
						        	            	text: "{I18N>informes.pluses.todos}"
						        	            })
						        	            ]
						          })
			        	]
			        })
			        
			        ]
		}).addStyleClass("containerRadiobuttonsListadosPhone");
		
		return radioButtonsContainer;
		
	},
	
	createTable : function(oController){
		

		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
        if(sap.ui.Device.system.phone == true){
        	return new sap.m.HBox({
        		items:  [new sap.m.Button({
				  		  icon: "sap-icon://download",
				  		  text: "Descargar",
						  press: oController.getListadoPluses
					  }).addStyleClass("buttonConsultarListadoPhone")]
        	}).addStyleClass("hBoxListadoPhone");
        }
        		
		var oTemplate = new sap.m.ColumnListItem({
			cells: [
			        new sap.m.Text({text: "{Pernr}"	}),
			        new sap.m.Text({text: "{Ename}"	}),
			        new sap.m.Text({text: "{Lgart}"	}),
			        new sap.m.Text({
			        	text: {
			        		path:  "Betrg",
			        		formatter: function(importe){
			        			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			        				  maxFractionDigits: 2,
			        				  groupingEnabled: true,
			        				  groupingSeparator: ".",
			        				  decimalSeparator: ","
			        				});
			        			
			        			
			        			if(importe != undefined){
			        				importe = oNumberFormat.format(importe);
			        				return importe;
			        			}
			        		}
			        	}
	        		}),
			        new sap.m.Text({
			        	text: {
			        		path:  "Anzdy",
			        		formatter: function(importe){
			        			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			        				  maxFractionDigits: 2,
			        				  groupingEnabled: true,
			        				  groupingSeparator: ".",
			        				  decimalSeparator: ","
			        				});
			        			
			        			
			        			if(importe != undefined){
			        				importe = oNumberFormat.format(importe);
			        				return importe;
			        			}
			        		}
			        	}
			        }),
			        new sap.m.Text({text: "{Zcomentario}"	}),
			        new sap.m.Text({
			        	text: {
			        			path: "Zposnr",
			        			formatter: function(pep){
			        				
			        				
			        				var hayGuion = pep.indexOf("-") != -1;
			        				while (hayGuion == true){
			        					pep = pep.replace('-' , '');
			        					hayGuion = pep.indexOf('-') != -1
			        				}
			        				pep = pep.replace("/" , "");
			        				
			        				var longitud = 17 - pep.length;
			        				
			        				if(longitud <17){
			        					for(var i =0;i<longitud;i++){
			        						pep += "0"
			        					}
			        					
			        				}
			        				
			        				return pep;
			        			}
			        			}
			        }),
			        new sap.m.Text({text: "{Temporada}"	})
			        ]
		}).addStyleClass("itemReportes");
		
		
		
		
		oView.plusesTable = new sap.m.Table({
            growing: true,
            growingThreshold: 15,
            growingScrollToLoad: true,
			columns: [

			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>manager.persona}"})
			          }),
			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>informes.nombre}"})
			          }),
			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>informes.concepto}"})
			          }),
			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>conceptosDia.valor}"})
			          }),
			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>conceptosDia.cantidad}"})
			          }),
			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>informes.comentario}"})
			          }),
			          new sap.m.Column({
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>conceptosHora.pep}"})
			          }),
			          new sap.m.Column({
			        	  visible: false,
			        	  width: "10%",
	  		            	 hAlign: sap.ui.core.TextAlign.Center,
	  		            	minScreenWidth : "480px",
		            	 demandPopin : true,
		            	 popinDisplay: sap.m.PopinDisplay.Inline,
			        	  header: new sap.m.Text({text: "{I18N>informes.temporada}"})
			          })
			          ]
		}).bindItems("/listadoPluses",oTemplate).addStyleClass("customTable");

		return oView.plusesTable;
	},
	
	createConfirmationDownloadDialog : function(oCon){
		
		var fn = this;
		
		fn.confirmationDownloadDialog = new sap.m.Dialog({
			showHeader: true,
			draggable: true,
			title: "{I18N>common.confirmar}",
			type: 'Message',
			content: new sap.m.Text({ text:  "{I18N>informes.pluses.descarga}" }),
			beginButton: new sap.m.Button({
				text: "{I18N>common.aceptar}",
				press: function (oEvt) {
					oCon.exportar(oEvt);
					fn.confirmationDownloadDialog.close();
				}
			}),
			endButton: new sap.m.Button({
				text: "{I18N>common.cancelar}",
				press: function () {
					fn.confirmationDownloadDialog.close();
				}
			})
		}).addStyleClass("customDialog");
		
	},

});