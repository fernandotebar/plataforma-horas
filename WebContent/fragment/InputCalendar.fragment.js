

sap.ui.jsfragment("fragment.InputCalendar", {
	createContent: function(oCon) {
		
		var oView = oCon.getView()
		
		
		var oLegendItemTemplate = new sap.ui.unified.CalendarLegendItem({
	    	   text: "{text}",
	    	   type: "{type}",
	    	   tooltip: "{text}"
		});
		
		oView.calendarLegend = new sap.ui.unified.CalendarLegend().bindAggregation("items","/leyenda/results", oLegendItemTemplate);
		
		var today = new Date();
		
		var oTemplateSpecialDates = new sap.ui.unified.DateTypeRange({
			startDate : {
				path	: "ZhrDatum",
				formatter: util.Formatter.stringToDate
			},
			endDate : 	{
				path	: "ZhrDatum",
				formatter: util.Formatter.stringToDate
			},
			type		: {
				parts: ["DescDia", "/leyenda/results"],
				formatter: function(tipodia, leyenda){
					if( leyenda != undefined){
						for(var i =0;i<leyenda.length;i++){
							if(tipodia == leyenda[i].text){
								return leyenda[i].type;
							}
						}
					}
				}
			}
		});

		oView.calendar = new sap.ui.unified.Calendar({
			width: "100%",
			legend: oView.calendarLegend,
			months: 1,
			nonWorkingDays : [6,0],
			selectedDates : new sap.ui.unified.DateRange({startDate: new Date(), endDate: new Date()}),
			select: function(oEvt){
				oCon.onDateSelection(oEvt)},
		}).bindAggregation("specialDates","/calendario/results",oTemplateSpecialDates).addStyleClass("sapUiHideOnPhone");
		
		
		oView.calendarPhone = new sap.ui.unified.CalendarDateInterval({
			width: "100%",
			legend: oView.calendarLegend,
			days: (isPhone())? 7 : 31,
			nonWorkingDays : [6,0],
			startDate : new Date(),
			select: function(oEvt){
				
				oCon.onDateSelection(oEvt)},
		}).bindAggregation("specialDates","/calendario/results",oTemplateSpecialDates).addStyleClass("sapUiVisibleOnlyOnPhone");
		
		
		oView.buttonsPeriodo =  new sap.m.SegmentedButton({
			selectedKey: "2",
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
							
							oCon.getPeriodos();
							var oItemTemplate = new sap.m.StandardListItem({
								key: "{Begda}",
								visible : {
									path: "Endda",
									formatter: function(finPeriodo) {
										
										var fechaMax = getConstante("PLVIPA_E");
										var finPeriodo = finPeriodo.substring(6,19);
					        			
					        			var finPeriodo = new Date(parseInt(finPeriodo));
					        			finPeriodo.setHours(0);
					        			fechaMax.setHours(0);
										
							 			if (finPeriodo.getTime() <= fechaMax.getTime()) {
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
								noDataText: "{I18N>common.mensajes.noPeriodos}",
								confirm: function(oEvt){
									
									var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
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
				        			
									oCon.getCalendario(dateFin, true);
									var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
									oView.calendar.destroySelectedDates();
									oView.calendar.addSelectedDate(new sap.ui.unified.DateRange({
					        			startDate: dateFin,
					        			endDate :dateFin
					        		}));
					        		oView.calendar.focusDate(dateFin);
								},
								cancel: function(){
									var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
					        		var oItemActual = oView.buttonsPeriodo.getItems()[2];
								}
							}).bindAggregation("items", "/periodos/results", oItemTemplate).addStyleClass("selectDialogPeriod");
							
							selectPeriodo.open();
							
						}
							
					}),
			        /*
			         * PERIODO ANTERIOR
			         */
			        new sap.m.SegmentedButtonItem({
						visible: {
							path : "/configuracion/REPORTE/REP_CALEN001/CAL_PREV",
							formatter: function(acceso) {
								if(acceso == "X"){
									return true;
								} else {
									return false;
								}
							}
						},
			        	enabled: {
			        		path: "/calendario/results",
			        		formatter: function(calendario){

			        			if(calendario != undefined){
			        				// Si estamos en diciembre no podremos navegar al mes anterior
			        				if(calendario[0].ZhrDatum.indexOf("2017-01") != -1 ){
			        					return false;
			        				}
			        				
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
			        	key: "1",
//			        	icon: "sap-icon://arrow-left",
			        	text: "{I18N>common.periodo.anterior}",
			        	press: function(oEvt){
			        		
			        		var firstDate = getAttributeValue("/calendario/results")[0].ZhrDatum;
			        		var today = new Date(); //new Date(2016,10,22)
			        		
			        		var maxDate = util.Formatter.stringToDate(firstDate);
			        		maxDate.setDate(maxDate.getDate()-1);
			        		oCon.getCalendario(maxDate, true);
			        		
			        		var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
			        		oView.calendar.destroySelectedDates();
			        		oView.calendar.addSelectedDate(new sap.ui.unified.DateRange({
			        			startDate: maxDate,
			        			endDate : maxDate
			        		}));
			        	}
			        		
			        }),
			        /*
			         * PERIODO ACTUAL
			         */
			        new sap.m.SegmentedButtonItem({
			        	key: "2",
//			        	icon: "sap-icon://refresh",
			        	text: "{I18N>common.periodo.actual}",
//						visible: "{/config/reporte/calendario/actual}" != undefined? true : false,
			        	press: function(oEvt){
			        		oCon.getCalendario(new Date(), true);
			        		
			        		var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
			        		oView.calendar.destroySelectedDates();
			        		oView.calendar.addSelectedDate(new sap.ui.unified.DateRange({
			        			startDate: new Date(),
			        			endDate : new Date()
			        		}));
			        		oView.calendar.focusDate(new Date());
			        	}
			        })
			        ]
		}).addStyleClass("buttonsPeriodo segmentedCalendarButtons")
		
		var calendarFrame = new sap.m.VBox({
			visible: {
				path : "/configuracion/REPORTE/REP_CALEN001/CAL_GRID",
				formatter: util.Formatter.reactOnConfig
			},
			 layoutData: new sap.ui.layout.GridData({
		    	   span: "L4 M6 S12"
			 }),
			items: [
			        oView.buttonsPeriodo,
			        oView.calendar,
			        oView.calendarPhone,
			        oView.calendarLegend
			        ]
		}).addStyleClass("calendarFrame");
		
		return calendarFrame;
	}
	
});