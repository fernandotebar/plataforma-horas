sap.ui.controller("view.EmpleadoManager", {

	onInit: function(oEvt){
		
		var oView = this.getView();
//		this.setDiasModel();
		setViewTitle(oView,"view.manager.title");

	},
	
	/**
     * Funcion que se llama cada vez que se muestra la vista del empleado
     */
	onBeforeShowCalls : function() {
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        var oController = oView.getController();
        
        oController.calcularFinRevision();
        oController.calcularFinAprobacion();
        oController.getTurnoTeoricoEmpleado()
        oController.getTotalesEmpleado();
        oController.getElementosPEP();
        setPropertySAPUI5Model("/modoDialogo", undefined);
//        oController.getConceptosHora();
//        oController.getConceptosHoraSelect();
        oController.getConceptosDia();
        oView.diasTable.removeSelections(true);
        sap.ui.getCore().getModel().setProperty("/haModificado", false);
	},
	
	/**
	 * Funcion que recupera los datos de la tabla 
	 */
	getTotalesEmpleado : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var filters = new Array();
		filters.push(
				new sap.ui.model.Filter("PERNR", sap.ui.model.FilterOperator.EQ, getAttributeValue("/manager/empleadoSelected/PERNR")),
				new sap.ui.model.Filter("FECHA", sap.ui.model.FilterOperator.EQ, util.Formatter.normalToRead(new Date(getAttributeValue("/periodoManager/results/0/ZhrDatum")))),
				new sap.ui.model.Filter("DIARIO", sap.ui.model.FilterOperator.EQ, "X")
				
				);
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.totalesPorEmpleado);
		params.setFilterEntity(filters);
		params.setExpand(["Periodo","Diferencias","Totales","Errores"]);
		params.setSuccess([ oController.getCompensacionesEmpleado]); //oController.setSinEnviarFilter,
		params.setResultData_path("/manager/empleadoSelected/INFO");
		
		// Incluir parámetro de error para salir de la aplicacion si no encontramos datos personales
		params.setError();
		params.setSkip(0);
		callODataServiceRead(params);
		
	},
	
	/**
	 * Funcion que recupera las compensaciones del empleado que estamos visualizando
	 */
	getCompensacionesEmpleado : function(){
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.compensaciones);	
		params.setResultData_path("/compensaciones");
