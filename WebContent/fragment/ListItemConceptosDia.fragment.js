sap.ui.jsfragment("fragment.ListItemConceptosDia", {
	createContent: function(oCon) {
		 
		this.title = new sap.m.Title({text:{
			parts: ["Lgady", "/conceptosDia/results"],
			formatter : function(codigo, conceptos){
				if(codigo && conceptos) {
					for(var i=0;i<conceptos.length;i++){
						if(codigo == conceptos[i].Lgady)
							return conceptos[i].Lgdtx
					}
				}
				
			}}}).addStyleClass("listItemConceptoTitle");
		
		var texto = new sap.m.Text({
			text: {
				path: "Betdy",
				formatter: function(importe){
					return importe + " EUR";
				}
			}
		}).addStyleClass("listItemDuracion");
		

		var desc = new sap.m.Text({
			text: {
				parts:["Anzdy","Zeidy", "/udsMedida/results"],
				formatter: function(numero,unidad, unidades){
					numero = (numero == undefined)? 0 : numero;
					if(unidad == "020")
						return "";
					for(var i=0;i<unidades.length;i++){
						if(unidad == unidades[i].ZEINH)
							return numero + " "+ unidades[i].ETEXT + "s"
					}
				}
			}
		}).addStyleClass("descListItemConceptoHora sapUiVisibleOnlyOnDesktop");
		
		this.borrar = new sap.m.Button({
			visible: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"  ,"/responsableEdita" ,"/gerenteEdita", "/fueraDePlazoRevision"],
				formatter: function(status, fuera,  responsableEdita, gerenteEdita, fueraPlazoRevision){
					
					
					if(gerenteEdita == true){
						if( (status == "A" || status == "N" || status == "E" || status == "M") && (fueraPlazoRevision == false || fueraPlazoRevision == undefined)){ //
							return true;
						}
					}
					
					if(responsableEdita == true){
						if( (status == "E" || status == "M")&& (fueraPlazoRevision == false || fueraPlazoRevision == undefined) ){ //
							return true;
						}else return false;
					}
					if((gerenteEdita == undefined || gerenteEdita == false) && (responsableEdita == undefined || responsableEdita == false)){
//						if(isGerProd() == true || isResponsable() == true){
//							if(status == "E" ||status == "C" ||status == "A" ||status == "N" ||status == "M" )
//								return false;
//							else return true;
//						}else 
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
			icon: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo" ,"/responsableEdita" ,"/gerenteEdita","/fueraDePlazoRevision"], //, 
				formatter: function(status, fuera, responsableEdita, gerenteEdita, fueraPlazoRevision){ //
					if(gerenteEdita == true){
						if( (status == "A" || status == "N" || status == "E" || status == "M") && (fueraPlazoRevision == false || fueraPlazoRevision == undefined) ){ //
							return "sap-icon://edit"
						}
					}
					
					if(responsableEdita == true){
						if( (status == "E" || status == "M") && (fueraPlazoRevision == false || fueraPlazoRevision == undefined) ){ //
							return "sap-icon://edit"
						}else return "sap-icon://display";
					}
					if((gerenteEdita == undefined || gerenteEdita == false) && (responsableEdita == undefined || responsableEdita == false)){
						
//						if(isGerProd() == true || isResponsable() == true){
//							if(status == "E" ||status == "C" ||status == "A" ||status == "N" ||status == "M" )
//								return "sap-icon://display";
//							else return "sap-icon://edit";
//						}else
						if((status == "E" ||status == "C" ||status == "A" ||status == "N" ||status == "M" ) || fuera == true ){
							return "sap-icon://display";
						}else return "sap-icon://edit"
					}
					return "sap-icon://display";
				}
			},
			press: function(oEvt){
				oCon.editConceptoDia(oEvt);
			}
		}).addStyleClass("listItemConceptoButton");
						
		var buttonContainer = new sap.m.HBox({items: [this.editar, this.borrar]}).addStyleClass("listItemConceptosButtonContainer")
	    		
		return new sap.m.CustomListItem({
			type: (sap.ui.Device.system.phone == true)? sap.m.ListType.Active : sap.m.ListType.Inactive,
			tap: function(oEvt){
				if(sap.ui.Device.system.phone == true){
					oCon.editConceptoDia(oEvt);
				}
			},
			content: [this.title,texto,desc, buttonContainer]
		}).addStyleClass("listItemConceptos");
	}
	
	
		
		
});