sap.ui.jsview("view.ConfigTurno", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.ConfigTurno
	*/ 
	getControllerName : function() {
		return "view.ConfigTurno";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.ConfigTurno
	*/ 
	createContent : function(oController) {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.TURNO);
		
		var oContainer = new sap.m.VBox({
			 layoutData: new sap.ui.layout.GridData({
		    	   span: "L8 M8 S12"
			 }),
			visible: {
				path : "/configuracion/ACCESOS/CON_AUT002/MENU_TURN",
				formatter: util.Formatter.reactOnConfig
			},
			items: [
				new sap.m.VBox({
					 layoutData: new sap.ui.layout.GridData({
				    	   span: "L6 M6 S12"
					 }),
		        	items: [
		        	        new sap.m.Label({text: "Dia de inicio"}).addStyleClass("diaSemanaEdicionTurno"),
		        	        new sap.m.HBox({
		        	        	items:  [
									new sap.m.DatePicker({
										width: "100%",
										change: oController.reactToInicioTurno,
										value:  {
											path: "Begda",
											formatter: function(oValue) {
												if( oValue){											
													var fecha = parseInt(oValue.substring(6, 19));
										            fecha = new Date(fecha);
										            fecha = util.Formatter.dateToString(fecha);
										            return fecha;
												}
											}
										},
										valueFormat: "yyyyMMdd",
										displayFormat:"dd MMMM yy"
									}).addStyleClass("datePickerInicioEdicionTurno"),
									new sap.m.Button({
										text: "{I18N>common.guardar}",
										press: function(oEvt) {
											var oView = sap.ui.getCore().byId(Common.Navigations.TURNO);
									        var oController = oView.getController();
									        if(oController.validarTurno() == true)
									        	oController.enviarTurno();
										}
									}).addStyleClass("buttonsEdicionTurno"),
									new sap.m.Button({
										text: "Restaurar",
										press: function(){
											var oViewConfig = sap.ui.getCore().byId(Common.Navigations.CONFIG);
											var oControllerConfig = oViewConfig.getController();
											oControllerConfig.getTurno();
										}
									}).addStyleClass("buttonsEdicionTurno")
		        	        	         ]
		        	        })
		        	        ]
		        }).addStyleClass("containerInicialEdicionTurno containerGrandeEdicionTurno"),
			    		        
		        new sap.m.VBox({
					 layoutData: new sap.ui.layout.GridData({
				    	   span: "L6 M6 S12"
					 }),
		        	items: [
		        	        new sap.m.Label({text: "Lunes"}).addStyleClass("diaSemanaEdicionTurno"),
		        	        new sap.m.HBox({
		        	        	items : [new sap.m.VBox({
			        	        	items : [
			        	        	         new sap.m.Label({text: "Hora de inicio"}),
					        	        	 new sap.m.TimePicker("IturnL1",{
													width: "60%",
													value:  "{IturnL1}",
													valueFormat:"HH:mm:ss",
													displayFormat:"HH:mm",
													enabled: {
														path: "DiaLibrL",
														formatter: function(oValue){
															return oValue != "X";
														}
						        	        		 }
											})]
			        	        }).addStyleClass("containerHoraEdicionTurno"),
			        	        new sap.m.VBox({
			        	        	items : [
			        	        	         new sap.m.Label({text: "Hora de fin"}),
					        	        	 new sap.m.TimePicker("FturnL1",{
													width: "60%",
													value:  "{FturnL1}",
													valueFormat:"HH:mm:ss",
													displayFormat:"HH:mm",
													enabled: {
														path: "DiaLibrL",
														formatter: function(oValue){
															return oValue != "X";
														}
						        	        		 }
											}) 
											]
			        	        }).addStyleClass("containerHoraEdicionTurno"),
			        	        new sap.m.VBox({
			        	        	items : [
			        	        	         new sap.m.Label({text: "Hora de inicio"}),
					        	        	 new sap.m.TimePicker("IturnL2",{
													width: "60%",
													value:  "{IturnL2}",
													valueFormat:"HH:mm:ss",
													displayFormat:"HH:mm",
													enabled: {
														path: "DiaLibrL",
														formatter: function(oValue){
															return oValue != "X";
														}
						        	        		 }
											}) ]
			        	        }).addStyleClass("containerHoraEdicionTurno"),
			        	        new sap.m.VBox({
			        	        	items : [
			        	        	         new sap.m.Label({text: "Hora de fin"}),
					        	        	 new sap.m.TimePicker("FturnL2",{
													width: "60%",
													value:  "{FturnL2}",
													valueFormat:"HH:mm:ss",
													displayFormat:"HH:mm",
													enabled: {
														path: "DiaLibrL",
														formatter: function(oValue){
															return oValue != "X";
														}
						        	        		 }
											})]
		        	        }),
		        	        new sap.m.VBox({
		        	        	items : [
		        	        	         new sap.m.Label({text: "Dia libre"}),
				        	        	 new sap.m.CheckBox({
				        	        		 selected: {
				        	        			 path: "DiaLibrL",
												formatter: util.Formatter.reactOnConfig
				        	        		 },
				        	        		 select: function (oEvt) {
				        	        			 
				        	        			 var path = this.getBindingContext().getPath();
				        	        			 var IturnL1 = sap.ui.getCore().byId("IturnL1"), FturnL1 = sap.ui.getCore().byId("FturnL1");
				        	        			 var IturnL2 = sap.ui.getCore().byId("IturnL2"), FturnL2 = sap.ui.getCore().byId("FturnL2");
												
				        	        			 
				        	        			 if(oEvt.getParameter("selected") == true){
				        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnL1", "00:00:00");
				        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnL1", "00:00:00");
				        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnL2", "00:00:00");
				        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnL2", "00:00:00");
				        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrL", "X");
				        	        				 IturnL1.setEnabled(false);
					        	        			 FturnL1.setEnabled(false);
					        	        			 IturnL2.setEnabled(false);
					        	        			 FturnL2.setEnabled(false);
				        	        			 }else {
				        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrL", "");
				        	        				 IturnL1.setEnabled(true);
					        	        			 FturnL1.setEnabled(true);
					        	        			 IturnL2.setEnabled(true);
					        	        			 FturnL2.setEnabled(true);
				        	        			 }
				        	        			 
				        	        		 }
					        	        	 })
		        	        	         ]
	        	        	}).addStyleClass("containerHoraEdicionTurno"),
		        	         ]
		        	        }).addStyleClass("containerHoraEdicionTurno"),
		        	        
		        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno"),
			        new sap.m.VBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
						 }),
			        	items: [
			        	        new sap.m.Label({text: "Martes"}).addStyleClass("diaSemanaEdicionTurno"),
			        	        new sap.m.HBox({
			        	        	items : [new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de inicio"}),
						        	        	 new sap.m.TimePicker("IturnM1",{
														width: "60%",
														value:  "{IturnM1}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrM",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												})]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de fin"}),
						        	        	 new sap.m.TimePicker("FturnM1",{
														width: "60%",
														value:  "{FturnM1}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrM",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) 
												]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de inicio"}),
						        	        	 new sap.m.TimePicker("IturnM2",{
														width: "60%",
														value:  "{IturnM2}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrM",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de fin"}),
						        	        	 new sap.m.TimePicker("FturnM2",{
														width: "60%",
														value:  "{FturnM2}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrM",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Dia libre"}),
						        	        	 new sap.m.CheckBox({
						        	        		 selected: {
						        	        			 path: "DiaLibrM",
														formatter: util.Formatter.reactOnConfig
						        	        		 },
						        	        		 select: function (oEvt) {

						        	        			 var path = this.getBindingContext().getPath();
						        	        			 var IturnM1 = sap.ui.getCore().byId("IturnM1"), FturnM1 = sap.ui.getCore().byId("FturnM1");
						        	        			 var IturnM2 = sap.ui.getCore().byId("IturnM2"), FturnM2 = sap.ui.getCore().byId("FturnM2");
														
						        	        			 
						        	        			 if(oEvt.getParameter("selected") == true){
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnM1", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnM1", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnM2", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnM2", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrM", "X");
						        	        				 IturnM1.setEnabled(false);
							        	        			 FturnM1.setEnabled(false);
							        	        			 IturnM2.setEnabled(false);
							        	        			 FturnM2.setEnabled(false);
						        	        			 }else {
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrM", "");
						        	        				 IturnM1.setEnabled(true);
							        	        			 FturnM1.setEnabled(true);
							        	        			 IturnM2.setEnabled(true);
							        	        			 FturnM2.setEnabled(true);
						        	        			 }
														
						        	        		 }
						        	        	 })
				        	        	         ]
				        	        }).addStyleClass("containerHoraEdicionTurno")
				        	        ]
			        	        })
			        	        
			        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno")
			        ,new sap.m.VBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
						 }),
			        	items: [
			        	        new sap.m.Label({text: "Miercoles"}).addStyleClass("diaSemanaEdicionTurno"),
			        	        new sap.m.HBox({
			        	        	items : [
	        	        	         new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de inicio"}),
						        	        	 new sap.m.TimePicker("IturnX1",{
														width: "60%",
														value:  "{IturnX1}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrX",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												})]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de fin"}),
						        	        	 new sap.m.TimePicker("FturnX1",{
														width: "60%",
														value:  "{FturnX1}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrX",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) 
												]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de inicio"}),
						        	        	 new sap.m.TimePicker("IturnX2",{
														width: "60%",
														value:  "{IturnX2}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrX",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de fin"}),
						        	        	 new sap.m.TimePicker("FturnX2",{
														width: "60%",
														value:  "{FturnX2}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrX",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Dia libre"}),
						        	        	 new sap.m.CheckBox({
						        	        		 selected: {
						        	        			 path: "DiaLibrX",
														formatter: util.Formatter.reactOnConfig
						        	        		 },
						        	        		 select: function (oEvt) {

						        	        			 var path = this.getBindingContext().getPath();
						        	        			 var IturnX1 = sap.ui.getCore().byId("IturnX1"), FturnX1 = sap.ui.getCore().byId("FturnX1");
						        	        			 var IturnX2 = sap.ui.getCore().byId("IturnX2"), FturnX2 = sap.ui.getCore().byId("FturnX2");
														
						        	        			 
						        	        			 if(oEvt.getParameter("selected") == true){
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnX1", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnX1", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnX2", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnX2", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrX", "X");
						        	        				 IturnX1.setEnabled(false);
							        	        			 FturnX1.setEnabled(false);
							        	        			 IturnX2.setEnabled(false);
							        	        			 FturnX2.setEnabled(false);
						        	        			 }else {
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrX", "");
						        	        				 IturnX1.setEnabled(true);
							        	        			 FturnX1.setEnabled(true);
							        	        			 IturnX2.setEnabled(true);
							        	        			 FturnX2.setEnabled(true);
						        	        			 }
						        	        		 }
						        	        	 })
				        	        	         ]
				        	        }).addStyleClass("containerHoraEdicionTurno")
				        	        ]
			        	        }),
			        	        
			        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno"),
			        new sap.m.VBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
						 }),
			        	items: [
			        	        new sap.m.Label({text: "Jueves"}).addStyleClass("diaSemanaEdicionTurno"),
			        	        new sap.m.HBox({
			        	        	items: [
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de inicio"}),
										        	 new sap.m.TimePicker("IturnJ1",{
															width: "60%",
															value:  "{IturnJ1}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrJ",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													})]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de fin"}),
										        	 new sap.m.TimePicker("FturnJ1",{
															width: "60%",
															value:  "{FturnJ1}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrJ",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) 
													]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de inicio"}),
										        	 new sap.m.TimePicker("IturnJ2",{
															width: "60%",
															value:  "{IturnJ2}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrJ",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de fin"}),
										        	 new sap.m.TimePicker("FturnJ2",{
															width: "60%",
															value:  "{FturnJ2}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrJ",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Dia libre"}),
										        	 new sap.m.CheckBox({
										        		 selected: {
										        			 path: "DiaLibrJ",
															formatter: util.Formatter.reactOnConfig
										        		 },
										        		 select: function (oEvt) {
										
										        			 var path = this.getBindingContext().getPath();
										        			 var IturnJ1 = sap.ui.getCore().byId("IturnJ1"), FturnJ1 = sap.ui.getCore().byId("FturnJ1");
										        			 var IturnJ2 = sap.ui.getCore().byId("IturnJ2"), FturnJ2 = sap.ui.getCore().byId("FturnJ2");
															
										        			 
										        			 if(oEvt.getParameter("selected") == true){
										        				 sap.ui.getCore().getModel().setProperty(path+"/IturnJ1", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/FturnJ1", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/IturnJ2", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/FturnJ2", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrJ", "X");
										        				 IturnJ1.setEnabled(false);
											        			 FturnJ1.setEnabled(false);
											        			 IturnJ2.setEnabled(false);
											        			 FturnJ2.setEnabled(false);
										        			 }else {
										        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrJ", "");
										        				 IturnJ1.setEnabled(true);
											        			 FturnJ1.setEnabled(true);
											        			 IturnJ2.setEnabled(true);
											        			 FturnJ2.setEnabled(true);
										        			 }
										        		 }
										        	 })
											         ]
										}).addStyleClass("containerHoraEdicionTurno")
										]
			        	        })
			        	        
			        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno")
			        ,new sap.m.VBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
						 }),
			        	items: [
			        	        new sap.m.Label({text: "Viernes"}).addStyleClass("diaSemanaEdicionTurno"),
			        	        new sap.m.HBox({
			        	        	items:[
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de inicio"}),
										        	 new sap.m.TimePicker("IturnV1",{
															width: "60%",
															value:  "{IturnV1}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrV",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													})]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de fin"}),
										        	 new sap.m.TimePicker("FturnV1",{
															width: "60%",
															value:  "{FturnV1}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrV",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) 
													]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de inicio"}),
										        	 new sap.m.TimePicker("IturnV2",{
															width: "60%",
															value:  "{IturnV2}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrV",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de fin"}),
										        	 new sap.m.TimePicker("FturnV2",{
															width: "60%",
															value:  "{FturnV2}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrV",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Dia libre"}),
										        	 new sap.m.CheckBox({
										        		 selected: {
										        			 path: "DiaLibrV",
															formatter: util.Formatter.reactOnConfig
										        		 },
										        		 select: function (oEvt) {
										        			 
										        			 var path = this.getBindingContext().getPath();
										        			 
										        			 var IturnV1 = sap.ui.getCore().byId("IturnV1"), FturnV1 = sap.ui.getCore().byId("FturnV1");
										        			 var IturnV2 = sap.ui.getCore().byId("IturnV2"), FturnV2 = sap.ui.getCore().byId("FturnV2");
															
										        			 
										        			 if(oEvt.getParameter("selected") == true){
										        				 sap.ui.getCore().getModel().setProperty(path+"/IturnV1", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/FturnV1", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/IturnV2", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/FturnV2", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrV", "X");
										        				 IturnV1.setEnabled(false);
											        			 FturnV1.setEnabled(false);
											        			 IturnV2.setEnabled(false);
											        			 FturnV2.setEnabled(false);
										        			 }else {
										        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrV", "");
										        				 IturnV1.setEnabled(true);
											        			 FturnV1.setEnabled(true);
											        			 IturnV2.setEnabled(true);
											        			 FturnV2.setEnabled(true);
										        			 }
										        		 }
										        	 })
											         ]
										}).addStyleClass("containerHoraEdicionTurno")
	        	        	       ]
			        	        })
			        	        
			        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno")
			        ,new sap.m.VBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
						 }),
			        	items: [
			        	        new sap.m.Label({text: "Sabado"}).addStyleClass("diaSemanaEdicionTurno"),
			        	        new sap.m.HBox({
			        	        	items: [
	        	        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de inicio"}),
						        	        	 new sap.m.TimePicker("IturnS1",{
														width: "60%",
														value:  "{IturnS1}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrS",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de fin"}),
						        	        	 new sap.m.TimePicker("FturnS1",{
														width: "60%",
														value:  "{FturnS1}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrS",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de inicio"}),
						        	        	 new sap.m.TimePicker("IturnS2",{
														width: "60%",
														value:  "{IturnS2}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrS",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Hora de fin"}),
						        	        	 new sap.m.TimePicker("FturnS2",{
														width: "60%",
														value:  "{FturnS2}",
														valueFormat:"HH:mm:ss",
														displayFormat:"HH:mm",
														enabled: {
															path: "DiaLibrS",
															formatter: function(oValue){
																return oValue != "X";
															}
							        	        		 }
												}) ]
				        	        }).addStyleClass("containerHoraEdicionTurno"),
				        	        new sap.m.VBox({
				        	        	items : [
				        	        	         new sap.m.Label({text: "Dia libre"}),
						        	        	 new sap.m.CheckBox({
						        	        		 selected: {
						        	        			 path: "DiaLibrS",
														formatter: util.Formatter.reactOnConfig
						        	        		 },
						        	        		 select: function (oEvt) {
						        	        			 
						        	        			 var path = this.getBindingContext().getPath();
						        	        			 
						        	        			 var IturnS1 = sap.ui.getCore().byId("IturnS1"), FturnS1 = sap.ui.getCore().byId("FturnS1");
						        	        			 var IturnS2 = sap.ui.getCore().byId("IturnS2"), FturnS2 = sap.ui.getCore().byId("FturnS2");
														
						        	        			 
						        	        			 if(oEvt.getParameter("selected") == true){
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnS1", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnS1", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/IturnS2", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/FturnS2", "00:00:00");
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrS", "X");
						        	        				 IturnS1.setEnabled(false);
							        	        			 FturnS1.setEnabled(false);
							        	        			 IturnS2.setEnabled(false);
							        	        			 FturnS2.setEnabled(false);
						        	        			 }else {
						        	        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrS", "");
						        	        				 IturnS1.setEnabled(true);
							        	        			 FturnS1.setEnabled(true);
							        	        			 IturnS2.setEnabled(true);
							        	        			 FturnS2.setEnabled(true);
						        	        			 }
						        	        		 }
						        	        	 })
				        	        	         ]
				        	        }).addStyleClass("containerHoraEdicionTurno")]
			        	        })
			        	        
			        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno"),
			        new sap.m.VBox({
						 layoutData: new sap.ui.layout.GridData({
					    	   span: "L6 M6 S12"
						 }),
			        	items: [
			        	        new sap.m.Label({text: "Domingo"}).addStyleClass("diaSemanaEdicionTurno"),
			        	        new sap.m.HBox({
			        	        	items : [
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de inicio"}),
										        	 new sap.m.TimePicker("IturnD1",{
															width: "60%",
															value:  "{IturnD1}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrD",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de fin"}),
										        	 new sap.m.TimePicker("FturnD1",{
															width: "60%",
															value:  "{FturnD1}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrD",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de inicio"}),
										        	 new sap.m.TimePicker("IturnD2",{
															width: "60%",
															value:  "{IturnD2}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrD",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													}) ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Hora de fin"}),
										        	 new sap.m.TimePicker("FturnD2",{
															width: "60%",
															value:  "{FturnD2}",
															valueFormat:"HH:mm:ss",
															displayFormat:"HH:mm",
															enabled: {
																path: "DiaLibrD",
																formatter: function(oValue){
																	return oValue != "X";
																}
											        		 }
													})
											         ]
										}).addStyleClass("containerHoraEdicionTurno"),
										new sap.m.VBox({
											items : [
											         new sap.m.Label({text: "Dia libre"}),
										        	 new sap.m.CheckBox({
										        		 selected: {
										    			 path: "DiaLibrD",
														formatter: util.Formatter.reactOnConfig
										        		 },
										        		 select: function (oEvt) {
										        			 
										        			 var path = this.getBindingContext().getPath();
										
										        			 var IturnD1 = sap.ui.getCore().byId("IturnD1"), FturnD1 = sap.ui.getCore().byId("FturnD1");
										        			 var IturnD2 = sap.ui.getCore().byId("IturnD2"), FturnD2 = sap.ui.getCore().byId("FturnD2");
															
										        			 
										        			 if(oEvt.getParameter("selected") == true){
										        				 sap.ui.getCore().getModel().setProperty(path+"/IturnD1", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/FturnD1", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/IturnD2", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/FturnD2", "00:00:00");
										        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrD", "X");
										        				 IturnD1.setEnabled(false);
											        			 FturnD1.setEnabled(false);
											        			 IturnD2.setEnabled(false);
											        			 FturnD2.setEnabled(false);
										        			 }else {
										        				 sap.ui.getCore().getModel().setProperty(path+"/DiaLibrD", "");
										        				 IturnD1.setEnabled(true);
											        			 FturnD1.setEnabled(true);
											        			 IturnD2.setEnabled(true);
											        			 FturnD2.setEnabled(true);
										        			 }
										        		 }
										        	 })
											         ]
										}).addStyleClass("containerHoraEdicionTurno"),
	        	        	         ]
			        	        })
			        	        
			        	        ]
			        }).addStyleClass("containerGrandeEdicionTurno")
			        
			        ]
		}).bindElement("/turnoEmpleado/results/0").addStyleClass("containerEdicionTurno");
		
		var oScrollContainer = new sap.m.ScrollContainer({
			content: oContainer
		})
		
		var mainPage = new sap.m.Page({
            showSubHeader: false,
            showHeader: false,
            enableScrolling: false,
            content: oContainer
        });
		
		return mainPage;
	}

});