sap.ui.jsfragment("fragment.InfoDia", {
	
	
	createContent: function(oCon) {
		
		var oView = oCon.getView();
		var fn = this;
		
//		var fragmentDia = getFragmentFromSociedad(Fragments.HOME.DIA);
		var contenidoDia = sap.ui.jsfragment("fragment.ContentInfoDia", oCon);
		
		oView.addConceptButton = new sap.m.Button({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"  , "/gerenteEdita" , "/responsableEdita", "/fueraDePlazoRevision"], //
				formatter: function(status, fuera, gerenteEdita, responsableEdita , fueraPlazoRevision){
					
					
					if(gerenteEdita == true){
						if( (status == "A" || status == "N"|| status == "E" || status == "M") &&  (fueraPlazoRevision == false)  ){ 
							return true;
						}
					}
					
					if(responsableEdita == true){
						if( (status == "E" || status == "M") &&  (fueraPlazoRevision == false) ){ 
							return true;
						} else return false;
					}
					
					if((responsableEdita == undefined || responsableEdita == false) && (gerenteEdita == undefined || gerenteEdita == false) && (status == "" ||status == "R" ||status == "B" ) && (fuera == false)){ //   
						return true;
					}else return false;
				}
			},
			icon: "sap-icon://add",
			tooltip: "{I18N>conceptosHora.anyadirConcepto}",
			text: "{I18N>conceptosHora.anyadirConcepto}",
			press: function(oEvt){
				var selected = oView.selectedKey;
				if(selected == "1" || selected == "")
					oView.getController().openConceptoHoraDialog("");
				if(selected == "2") {
					oView.getController().openConceptoDiaDialog("");
				}
				
			}
		});
		
		oView.dayInfoHeader =  sap.ui.jsfragment("fragment.HeaderInfoDia", oCon).bindObject("/informacionDia/detalleparte/results/0")
		
		var oTemplate = new sap.ui.core.Item({
			key: "{DOMVALUE_L}",
			text: "{DDTEXT}"			
		});
		
		
		
		var oSuggestionItemTemplate = new sap.m.SuggestionItem({
			key: "{DOMVALUE_L}",
			text: "{DDTEXT}"
		});
		
		var oFrameInfoParte = new sap.m.VBox({
			items : [
			         new sap.m.HBox({
			        	 visible: {
			        		path: "/configuracion/REPORTE/REP_REPOR001/PAR_VIAJE",
			        		formatter: util.Formatter.reactOnConfig
			        	 },
			        	 items: [new sap.m.Text({
			        			 	text: {
			        			 		path : "I18N>common.viaje",
			        			 		formatter: function(texto) {
			        			 			return texto + ":";
			        			 		}
			        			 	}
		        				 }),
		        				 // VIAJE INTERNACIONAL
			        	         new sap.m.Select({
			        	        	 enabled: {
			        	        		parts: ["DentroFuera", "/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"  , "/gerenteEdita" , "/responsableEdita", "/fueraDePlazoRevision"],
			        	        		formatter: function(dentroFuera, status, fuera, gerenteEdita, responsableEdita , fueraPlazoRevision) {
			        	        			if(dentroFuera != "2" && dentroFuera != "3"){
			        	        				return false;
			        	        			} else {

			        	    					if(gerenteEdita == true){
			        	    						if( (status == "A" || status == "N"|| status == "E" || status == "M") &&  (fueraPlazoRevision == false)  ){ 
			        	    							return true;
			        	    						}
			        	    					}
			        	    					
			        	    					if(responsableEdita == true){
			        	    						if( (status == "E" || status == "M") &&  (fueraPlazoRevision == false) ){ 
			        	    							return true;
			        	    						} else return false;
			        	    					}
			        	    					
			        	    					if((responsableEdita == undefined || responsableEdita == false) && (gerenteEdita == undefined || gerenteEdita == false) && (status == "" ||status == "R" ||status == "B" ) && (fuera == false)){ //   
			        	    						return true;
			        	    					}else return false;
			        	        			}
			        	        		}
			        	        	 },
			        	        	 selectedKey: "{ViajeInternacional}",
			        	        	 change: function(oEvt) {
			        	        		 var path = "/informacionDia/detalleparte/results/0/ViajeInternacional";
			        	        		 var value = oEvt.getParameter("selectedItem").getKey();
			        	        		 sap.ui.getCore().getModel().setProperty(path, value);
			        	        		 sap.ui.getCore().getModel().updateBindings();
			        	        	 }
			        	         }).bindItems("/viajeInternacional/results", oTemplate).addStyleClass("selectInfoParte")
			        	         ]
			         }).addStyleClass("attrContainerParte"),
			         new sap.m.HBox({
			        	 visible: {
				        		path: "/configuracion/REPORTE/REP_REPOR001/PAR_CENTRO",
				        		formatter: util.Formatter.reactOnConfig
				        	 },
			        	 items: [new sap.m.Text({
			        			 	text: {
			        			 		path : "I18N>common.centroTrabajo",
			        			 		formatter: function(texto) {
			        			 			return texto + ":";
			        			 		}
			        			 		
			        			 	}
		        				 }),
		        				 
		        				 // CENTRO DE TRABAJO
						         new sap.m.Select({
			        	        	 	enabled: {
			        	        	 		parts: ["ViajeInternacional", "/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"  , "/gerenteEdita" , "/responsableEdita", "/fueraDePlazoRevision"],
				        	        		formatter: function(ViajeInternacional, status, fuera, gerenteEdita, responsableEdita , fueraPlazoRevision) {
				        	        			if(ViajeInternacional != undefined) {
					        	        			if(ViajeInternacional != "")
					        	        			{
//					        	        				return false;
					        	        			} else
					        	        			{
					        	        				if(gerenteEdita == true)
					        	        				{
					        	    						if( (status == "A" || status == "N"|| status == "E" || status == "M") &&  (fueraPlazoRevision == false)  ){ 
					        	    							return true;
					        	    						}
					        	    					}
					        	    					
					        	    					if(responsableEdita == true) 
					        	    					{
					        	    						if( (status == "E" || status == "M") &&  (fueraPlazoRevision == false) ){ 
					        	    							return true;
					        	    						} else return false;
					        	    					}
					        	    					
					        	    					if((responsableEdita == undefined || responsableEdita == false) && (gerenteEdita == undefined || gerenteEdita == false) && (status == "" ||status == "R" ||status == "B" ) && (fuera == false)){ //   
					        	    						return true;
					        	    					}else return false;
					        	        			}
				        	        			} else {if(gerenteEdita == true){
			        	    						if( (status == "A" || status == "N"|| status == "E" || status == "M") &&  (fueraPlazoRevision == false)  ){ 
			        	    							return true;
			        	    						}
			        	    					}
			        	    					
			        	    					if(responsableEdita == true){
			        	    						if( (status == "E" || status == "M") &&  (fueraPlazoRevision == false) ){ 
			        	    							return true;
			        	    						} else return false;
			        	    					}
			        	    					
			        	    					if((responsableEdita == undefined || responsableEdita == false) && (gerenteEdita == undefined || gerenteEdita == false) && (status == "" ||status == "R" ||status == "B" ) && (fuera == false)){ //   
			        	    						return true;
			        	    					}else return false;
			        	    					}
				        	        		}
				        	        	 },
				        	        	 selectedKey: {
				        	        		 path: "DentroFuera",
				        	        		 formatter: function(oValue){
				        	        			 return oValue;
				        	        		 }
				        	        	 },
				        	        	 change: function(oEvt) {
				        	        		 var path = "/informacionDia/detalleparte/results/0/DentroFuera";
				        	        		 var pathViaje = "/informacionDia/detalleparte/results/0/ViajeInternacional";
				        	        		 var value = oEvt.getParameter("selectedItem").getKey();
				        	        		 if(value == "1"){
				        	        			 sap.ui.getCore().getModel().setProperty(pathViaje, "");
				        	        		 }
				        	        		 sap.ui.getCore().getModel().setProperty(path, value);

				        	        		 sap.ui.getCore().getModel().updateBindings();
				        	        		 
				        	        		 oCon.openCambioCentroDialog();
				        	        	 }
	        	        		 }).bindItems("/dentroFueraCentro/results", oTemplate).addStyleClass("selectInfoParte")
						         ]
			         }).addStyleClass("attrContainerParte")
			         ]
		}).bindObject("/informacionDia/detalleparte/results/0").addStyleClass("containerInfoParte");
		
		
		
		var conceptosContainer = new sap.m.VBox({
			layoutData: new sap.ui.layout.GridData({
		    	   span: {
		    		   // Dependiendo de si tendremos calendario a la izquierda, setearemos el span de la informacion dia
		    		   path: "/configuracion/REPORTE/REP_CALEN001/CAL_GRID",
		    		   formatter: function(accesoCalendario){
		    			   if( accesoCalendario =="X"){
		    				   return "L8 M6 S12"
		    			   } return "L12 M12 S12";
		    		   }
		    	   }
	       }),
			items: [
			        oView.dayInfoHeader,
			        oFrameInfoParte,
			        new sap.m.Bar({
			        	contentLeft: oView.addConceptButton,
//			        	contentRight: 
			        }).addStyleClass("headerAnadirConcepto customHeader "),
			        new sap.m.MessageStrip({
		        		icon : "sap-icon//warning",
		    			type: sap.ui.core.MessageType.Warning,
		    			showIcon : true,
		    			showCloseButton : false,
		        		text: "{/infoAusenciaManager}",
		        		visible: {
		        			parts: ["/infoAusenciaManager", "/responsableEdita" , "/gerenteEdita"],
		        			formatter: function(ausencia, responsable, gerente){
		        				if(responsable == undefined && gerente == undefined){
		        					return false;
		        				}else if(ausencia != undefined && ausencia != ""){
		        					return true;
		        				}else return false;
		        			}
		        		},
		        	}).addStyleClass("stripAusenciaManager"),
		        	contenidoDia
			        ]
		}).addStyleClass("frameInfoDia")
		
		return conceptosContainer;
		
		
		
	}

});