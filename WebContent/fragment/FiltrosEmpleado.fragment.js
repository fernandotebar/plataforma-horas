sap.ui.jsfragment("fragment.FiltrosEmpleado", {
	
	
	createContent: function(oCon) {
		
		var oView = oCon.getView();

		oView.atrasButton = new sap.m.Button({
			icon: "sap-icon://nav-back",
//			text: "{I18N>empleado.irEmpleados}",
			press: oCon.onNavBack
		}).addStyleClass("atrasButtonEmpleado"); 
		
		oView.horasCompensadas = new sap.m.ToggleButton({
			visible: {
				path : "/configuracion/MANAGER/MAN_D_FIL001/FIL_COM",
				formatter: util.Formatter.reactOnConfig
			},
			text: "{I18N>empleado.conCompensadas}",
			press: function(oEvt){
				
				var anadir = oEvt.getParameter("pressed");
				if(anadir == true)
					oCon.setCompensadasFilter();
				else oCon.removeCompensadasFilter();
			}
		}).addStyleClass("pendientesDesktopManager sapUiHideOnPhone");
		
		oView.horasGeneradas = new sap.m.ToggleButton({
			visible: {
				path : "/configuracion/MANAGER/MAN_D_FIL001/FIL_GEN",
				formatter: util.Formatter.reactOnConfig
			},
			text: "{I18N>empleado.conGeneradas}",
			press: function(oEvt){
				var anadir = oEvt.getParameter("pressed");
				if(anadir == true)
					oCon.setGeneradasFilter();
				else oCon.removeGeneradasFilter();
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
						oCon.setInitialFilter();
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
					oCon.setInitialFilter();
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
				oCon.removeEstadoFilter();
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
			        		oCon.setSinEnviarFilter();
			        	}
			        		
			        }),
			        new sap.m.SegmentedButtonItem({
			        	key: "2",
//			        	icon: "sap-icon://arrow-right",
			        	text: "{I18N>empleado.diasTodos}",
			        	press: function(oEvt){


			        		oCon.setTodosFilter();
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
												oCon.setCompensadasFilter();
											}
										}),
										new sap.ui.unified.MenuItem({
											key: "2",
											text: "{I18N>empleado.conGeneradas}",
											select: function(oEvt){
												oCon.setGeneradasFilter();
											}
										}),
										new sap.ui.unified.MenuItem({
											key: "2",
											text: "{I18N>empleado.borrarHoras}",
											select: function(oEvt){
												oCon.removeCompensadasFilter();
												oCon.removeGeneradasFilter();
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
								        		oCon.setSinEnviarFilter();
								        	}
								        }),
								        new sap.ui.unified.MenuItem({
								        	key: "32",
								        	text: "{I18N>empleado.diasTodos}",
								        	select: function(oEvt){
								        		oCon.setTodosFilter();
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