// DEV

sap.ui.jsfragment("fragment.Compensaciones", {
	
	createContent: function(oCon) {
	
		var oView = oCon.getView();
		
		oView.selectCompensaciones = new sap.m.Select({
			selectedKey: "0",
        	items: [
					new sap.ui.core.Item({
						key: "0",
						text: "{I18N>compensaciones.prolongacion}",
						visible: {
							path : "/configuracion/REPORTE/REP_COMPE001/COM_HEXT",
            				formatter : util.Formatter.reactOnConfig
            			},
					}),
					new sap.ui.core.Item({
						key: "1",
						text: "{I18N>compensaciones.jornadaExtra}"
					}),
					new sap.ui.core.Item({
						key: "2",
						text: "{I18N>compensaciones.festivo}"
					}),
					new sap.ui.core.Item({
						key: "3",
						text: "{I18N>compensaciones.festivoEspecial}"
					})
	        	        ],
	        	change: function(oEvt){
	        		var selectedPath = oEvt.getParameter("selectedItem").getKey();
	        		oView.oHeaderCell.bindObject("/compensaciones/results/"+selectedPath);
	        	}
        }).addStyleClass("selectCompensaciones sapUiVisibleOnlyOnPhone");
		
		
		oView.oHeaderCell = new sap.suite.ui.commons.HeaderCell({
        	east: new sap.suite.ui.commons.HeaderCellItem({
    			height:"100%",
        		content: new sap.suite.ui.microchart.ComparisonMicroChart({
        			scale : "{I18N>compensaciones.horas}",
        			data : [
        			        new sap.suite.ui.microchart.ComparisonMicroChartData({
        			        	value : {
        			        		path: "Anzhl",
        			        		formatter: util.Formatter.compensacionesDecimals
        			        	},
        			        	color : sap.m.ValueColor.Good,
        			        	title : "{I18N>compensaciones.generadas}",
        			        }),
        			        new sap.suite.ui.microchart.ComparisonMicroChartData({
//        			        	visible: false,
        			        	value : {
        			        		path: "Kverb",
        			        		formatter: util.Formatter.compensacionesDecimals
        			        	},
        			        	color : sap.m.ValueColor.Error,
        			        	title : "{I18N>compensaciones.compensadas}",
        			        })
        			        
        			        ]
        		})
        	})
        }).bindObject("/compensaciones/results/0").addStyleClass("customCell sapUiVisibleOnlyOnPhone");
		
		
		
		var oTemplate = new sap.m.VBox({
			visible: {
				parts : ["Ktart", "/reglas", "/configuracion/REPORTE/REP_COMPE001"],
				formatter : function(bolsa, reglas, acceso) {
					
					if( reglas ) {
						var rutaDeAcceso = "COM_" + bolsa;
						if(acceso){
							if(acceso[rutaDeAcceso]){
								return true;
							}
						} 
						
						
						
						// Si no hemos encontrado ningun concepto
						var area = this.getDomRef();
						if(area != undefined)
							jQuery(area.parentElement).css('margin-left', '0%');
						return false;
					}
					
					
					
				}
			},
	        	items:[ 
        	        new sap.m.Text({text: {
	        				parts: ["Ktart", "/textosBolsas/results"],
	        				formatter: function(bolsa, textos) {
	        					for(var i = 0;i<textos.length;i++) {
	        						if(textos[i].KTART == bolsa){
	        							return textos[i].KTEXT;
	        						}
	        					}
	        				}
	        				}
        			}),
        			new sap.suite.ui.microchart.ComparisonMicroChart({
	        			scale : {
	        				path: "/reglas/HORS_JOR",
	        				formatter: function(regla){
	        					if (regla)
	        						return getI18nText("compensaciones.jornadas");
	        					else return getI18nText("compensaciones.horas");
	        				}
	        			},
	        			data : [
	        			        new sap.suite.ui.microchart.ComparisonMicroChartData({
	        			        	value : {
	        			        		path: "Anzhl",
	        			        		formatter: util.Formatter.compensacionesDecimals
	        			        	},
	        			        	color : sap.m.ValueColor.Good,
	        			        	title : {
	        			        		parts: ["I18N>compensaciones.generadas","Ktart","/configuracion/REPORTE/REP_COMPE001"],
	        			        		formatter: function(texto, bolsa,acceso) {
	        			        			
        									var rutaDeAcceso = "COM_" + bolsa+"_G";
        									if(acceso){
        										if(acceso[rutaDeAcceso]){
        											return texto;
        										}
        										else {
        											this.getParent().removeData(this)
        											return "";
        										}
        									} 
		        			        			
	        			        			
	        			        			
	        			        		}
	        			        	}
	        			        }),
	        			        new sap.suite.ui.microchart.ComparisonMicroChartData({
	        			        	value : {
	        			        		path: "Kverb",
	        			        		formatter: util.Formatter.compensacionesDecimals
	        			        	},
	        			        	color : sap.m.ValueColor.Error,
	        			        	title : {
	        			        		parts: ["I18N>compensaciones.compensadas","Ktart","/configuracion/REPORTE/REP_COMPE001"],
	        			        		formatter: function(texto, bolsa,acceso) {
	        			        			
        									var rutaDeAcceso = "COM_" + bolsa+"_C";
        									if(acceso){
        										if(acceso[rutaDeAcceso]){
    		        			        				return texto;
        										}
        										else {
        											this.getParent().removeData(this)
        											return "";
        										}
        									}
		        			        			
	        			        			
	        			        			
	        			        		}
	        			        	}
	        			        })
	        			        
	        			        ]
	        		})
        	]
        }).addStyleClass("customCell sapUiHideOnPhone");
		
		
		
		var compensacionesContainer;
		
		if(sap.ui.Device.system.phone == true){
			
			compensacionesContainer = new sap.m.HBox({
	        	items: [
					oView.selectCompensaciones,
					oView.oHeaderCell,
        	        ]
	        }).addStyleClass("frameCompensaciones");
			
		}else{
			compensacionesContainer = new sap.m.HBox().bindAggregation("items","/compensaciones/results", oTemplate).addStyleClass("frameCompensaciones");
			
			compensacionesContainer.insertItem(new sap.m.Text({text: "{I18N>compensaciones.title}"}).addStyleClass("titleCompensaciones"),0)
		}
				
		return new sap.m.Bar({
			visible: {
				path : "/configuracion/REPORTE/REP_COMPE001/COM_BAR",
				formatter: function(acceso) {
					if(acceso == "X"){
						return true;
					} else {
						return false;
					}
				}
			},
            contentLeft: [ compensacionesContainer]
		}).addStyleClass("appSubHeader appSubHeaderManager");
	
	}


})