jQuery.sap.require("util.Formatter");
sap.ui.controller("view.ListadoPluses", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.ListadoPluses
*/
	onInit: function() {

		var oView = this.getView();
		this.createMonthsModel();
		oView.createConfirmationDownloadDialog(this);
		setViewTitle(oView,"view.pluses.title");
	},
	
	onBeforeShowCalls : function() {
    	
    	var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
        var oController = oView.getController();
        
        oController.getPeriodos();
	},
	
	
	getListadoPluses : function(){
		
		var fn = this;
		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oController = oView.getController();
		

		var lang = getLangForCalls();
		
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
		
		var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.calendario.key;
		
		
		var begdaSeleccionada = oView.periodoSelect.getSelectedKey();
		var begdaEnviar, enddaEnviar;
		var periodo = getAttributeValue("/periodoListados/results");
		
		for(var i=0;i<periodo.length;i++){
			if(begdaSeleccionada == periodo[i].Begda){
				begdaEnviar = periodo[i].Begda;
				enddaEnviar = periodo[i].Endda;
			}
		}
		
		formatter = function(date){
			date = date.substring(6,19)
			
			var dateSalir = new Date(parseInt(date));
			
			return util.Formatter.dateToString(dateSalir);
			
		}

		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
		
		var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.listadoPluses.key;
		
		var directo = (oView.buttonsEmpleados.getSelectedKey() == "1")? 'X' : '';
		
	    var urlData = {
	    		"BEGDA": "'"+formatter(begdaEnviar)+"'",
	    		"ENDDA": "'"+formatter(enddaEnviar)+"'",
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'",
	    		"DIRECTO": "'"+directo+"'"
	    };
	    
	    var success = function(data){
		      var p_data = data.d;
		      oController.setPlusesGeneradosFilter();
		      oView.buttonsConceptos.setSelectedKey("1");
		      sap.ui.getCore().getModel().setProperty("/listadoPluses", p_data.results);
		      
		      
		      if(sap.ui.Device.system.phone == true){
		    	  oController.exportarMovil(p_data);
		      }
		    }
	    
	    callFunctionImport(entity,urlData,success);
		
		
	},
	
	
	setInitialFilter: function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oldFilters = oView.plusesTable.getBinding("items").aFilters;
		
				
		oldFilters.push(new sap.ui.model.Filter([],true));
		oView.plusesTable.getBinding("items").filter(oldFilters);
	},
	
	setInitialDirectosFilter: function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oldFilters = oView.plusesTable.getBinding("items").aFilters;
		
		oldFilters.push(new sap.ui.model.Filter([],true));
		
		
		oView.plusesTable.getBinding("items").filter(oldFilters);
		
		
	},
	
	setGastosJornadaFilter : function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oController = oView.getController();
		var oldFilters;
		
		var filter = new sap.ui.model.Filter("Betrg", sap.ui.model.FilterOperator.GT, "0.00");

		oController.setTodosFilter();
		
		// Para la llamada inicial
		if(oView.plusesTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}

		oldFilters = oView.plusesTable.getBinding("items").aFilters;
		

		
		
		oldFilters[0].aFilters.push(filter);
		
		
		oView.plusesTable.getBinding("items").filter(oldFilters);
	},
	
	setPlusesGeneradosFilter : function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oController = oView.getController();
		var oldFilters;
		
		var filter = new sap.ui.model.Filter("Betrg", sap.ui.model.FilterOperator.EQ, "0.00");

		oController.setTodosFilter();
		
		// Para la llamada inicial
		if(oView.plusesTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		
		
		oldFilters = oView.plusesTable.getBinding("items").aFilters;
		
		
		oldFilters[0].aFilters.push(filter);
		
		
		oView.plusesTable.getBinding("items").filter(oldFilters);
	},
	
	setTodosFilter : function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oController = oView.getController();
		var oldFilters = oView.plusesTable.getBinding("items").aFilters;
		
		if(oView.plusesTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		
		for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
			if(oldFilters[0].aFilters[i].sPath == "Betrg"){
				oldFilters[0].aFilters.splice(i,1);
				i--;
			}
		}

		if(oldFilters[0].aFilters.length == 0){
			oView.plusesTable.getBinding("items").filter(undefined);
		}else oView.plusesTable.getBinding("items").filter(oldFilters);
	},
	
	checkMonthVisible:  function(month){
		var today = new Date();
		
		if(month == undefined){
			return true;
		}

		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var anyoSelected = oView.anyoSelect.getSelectedKey();
		
		if( anyoSelected == today.getFullYear()){
			
			if(today.getMonth() >= month){
				return true;
			}else return false;
		}
		
		if( anyoSelected < today.getFullYear()){
			return true;
		}
		
		
	},
	
	
	getCalendario : function(date){
		
		var fn = this;
		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var oController = oView.getController();
		

		var lang = getLangForCalls();
		
		if(date instanceof Date == false){
			if(sap.ui.Device.system.phone == false)
				date = oView.calendar.getSelectedDates()[0].getStartDate();
			else date = oView.calendarPhone.getSelectedDates()[0].getStartDate();
		}
		
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
		
		var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.calendario.key;
		
	    var urlData = {
	    		"FECHA": "'"+util.Formatter.dateToString(date)+"'",
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'",
	    		"LANGU": "'"+lang+"'"
	    };
	    
	    var success = function(data){
		      var p_data = data.d;
		      
		      var last = p_data.results.length-1;
		      var inicio = util.Formatter.stringToDate(p_data.results[0].ZhrDatum);
		      var fin = util.Formatter.stringToDate(p_data.results[last].ZhrDatum);
		      
		      var range = new sap.ui.unified.DateRange({
		    	  startDate: inicio,
		    	  endDate: fin
		      });
		      
		      var newData = {
		    		  start: inicio,
		    		  end: fin
		      }
		      
		      
		      sap.ui.getCore().getModel().setProperty("/periodoListados", newData);
		    }
	    
	    callFunctionImport(entity,urlData,success);
	},
	
	
	getPeriodos : function(){
		
		
		var fn = this;
		
		var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerPeriodos.key;
	    var urlData = {
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'",
	    		"CALENDAR" : "''"
	    };
	    
	    success = function (data) {
		      var p_data = data.d;
		      
		      for(var i =0;i<p_data.results.length;i++){
		    	  
		    	  var oTextoFecha = p_data.results[i].Begda.substring(6,19);
		    	  var oDate = new Date(parseInt(oTextoFecha));
		    	  
		    	  var dia = oDate.getDate();      			
		    	  var mes = oDate.getMonth()+1;
		    	  
		    	  var diaHoy = new Date().getDate();
		    	  var mesHoy = new Date().getMonth()+1;
		    	  
		    	  if( diaHoy < dia && mesHoy == mes ){
		    		  p_data.results.splice(i,1);
		    		  i--; 
		    	  }else if( mesHoy < mes ){
			    		  p_data.results.splice(i,1);
			    		  i--;
		    		  }
		    	  
		    	
		      }
		      
		      sap.ui.getCore().getModel().setProperty("/periodoListados", p_data);
	    };
	    
	    callFunctionImport(entity,urlData,success);
	},

	
	
	exportar : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var columns = oView.plusesTable.getColumns();
		var lineaColumna = [], filtroSeleccionado = oView.buttonsConceptos.getSelectedKey(), calculo;
		
		for(var j =0;j<columns.length;j++){
			lineaColumna.push(columns[j].getHeader().getText())
		}
		
		switch (filtroSeleccionado) {
		
		case "1" : {
			calculo = "GJ";
			break;
		}
		case "2" : {
			calculo = "PG";
			break;
		}
		case "3" : {
			calculo = "TD";
			break;
		}
		}
		
		var items = oView.plusesTable.getBinding("items").oList;
		var data = [lineaColumna];
		for(var i =0;i<items.length;i++){
			
			
			var lineaActual = [];
			var context = items[i];
			
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				  maxFractionDigits: 2,
				  groupingEnabled: true,
				  groupingSeparator: ".",
				  decimalSeparator: ","
			});
			
			
			context.Betrg = oNumberFormat.format(context.Betrg);
			
			if( (calculo == "GJ" && context.Betrg == "0,00") || (calculo == "PG" && context.Betrg != "0,00") || calculo == "TD"){
				
				var nuevoPEP = context.Zposnr;
				
				if(nuevoPEP != ""){
					var hayGuion = nuevoPEP.indexOf("-") != -1;
					while (hayGuion == true){
						nuevoPEP = nuevoPEP.replace('-' , '');
						hayGuion = nuevoPEP.indexOf('-') != -1
					}
					nuevoPEP = nuevoPEP.replace("/" , "");
					
					var longitud = 17 - nuevoPEP.length;
					
					if(longitud <17){
						for(var j =0;j<longitud;j++){
							nuevoPEP += "0"
						}
					}
				}
				
				
				context.Anzdy = oNumberFormat.format(context.Anzdy);
				
				
				lineaActual.push(context.Pernr);
				lineaActual.push(context.Ename);
				lineaActual.push(context.Lgart);
				lineaActual.push(context.Betrg);
				lineaActual.push(context.Anzdy);
				lineaActual.push(context.Zcomentario);
				lineaActual.push(nuevoPEP);
				lineaActual.push(context.Temporada);
				data.push(lineaActual);
			}
		}
		
		
		var csvRows = [];

		for(var i=0; i<data.length; i++){
		    csvRows.push(data[i].join(';'));
		}

		var csvString = csvRows.join('\n');
		var a         = document.createElement('a');
		a.href        = 'data:text/csv,' + encodeURIComponent(csvString);
		a.target      = '_blank';
		a.download    = 'listadoPluses.csv';

		document.body.appendChild(a);
		a.click();
	},
	
	exportarMovil : function(data){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.PLUSES);
		var columns = oView.plusesTable.getColumns();
		var lineaColumna = [];
		
		for(var j =0;j<columns.length;j++){
			lineaColumna.push(columns[j].getHeader().getText())
		}
		
		var items = oView.plusesTable.getItems();