//		callODataServiceRead(params);
		
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    var urlData = {
	    		"FECHA": "'"+util.Formatter.stringToString(getAttributeValue("/manager/empleadoSelected/INFO/FECHA"))+"'",
	    		"PERNR" : "'"+getAttributeValue("/manager/empleadoSelected/PERNR")+"'"
	    };
				
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.compensaciones.key;
    	
	    success = 	function(data,response,request){
		      var p_data = data.d;
		      sap.ui.getCore().getModel().setProperty("/compensaciones",p_data);
		    };
	    	
    	callFunctionImport(entity,urlData,success);
	    
		
	},
	
	/**
	 * Funcion para enviar el dia del empleado que estamos visualizando
	 * @param aprobar Booleano para aprobar o rechazar
	 */
	enviarDia : function(aprobar){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");

		var lang = getLangForCalls();
		
		if(status =="E"){
				setAttributeValue("/informacionDia/detalleparte/results/0/Stahd", "M");
		}else if(status =="A"){
			if(isGerProd() == true){
				setAttributeValue("/informacionDia/detalleparte/results/0/Stahd", "N");
			}
		}
		var data = {
				Pernr : getAttributeValue("/manager/empleadoSelected/PERNR"),
				Modificador : getAttributeValue("/userInfo/PERNR"),
				Fecha : getAttributeValue("/informacionDia/Fecha"),
				detalleparte : getAttributeValue("/informacionDia/detalleparte/results"),
				detallehora : getAttributeValue("/informacionDia/detallehora/results"),
				detalledia : getAttributeValue("/informacionDia/detalledia/results"),
	    		"LANGU": ""+lang+""
		}
		
		data.detalleparte = (data.detalleparte.length == 0)?  new Array(new Object()) : data.detalleparte;
		data.detallehora = (data.detallehora.length == 0)?  new Array(new Object()) : data.detallehora;
		data.detalledia = (data.detalledia.length == 0)?  new Array(new Object()) : data.detalledia;
			
		
		delete data.detalleparte[0].__metadata;
		for(var i = 0;i<data.detallehora.length;i++){
			delete data.detallehora[i].__metadata;
		}
		for(var j = 0;j<data.detalledia.length;j++){
			delete data.detalledia[j].__metadata;
		}
		
		var oViewHome = sap.ui.getCore().byId(Common.Navigations.HOME);
		data.detallehora = oViewHome.getController().ajustarHorasDia();
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia);
		var success = [];
		if(aprobar == true){
			success.push(this.aprobarParte);
		}
		if(aprobar == false) {
			success.push(this.rechazarParte);
		}
		success.push(this.getTotalesEmpleado)
		params.setSuccess(success);
		params.setResultData_path("/informacionDia");
		callODataServiceCreate(params, data);
		sap.ui.getCore().getModel().setProperty("/haModificado",true);
		
	},
	
	/**
	 * Funcion intermedia para mandar a aprobar partes
	 */
	aprobarParte : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		oController.aprobarRechazarPartes(false,false);
	},
	
	/**
	 * Funcion intermedia para mandar a aprobar partes
	 */
	rechazarParte : function(){
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		oController.aprobarRechazarPartes(true,false);
	},
	
	
	/**
	 * Funcion para ejecutar la aprobacion o rechazo de partes
	 * @param rechazar Booleano para aprobar o rechazar
	 * @param multiple Unico o multiple
	 */
	aprobarRechazarPartes : function(rechazar, multiple){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
		var aprobarRechazar = (rechazar==true)? "X": "";
//		var newStatus = oController.changeParteStatus(modo, status);
		
		var lang = getLangForCalls();
		var fechaTable = new Array();
		var table = oView.diasTable.getSelectedItems();
		
		if(multiple == true){
			for(var i = 0;i<table.length;i++){
				var actual = table[i].getBindingContext().getObject();
				fechaTable.push({"FECHA": util.Formatter.stringToString(actual.FECHA)});
			}
		}else {
			var oldFecha = getAttributeValue("/informacionDia/detalleparte/results/0/Begda");
			if(oldFecha.indexOf("Date") == -1)
				fechaTable.push({"FECHA": util.Formatter.stringToString(oldFecha)});
			else{
				var fecha = parseInt(oldFecha.substring(6,19));
				fecha = new Date(fecha);
				fecha = util.Formatter.dateToString(fecha);
				fechaTable.push({"FECHA": fecha});
			}
		}
		
		if((fechaTable.length != 0 && multiple == true) || multiple == false){
			var data = {
					PERNR: getAttributeValue("/manager/empleadoSelected/PERNR"),
					RECHAZAR : aprobarRechazar,
					ACTOR : getAttributeValue("/userInfo/PERNR"),
					LANGU:  lang,
					aprobdias_nav : fechaTable
			}
			
			var params= new CustomModelParameters();
			params.setService(ServiceConstants.Z_HR_CTLH_SRV);
			params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.aprobarPartes);
			params.setSuccess([oController.getTotalesEmpleado]);
//			params.setResultData_path("/");
			callODataServiceCreate(params, data);
		      sap.ui.getCore().getModel().setProperty("/haModificado",true);
		}else{
			sap.m.MessageToast.show(getI18nText("common.mensajes.noPartes"));
		}
		
	},
	
	/**
	 * Funcion que envia el dia para des-aprobarlo. Quedara como enviado o modificado
	 */
	deshacerDia : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var pathSelected = oView.diasTable.getSelectedItems();
		var oController = oView.getController();
		var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");

		var lang = getLangForCalls();
		
		if(status =="A"){
				setAttributeValue("/informacionDia/detalleparte/results/0/Stahd", "E");
		}
		if(status =="N"){
			setAttributeValue("/informacionDia/detalleparte/results/0/Stahd", "M");
		}
		setAttributeValue("/informacionDia/detalleparte/results/0/Zaprobado", "");
		var data = {
				Pernr : getAttributeValue("/manager/empleadoSelected/PERNR"), // getAttributeValue("/userInfo/PERNR")
				Modificador : getAttributeValue("/userInfo/PERNR"),
				Fecha : getAttributeValue("/informacionDia/Fecha"),
				detalleparte : getAttributeValue("/informacionDia/detalleparte/results"),
				detallehora : getAttributeValue("/informacionDia/detallehora/results"),
				detalledia : getAttributeValue("/informacionDia/detalledia/results"),
	    		"LANGU": ""+lang+""
		}
		
		data.detalleparte = (data.detalleparte.length == 0)?  new Array(new Object()) : data.detalleparte;
		data.detallehora = (data.detallehora.length == 0)?  new Array(new Object()) : data.detallehora;
		data.detalledia = (data.detalledia.length == 0)?  new Array(new Object()) : data.detalledia;
			
		
		delete data.detalleparte[0].__metadata;
		for(var i = 0;i<data.detallehora.length;i++){
			delete data.detallehora[i].__metadata;
		}
		for(var j = 0;j<data.detalledia.length;j++){
			delete data.detalledia[j].__metadata;
		}
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia);
		params.setSuccess([this.getTotalesEmpleado]);
		params.setResultData_path("/informacionDia");
		callODataServiceCreate(params, data);
	      sap.ui.getCore().getModel().setProperty("/haModificado",true);
		
	},
	
	/**
	 * Funcion para cambiar el estado a un dia que acabamos de modificar
	 */
	updateTable : function(){
		
		var diaCambiado = getAttributeValue("/informacionDia/Fecha");
		var statusCambiado = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
		var tabla = getAttributeValue("/manager/empleadoSelected/INFO/Periodo/results");
		
		for(var i =0;i<tabla.length;i++){
			if(diaCambiado == tabla[i].FECHA){
				tabla[i].STAHD = statusCambiado;
			}
		}
		sap.ui.getCore().getModel().updateBindings();
		
	},
	
	/**
     * Funcion para crear un filtro inicial vacio para la gestion de todos los filtros
     */
	setInitialFilter: function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		
				
		oldFilters.push(new sap.ui.model.Filter([],true));
		oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	 /**
     * Funcion que muestra la tabla con los dias cuyos partes esten sin enviar
     */
	setSinEnviarFilter : function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var oldFilters;
		
		var filter = new sap.ui.model.Filter("ENVIADA", sap.ui.model.FilterOperator.NE, "X");
		
		// Para la llamada inicial
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		oldFilters = oView.diasTable.getBinding("items").aFilters;
		oldFilters[0].aFilters.push(filter);
		
		
		oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	/**
     * Funcion que muestra la tabla eliminando el filtro de sin enviar
     */
	setTodosFilter : function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		
		for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
			if(oldFilters[0].aFilters[i].sPath == "ENVIADA"){
				oldFilters[0].aFilters.splice(i,1);
				i--;
			}
		}

		if(oldFilters[0].aFilters.length == 0){
			oView.diasTable.getBinding("items").filter(undefined);
		}else oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	
	/**
     * Funcion que muestra la tabla con los dias con horas generadas
     */
	setGeneradasFilter: function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		
		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		
		var filter = new sap.ui.model.Filter({filters: [
		                                        new sap.ui.model.Filter("GENE90", sap.ui.model.FilterOperator.GT, 0),
							                    new sap.ui.model.Filter("GENE91", sap.ui.model.FilterOperator.GT, 0),
						                        new sap.ui.model.Filter("GENE92", sap.ui.model.FilterOperator.GT, 0),
						                        new sap.ui.model.Filter("GENE93", sap.ui.model.FilterOperator.GT, 0)],
						                        and : false});
		
		oldFilters[0].aFilters.push(filter);
		oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	/**
     * Funcion que muestra la tabla con los dias con horas compensadas
     */
	setCompensadasFilter: function() {
		
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();

		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		
		var filter = new sap.ui.model.Filter({filters : [ 
		                                          new sap.ui.model.Filter("COMP90", sap.ui.model.FilterOperator.GT, 0),
		                                          new sap.ui.model.Filter("COMP91", sap.ui.model.FilterOperator.GT, 0),
		                                          new sap.ui.model.Filter("COMP92", sap.ui.model.FilterOperator.GT, 0),
					                      			new sap.ui.model.Filter("COMP93", sap.ui.model.FilterOperator.GT, 0)],
					                      			and:false});
		oldFilters[0].aFilters.push(filter);
		
		oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	/**
     * Funcion que elimina el filtro de horas generadas
     */
	removeGeneradasFilter : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		
		
		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		for(var i = 0;i<oldFilters[0].aFilters.length;i++){
			if(oldFilters[0].aFilters[i].aFilters != undefined){
				for(var j = 0; j<oldFilters[0].aFilters[i].aFilters.length;j++){
					if(oldFilters[0].aFilters[i].aFilters[j].sPath == "GENE90" || oldFilters[0].aFilters[i].aFilters[j].sPath == "GENE91" || 
							oldFilters[0].aFilters[i].aFilters[j].sPath == "GENE92" || oldFilters[0].aFilters[i].aFilters[j].sPath == "GENE93"){
						oldFilters[0].aFilters.splice(i,1);
						i--;
						break;
					}
				}
				
			}
			
		}

		if(oldFilters[0].aFilters.length == 0){
			oView.diasTable.getBinding("items").filter(undefined);
		}else oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	/**
     * Funcion que elimina el filtro de horas compensadas
     */
	removeCompensadasFilter : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		
		
		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		for(var i = 0;i<oldFilters[0].aFilters.length;i++){
			if(oldFilters[0].aFilters[i].aFilters != undefined){
				for(var j = 0; j<oldFilters[0].aFilters[i].aFilters.length;j++){
					if(oldFilters[0].aFilters[i].aFilters[j].sPath == "COMP90" || oldFilters[0].aFilters[i].aFilters[j].sPath == "COMP91" || 
							oldFilters[0].aFilters[i].aFilters[j].sPath == "COMP92" || oldFilters[0].aFilters[i].aFilters[j].sPath == "COMP93"){
						oldFilters[0].aFilters.splice(i,1);
						i--;
						break;
					}
				}
							}
			
		}

		if(oldFilters[0].aFilters.length == 0){
			oView.diasTable.getBinding("items").filter(undefined);
		}else oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	
	/**
     * Funcion que elimina el filtro de estado
     */
	removeEstadoFilter : function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var oldFilters = oView.diasTable.getBinding("items").aFilters;
		
		if(oView.diasTable.getBinding("items").aFilters.length == 0){
			oController.setInitialFilter();
		}
		
		for(var i = 0;i<  oldFilters[0].aFilters.length;i++){
			if(oldFilters[0].aFilters[i].sPath == "STAHD"){
				oldFilters[0].aFilters.splice(i,1);
				i--;
			}
		}
		

		if(oldFilters[0].aFilters.length == 0){
			oView.diasTable.getBinding("items").filter(undefined);
		}else oView.diasTable.getBinding("items").filter(oldFilters);
	},
	
	/**
	 * Funcion que recupera un dia
	 * @param date Fecha
	 */
	getInformacionDia : function(date){
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
		
		var lang = getLangForCalls();
	    var filters = new Array();
		filters.push(new sap.ui.model.Filter(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia.filters.Fecha, sap.ui.model.FilterOperator.EQ, util.Formatter.normalToRead(date))); // util.Formatter.dateToString(date)
		filters.push(new sap.ui.model.Filter(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia.filters.Pernr, sap.ui.model.FilterOperator.EQ,getAttributeValue("/manager/empleadoSelected/PERNR"))); //getAttributeValue("/userInfo/PERNR"))
		filters.push(new sap.ui.model.Filter("LANGU", sap.ui.model.FilterOperator.EQ, lang)); //getAttributeValue("/userInfo/PERNR"))
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia);
		params.setFilterEntity(filters);
