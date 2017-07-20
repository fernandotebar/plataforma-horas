jQuery.sap.require("sap.m.MessageBox");

sap.ui.jsfragment("fragment.DialogoHora", {
	
	createContent: function(oCon) {
		
		var oView  = oCon.getView();
		var oTemplateConcepto = new sap.ui.core.Item({
    	   key: {
    		   path: "Lgahr",
    		   formatter: function(concepto) {
    			   if(concepto == "PJEV"){
    				   this.setEnabled(false);
    			   }
    			   return concepto;
    		   }
    	   	},
			text: "{Lghtx}",
       });
		
		
		oView.conceptoHoraSelect = new sap.m.Select({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita", "Lgahr"],
				formatter: util.Formatter.modificarOnStahd
			},
			change: function(oEvt){
				var concepto = oEvt.getParameter("selectedItem").getKey();
				var path = oView.conceptoHoraDialog.getBindingContext().getPath();
				setAttributeValue(path+"/Cobrar", "");
				setAttributeValue(path+"/Directo", "");
				setAttributeValue(path+"/Lgahr", concepto);
			},
			width: "100%",
			selectedKey: {
				path: "Lgahr",
				formatter: function(concepto){
					var path = oView.conceptoHoraDialog.getBindingContext().getPath();
					if(concepto == undefined){
						setAttributeValue(path+"/Lgahr", "TURN");
						return "TURN";
					}else {
						setAttributeValue(path+"/Lgahr", concepto);
						return concepto;
					}
				}
			}
		}).bindItems("/conceptosHoraSelect/results",oTemplateConcepto);
		
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
				parts: ["/responsableEdita", "/gerenteEdita","/configuracion/REPORTE/REP_REPOR001/HOR_EPEP"],
				formatter: function(responsableEdita, gerenteEdita, acceso){
					if((responsableEdita == true || gerenteEdita == true) && acceso == "X"){
						return true;
					}else return false;
				}
			},
			width: "100%",
			selectedKey: "{Pspnr}",
		}).bindItems("/elementosPEP/results",oTemplatePEP);
		
		var oTemplateDirecto = new sap.ui.core.Item({
	    	   key: "{DOMVALUE_L}",
				text: "{DDTEXT}",
		});
		
		var tipoDirectoSelect = new sap.m.Select({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			width: "100%",
			forceSelection: false,
			selectedKey: "{Directo}",
		}).bindItems("/tipoDirecto/results",oTemplateDirecto);
		
		
		var oTemplateCategoria = new sap.ui.core.Item({
	    	   key: "{ZCATEGPROF}",
				text: "{TEXTO}",
		});
		
		
		var suggestionTemplate = new sap.m.SuggestionItem({
	    	   key: "{ZCATEGPROF}",
				text: "{TEXTO}",
		});
		
		oView.categoriaSearch = new sap.m.SearchField({
	        	placeholder: "{I18N>common.seleccionar}",
	        	enabled: {
					parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
					formatter: util.Formatter.modificarOnStahd
				},
	        	search: function(oEvt){
	        		var selection = oEvt.getParameter("suggestionItem");
	        		if(selection != undefined){
		        		var keySelected = selection.getProperty("key");
		        		oView.categoriaSearch.setValue(keySelected);
		        		var binding = oView.conceptoHoraDialog.getBindingContext().getPath();
		        		setAttributeValue(binding+"/IdCategoria",keySelected);
	        		}

					var path = oView.conceptoHoraDialog.getBindingContext().getPath();
	        		if(oEvt.getParameter("clearButtonPressed") == true){
	        			sap.ui.getCore().getModel().setProperty(path+"/IdCategoria", undefined);
	        		}
	        	},
	        	value: {
	        		parts: ["IdCategoria", "/categorias/results"],
	        		formatter: function(cat, categorias){
	        			
	        			if(categorias != undefined){
	        				
	        				for(var i=0;i<categorias.length;i++){
	        					if(categorias[i].ZCATEGPROF == cat){
	        						return categorias[i].TEXTO;
	        					}
	        				}
	        			}
	        		}
	        	},
	        	enableSuggestions: true,
	        	maxLength: 9999,
	        	suggest: function(event){
	        		var value = event.getParameter("suggestValue");
	    			var filters = [];
	    			if (value) {
	    				filters = new sap.ui.model.Filter("TEXTO", sap.ui.model.FilterOperator.Contains,value)
	    			}
	     
	    			oView.categoriaSearch.getBinding("suggestionItems").filter(filters);
	    			oView.categoriaSearch.suggest();
	        	}
        }).bindAggregation("suggestionItems", "/categorias/results", suggestionTemplate);
		
		
		var categoriaSelect = new sap.m.Select({
			selectedKey: "{IdCategoria}",
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
		}).bindItems("/categorias/results",oTemplateCategoria);
		
		var descripcion = new sap.m.TextArea({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			maxLength : 50,
			value: "{Dschr}",
			}).addStyleClass("textAreaConcepto");
		
		oView.horaCitacion = new sap.m.TimePicker({
			width: "100%",
			enabled: false,
//			enabled: {
//				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
//				formatter: util.Formatter.modificarOnStahd
//			},
			value:  {
				parts: ["Beghr","Endhr", "Lgahr"] , //{Citacion}",
				formatter: function(inicio, fin, concepto){
					var path = oView.conceptoHoraDialog.getBindingContext().getPath();
					if(concepto == "TRTI"){
						sap.ui.getCore().getModel().setProperty(path+"/Citacion", inicio);
						return inicio;
					} else if( concepto == "TRTV"){
						sap.ui.getCore().getModel().setProperty(path+"/Citacion", fin);
						return fin;
					}
				}
			},
			displayFormat:"HH:mm"
			
		});
		
		oView.horaInicio = new sap.m.TimePicker({
			width: "100%",
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			value:  "{Beghr}",
			displayFormat:"HH:mm"
			
		});
		oView.horaFin = new sap.m.TimePicker({
			width: "100%",
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			value: "{Endhr}",
			displayFormat:"HH:mm"
		});
		
		oView.radioButtonCategoria = new sap.m.RadioButtonGroup({
        	enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			selectedIndex : {
				parts: ["Zplus","Zcategoria","Zsuperior", "/gerenteEdita", "/responsableEdita"],
				formatter : function(plus, cate, supe, gerente, responsable){
					
					var path = oView.conceptoHoraDialog.getBindingContext().getPath();
					if(plus == "X"){
	        			return 0;
					}
						
					if(plus == "" && cate == "" && supe == "" || plus == undefined && cate == undefined && supe == undefined){
						return 0;
					}
					
					if(cate == "X"){
						if(responsable == undefined && gerente == undefined){
	        	  			getCategorias(false, "1");
	        	  		}else getCategorias(true, "1");
	        			return 1;
					}
					
					if(supe == "X"){
						if(responsable == undefined && gerente == undefined){
	        	  			getCategorias(false, "2");
	        	  		}else getCategorias(true, "2");
	        			return 2;
					}
					
				}
				
			},
        	select: function(oEvt){
        		var selected = oEvt.getParameter("selectedIndex");
        		var path = oEvt.getSource().getBindingContext().getPath()
        		if(selected ==0){
        			sap.ui.getCore().getModel().setProperty(path+"/Zplus", "X");
        			sap.ui.getCore().getModel().setProperty(path+"/IdCategoria", undefined);
        			sap.ui.getCore().getModel().setProperty(path+"/Zcategoria", "");
        			sap.ui.getCore().getModel().setProperty(path+"/Zsuperior", "");
        		}else
        		if(selected == 1){
        			sap.ui.getCore().getModel().setProperty(path+"/Zplus", "");
        			sap.ui.getCore().getModel().setProperty(path+"/Zcategoria", "X");
        			sap.ui.getCore().getModel().setProperty(path+"/Zsuperior", "");
        		}else
        		if(selected == 2){
        			sap.ui.getCore().getModel().setProperty(path+"/IdCategoria", undefined);
        			sap.ui.getCore().getModel().setProperty(path+"/Zplus", "");
        			sap.ui.getCore().getModel().setProperty(path+"/Zcategoria", "");
        			sap.ui.getCore().getModel().setProperty(path+"/Zsuperior", "X");
        		}
        		
        	},
        	buttons: [new sap.m.RadioButton({
        				text: "{I18N>conceptosHora.plus}"
        				}),
        	          new sap.m.RadioButton({
        	        	  	text: (sap.ui.Device.system.phone == false)?"{I18N>conceptosHora.dentro}" : "{I18N>conceptosHora.dentroA}" ,
        	        	  	select: function(){
        	        	  		
        	        	  		var responsableEdita = getAttributeValue("/responsableEdita");
        	        	  		var gerenteEdita = getAttributeValue("/gerenteEdita");
        	        	  		
        	        	  		if(responsableEdita == undefined && gerenteEdita == undefined){
        	        	  			getCategorias(false, "1");
        	        	  		}else getCategorias(true, "1");
        	        	  		
        	        	  	}
        	          }),
        	          new sap.m.RadioButton({
        	        	  	text: "{I18N>conceptosHora.superior}",
        	        	  	select: function(){
        	        	  		
        	        	  		var responsableEdita = getAttributeValue("/responsableEdita");
        	        	  		var gerenteEdita = getAttributeValue("/gerenteEdita");
        	        	  		
        	        	  		if(responsableEdita == undefined && gerenteEdita == undefined){
        	        	  			getCategorias(false, "2");
        	        	  		}else getCategorias(true, "2");
        	        	  		
        	        	  	}
	        		  })
        	           ]
        });
		
		
		
		oView.produccion = new sap.m.Input({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			value: "{Produccion}"
		});
		
		var oTemplateDescripciones = new sap.m.Token({
			key : "{TEXT}",
			text : "{TEXT}",
			press: function(oEvt){
				
				
				var texto = this.getBindingContext().getObject().TEXT;
				var produccionesPath = oView.produccion.getBindingContext().getPath()+"/Produccion";
				var producciones = sap.ui.getCore().getModel().getProperty(produccionesPath);
				if(!producciones){
					producciones = "";
				}
				if ( producciones.indexOf(texto) < 0){
					producciones = texto;
					this.setSelected(false);
				}
				sap.ui.getCore().getModel().setProperty(produccionesPath, producciones);
			}
		});
		
		oView.descripcionProducciones = new sap.m.MultiInput({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			enableMultiLineMode : true
		}).bindAggregation("tokens", "/descripcionesProduccion/results",oTemplateDescripciones)
        
		var conceptoHoraDialog = new sap.m.Dialog({
			showHeader: true,
//			draggable: true,
			customHeader: new sap.m.Bar({
				contentMiddle: new sap.m.Text({text: "{I18N>conceptosHora.dialogo.title}"})
			}),
			content: [
			        /*
			         * Inicio container de prioridad de compensacion.
			         * SECCION: Reporte
			         * FUNCIONALIDAD: Compensacion
			         * FRAME: Prioridad
			         */
					new sap.m.HBox({
						visible: {
							parts: ["Lgahr","/responsableEdita", "/gerenteEdita", "/categoriaEmpleado/ZFREE_COMPEN", "/configuracion/REPORTE/REP_COMPE001/COM_PRI1"],
        	        		formatter: function(concepto, responsable, gerente, compensaLibre, acceso){
        	        			if(acceso == "X"){
	        	        			if(compensaLibre == true){
	        	        				return false;
	        	        			}
	    	        				if((conceptoEsCompensacion(concepto) == true) && (responsable == undefined && gerente == undefined)){
	    	        					return true;
	    	        				} else return false;
        	        			} else return false;
        	        		}
						},
						justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
					 	items: [
					      new sap.m.VBox({
					    	  items: [
					    	        new sap.m.Title({text: "{I18N>conceptosHora.prioridad}"}).addStyleClass("titlesDialogConceptos"),
					    	        new sap.m.HBox({
					    	        	items: [
					    	        	        
					    	        	        new sap.m.VBox({
					    	        	        	visible : {
					    	        	        		path: "/reglas/COMPRI_1",
					    	        	        		formatter: function(visibilidad) {
					    	        	        			if(visibilidad)
					    	        	        				return true;
					    	        	        			else return false;
					    	        	        		}
					    	        	        	},
					    	        	        	width: "30%",
					    	        	        	items: [
					    	        	        	        new sap.m.Text({text: "1"}).addStyleClass("ordenItemOrdenCompensacion"),
					    	        	        	        new sap.m.Text({
					    	        	        	        	text: {
					    	        	        	        		parts: ["/reglas/COMPRI_1", "/textosBolsas/results"],
						    	        	        				formatter: function(prioridad, textos) {
						    	        	        					if(prioridad){
						    	        	        						for(var i = 0;i<textos.length;i++) {
							    	        	        						if(prioridad[""][""].ID_CONC1 == textos[i].KTART){
							    	        	        							return textos[i].KTEXT;
							    	        	        						}
							    	        	        					}
						    	        	        					}
						    	        	        					
						    	        	        				}
					    	        	        	        	}
					    	        	        	        }).addStyleClass("titleItemOrdenCompensacion"),
					    	        	        	        ]
					    	        	        }).addStyleClass("itemOrdenCompensacion"),
					    	        	        new sap.m.VBox({
					    	        	        	visible : {
					    	        	        		path: "/reglas/COMPRI_2",
					    	        	        		formatter: function(visibilidad) {
					    	        	        			if(visibilidad)
					    	        	        				return true;
					    	        	        			else return false;
					    	        	        		}
					    	        	        	},
					    	        	        	width: "25%",
					    	        	        	items: [
					    	        	        	        new sap.m.Text({text: "2"}).addStyleClass("ordenItemOrdenCompensacion"),
					    	        	        	        new sap.m.Text({
					    	        	        	        	text: {
					    	        	        	        		parts: ["/reglas/COMPRI_2", "/textosBolsas/results"],
						    	        	        				formatter: function(prioridad, textos) {
						    	        	        					if(prioridad){
						    	        	        						for(var i = 0;i<textos.length;i++) {
							    	        	        						if(prioridad[""][""].ID_CONC1 == textos[i].KTART){
							    	        	        							return textos[i].KTEXT;
							    	        	        						}
							    	        	        					}
						    	        	        					}
						    	        	        				}
					    	        	        	        	}
					    	        	        	        }).addStyleClass("titleItemOrdenCompensacion"),
					    	        	        	        ]
					    	        	        }).addStyleClass("itemOrdenCompensacion"),
					    	        	        new sap.m.VBox({
					    	        	        	visible : {
					    	        	        		path: "/reglas/COMPRI_3",
					    	        	        		formatter: function(visibilidad) {
					    	        	        			if(visibilidad)
					    	        	        				return true;
					    	        	        			else return false;
					    	        	        		}
					    	        	        	},
					    	        	        	width: "20%",
					    	        	        	items: [
					    	        	        	        new sap.m.Text({text: "3"}).addStyleClass("ordenItemOrdenCompensacion"),
					    	        	        	        new sap.m.Text({
					    	        	        	        	text: {
					    	        	        	        		parts: ["/reglas/COMPRI_3", "/textosBolsas/results"],
						    	        	        				formatter: function(prioridad, textos) {
						    	        	        					if(prioridad){
						    	        	        						for(var i = 0;i<textos.length;i++) {
							    	        	        						if(prioridad[""][""].ID_CONC1 == textos[i].KTART){
							    	        	        							return textos[i].KTEXT;
							    	        	        						}
							    	        	        					}
						    	        	        					}
						    	        	        				}
					    	        	        	        	}
					    	        	        	        }).addStyleClass("titleItemOrdenCompensacion"),
					    	        	        	        ]
					    	        	        }).addStyleClass("itemOrdenCompensacion"),
					    	        	        new sap.m.VBox({
					    	        	        	visible : {
					    	        	        		path: "/reglas/COMPRI_4",
					    	        	        		formatter: function(visibilidad) {
					    	        	        			if(visibilidad)
					    	        	        				return true;
					    	        	        			else return false;
					    	        	        		}
					    	        	        	},
					    	        	        	width: "25%",
					    	        	        	items: [
					    	        	        	        new sap.m.Text({text: "4"}).addStyleClass("ordenItemOrdenCompensacion"),
					    	        	        	        new sap.m.Text({
					    	        	        	        	text: {
					    	        	        	        		parts: ["/reglas/COMPRI_4", "/textosBolsas/results"],
						    	        	        				formatter: function(prioridad, textos) {
						    	        	        					if(prioridad){
						    	        	        						for(var i = 0;i<textos.length;i++) {
							    	        	        						if(prioridad[""][""].ID_CONC1 == textos[i].KTART){
							    	        	        							return textos[i].KTEXT;
							    	        	        						}
							    	        	        					}
						    	        	        					}
						    	        	        				}
					    	        	        	        	}
					    	        	        	        }).addStyleClass("titleItemOrdenCompensacion"),
					    	        	        	        ]
					    	        	        }).addStyleClass("itemOrdenCompensacion")
					    	        	        
					    	        	        
					    	        	        ]
					    	        }).addStyleClass("ordenCompensacion")
					    	          
					    	          ]
					      }).addStyleClass("formDialogContainer formDialogFullWidth containerOrdenCompensacion"),
					      
				      ]}),
			        /*
			         * Fin container de prioridad de compensacion.
			         * SECCION: Reporte
			         * FUNCIONALIDAD: Compensacion
			         * FRAME: Prioridad
			         */
				      
				    /*
				     * Inicio container de seleccion de concepto horario, elemento PEP y restantes hasta negativos de compensacion
				     */
					new sap.m.HBox({
						justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
		        	 	items: [
				          new sap.m.VBox({
				        	  visible: {
			        	        	parts: ["Lgahr","/responsableEdita", "/gerenteEdita", "/userInfo/compensaLibre","/configuracion/REPORTE/REP_REPOR001/HOR_EPEP"],
		        	        		formatter: function(concepto, responsableEdita, gerenteEdita, acceso){
		        	        			if(acceso == "X"){
		        	        				this.addStyleClass("formDialogFullWidth");
		        	        			}
		        	        			if(responsableEdita != undefined || gerenteEdita != undefined){
		        	        				this.addStyleClass("formDialogFullWidth");
		        	        			}else{
		        	        				if(conceptoEsCompensacion(concepto) == true){
		        	        					this.removeStyleClass("formDialogFullWidth");
		        	        				} else this.addStyleClass("formDialogFullWidth");
		        	        				
		        	        			}
		        	        			return true;
		        	        		}
			        	        },
				        	  items: [
				        	        new sap.m.Title({text: "{I18N>conceptosHora.selecciona}"}).addStyleClass("titlesDialogConceptos"),
				        	        oView.conceptoHoraSelect
				        	          
				        	          ]
				          }).addStyleClass("formDialogContainer"),
				          
				          new sap.m.VBox({
			        	        visible: {
			        	        	parts: ["Lgahr","/responsableEdita", "/gerenteEdita", "/userInfo/compensaLibre","/configuracion/REPORTE/REP_REPOR001/HOR_EPEP"],
		        	        		formatter: function(concepto, responsableEdita, gerenteEdita, accesoPEP){
		        	        			
		        	        			if(responsableEdita != undefined || gerenteEdita != undefined){
		        	        				if(accesoPEP == "X"){
			        	        				this.addStyleClass("formDialogFullWidth");
			        	        				return true;
			        	        			}else return false;
		        	        			}else{
//		        	        				if(accesoPEP == "X"){
//			        	        				this.addStyleClass("formDialogFullWidth");
//			        	        			}
		        	        				if(conceptoEsCompensacion(concepto) == true){
		        	        					this.removeStyleClass("formDialogFullWidth");
		        	        					return true;
		        	        				} else{
		        	        					this.addStyleClass("formDialogFullWidth");
		        	        					return false;
		        	        				}
		        	        				
		        	        			}
		        	        		}
			        	        },
				        	  items: [
			        	        new sap.m.Title({
			        	        	text:{
			        	        		parts: ["Lgahr","/responsableEdita", "/gerenteEdita","/configuracion/REPORTE/REP_REPOR001/HOR_EPEP"],
			        	        		formatter: function(concepto, responsableEdita, gerenteEdita, accesoPEP){
			        	        			if(accesoPEP == "X"){
			        	        				this.addStyleClass("formDialogFullWidth");
			        	        			}
			        	        			if(responsableEdita != undefined || gerenteEdita != undefined && accesoPEP == "X"){
			        	        				return getI18nText("conceptosHora.pep");
			        	        			}else{
			        	        				if(conceptoEsCompensacion(concepto) == true){
			        	        					return getI18nText("conceptosHora.horasCompensacion");
			        	        				}
			        	        				
			        	        			}
			        	        		}
			        	        	}
			        	        		
			        	        		}).addStyleClass("titlesDialogConceptos"),
				        	       
				        	        elementoPEPSelect,
				        	       new sap.m.Input({
				        	    	   visible: {
				        	    		   parts : ["Lgahr", "/informacionDia/detalleparte/results/0/Stahd" , "/responsableEdita", "/gerenteEdita", "/userInfo/compensaLibre"],
				       					formatter: function(concepto, status, responsableEdita, gerenteEdita, compensa){
				       						if(conceptoEsCompensacion(concepto) == false){
				    							return false;
				    						}
					    					if(status == "E"){
					    						if(gerenteEdita != undefined || responsableEdita != undefined){
					    							return false;
					    						}
					    					}else {
					    						if(gerenteEdita != undefined || responsableEdita != undefined){
					    							return false;
					    						}
					    						
					    						return true;
					    					}
				       					}},
		        	    			   enabled: false,
				        	    	   value: {
				        	    		   parts: [ "Lgahr","/compensaciones/results", "/compensacionesAntiguas/results"  , "/responsableEdita", "/gerenteEdita","/reglas/COMPENSA"],
				        	    		   formatter: function(concepto, compensaciones, antiguas, responsableEdita, gerenteEdita, compensa){
				        	    			   
				        	    			   if(gerenteEdita != undefined || responsableEdita != undefined){
				        	    				   return "";
				        	    			   }
				        	    			   var tipoComp, diferenciaCompensada, bolsa, comps;
				        	    			   if(conceptoEsCompensacion(concepto) == true) {	
				        	    				   // Es compensacion actual
				        	    				   if(compensa[concepto]) {
				        	    					   bolsa = compensa[concepto][""].ID_CONC1;
				        	    					   comps = compensaciones;
				        	    				   // Es compensacion antigua
				        	    				   }else {
				        	    					   bolsa = concepto.substring(2,4);
				        	    					   comps = antiguas
				        	    				   }
				        	    				   for(var i =0;i<comps.length;i++) {				        	    					   
				        	    					   if(comps[i].Ktart == bolsa){
				        	    						   diferenciaCompensada = comps[i].Anzhl - comps[i].Kverb;
							        	    			   return diferenciaCompensada;
				        	    					   }
				        	    				   }
				        	    				   
				        	    			   }
				        	    			   return "";
				        	    			   
				        	    		   }
				        	    	   }
				        	       })   
				        	          ]
				          }).addStyleClass("formDialogContainer"),
			          ]
					}).addStyleClass("conceptoPEPContainer"),
				/*
			     * Fin container de seleccion de concepto horario, elemento PEP y restantes hasta negativos de compensacion
			     */
					
				/*
				 * Inicio container de hora de inicio y fin
				 */
				new sap.m.HBox({
					 layoutData: new sap.ui.layout.GridData({
				    	   span: "L6 M6 S12"
				       }),
					justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
		        	  items: [
			          new sap.m.VBox({
							 layoutData: new sap.ui.layout.GridData({
						    	   span: "L6 M6 S12"
						       }),
			        	  items: [
			        	        new sap.m.Title({text: "{I18N>conceptosHora.inicio}"}).addStyleClass("titlesDialogConceptos"),
			        	        oView.horaInicio
			        	          
			        	          ]
			          }).addStyleClass("formDialogContainer"),
			          new sap.m.VBox({
							 layoutData: new sap.ui.layout.GridData({
						    	   span: "L6 M6 S12"
						       }),
			        	  items: [
			        	        new sap.m.Title({text: "{I18N>conceptosHora.fin}"}).addStyleClass("titlesDialogConceptos"),
			        	        oView.horaFin
			        	          ]
			          }).addStyleClass("formDialogContainer")
			          ]
          		}),
          		/*
				 * Fin container de hora de inicio y fin
				 */
          		
          		/*
          		 * Inicio container descripcion de concepto y check de cobrar
          		 */
          		new sap.m.HBox({
					 layoutData: new sap.ui.layout.GridData({
				    	   span: "L6 M6 S12"
				       }),
					justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
		        	  items: [
			          new sap.m.VBox({
			        	  visible: {
			        		parts : ["Lgahr",
			        		         "/configuracion/REPORTE/REP_REPOR001/HOR_DESC"],
			        		formatter: function(concepto, acceso){
			        			
			        			var seleccion = getAttributeValue("/configuracion/REPORTE/REP_REPOR001/HOR_COB_"+concepto);
			        			if(acceso == "X"){
			        				if(seleccion == "X"){
		        	    				   this.removeStyleClass("formDialogFullWidth");
				        			}else this.addStyleClass("formDialogFullWidth");
				        			return true;
			        			}else{
			        				this.addStyleClass("formDialogFullWidth");
			        				return false;
			        			}
			        		}
			        	  },
			        	  items: [
							new sap.m.Title({text: "{I18N>conceptosHora.descripcion}"}).addStyleClass("titlesDialogConceptos"),
							descripcion
			        	          
			        	          ]
			          }).addStyleClass("formDialogContainer"),
			          
			          /*
				         * Inicio container cobrar.
				         * SECCION: Reporte
				         * FUNCIONALIDAD: Cobrar
				         * FRAME: Dialogo hora
				         */
			          new sap.m.VBox({

	        	    	   visible: {
	        	    		   	parts : ["Lgahr",
	        	    		   	         "/informacionDia/detalleparte/results/0/Stahd" ,
	        	    		   	         "/responsableEdita", "/gerenteEdita",],
		       					formatter: function(concepto, status, responsableEdita, gerenteEdita){

				        			var seleccion = getAttributeValue("/configuracion/REPORTE/REP_REPOR001/HOR_COB_"+concepto);
	       							if(seleccion == "X"){
		       							return true;
		       						}else return false;
		       					}
	        	    	   },
			        	  items: [
			        	        new sap.m.Title({text: "{I18N>conceptosHora.cobrar}"}).addStyleClass("titlesDialogConceptos"),
			        	        new sap.m.CheckBox({
				        				enabled: {
				        					parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				        					formatter: util.Formatter.modificarOnStahd
				        				},
				        	    	   selected: {
				        	    		   path: "Cobrar",
				        	    		   formatter: function(cobrar){
				        	    			   
				        	    			   if(cobrar == undefined || cobrar == ""){
				        	    				   return false;
				        	    			   }else return true;
				        	    		   }
				        	    	   },
				        	    	   select : function(oEvt){
				       						var path = oView.conceptoHoraDialog.getBindingContext().getPath();
				        	    		   var selected = oEvt.getParameter("selected");
				        	    		   if(selected == true){
				        	    			   setAttributeValue(path+"/Cobrar", "X")
				        	    		   } else  setAttributeValue(path+"/Cobrar", "")
				        	    	   }
				        	       })
		        	          ]
			          }).addStyleClass("formDialogContainer")
			          /*
				         * Fin container cobrar.
				         * SECCION: Reporte
				         * FUNCIONALIDAD: Cobrar
				         * FRAME: Dialogo hora
				         */
			          ]
          			}),
	      			/*
			         * Inicio container funciones superiores.
			         * SECCION: Reporte
			         * FUNCIONALIDAD: superiores
			         * FRAME: Dialogo hora
			         */
		          new sap.m.HBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
					       }),
		        	  	visible: {
		        	  		parts: ["Lgahr", "/conceptosHora/results","/configuracion/REPORTE/REP_REPOR001/HOR_FSUP"],
		        	  		formatter: function(concepto, conceptos, acceso){
		        	  			if(acceso == "X"){
		        	  				if(conceptoEsCompensacion(concepto) == true){
										return false;
									}else{
										if(conceptoAcumulaNoEstaOculto(concepto) == true)
											return true;
		        	  					else return false;
				        	  				
				        	  			
									}
		        	  			} else return false;
		        	  			
		        	  		}
		        	  	},
						justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
			        	  items: [
				          new sap.m.VBox({
				        	  visible : {
				        		  parts: ["Zplus","Zcategoria","Zsuperior"],
		        					formatter : function(plus, cate, supe){
		        						
		        						var path = oView.conceptoHoraDialog.getBindingContext().getPath();
  	        						if(plus == "X"){
  	        							this.addStyleClass("formDialogFullWidth");
  	        						}
  	        							
  	        						if(plus == "" && cate == "" && supe == "" || plus == undefined && cate == undefined && supe == undefined){
  	        							this.addStyleClass("formDialogFullWidth");
  	        						}
		        						
  	        						if(cate == "X"){
  	        							this.removeStyleClass("formDialogFullWidth");
  	        						}
  	        						
  	        						if(supe == "X"){
  	        							this.removeStyleClass("formDialogFullWidth");
  	        						}
		        						return true;
		        					}
				        	  },
				        	  
					        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosHora.funciones}"}).addStyleClass("titlesDialogConceptos"),
					        	        oView.radioButtonCategoria
					        	          
					        	          ]
					          }).addStyleClass("formDialogContainer formDialogFullWidth"),
					          new sap.m.VBox({

						  			visible: {
						  				parts: ["Zplus","Zcategoria","Zsuperior"],
						  				formatter : function(plus, cate, supe){
						  					if(plus == "X" || (plus == undefined && cate == undefined && supe == undefined)|| (plus == "" && cate == "" && supe == ""))
						  						return false;
						  					else return true;
						  				}
						  			},
					        	  items: [
					        	        new sap.m.Title({
					        	        	text: "{I18N>conceptosHora.categoria}"
					        	        		}).addStyleClass("titlesDialogConceptos"),
			        	        		oView.categoriaSearch
					        	          ]
					          }).addStyleClass("formDialogContainer formDialogFullWidth")
				          ]
		          		}).addStyleClass("conceptoPEPContainer"),
		          		/*
				         * Fin container funciones superiores.
				         * SECCION: Reporte
				         * FUNCIONALIDAD: superiores
				         * FRAME: Dialogo hora
				         */
		          		/*
						 * Inicio container de hora de citacion para viajes
						 */
						new sap.m.HBox({
							 layoutData: new sap.ui.layout.GridData({
						    	   span: "L6 M6 S12"
						       }),
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	  items: [
					          new sap.m.VBox({
									 layoutData: new sap.ui.layout.GridData({
								    	   span: "L6 M6 S12"
								       }),
								       visible: {
							        		parts : ["Lgahr","/reglas/VI_CI_IN","/configuracion/REPORTE/REP_REPOR001/HOR_CIT","/informacionDia/detalleparte/results/0/DentroFuera"],
							        		formatter: function(concepto, reglas, acceso, dentroFuera){
							        			
							        			if(reglas) {
							        				if(acceso == "X" && reglas[concepto] && reglas[concepto][dentroFuera]){
								        				this.addStyleClass("formDialogFullWidth");
									        			return true;
								        			}else{
								        				return false;
								        			}
							        			} else return false;
							        			
							        		}
							        	  },
						        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosHora.horaCitacion}"}).addStyleClass("titlesDialogConceptos"),
					        	        oView.horaCitacion
					        	          
					        	          ]
					          }).addStyleClass("formDialogContainer")
					          ]
		          		}),
		          		/*
						 * Inicio container de tipo de directo
						 */
						new sap.m.HBox({
							 layoutData: new sap.ui.layout.GridData({
						    	   span: "L6 M6 S12"
						       }),
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	  items: [
					          new sap.m.VBox({
									 layoutData: new sap.ui.layout.GridData({
								    	   span: "L6 M6 S12"
								       }),
								       visible: {
							        		parts : ["Lgahr", "/configuracion/REPORTE/REP_REPOR001/HOR_DIR", "/informacionDia/detalleparte/results/0/DentroFuera"],
							        		formatter: function(concepto, acceso, dentroFuera){
							        			if(acceso == "X"){
						        	  				if(conceptoEsCompensacion(concepto) == true){
														return false;
													}else{
														if(conceptoAcumulaNoEstaOculto(concepto) == true && dentroFuera == "2"){
									        				this.addStyleClass("formDialogFullWidth");
									        				return true;
														} else return false;
								        	  				
													}
						        	  			} else return false;
							        		}
							        	  },
						        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosHora.tipoDirecto}"}).addStyleClass("titlesDialogConceptos"),
					        	        tipoDirectoSelect
					        	          
					        	          ]
					          }).addStyleClass("formDialogContainer")
					          ]
		          		}),
		          		/*
						 * Inicio container de descripcion de la produccion
						 */
						new sap.m.HBox({
							 layoutData: new sap.ui.layout.GridData({
						    	   span: "L6 M6 S12"
						       }),
							justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
				        	  items: [
					          new sap.m.VBox({
									 layoutData: new sap.ui.layout.GridData({
								    	   span: "L6 M6 S12"
								       }),
								       visible: {
							        		parts : ["Lgahr","/configuracion/REPORTE/REP_REPOR001/HOR_PROD", "Directo", "/informacionDia/detalleparte/results/0/DentroFuera"],
							        		formatter: function(concepto, acceso, directo, dentroFuera){
							        			if(acceso == "X"){
						        	  				if(conceptoEsCompensacion(concepto) == true){
														return false;
													}else{
														if(conceptoAcumulaNoEstaOculto(concepto) == true && directo != "" && dentroFuera == "2"){
									        				this.addStyleClass("formDialogFullWidth");
									        				return true;
														} else return false;
													}
						        	  			} else return false;
							        		}
							        	  },
						        	  items: [
					        	        new sap.m.Title({text: "{I18N>conceptosHora.descProduccion}"}).addStyleClass("titlesDialogConceptos"),
					        	        oView.produccion,
					        	        new sap.m.Title({text: "{I18N>conceptosHora.clicarAnadirProduccion}"}).addStyleClass("titlesDialogConceptos"),
						        	    oView.descripcionProducciones,
					        	        new sap.m.TextArea({
					        	        	visible: false,
					        				enabled: {
					        					parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
					        					formatter: util.Formatter.modificarOnStahd
					        				},
					        				maxLength : 50,
					        				value: "{Produccion}",
					        				}).addStyleClass("textAreaConcepto")
					        	          
					        	          ]
					          }).addStyleClass("formDialogContainer")
					          ]
		          		}),
		          
		          		]
			,
			beforeOpen: function(oEvt){
				
        	   if(window.pageYOffset > 0) {
        		   this.addStyleClass("moveCustomDialog")
        	   }
//        	    getDescripcionProduccion();
				removeStripsDialogHora();
			},
			buttons:[
				new sap.m.Button({
					text: "{I18N>common.aceptar}",
					press: function(oEvt){
						var correct = oCon.validarDialogHora(oView.conceptoHoraDialog.getBindingContext(),"C");
						if(correct == true)
							oCon.closeAddItemDialog();
					}
				}),
				new sap.m.Button({
					text: "{I18N>common.cancelar}",
					press: function(){
						oCon.removeListItemConcepto(oView.conceptoHoraDialog.getBindingContext(),true);
						oCon.closeAddItemDialog();
					}
				}),
				new sap.m.Button({
					text: "{I18N>common.terminar}",
					press: function(){
						
						var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
						
						var responsableEdita = getAttributeValue("/responsableEdita");
						var gerenteEdita = getAttributeValue("/gerenteEdita");
						var modo = "E";
						
						if( responsableEdita == true){
							if( status != "E" && status != "M"){
								modo = "V";
							}
						}
						if(gerenteEdita == true){
							if(status == "A" || status == "N" || status == "E" || status == "M") {
								modo = "V";
							}
						}
						
						var correct = oCon.validarDialogHora(oView.conceptoHoraDialog.getBindingContext(), modo);
						if(correct == true)
							oCon.closeAddItemDialog();
						
					}
				})
			         
			         
	         ]
		}).addStyleClass("customDialog")
		
		return conceptoHoraDialog;
	}

});