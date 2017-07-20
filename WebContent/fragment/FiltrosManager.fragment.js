sap.ui.jsfragment("fragment.FiltrosManager", {
	
	
	createContent: function(oCon) {
		
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
			        	text: "{I18N>manager.todos}",
			        	visible: {
			        		path: "/empleados/results",
			        		formatter: function(empleados) {
			        			
			        			if(empleados != undefined){
			        				for(var i =0;i<empleados.length;i++) {
				        				
				        				if(empleados[i].DIRECTO != "X"){
				        					return true;
				        				}
				        			}
			        				oView.tipoEmpleado.setSelectedKey("1");
				        			this.getParent().addStyleClass("uniqueSegmentedDesktopManagerPendientes");
				        			return false;
			        			}
			        			
			        		}
			        	}
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
			        /*
			         * LISTA DE PERIODOS
			         */
					new sap.m.SegmentedButtonItem({
						visible: {
							path : "/configuracion/REPORTE/REP_CALEN001/CAL_PERI",
							formatter: util.Formatter.reactOnConfig
						},
						key: "0",
						icon: "sap-icon://expand-group",
						text:  "{I18N>common.periodo.seleccione}",
						press: function(oEvt){
							var oItemTemplate = new sap.m.StandardListItem({
								key: "{Begda}",
								visible : {
									parts: ["Begda", "Endda" ],
									formatter: function(inicio, fin) {
										
										var fechaMax = getConstante("PLVIPA_M");
										var fin = fin.substring(6,19);
										
										var inicio = inicio.substring(6,19);
					        			inicio = new Date(parseInt(inicio));
					        			inicio.setHours(0);
					        			
					        			var fin = new Date(parseInt(fin));
					        			fin.setHours(0);
					        			fechaMax.setHours(0);
					        			
					        			if ( inicio.getTime() < fechaMax.getTime()) {
							 	            return false;
							 	        }else return true;
									}
								},
					        	title: {
					        		parts: ["Begda", "Endda"],
					        		formatter: function(inicio, fin){
					        			
					        			inicio = inicio.substring(6,19)
					        			fin = fin.substring(6,19)
					        			
					        			var dateIni = new Date(parseInt(inicio));
					        			var dateFin = new Date(parseInt(fin));
					        			
					        			return util.Formatter.dateToString4(dateIni) +" - "+util.Formatter.dateToString4(dateFin);
					        		}
					        	},
					        	info: {
					        		parts: ["Begda", "/periodos/results/0/Begda"],
					        		formatter: function(inicio, inicioPeriodo){
					        			
					        			var inicio = inicio.substring(6,19);
					        			inicio = new Date(parseInt(inicio));
					        			inicio.setHours(0);
					        			
					        			var inicioPeriodo = inicioPeriodo.substring(6,19);
					        			inicioPeriodo = new Date(parseInt(inicioPeriodo));
					        			inicioPeriodo.setHours(0);
					        			
					        			if(inicio.getTime() == inicioPeriodo.getTime()){
					        				this.addCustomData(new sap.ui.core.CustomData({
					        					key: "actual",
					        					value: true
					        				}));
					        				return getI18nText("common.periodo.actual");
					        			}else {
					        				this.addCustomData(new sap.ui.core.CustomData({
					        					key: "actual",
					        					value: false
					        				}));
					        				
					        			}
					        			
					        		}
					        	}
							}).addStyleClass("itemSelectDialogPeriod");
							var selectPeriodo = new sap.m.SelectDialog({
								title: "{I18N>common.periodo.title}",
								confirm: function(oEvt){
									
									var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
							        var oController = oView.getController();
									var item = oEvt.getParameter("selectedItem");
									var data = item.getBindingContext().getObject();
									var customData = item.getCustomData()[0];
									
									var inicio = data.Begda.substring(6,19)
				        			var fin = data.Endda.substring(6,19)
				        			
				        			var dateIni = new Date(parseInt(inicio));
				        			var dateFin = new Date(parseInt(fin));
														        		
				        			if(customData.getValue() == true) {
				        				oView.buttonsPeriodo.setSelectedKey("2");
				        			}
				        			
					        		oView.empleadosTable.removeSelections(true);
					        		oCon.getCalendarioManager(util.Formatter.dateToString(dateFin));
								},
								cancel: function(){
									
									
								}
							}).bindAggregation("items", "/periodos/results", oItemTemplate).addStyleClass("selectDialogPeriod");
							
							selectPeriodo.open();
							
						}
							
					}),
			        new sap.m.SegmentedButtonItem({
            			visible: {
            				path : "/configuracion/MANAGER/MAN_G_CAL001/CAL_PREV",
            				formatter: util.Formatter.reactOnConfig
            			},
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
			        		oView.empleadosTable.removeSelections(true);
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
			        		oView.empleadosTable.removeSelections(true);
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