sap.ui.jsfragment("fragment.ContentInfoDia", {
	
	
	createContent: function(oCon) {
		
		var oView = oCon.getView();
		oView.listConceptoHora = new sap.m.List().addStyleClass("listConceptosHora");
		oView.listConceptoDia = new sap.m.List().addStyleClass("listConceptosHora");
		
		//Bindeamos conceptos
		var itemHora = sap.ui.jsfragment("fragment.ListItemConceptosHora", oCon);
		oView.listConceptoHora.bindItems("/informacionDia/detallehora/results", itemHora);
		
		var itemDia = sap.ui.jsfragment("fragment.ListItemConceptosDia", oCon);
		oView.listConceptoDia.bindItems("/informacionDia/detalledia/results", itemDia);
		
		oView.observaciones = new sap.m.TextArea({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/fueraDePlazo"  ,"/responsableEdita" ,"/gerenteEdita", "/fueraDePlazoRevision"], // 
				formatter: function(status, fuera,  responsableEdita, gerenteEdita , fueraPlazoRevision){
					
					var fueraPlazoRevision = getAttributeValue("/fueraDePlazoRevision");
					
					if(gerenteEdita == true){
						if( (status == "A" || status == "N" || status == "E" || status == "M") && (fueraPlazoRevision == false || fueraPlazoRevision == undefined) ){ //
							return true;
						}
					}
					
					if(responsableEdita == true){
						if( (status == "E" || status == "M") && (fueraPlazoRevision == false || fueraPlazoRevision == undefined) ){
							return true;
						}
					}
					if((gerenteEdita == undefined || gerenteEdita == false) && (responsableEdita == undefined || responsableEdita == false)){
						if((status == "E" ||status == "C" ||status == "A" ||status == "N" ||status == "M" ) || fuera == true){
							return false;
						}else return true
					}
					return false;
					
				}
			},
			value: "{Obshd}",
			maxLength: 130,
			rows: 3,
			width: "100%"
		}).bindObject("/informacionDia/detalleparte/results/0");

		
		
		
		
		oView.tabbarConceptos= new sap.m.IconTabBar({
			select: function(oEvt){
				oView.selectedKey = this.getSelectedKey();
			},
			expandable: false,
			items:[
			       
					new sap.m.IconTabFilter({
						visible: {
							path : "/configuracion/REPORTE/REP_NAVIG001/TAB_HORA",
							formatter: util.Formatter.reactOnConfig
						},
						key: "1",
					   text: "{I18N>conceptosHora.titulo}",
					   content: oView.listConceptoHora
					}),
			       new sap.m.IconTabFilter({
						visible: {
							path : "/configuracion/REPORTE/REP_NAVIG001/TAB_DIAR",
							formatter: util.Formatter.reactOnConfig
						},
			    	   key: "2",
			    	   text: "{I18N>conceptosDia.titulo}",
			    	   content: oView.listConceptoDia
			       }),
			       new sap.m.IconTabFilter({
						visible: {
							path : "/configuracion/REPORTE/REP_NAVIG001/TAB_OBSE",
							formatter: util.Formatter.reactOnConfig
						},
			    	   key: "0",
			    	   text: "{I18N>conceptosHora.observaciones}",
			    	   content: oView.observaciones
			       })
			       ]
		}).addStyleClass("iconTabConceptos")
		
		return oView.tabbarConceptos;
	}

});