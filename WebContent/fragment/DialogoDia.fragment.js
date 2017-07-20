sap.ui.jsfragment("fragment.DialogoDia", {
	
	createContent: function(oCon) {
		
		var oView = oCon.getView();		
		var oTemplateConcepto = new sap.ui.core.Item({
	    	   key: "{Lgady}",
				text: "{Lgdtx}",
		});
		
		var conceptoDiaSelect = new sap.m.Select({
			// Tocado el formatter (antes {Lgady}
			selectedKey: {
				path: "Lgady",
				formatter: function(concepto){
					var path = oView.conceptoDiaDialog.getBindingContext().getPath();
					if(concepto == undefined){
						setAttributeValue(path+"/Lgady", "DIIS");
						setAttributeValue(path+"/Zeidy", "020");
						setAttributeValue(path+"/Waers", "EUR");
						return "DIIS";
					}else {
						setAttributeValue(path+"/Lgady", concepto);
						return concepto;
					}
				}
			},
			change: function(oEvt){
				
				var path = oView.conceptoDiaDialog.getBindingContext().getPath();
				
				
				var selected = oEvt.getParameter("selectedItem").getBindingContext().getObject();
				var ud = selected.Zeinh;
				oView.udsMedida.setSelectedKey(ud)
				removeStripsDialogDia();
				setAttributeValue(path+"/Lgady", selected.Lgady);
				setAttributeValue(path+"/Anzdy", "");
				setAttributeValue(path+"/Zeidy", selected.Zeinh);
				setAttributeValue(path+"/Waers", "EUR");
				var objectToCalc = oView.conceptoDiaDialog.getBindingContext().getObject()
				if(objectToCalc.Lgady == "KLMT"){
					setAttributeValue("/importeConceptoDia/IMPORTE_UN", undefined);
	        		oView.conceptoDiaDialog.getButtons()[0].setEnabled(false);
				}else {
					var app = sap.ui.getCore().byId("app");
					var vista = app.getCurrentDetailPage();
					vista.getController().calcularImporteDieta(objectToCalc);
					oView.conceptoDiaDialog.getButtons()[0].setEnabled(true);
				}
			},
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
		}).bindItems("/conceptosDia/results",oTemplateConcepto);
		
		var oTemplatePEP = new sap.ui.core.Item({
	    	   key: "{Pspnr}",
				text: "{Post1}",
		});
		

		var elementoPEPSelect = new sap.m.Select({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			visible: {
				parts: ["/responsableEdita", "/gerenteEdita"],
				formatter: function(responsableEdita, gerenteEdita){
					if(responsableEdita == true || gerenteEdita == true){
						return true;
					}else return false;
				}
			},
			selectedKey: "{Pspnr}",
			width: "250px",
		}).bindItems("/elementosPEP/results",oTemplatePEP);
		
		var oTemplateUdsMedida = new sap.ui.core.Item({
	    	   key: "{ZEINH}",
				text: "{ETEXT}",
		});
		
		oView.udsMedida = new sap.m.Select({
			enabled: false,
			selectedKey: "{Zeidy}"
		}).bindItems("/udsMedida/results",oTemplateUdsMedida);
		
		var conceptoDiaDialog = new sap.m.Dialog({
			showHeader: true,
			customHeader: new sap.m.Bar({
				contentMiddle: new sap.m.Text({text: "{I18N>conceptosDia.titulo}"})
			}),
			content: [
			          new sap.m.HBox({
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
			        	  items: [			        	          
								new sap.m.VBox({
									visible: {
				        	        	parts: ["/responsableEdita", "/gerenteEdita"],
			        	        		formatter: function(concepto, responsableEdita, gerenteEdita){
			        	        			if(responsableEdita == undefined || gerenteEdita == undefined){
			        	        				this.addStyleClass("formDialogFullWidth");
			        	        			}else{
			        	        				this.removeStyleClass("formDialogFullWidth");
			        	        				} 
			        	        				
			        	        			
			        	        			return true;
			        	        		}
				        	        },
								  items: [
								        new sap.m.Title({text: "{I18N>conceptosDia.selecciona}"}).addStyleClass("titlesDialogConceptos"),
								        conceptoDiaSelect
								          
								          ]
								}).addStyleClass("formDialogContainer"),
		        	          
								 new sap.m.VBox({
									 visible: {
					        	        	parts: ["/responsableEdita", "/gerenteEdita"],
				        	        		formatter: function(concepto, responsableEdita, gerenteEdita){
				        	        			if(responsableEdita == undefined || gerenteEdita == undefined){
				        	        				this.addStyleClass("formDialogFullWidth");
				        	        			}else{
				        	        				this.removeStyleClass("formDialogFullWidth");
				        	        				} 
				        	        				
				        	        			
				        	        			return true;
				        	        		}
					        	        },
					        	        visible: {
					        	        	parts: ["/responsableEdita", "/gerenteEdita"],
				        	        		formatter: function( responsableEdita, gerenteEdita){
				        	        			if(responsableEdita != undefined || gerenteEdita != undefined){
				        	        				return true;
				        	        			}else return false;
				        	        		}
					        	        },
						        	  items: [
						        	        new sap.m.Title({
						        	        	text:{
						        	        		parts: ["Lgahr","/responsableEdita", "/gerenteEdita"],
						        	        		formatter: function(concepto, responsableEdita, gerenteEdita){
						        	        			if(responsableEdita != undefined || gerenteEdita != undefined){
						        	        				return getI18nText("conceptosHora.pep");
						        	        			}
						        	        		}
						        	        	}
				        	        		
				        	        		}).addStyleClass("titlesDialogConceptos"),
						        	        elementoPEPSelect
						        	          ]
						          }).addStyleClass("formDialogContainer"),
			        	          ]
			          }).addStyleClass("conceptoPEPContainer"),
			          
			          new sap.m.HBox({
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
			        	 items: [new sap.m.VBox({
				        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosDia.valor}"}).addStyleClass("titlesDialogConceptos"),
										new sap.m.Input({
											enabled: false,
											value: {
												parts: ["IMPORTE_UN", "TOTAL"],
												formatter : function(importe, total){
													var path = oView.conceptoDiaDialog.getBindingContext().getPath();
													var lgady = oView.conceptoDiaDialog.getBindingContext().getObject().Lgady;
													var anzdy = oView.conceptoDiaDialog.getBindingContext().getObject().Anzdy;
													var valor;
													if(lgady == "KLMT" ){
														
														if((importe != undefined && total == "") || (importe != undefined && total == undefined) ){
															valor = importe * anzdy;
														}else{
															valor = total;
														}
													} else valor = importe;
													setAttributeValue(path+"/Betdy", ""+valor);
													return valor;
													
														
													
													
												}
											}
										}).bindObject("/importeConceptoDia")
					        	          
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
			        	  visible: {
								parts: ["/informacionDia/detalleparte/results/0/Stahd", "Lgady" , "/conceptosDia/results"],
								formatter: function(status, conceptoDia, conceptos){
									if(status == "E" )
										return false;
									else{
										if(conceptoDia != undefined){
											for(var i =0;i<conceptos.length;i++){
												
												if(conceptoDia == conceptos[i].Lgady){
													if( conceptos[i].Zeinh == "051")
														return true;
												}
												
											}
											return false;
										}else {
											return false;
										}
									}
									
									
								}
							},
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	 items: [new sap.m.VBox({

									visible: {
										parts: ["/informacionDia/detalleparte/results/0/Stahd", "Lgady" , "/conceptosDia/results"],
										formatter: function(status, conceptoDia, conceptos){
											if(status == "E" )
												return false;
											else{
												if(conceptoDia != undefined){
													for(var i =0;i<conceptos.length;i++){
														
														if(conceptoDia == conceptos[i].Lgady){
															if( conceptos[i].Zeinh == "051")
																return true;
														}
														
													}
													return false;
												}
											}
										}
									},
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
						        	  visible: {
											parts: ["/informacionDia/detalleparte/results/0/Stahd", "Lgady" , "/conceptosDia/results"],
											formatter: function(status, conceptoDia, conceptos){
												if(status == "E" )
													return false;
												else{
													if(conceptoDia != undefined){
														for(var i =0;i<conceptos.length;i++){
															
															if(conceptoDia == conceptos[i].Lgady){
																if( conceptos[i].Zeinh == "051")
																	return true;
															}
															
														}
														return false;
													}else {
														return false;
													}
												}
												
												
											}
										},
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
						        	        		
						        	        		var data = oView.conceptoDiaDialog.getBindingContext().getObject();
						        	        		var cantidadValue = data.Anzdy;
						        	        		if(cantidadValue >0){
							        	        		oCon.calcularImporteDieta(data);
							        	        		oView.conceptoDiaDialog.getButtons()[0].setEnabled(true);
						        	        		}
						        	        	}
						        	        }).addStyleClass("conceptoDiaBotonCalcular")
						        	          
						        	          ]
						          }).addStyleClass("formDialogContainer")] 
				          })
			          
			          
			],
			afterOpen: function(){
				var binding = this.getBindingContext().getObject();
				
				var app = sap.ui.getCore().byId("app");
				var vista = app.getCurrentDetailPage();
				
				
				vista.getController().calcularImporteDieta(binding);
				
			},
			
			beforeClose: function(oEvt){
				if(window.pageYOffset > 0) {
				   this.addStyleClass("moveCustomDialog")
				}
				removeStripsDialogDia();
			},
			buttons:[
						new sap.m.Button({
							enabled: true,
					text: "{I18N>common.aceptar}",
					press: function(oEvt){
						var correct = oCon.validarDialogDia(oView.conceptoDiaDialog.getBindingContext());
						if(correct == true)
							oCon.closeAddItemDialog();
					}
				}),
				new sap.m.Button({
					text: "{I18N>common.cancelar}",
					press: function(){
						oCon.removeListItemConcepto(oView.conceptoDiaDialog.getBindingContext(), true);
						oCon.closeAddItemDialog();
					}
				}),
				new sap.m.Button({
					text: "{I18N>common.terminar}",
					press: function(){
						var correct = oCon.validarDialogDia(oView.conceptoDiaDialog.getBindingContext());
						if(correct == true)
							oCon.closeAddItemDialog();
					}
				})
					         
					         
			         ]     
		}).addStyleClass("customDialog")
		
		return conceptoDiaDialog;
		
	}

});
		