//		params.setExportType("json");
		params.setExpand("detalleparte,detallehora,detalledia");
		params.setSuccess([this.ordenarConceptos, getColisiones, getDescripcionProduccion]);
		params.setResultData_path("/informacionDia");
		callODataServiceRead(params,undefined,true);
	},
	
	/**
	 * Funcion para recuperar los elementos PEP que puede tener el empleado (a seleccionar por el manager)
	 */
	getElementosPEP : function(){
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.compensaciones);	
//		callODataServiceRead(params);
		
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    var urlData = {
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'"
	    };
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.elementosPEP.key;
    	
	    success = 	function(data,response,request){
		      var p_data = data.d;
		      sap.ui.getCore().getModel().setProperty("/elementosPEP",p_data);
		    };
	    	
    	callFunctionImport(entity,urlData,success);
	},
	
	/**
	 * Funcion para navegar atrás
	 */
	onNavBack: function(){
		
		var app = sap.ui.getCore().byId(Common.App.Name);
		app.backDetail();
	},
	
	/**
	 * Funcion que consulta ausencias para un empleado
	 * @param fecha Fecha 
	 * @param pernr Pernr del empleado
	 */
	consultarAusencias : function(fecha, pernr){
		
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);

		var lang = getLangForCalls();
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    var urlData = {
	    		"FECHA": "'"+util.Formatter.stringToString(fecha)+"'",
	    		"PERNR" : "'"+pernr+"'",
	    		"LANGU": "'"+lang+"'"
	    };
		
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.comprobarAusencia.key;
    	
	    success = 	function(data,response,request){
	    	var p_data = data.d;
	    	var responsable = getAttributeValue("/responsableEdita");
	    	var gerente = getAttributeValue("/gerenteEdita");
	    	sap.ui.getCore().getModel().setProperty("/infoAusenciaManager", p_data.TEXTO);
	    	
		    };
	    	
    	callFunctionImport(entity,urlData,success);
	},
	
	
	onPressItem : function(oEvt) {

        var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        var oController = oView.getController();
        var contexto = this.getBindingContext().getObject();
        var pernr = getAttributeValue("/manager/empleadoSelected/PERNR")

        if (isGerProd() == true) {
            setPropertySAPUI5Model("/gerenteEdita", true);
        } else setPropertySAPUI5Model("/gerenteEdita", false);

        if (isResponsable() == true) {
            setAttributeValue("/responsableEdita", true);
        } else setAttributeValue("/responsableEdita", false);

        if (contexto.STAHD != "") {
     	   	oController.getConceptosHora(contexto.FECHA,pernr);
     	   	oController.getConceptosHoraSelect(contexto.FECHA,pernr);
            oController.consultarAusencias(contexto.FECHA, pernr);
            oView.dayDialog.open();
        } else {
            sap.m.MessageToast.show(getI18nText("common.mensajes.parteInicial"));
        }

    },
	
	/**
	 * Funcion que reacciona a la seleccion de la lista de partes
	 * @param oEvt
	 */
	onSelectParte : function(oEvt){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oTable = oView.diasTable;
		var empleadoDirecto = getAttributeValue("/manager/empleadoSelected/DIRECTO");
		var fechaMax = getConstante("FIN_APRO");
		
		fueraPlazo = getAttributeValue("/fueraDePlazoAprobacion");
		
			
		// Ha clicado en seleccionar todos
		if(oEvt.getParameter("listItems").length > 1){
			
			if(oEvt.getParameter("selected") == true){
				var selectedItems = oEvt.getParameter("listItems");
				for(var i =0;i<selectedItems.length;i++){
					var selected = selectedItems[i];
					var objeto = selected.getBindingContext().getObject();
					var enable = false;
					if(fueraPlazo == true || objeto.STAHD == "A" || objeto.STAHD == "B" || objeto.STAHD == ""|| objeto.STAHD == "R" || objeto.STAHD == "N" || objeto.STAHD == "C"){
						if(fueraPlazo == true){
							sap.m.MessageToast.show(getI18nText("common.mensajes.fueraPlazo"));
						}
						oTable.setSelectedItem(selected,false);
					}
				}
			} else {
				oTable.removeSelections(true);
			}
			
		}else {
			
			var selected = oEvt.getParameter("listItem")
			var objeto = selected.getBindingContext().getObject();
			var enable = false;
			
			if(fueraPlazo == false && ( objeto.STAHD == "E" || objeto.STAHD == "M")){
				enable = true;
			} else {
				if(objeto.STAHD == "A" || objeto.STAHD == "N"){
					sap.m.MessageToast.show(getI18nText("common.mensajes.aprobado"));
				} else if(objeto.STAHD == ""){
					sap.m.MessageToast.show(getI18nText("common.mensajes.parteInicial"));
				} else if(fueraPlazo == true){
					sap.m.MessageToast.show(getI18nText("common.mensajes.fueraPlazo"));
				} else sap.m.MessageToast.show(getI18nText("common.mensajes.noAprobarDia"));
				
				oTable.setSelectedItem(selected,false);
			}
			
			
		}
		
	},
	
	/**
	 * Funcion para calcular el plazo maximo de aprobacion del manager para una lista de dias
	 */
	calcularFinAprobacion : function(){


		var periodos = getAttributeValue("/periodos/results");
		var dia = getAttributeValue("/periodoManager/results/0/ZhrDatum");
        
        var indexPeriodo,
        	fechaMaxImputacion,
        	result = false;
        periodos.sort(function compareFunction(a, b) {

        	var diaActual = parseInt(a.Begda.substring(6, 19));
        	var diaActualB = parseInt(b.Begda.substring(6, 19));

            if (diaActual > diaActualB) {
                return -1;
            } else return 1;

        });
        
        
        dia = util.Formatter.stringToDate4(dia);
        dia = dia.getTime();
        
        for(var i =0;i<periodos.length;i++) {
        	
        	var iniMes = parseInt(periodos[i].Begda.substring(6, 19));
        	iniMes = new Date(iniMes);
        	iniMes.setHours(0);
        	iniMes = iniMes.getTime();
        	var finMes = parseInt(periodos[i].Endda.substring(6, 19));
        	finMes = new Date(finMes);
        	finMes.setHours(0);
        	finMes = finMes.getTime();
        	
        	
        	if(dia >= iniMes && dia <= finMes) {
        		indexPeriodo = i;
        		break;
        	}
        }
        
        if(indexPeriodo == 0){
        	result = false;
        }
        if(indexPeriodo == 1){
        	fechaMaxImputacion = getConstante("FIN_APRO");
			if (checkOnTimeFecha(fechaMaxImputacion) == false) {
				result = true;
			};
        }
        if(indexPeriodo > 1){
        	result = true;
        }
        
        setAttributeValue("/fueraDePlazoAprobacion", result);
        return result;
	},
	
	/**
	 * Funcion para calcular el plazo maximo de edicion del manager
	 */
	calcularFinRevision : function(){


//		var calendar = getAttributeValue("/periodoManager/results");
//		var fechaMaxImputacion = getConstante("FIN_REVI"), result = false;
//    	
//        if (calendar != undefined && calendar.length > 0) {
//            if (new Date().getTime() > fechaMaxImputacion.getTime()) {
//                result = true;
//            }
//            setAttributeValue("/fueraDePlazoRevision", result);
//        }
        
		
        var periodos = getAttributeValue("/periodos/results");
		var dia = getAttributeValue("/periodoManager/results/0/ZhrDatum");
        
        
        var indexPeriodo,
        	fechaMaxImputacion,
        	result = false;
        periodos.sort(function compareFunction(a, b) {

        	var diaActual = parseInt(a.Begda.substring(6, 19));
        	var diaActualB = parseInt(b.Begda.substring(6, 19));

            if (diaActual > diaActualB) {
                return -1;
            } else return 1;

        });
        

        dia = util.Formatter.stringToDate4(dia);
        dia = dia.getTime();
        
        for(var i =0;i<periodos.length;i++) {
        	
        	var iniMes = parseInt(periodos[i].Begda.substring(6, 19));
        	iniMes = new Date(iniMes);
        	iniMes.setHours(0);
        	iniMes = iniMes.getTime();
        	var finMes = parseInt(periodos[i].Endda.substring(6, 19));
        	finMes = new Date(finMes);
        	finMes.setHours(0);
        	finMes = finMes.getTime();
        	
        	if(dia >= iniMes && dia <= finMes) {
        		indexPeriodo = i;
        		break;
        	}
        }
        
        if(indexPeriodo == 0){
        	result = false;
        }
        if(indexPeriodo == 1){
        	fechaMaxImputacion = getConstante("FIN_REVI");
        	if (checkOnTimeFecha(fechaMaxImputacion) == false) {
                result = true;
            }
        }
        if(indexPeriodo > 1){
        	fechaMaxImputacion = getConstante("PLMOPA_M");
        	if ( dia < fechaMaxImputacion.getTime()) {
                result = true;
            }
        }
        
        
        setAttributeValue("/fueraDePlazoRevision", result);
        return result;
	},
	
	
	/**
	 * Funcion para recuperar el plazo maximo de edición por parte del manager
	 * @returns
	 */
	getFueraDePlazoRevision : function(){
		
		return getAttributeValue("/fueraDePlazoRevision");
	},
	
	/**
	 * Funcion para comprobar si estamos en el periodo actual
	 * @returns {Boolean}
	 */
	enPeriodoActual : function(){
		
		var calendar = getAttributeValue("/periodoManager/results");
		
		if(calendar != undefined && calendar.length > 0){
			var lastDate = calendar[calendar.length-1].ZhrDatum;
			var today = new Date(); //new Date(2016,10,22)
			
			// Si efectivamente estamos en otro mes, seteamos el valor a true o false, si no, será undefined
			for(var i =0;i<calendar.length;i++){
				if(util.Formatter.stringToString(calendar[i].ZhrDatum) == util.Formatter.dateToString(today)){
					return true;
				}
			}
			return false;	
		}
	},
	
	
	/**
	 * Handler para el hover de un item de la lista. Sacamos popover con la informacion
	 * @param oEvt
	 */
	reactToHoverItem : function(oEvt){
		
		
		var open = true;
		oEvt.stopPropagation();
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		var item = oEvt.currentTarget.innerText;
		var index = oEvt.currentTarget.rowIndex-1;
		var fecha = oEvt.currentTarget.cells[2].innerText;
		if(fecha.indexOf("/") == -1)
			fecha = oEvt.currentTarget.cells[1].innerText;
		var empleado = getAttributeValue("/manager/empleadoSelected/PERNR");
		var date = util.Formatter.stringToDate3(fecha.replace("/","").replace("/",""));
		var oItem = oView.diasTable.getItems()[index];
		var oDateCell = oItem.getCells()[0];
		var oStateCell = oItem.getCells()[1];
		
		var oPopover = sap.ui.getCore().byId("popoverDiaEmpleado");
		var oldCustomData,close, estado = oItem.getBindingContext().getObject().STAHD;
		

		if(oPopover == undefined){
			
			oPopover = new sap.m.Popover("popoverDiaEmpleado",{
				placement: sap.m.PlacementType.VerticalPreferredTop,
				title: {
					parts: ["I18N>manager.informacion","/popoverDiaEmpleado/Fecha"],
					formatter: function(titulo, dia){
						if(dia != undefined)
							return titulo +" "+ util.Formatter.fechaDiaToString(dia);
						else return titulo;
					}
				},
				content: [
				          new sap.m.HBox({
				        	  items: [
				        	          new sap.m.VBox({
				        	        	  items: [
		    	        			          	new sap.m.Title({text: "{I18N>manager.horario}"}),
												new sap.m.List().bindItems("/popoverDiaEmpleado/detallehora/results",
														  new sap.m.StandardListItem({
															  icon: {
																  path: "Cobrar",
																  formatter: function(cobrar){
																	  this.removeStyleClass("conceptoPopoverManagerNoCobrar");
																	  if(cobrar == "X"){
																		  return "sap-icon://paid-leave";
																	  }else {
																		  this.addStyleClass("conceptoPopoverManagerNoCobrar");
																	  }
																	  
																  }
																  		
															  },
															  title: {
																  parts: ["Lgahr", "/conceptosHora/results"],
																	formatter : function(codigo, conceptos){
																		// Descomentar cuando recuperemos bien los conceptos horarios
																		for(var i=0;i<conceptos.length;i++){
																			if(codigo == conceptos[i].Lgahr){
																				this.setTooltip(conceptos[i].Lghtx);
																				return conceptos[i].Lghtx;
																			}
																		}
																	}
															  },
															  info: {
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
														  }))
		    	        			          ]}),
	    	        			          new sap.m.VBox({
					        	        	  items: [
			    	        			          	new sap.m.Title({text: "{I18N>conceptosDia.titulo}"}),
													new sap.m.List().bindItems("/popoverDiaEmpleado/detalledia/results",
															  new sap.m.StandardListItem({
																  title: {
																	  parts: ["Lgady", "/conceptosDia/results"],
																		formatter : function(codigo, conceptos){
																			// Descomentar cuando recuperemos bien los conceptos horarios
																			for(var i=0;i<conceptos.length;i++){
																				if(codigo == conceptos[i].Lgady){
																					this.setTooltip(conceptos[i].Lgdtx);
																					return conceptos[i].Lgdtx;
																				}
																			}
																		}
																  },
																  info: {
																	  	path: "Betdy",
															        	formatter: function(importe){
															        		return importe + " EUR";
															        	}
																  },
																  description : {
																	  parts: ["Anzdy","Zeidy","/udsMedida/results"],
															        	formatter: function(numero, unidad, unidades){
															        		
															        		numero = (numero == undefined)? 0 : numero;
																			if(unidad == "020")
																				return "";
																			for(var i=0;i<unidades.length;i++){
																				if(unidad == unidades[i].ZEINH)
																					return numero + " "+ unidades[i].ETEXT + "s"
																			}
															        	}
																  }
															  }))
			    	        			          ]}),
				        	            new sap.m.VBox({
				        	        			  items: [
				        	        			          new sap.m.Title({text: "{I18N>manager.comentarios}"}),
				        	        			          new sap.m.TextArea({
				        	        			        	  enabled: false,
				        	        			        	  rows: 3	,
				        	        			        	  cols: 40
				        	        			          }).bindValue("/popoverDiaEmpleado/detalleparte/results/0/Obshd")
				        	        			          ]
				        	        		  })
				        	          
				        	          
				        	          
				        	          ]
				          })
				          ]
			}).addCustomData(new sap.ui.core.CustomData({
				key: "index",
				value: index
			}));
			
			
		} else {
			oldCustomData = oPopover.getCustomData()[0];
			var oldIndex = oPopover.getCustomData()[0].getValue();
			if(index == oldIndex || (oEvt.target.cellIndex != 0 && oEvt.target.cellIndex != 1 && oEvt.target.cellIndex != 2)){
				open = false;
			}
			else{
				oldCustomData.setValue(index);
				open = true;
			}
		}
		
		// Si estamos sobre otro item y si estamos hover sobre las dos primeras columnas ( fecha y estado) y no está en inicial
		if(open == true && getAttributeValue("/configuracion/MANAGER/MAN_D_POP001/POPUP_DE") != undefined){
			oController.getConceptosHora();
			oController.getConceptosHoraSelect();
			oController.getInformacionDiaPopover(date);
			oPopover.openBy(oDateCell);
		}
		
	},
	
	/**
	 * Funcion que calcula el importe del concepto diario para el empleado
	 * @param data
	 */
	calcularImporteDieta : function(data){
		
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas);	
		params.setResultData_path("/importeConceptoDia");
		var anzdy ="", lgady;
		
		if(data.Anzdy == undefined || data.Betdy == undefined || data.Betdy == "0.00"){
			anzdy = "'0'";
		}else anzdy = "'"+data.Anzdy+"'";

		if(data.Lgady == undefined){
			var data = new Object();
			data.Lgady = "DIIS";
		}

		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    var urlData = {
	    		"FECHA": "'"+util.Formatter.dateToString(new Date())+"'",
	    		"PERNR" : "'"+getAttributeValue("/manager/empleadoSelected/PERNR")+"'",
	    		"LGAHR": "'"+data.Lgady+"'",
	    		"CANTIDAD": anzdy
	    };
		
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas.key;
	    
	    success = function(data,response,request){
		      var p_data = data.d;
		      console.log(p_data);
		      sap.ui.getCore().getModel().setProperty("/importeConceptoDia", p_data);
		      sap.ui.getCore().getModel().refresh(true)
	    };
	    
	    callFunctionImport(entity,urlData,success);
	},
	
	/**
	 * Funcion que recupera la informacion del dia para mostrarla en el popover
	 * @param date
	 */
	getInformacionDiaPopover : function(date){
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
		

		var lang = getLangForCalls();
	    var filters = new Array();
		filters.push(new sap.ui.model.Filter(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia.filters.Fecha, sap.ui.model.FilterOperator.EQ, util.Formatter.normalToRead(date))); // util.Formatter.dateToString(date)
		filters.push(new sap.ui.model.Filter(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia.filters.Pernr, sap.ui.model.FilterOperator.EQ,getAttributeValue("/manager/empleadoSelected/PERNR"))); //getAttributeValue("/userInfo/PERNR"))
		filters.push(new sap.ui.model.Filter("LANGU", sap.ui.model.FilterOperator.EQ, lang)); //getAttributeValue("/userInfo/PERNR"))
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);		
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia);
		params.setFilterEntity(filters);
