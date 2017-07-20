sap.ui.jsfragment("fragment.ListItemConceptosHora", {
	createContent: function(oCon) {
		 
		var title = new sap.m.Title({
			
			text:{
				parts: ["Lgahr", "/conceptosHora/results"],
				formatter : function(codigo, conceptos){
					// Descomentar cuando recuperemos bien los conceptos horarios
					if(conceptos != undefined){
						for(var i=0;i<conceptos.length;i++){
							if(codigo == conceptos[i].Lgahr){
								this.setTooltip(conceptos[i].Lghtx);
								return conceptos[i].Lghtx;
							}
						}
					}
					
				}}
			
		}).addStyleClass("listItemConceptoTitle");
		this.hoursDe = new sap.m.Input({
			maxLength: 2
		});
		this.hoursA = new sap.m.Input({
			maxLength: 2
		});
		
		this.borrar = new sap.m.Button({
			visible: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"  ,"/responsableEdita" ,"/gerenteEdita", "/fueraDePlazoRevision"],
				formatter: function(status, fuera,  responsableEdita, gerenteEdita, fueraPlazoRevision){
					
					
					if(gerenteEdita == true){
						if( (status == "A" || status == "N" || status == "E" || status == "M") && (fueraPlazoRevision == false)){ //
							return true;
						}
					}
					
					if(responsableEdita == true){
						if( (status == "E" || status == "M")&& (fueraPlazoRevision == false) ){ //
							return true;
						}else return false;
					}
					if((gerenteEdita == undefined || gerenteEdita == false) && (responsableEdita == undefined || responsableEdita == false)){
						if((status == "E" ||status == "C" ||status == "A" ||status == "N" ||status == "M" ) || fuera == true){
							return false;
						}else return true
					}
					return false;
					
				}
			},
			press: function(oEvt){
				var oContext = oEvt.getSource().getBindingContext();
				oCon.removeListItemConcepto(oContext, true);
			},
			icon: "sap-icon://sys-cancel"
		}).addStyleClass("listItemConceptoButton");
		
		this.editar = new sap.m.Button({
			visible: (sap.ui.Device.system.phone == true)? false : true,
			enabled : {
				path: "Lgahr",
				formatter: function(concepto){

					if(concepto){
						return true
					}
				}
			}
			,
			icon: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo" ,"/responsableEdita" ,"/gerenteEdita","/fueraDePlazoRevision", "Lgahr"],
				formatter: function(status, fuera, responsableEdita, gerenteEdita, fueraPlazoRevision, concepto){ //
					if(gerenteEdita == true){
						if( (status == "A" || status == "N" || status == "E" || status == "M") && (fueraPlazoRevision == false) ){
							if(concepto == undefined) return "";
							return "sap-icon://edit"
						}
					}
					
					if(responsableEdita == true){
						if( (status == "E" || status == "M") && (fueraPlazoRevision == false) ){
							if(concepto == undefined) return "";
								return "sap-icon://edit"
						}else return "sap-icon://display";
					}
					if((gerenteEdita == undefined || gerenteEdita == false) && (responsableEdita == undefined || responsableEdita == false)){
						
						if((status == "E" ||status == "C" ||status == "A" ||status == "N" ||status == "M" ) || fuera == true ){
							return "sap-icon://display";
						}else return "sap-icon://edit"
					}
					return "sap-icon://display";
				}
			},
			press: function(oEvt){
				
				oCon.editConceptoHora(oEvt);
			}
		}).addStyleClass("listItemConceptoButton");
		
		var info = new sap.m.Text({
			text:{
	        	parts: ["Beghr","Endhr","I18N>conceptosHora.de","I18N>conceptosHora.a"],
	        	formatter: function(inicio, fin, de, a){
	        		
	        		if(inicio != undefined && fin != undefined){
	        			inicio = inicio.split(":")[0] +":" + inicio.split(":")[1];
		        		fin = fin.split(":")[0] +":" + fin.split(":")[1];
		        		
		        		if(sap.ui.Device.system.phone == false)
		        			return de +" "+ inicio +" "+ a +" "+ fin ;//+ getI18nText("conceptosHora.horas");
		        		else return inicio +" - "+ fin ;
	        		}
	        		
	        		
	        	}
			}
		}).addStyleClass("listItemDuracion");
		
		var desc = new sap.m.Text({text: "{Dschr}"}).addStyleClass("descListItemConceptoHora sapUiVisibleOnlyOnDesktop");
		
		var buttonContainer = new sap.m.HBox({items: [this.editar, this.borrar]}).addStyleClass("listItemConceptosButtonContainer")
	    
		return new sap.m.CustomListItem({
			type: (sap.ui.Device.system.phone == true)? sap.m.ListType.Active : sap.m.ListType.Inactive,
			visible: {
				parts: ["Lgahr" , "/responsableEdita" , "/gerenteEdita"],
				formatter: function(concepto, responsableEdita, gerenteEdita){
					if(conceptoEstaOculto(concepto) == true){
						if(responsableEdita == undefined && gerenteEdita == undefined){
							return false;
						}else return true;
					}else return true;
				}
			},
			tap: function(oEvt){
				if(sap.ui.Device.system.phone == true){
					oCon.editConceptoHora(oEvt);
				}
			},
				
			content: [title, info,desc,  buttonContainer]
		}).addStyleClass("listItemConceptos");
	}
	
	
		
		
});