//		var data = [lineaColumna];
		for(var i =0;i<items.length;i++){
			
			var lineaActual = [];
			var context = items[i].getBindingContext().getObject();
			
			
			var nuevoPEP = context.Zposnr;
			
			if(nuevoPEP != ""){
				var hayGuion = nuevoPEP.indexOf("-") != -1;
				while (hayGuion == true){
					nuevoPEP = nuevoPEP.replace('-' , '');
					hayGuion = nuevoPEP.indexOf('-') != -1
				}
				nuevoPEP = nuevoPEP.replace("/" , "");
				
				var longitud = 17 - nuevoPEP.length;
				
				if(longitud <17){
					for(var j =0;j<longitud;j++){
						nuevoPEP += "0"
					}
					
				}
			}
			
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				  maxFractionDigits: 2,
				  groupingEnabled: true,
				  groupingSeparator: ".",
				  decimalSeparator: ","
				});
			
			
			context.Betrg = oNumberFormat.format(context.Betrg);
			context.Anzdy = oNumberFormat.format(context.Anzdy);
			
			
			lineaActual.push(context.Pernr);
			lineaActual.push(context.Ename);
			lineaActual.push(context.Lgart);
			lineaActual.push(context.Betrg);
			lineaActual.push(context.Anzdy);
			lineaActual.push(context.Zcomentario);
			lineaActual.push(nuevoPEP);
			lineaActual.push(context.Temporada);
			data.push(lineaActual);
		}
		
		var csvRows = [];

		for(var i=0; i<data.length; i++){
		    csvRows.push(data[i].join(';'));
		}

		var csvString = csvRows.join('\n');
		var a         = document.createElement('a');
		a.href        = 'data:text/csv,' + encodeURIComponent(csvString);
		a.target      = '_blank';
		a.download    = 'listadoPluses.csv';

		document.body.appendChild(a);
		a.click();
	},
	

	
	createMonthsModel : function(){
		
		
		var data = [
		            {
		            	numero: "0",
		            	texto: getI18nText("common.mes.0") +" - "+ getI18nText("common.mes.1")
            		},
		            {
		            	numero: "1",
		            	texto: getI18nText("common.mes.1") +" - "+ getI18nText("common.mes.2")
		            },
		            {
		            	numero: "2",
		            	texto: getI18nText("common.mes.2") +" - "+ getI18nText("common.mes.3")
		            },
		            {
		            	numero: "3",
		            	texto: getI18nText("common.mes.3") +" - "+ getI18nText("common.mes.4")
		            },
		            {
		            	numero: "4",
		            	texto: getI18nText("common.mes.4") +" - "+ getI18nText("common.mes.5")
		            },
		            {
		            	numero: "5",
		            	texto: getI18nText("common.mes.5") +" - "+ getI18nText("common.mes.6")
		            },
		            {
		            	numero: "6",
		            	texto: getI18nText("common.mes.6") +" - "+ getI18nText("common.mes.7")
		            },
		            {
		            	numero: "7",
		            	texto: getI18nText("common.mes.7") +" - "+ getI18nText("common.mes.8")
		            },
		            {
		            	numero: "8",
		            	texto: getI18nText("common.mes.8") +" - "+ getI18nText("common.mes.9")
		            },
		            {
		            	numero: "9",
		            	texto: getI18nText("common.mes.9") +" - "+ getI18nText("common.mes.10")
		            },
		            {
		            	numero: "10",
		            	texto: getI18nText("common.mes.10") +" - "+ getI18nText("common.mes.11")
		            },
		            {
		            	numero: "11",
		            	texto: getI18nText("common.mes.11") +" - "+ getI18nText("common.mes.0")
		            },
		            ]
		
		setAttributeValue("/meses",data);
	},

	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.ListadoPluses
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.ListadoPluses
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.ListadoPluses
*/
//	onExit: function() {
//
//	}

});