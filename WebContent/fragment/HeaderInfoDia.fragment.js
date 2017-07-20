// DEV HEADER

sap.ui.jsfragment("fragment.HeaderInfoDia", {
	createContent: function(oCon) {
		
		
		return new sap.m.ObjectHeader({
	
			title : {
				path: "/informacionDia/Fecha",
				formatter: function(value) {
					if(value) {
						if(value.indexOf("Date") >= 0) {
							var newDate = parseInt(value.substring(6, 19));
							newDate = new Date(newDate);
						} else {
							var newDate = util.Formatter.stringToDate4(value);
						}
						
						
						var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
							pattern : "EEEE, dd  MMMM  yyyy" 
						});
						newValue = dateFormat.format(newDate);
						
						
						return newValue;
					}
					
				},
//				type: new sap.ui.model.type.DateTime({
//					source: {
//						pattern: "yyyy-MM-dd HH:mm:ss"
//					},
//					pattern: "EEEE, dd  MMMM  yyyy"
//					})
			},
			fullScreenOptimized : true,
			iconActive : true,
			statuses: [],
			attributes : [
				           new sap.m.ObjectAttribute({
				        	   title: "{I18N>parte.turno}",
								text : {
									parts: ["Hrbeg", "Hrend","Hrbeg2", "Hrend2"],
									formatter: function( inicio , fin, inicio2, fin2){
										if(inicio2  == "00:00:00" || fin2 == "00:00:00" || inicio2  == undefined || fin2 == undefined || inicio2  == "" || fin2 == "")
											return inicio +" - "+fin;
										else return inicio +" - " + fin + ", " +  inicio2 + " - " + fin2;
									}
								}
				           }),
				           new sap.m.ObjectAttribute({
								title: "{I18N>parte.tipoDia}",
								text:{
									path : "Tdyhd",
									formatter: function(estado){
										
										var estadosParte = getAttributeValue("/tiposDia/results");
										if(estadosParte != undefined){
											for(var i =0;i<estadosParte.length ;i++){
												if(estado == estadosParte[i].DOMVALUE_L)
													return estadosParte[i].DDTEXT;
											}
										}
										return estado;
									}
								}
							}),
							new sap.m.ObjectAttribute({
								title: "{I18N>parte.estadoParte}",
								text:{
									path : "Stahd",
									formatter: function(estado){
										
										var estadosParte = getAttributeValue("/estadosParte/results");
										if(estadosParte != undefined){
											for(var i =0;i<estadosParte.length ;i++){
												if(estado == estadosParte[i].DOMVALUE_L)
													return estadosParte[i].DDTEXT;
											}
										}
										return estado;
									}
								}
									
							})
				           
			              ]
		}).addStyleClass("customObjectHeader");
		
	}
});