//		params.setExportType("json");
		params.setExpand("detalleparte,detallehora,detalledia");
		params.setSuccess([this.ordenarConceptos]);
		params.setResultData_path("/popoverDiaEmpleado");
		callODataServiceRead(params,undefined,true);
	},
	
	
	/**
	 * Funcion para ordenar los conceptos horarios en la visualizacion del parte
	 * @param data
	 */
	ordenarConceptos : function(data){
		
		
		data.detallehora.results.sort(function compareFunction (a, b)  {
			
			var horaIniA = a.Beghr.split(":")[0], minutoIniA = a.Beghr.split(":")[1];
			var horaIniB = b.Beghr.split(":")[0], minutoIniB = b.Beghr.split(":")[1];
			
			
			var horaFinA = a.Endhr.split(":")[0], minutoFinA = a.Endhr.split(":")[1];
			var horaFinB = b.Endhr.split(":")[0], minutoFinB = b.Endhr.split(":")[1];
			
			// Si la hora de inicio es anterior 
			if(horaIniA < horaIniB ||(horaIniA == horaIniB && minutoIniA < minutoIniB)){
				return -1;
			}else if(horaIniA == horaIniB && minutoIniA == minutoIniB){
			// Si la hora de inicio es igual
				if(a.Beghr == a.Endhr){
					return -1;
				}
				
			}else return 1;
			
		});
		
		
      sap.ui.getCore().getModel().setProperty("/informacionDia",data);
      sap.ui.getCore().getModel().setProperty("/popoverDiaEmpleado",data);
      sap.ui.getCore().getModel().updateBindings();
		
	},
	
	/**
	 * Funcion que recupera TODOS los conceptos horarios
	 */
	getConceptosHora : function(date,pernr){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        var oController = oView.getController();
		var lang = getLangForCalls();
		var fn = this;
	    var urlData = {
	    		"LANG": "'"+lang+"'",
	    		"FECHA" : "'"+ util.Formatter.stringToString2(date) +"'",
	    		"PERNR" : "'"+pernr+"'"
	    };
	    
	    var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";	    
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoHoraTodos.key;
	    
	    success = function(data,response,request){
		      var p_data = data.d;
		      sap.ui.getCore().getModel().setProperty("/conceptosHora", p_data);
		      oController.getInformacionDia(new Date(date), pernr);
	    }
	    
	    callFunctionImport(entity,urlData,success);
	},
	
	/**
	 * Funcion para recuperar los conceptos horarios que se mostraran en el desplegable
	 */
	getConceptosHoraSelect : function(date,pernr){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        var oController = oView.getController();
		var lang = getLangForCalls();
		var fn = this;
	    var urlData = {
	    		"LANG": "'"+lang+"'",
	    		"FECHA" : "'"+ util.Formatter.stringToString2(date) +"'",
	    		"PERNR" : "'"+pernr+"'"
	    };
	    
	    var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoHora.key;
	    
	    success = function(data,response,request){
		      var p_data = data.d;
		      for(var i = 0;i<p_data.results.length;i++) {
		    	  if(conceptoEstaOculto(p_data.results[i].Lgahr) == true){
		    		  p_data.results.splice(i,1);
		    		  i--;
		    	  }
		      }
		      sap.ui.getCore().getModel().setProperty("/conceptosHoraSelect", p_data);
	    };
	    
	    callFunctionImport(entity,urlData,success);
	},
	
	/**
	 * Funcion que recupera TODOS los conceptos diarios
	 */
	getConceptosDia : function(){
		
		
		var lang = getLangForCalls();
		var fn = this;
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        var oController = oView.getController();
	    var urlData = {
	    		"LANG": "'"+lang+"'",
	    		"PERNR" : "'"+getAttributeValue("/manager/empleadoSelected/PERNR")+"'"
	    };
	    
	    var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoDia.key;
	    
	    success = function(data,response,request){
		      var p_data = data.d;
		      sap.ui.getCore().getModel().setProperty("/conceptosDia", p_data);
		    }
	    
	    
	    callFunctionImport(entity,urlData,success);
	    
	},
	
	/**
	 * Funcion para recuperar la visualizacion de columnas en el empleado
	 */
	getColumnas : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
        var oController = oView.getController();	
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    var urlData = {
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'"
	    };
				
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerColumnasEmpleado.key;
    	
	    success = 	function(data,response,request){
		      var p_data = data.d;
		      
		      p_data.Fecha = "X";
		      sap.ui.getCore().getModel().setProperty("/columnasEmpleado",p_data);
		      
		      if(p_data.Pernr == "00000000"){
		    	  oController.openTableSettingsDialog();
		      }
		    };
	    	
    	callFunctionImport(entity,urlData,success);
	},
	
	
	/**
	 * Funcion para enviar la configuracion de las columnas del empleado
	 * @param context Columnas seleccionadas
	 */
	enviarColumnas : function(context) {		
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();

		var data = getAttributeValue("/columnasEmpleado");
		data.Pernr = getAttributeValue("/userInfo/PERNR");
		delete data.__metadata;
		sap.ui.getCore().getModel().updateBindings();
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);
		params.setSuccess([oController.refreshTableAfterColumnas]);
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarColumnasEmpleado);
		callODataServiceCreate(params, data);
	},
	
	/**
	 * Funcion para abrir el dialogo de gestion de las columnas
	 */
	openTableSettingsDialog : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();
		
		if(oView.tableSettingsDialog == undefined){
			oView.createTableSettingsDialog();
		}
		
		oView.tableSettingsDialog.open();
	},
	
	/**
	 * Funcion para gestionar al seleccionar los checkbox del dialogo de gestion de columnas
	 * @param index Index de grupo
	 * @param todos Todos o ninguno
	 */
	seleccionarColumnas : function(index, todos){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        var oDialog = oView.tableSettingsDialog;
        
        var columnas = getAttributeValue("/columnasEmpleado");
        var configuracion =  getAttributeValue("/configuracion/MANAGER");
        
		if(todos == true){
        	todos = "X";
        }else todos = "";
		switch(index){
		
		case 1: {
			
			
			columnas.Fecha = "X";
			
			if ( configuracion.MAN_D_ACU001.COL_CUMUL  != undefined )
				columnas.Cumul = todos;
        	else columnas.Cumul = "";
//			if ( configuracion.MAN_D_GEN001.COL_HOR_TEOR  != undefined )
//				columnas.HorTeor = todos;
//        	else columnas.HorTeor = "";
//			if ( configuracion.MAN_D_GEN001.COL_HOR_DING  != undefined )
//				columnas.HorDingo = todos;
//        	else columnas.HorDingo = "";
//			columnas.HorDingo = "";
//			columnas.Stahd = "X";
			break;
		}
		case 2: {
			
			if ( configuracion.MAN_D_HEXT.COL_HE_G != undefined || configuracion.MAN_D_HEXT.COL_HE_C != undefined )
				columnas.Gencomp90 = todos;
        	else columnas.Gencomp90 = "";
			if ( configuracion.MAN_D_JEXT.COL_JE_G != undefined || configuracion.MAN_D_JEXT.COL_JE_C != undefined )
				columnas.Gencomp91 = todos;
        	else columnas.Gencomp91 = "";
			if ( configuracion.MAN_D_FTRA.COL_FT_G != undefined || configuracion.MAN_D_FTRA.COL_FT_C != undefined  )
				columnas.Gencomp92 = todos;
        	else columnas.Gencomp92 = "";
			if ( configuracion.MAN_D_FSPC.COL_HE_G != undefined || configuracion.MAN_D_FSPC.COL_FS_C != undefined  )
				columnas.Gencomp93 = todos;
        	else columnas.Gencomp93 = "";
			break;
		}
		

        case 3:
        {
        	if ( configuracion.MAN_D_SAL001.COL_COND_COM != undefined )
        		columnas.COND_COMP = todos;
        	else columnas.COND_COMP = "";
        	if ( configuracion.MAN_D_SAL001.COL_COND_REA != undefined )
        		columnas.COND_REAL = todos;
        	else columnas.COND_REAL = "";
        	if ( configuracion.MAN_D_SAL001.COL_COND_JOR != undefined )
        		columnas.COND_JORN = todos;
        	else columnas.COND_JORN = "";
        	if ( configuracion.MAN_D_SAL001.COL_DIRE_COM != undefined )
        		columnas.DIRE_COMP = todos;
        	else columnas.DIRE_COMP = "";
        	if ( configuracion.MAN_D_SAL001.COL_DIRE_REA != undefined )
        		columnas.DIRE_REAL = todos;
        	else columnas.DIRE_REAL = "";
        	if ( configuracion.MAN_D_SAL001.COL_DIRE_JOR != undefined )
        		columnas.DIRE_JORN = todos;
        	else columnas.DIRE_JORN = "";
        	if ( configuracion.MAN_D_SAL001.COL_MONT_COM != undefined )
        		columnas.MONT_COMP = todos;
        	else columnas.MONT_COMP = "";
        	if ( configuracion.MAN_D_SAL001.COL_MONT_REA != undefined )
        		columnas.MONT_REAL = todos;
        	else columnas.MONT_REAL = "";
        	if ( configuracion.MAN_D_SAL001.COL_MONT_JOR != undefined )
        		columnas.MONT_JORN = todos;
        	else columnas.MONT_JORN = "";
        	if ( configuracion.MAN_D_SAL001.COL_REGU_COM != undefined )
        		columnas.REGU_COMP = todos;
        	else columnas.REGU_COMP = "";
        	if ( configuracion.MAN_D_SAL001.COL_REGU_REA != undefined )
        		columnas.REGU_REAL = todos;
        	else columnas.REGU_REAL = "";
        	if ( configuracion.MAN_D_SAL001.COL_REGU_JOR != undefined )
        		columnas.REGU_JORN = todos;
        	else columnas.REGU_JORN = "";
        	if ( configuracion.MAN_D_SAL001.COL_VIAJ_COM != undefined )
        		columnas.VIAJ_COMP = todos;
        	else columnas.VIAJ_COMP = "";
        	if ( configuracion.MAN_D_SAL001.COL_VIAJ_REA != undefined )
        		columnas.VIAJ_REAL = todos;
        	else columnas.VIAJ_REAL = "";
        	if ( configuracion.MAN_D_SAL001.COL_VIAJ_JOR != undefined )
        		columnas.VIAJ_JORN = todos;
        	else columnas.VIAJ_JORN = "";
        	if ( configuracion.MAN_D_SAL001.COL_TOTA_COM != undefined )
        		columnas.TOTA_COMP = todos;
        	else columnas.TOTA_COMP = "";
        	if ( configuracion.MAN_D_SAL001.COL_TOTA_REA != undefined )
        		columnas.TOTA_REAL = todos;
        	else columnas.TOTA_REAL = "";
        	if ( configuracion.MAN_D_SAL001.COL_TOTA_JOR != undefined )
        		columnas.TOTA_JORN = todos;
        	else columnas.TOTA_JORN = "";
            break;
        }
		
		
		case 4: {
			
						
        	if ( configuracion.MAN_D_ACU001.COL_DIET != undefined ) 
        		columnas.Dietas = todos;
        	else columnas.Dietas = "";
        	if ( configuracion.MAN_D_ACU001.COL_KM != undefined ) 
        		columnas.Km = todos;
        	else columnas.Km = "";
        	if ( configuracion.MAN_D_ACU001.COL_COMI != undefined ) 
        		columnas.Comida = todos;
        	else columnas.Comida = "";
        	if ( configuracion.MAN_D_ACU001.COL_VIAJE != undefined ) 
        		columnas.Viaje = todos;
        	else columnas.Viaje = "";
        	if ( configuracion.MAN_D_ACU001.COL_PLWE != undefined ) 
        		columnas.Finde = todos;
        	else columnas.Finde = "";
        	if ( configuracion.MAN_D_ACU001.COL_HOCO != undefined ) 
        		columnas.Hacom = todos;
        	else columnas.Hacom = "";
        	if ( configuracion.MAN_D_ACU001.COL_JEVI != undefined ) 
        		columnas.Jevia = todos;
        	else columnas.Jevia = "";
        	if ( configuracion.MAN_D_ACU001.COL_IMJE != undefined ) 
        		columnas.Jext = todos;
        	else columnas.Jext = "";
        	if ( configuracion.MAN_D_ACU001.COL_IMFT != undefined ) 
        		columnas.Ftra = todos;
        	else columnas.Ftra = "";
        	if ( configuracion.MAN_D_ACU001.COL_IMFE != undefined ) 
        		columnas.Fspc = todos;
        	else columnas.Fspc = "";
        	if ( configuracion.MAN_D_ACU001.COL_PLUS_CON != undefined ) 
        		columnas.PLUS_COND = todos;
        	else columnas.PLUS_COND = "";
			break;
		}
		
		}
		 sap.ui.getCore().getModel().setProperty("/columnasEmpleado", columnas);
        sap.ui.getCore().getModel().updateBindings();
	},
	
	
	refreshTableAfterColumnas : function(){ 
		
		var oView = sap.ui.getCore().byId(Common.Navigations.EMPLEADO);
		var oController = oView.getController();

        var periodoManager = getAttributeValue("/periodoManager/results");
 	   	oController.getTotalesEmpleado();
	},
	
	
	/**
	 * Función que obtiene TODOS los tipos de conceptos horarios
	 */
	getTurnoTeoricoEmpleado: function() {
	
	
	    var lang = getLangForCalls();
	    var fn = this;
	    
	    var fecha = getAttributeValue("/periodoManager/results/0/ZhrDatum");
	    
	    var urlData = {
			"FECHA" : "'"+ fecha+"T00:00:00" +"'",
	        "PERNR": "'" + getAttributeValue("/manager/empleadoSelected/PERNR") + "'"
	    };
	
	    var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerTurno.key;
	
	    success = function(data, response, request) {
	        var p_data = data.d;
	        sap.ui.getCore().getModel().setProperty("/manager/turnoEmpleadoSelected", p_data);
	
	    }
	
	    callFunctionImport(entity, urlData, success);
	},
	
	
	getHorarioEnDiaSemanaInicio: function(fecha, turno) {
		
		if( fecha && turno){
			var date = util.Formatter.stringToDate4(fecha);
			
			// esto es un cambio otro cambio
			if(turno != undefined){
				var diaSemana = date.getDay();
				var diaHorario = "";
				switch(diaSemana){
				
				case 1: {
					diaHorario = "L";
					break;
				}
				case 2: {
					diaHorario = "M";
					break;
				}
				case 3: {
					diaHorario = "X";
					break;
				}
				case 4: {
					diaHorario = "J";
					break;
				}
				case 5: {
					diaHorario = "V";
					break;
				}
				case 6: {
					diaHorario = "S";
					break;
				}
				case 0: {
					diaHorario = "D";
					break;
				}
				}
				
//				Devolvemos el inicio y el fin de la primera parte del turno
				var rutaIni1 = "Iturn"+ diaHorario+"1";
				var ini1 = turno[rutaIni1];
				var rutaFin1 = "Fturn"+ diaHorario+"1";
				var fin1 = turno[rutaFin1];
				var result = ini1 +" - "+ fin1;
				
				return result;
			}
			
			
		}
		
		
		
	},
	
	getHorarioEnDiaSemanaFin: function(fecha, turno) {
		
		if( fecha && turno){
			var date = util.Formatter.stringToDate4(fecha);
			
			
			if(turno != undefined){
				var diaSemana = date.getDay();
				var diaHorario = "";
				switch(diaSemana){
				
				case 1: {
					diaHorario = "L";
					break;
				}
				case 2: {
					diaHorario = "M";
					break;
				}
				case 3: {
					diaHorario = "X";
					break;
				}
				case 4: {
					diaHorario = "J";
					break;
				}
				case 5: {
					diaHorario = "V";
					break;
				}
				case 6: {
					diaHorario = "S";
					break;
				}
				case 0: {
					diaHorario = "D";
					break;
				}
				}
				
	//			Vemos si tiene turno partido
				var checkTurnoPartido;
				var rutaIni2 = "Iturn"+ diaHorario+"2";
				var ini2 = turno[rutaIni2];
				if(ini2.charAt(0) != ":") {
					ini2 = turno[rutaIni2];
					var rutaFin2 = "Fturn"+ diaHorario+"2";
					var fin2 = turno[rutaFin2];
				}
				
				
				var result = ini2 + " - "+ fin2;
				
				return result;
			}
		}
		
		
		
	}

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.EmpleadoManager
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.EmpleadoManager
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.EmpleadoManager
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.EmpleadoManager
*/
//	onExit: function() {
//
//	}

});