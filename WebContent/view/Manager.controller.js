sap.ui.controller("view.Manager", {

    onInit: function() {

        var oView = this.getView();
        setViewTitle(oView, "view.manager.title");
        setPropertySAPUI5Model("/manager/empleadoSelected", new Object());
    },
    
    /**
     * Funcion que se llama cada vez que se muestra la vista del manager
     */
    onBeforeShowCalls : function() {
    	
    	var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();

        
        var empleados = getAttributeValue("/empleados/results");
        var haModificado = getAttributeValue("/haModificado");
        var cambioUsuario = getAttributeValue("/cambioUsuario");
        var periodoManager = getAttributeValue("/periodoManager/results");

        // Si es la primera vez, llamamos con el dia de hoy
        if ((empleados == undefined && (haModificado == false || haModificado == undefined)) || cambioUsuario == true) {
        	sap.ui.getCore().getModel().setProperty("/cambioUsuario", false);
            oController.getCalendarioManager(util.Formatter.dateToString(new Date()));
        } else if (haModificado == true) {
            // Si venimos de EmpleadoManager, llamamos con la fecha de inicio del periodo que acabamos de ver
            oController.getCalendarioManager(util.Formatter.stringToString(periodoManager[0].ZhrDatum), true);
        }
        
        oController.setMode();
        oController.getPeriodos();
        getDominioDentroFueraCentro();
    	
    },
    

    
    /**
     * Funcion que aprueba o rechaza los empleados seleccionados en la tabla
     * @param rechazar
     */
    aprobarRechazarPersonas: function(rechazar) {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
        var finPeriodo = getAttributeValue("/periodoManager/results").length - 1;
        var aprobarRechazar = (rechazar == true) ? "X" : "";
        //		var newStatus = oController.changeParteStatus(modo, status);

        var lang = getLangForCalls();
        var pernrTable = new Array();
        var table = oView.empleadosTable.getSelectedItems();

        var excludePendientes = getAttributeValue("/selectedPendientes");
        
        // Recupera todos los empleados y los mete en la tabla aprobmassNav
        for (var i = 0; i < table.length; i++) {
            var actual = table[i].getBindingContext().getObject();
            pernrTable.push({
                "PERNR": actual.PERNR
            });
        }

        if (pernrTable.length != 0) {

            var data = {
                BEGDA: getAttributeValue("/periodoManager/results/0/ZhrDatum").replace("-", "").replace("-", ""),
                ENDDA: getAttributeValue("/periodoManager/results/" + finPeriodo + "/ZhrDatum").replace("-", "").replace("-", ""),
                RECHAZAR: aprobarRechazar,
                ACTOR: getAttributeValue("/userInfo/PERNR"),
                LANGU: lang,
                aprobmassNav: pernrTable
            }

            var params = new CustomModelParameters();
            params.setService(ServiceConstants.Z_HR_CTLH_SRV);
            params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.aprobarPersonas);
            params.setSuccess([this.getEmpleados]);
            callODataServiceCreate(params, data);

        } else {

            sap.m.MessageToast.show(getI18nText("common.mensajes.noEmpleados"));
        }

        oView.empleadosTable.removeSelections(true);

    },

    /**
     * Funcion que recupera el periodo del manager para mostrar el actual o el anterior
     * @param date Fecha 
     * @param fromEmpleados Boolean si venimos de la vista de empleados
     */
    getCalendarioManager: function(date, fromEmpleados) {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();

        var lang = getLangForCalls();
        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
        var urlData = {
            "FECHA": "'" + date + "'",
            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
            "LANGU": "'" + lang + "'"
        };
        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.calendario.key;

        success = function(data, response, request) {
            var p_data = data.d;
            
            var listaEmpleados = getAttributeValue("/empleados/results");
            if(fromEmpleados != true) {
            	oController.getListaEmpleados(date, fromEmpleados);
            } else {
            	oController.getEmpleados(date, fromEmpleados);
            }
            
            sap.ui.getCore().getModel().setProperty("/periodoManager", p_data);
            oController.calcularFinAprobacion();
            sap.ui.getCore().getModel().updateBindings()
        };

        callFunctionImport(entity, urlData, success);
    },
    
    
    getListaEmpleados : function(date, fromEmpleados) {
    	
    	var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        
    	var directos = "";

        // Si venimos de aprobar/rechazar masivamente
        if (typeof date != "string") {
            date = date.BEGDA;
        }
        
        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
        var urlData = {
            "FECHA": "'" + date + "'",
            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
            "DIRECTOS": "'" + directos + "'"
        };

        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerEmpleados.key;
        
        var error = function (){
        	reintentarLlamada(Common.Navigations.MANAGER, "common.mensajes.errorLlamada", entity, urlData, success, this.error);
        }
                
        success = function(data, response, request) {
	        var p_data = data.d;
	        
	        if (p_data.results.length == 0){
	        	error(data, response, request);
	        }else {
	        	sap.ui.getCore().getModel().setProperty("/listaEmpleados", p_data);
	        	oController.getEmpleados(date, fromEmpleados, p_data.results);
	        }
            
        };
    	
    	callFunctionImport(entity, urlData, success, error);
    },
    
    /**
     * Funcion que recupera los subordinados de un manager para un periodo junto con sus acumulados, diferenciales, etc
     * @param date Fecha referencia
     * @param fromEmpleados Boolean si venimos de la vista de empleados
     */
    getEmpleados: function(date, fromEmpleados, tablaPernr) {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();

        var directos = "";

        // Si venimos de aprobar/rechazar masivamente
        if (typeof date != "string") {
            date = date.BEGDA;
        }
        
        if(tablaPernr == undefined) {
        	tablaPernr = getAttributeValue("/listaEmpleados/results");
        }
        
        var data = {
            "FECHA": date ,
            "PERNR": "" + getAttributeValue("/userInfo/PERNR") + "",
            "DIRECTOS": "",
            "Nav_pernr": tablaPernr,
            "Nav_subordinados": []
        };

        
        success = function(data, response, request) {
            var p_data = data.Nav_subordinados;
            
        
//            if (p_data.results.length == 0){
//            	error(data, response, request);
//            }
            sap.ui.getCore().getModel().setProperty("/empleados", p_data);

            
            // Si volvemos de empleados, no metemos ningun filtro. Si es gerente/productor pero no responsable,
            // solo podra ver todos los empleados
            if (fromEmpleados == false && !(isResponsable() == false && isGerProd() == true)) {
                oController.setInitialFilter();
                oController.setDirectosFilter();
            }
            oController.setNameSorter();
        };
        
        var error = function(data){
        	
        	if(data.response.statusCode == "500"){
            	reintentarLlamada(Common.Navigations.MANAGER, "common.mensajes.errorLlamada", entity, urlData, success, this.error);
            }
		};
        
        
        /**
         * MODIFICAR AQUI EL PASO DE FUNCTION IMPORT A DEEP ENTITY PARA AÑADIR LA TABLA DE PERNRs
         */
        
        var params = new CustomModelParameters();
        params.setService(ServiceConstants.Z_HR_CTLH_SRV);
        params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerSubordinados);
        params.setSuccess([success]);
        params.setError([error]);
        callODataServiceCreate(params, data);
    },
    
    /**
     * Funcion para filtrar la tabla por nombre
     */
    setNameSorter: function() {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var aSorters = oView.empleadosTable.getBinding("items").aSorters;

        aSorters.push(new sap.ui.model.Sorter("ENAME", false));


        oView.empleadosTable.getBinding("items").sort(aSorters);

    },
    
    /**
     * Funcion para crear un filtro inicial vacio para la gestion de todos los filtros
     */
    setInitialFilter: function() {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oldFilters = oView.empleadosTable.getBinding("items").aFilters;

        oldFilters.push(new sap.ui.model.Filter([], true));


        oView.empleadosTable.getBinding("items").filter(oldFilters);
    },
    
    /**
     * Funcion que filtra la tabla por los subordinados directos del manager
     */
    setDirectosFilter: function() {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        var oldFilters;


        var filter = new sap.ui.model.Filter("DIRECTO", sap.ui.model.FilterOperator.EQ, "X");


        oldFilters = oView.empleadosTable.getBinding("items").aFilters;
        oldFilters[0].aFilters.push(filter);


        oView.empleadosTable.getBinding("items").filter(oldFilters);
    },
    
    /**
     * Funcion que filtra la tabla por los subordinados con partes pendientes
     */
    setFilterPendientes: function() {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        var oldFilters;

        var filter = new sap.ui.model.Filter("DIAS_PEND", sap.ui.model.FilterOperator.GT, 0);

        oldFilters = oView.empleadosTable.getBinding("items").aFilters;

        if (oldFilters.length == 0) {
            oController.setInitialFilter()
        }
        oldFilters[0].aFilters.push(filter);

        oView.empleadosTable.getBinding("items").filter(oldFilters);
    },
    
    /**
     * Funcion que elimina el filtro de los subordinados con partes pendientes
     */
    removeFilterPendientes: function() {
        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oldFilters = oView.empleadosTable.getBinding("items").aFilters;



        for (var i = 0; i < oldFilters[0].aFilters.length; i++) {
            if (oldFilters[0].aFilters[i].sPath == "DIAS_PEND") {
                oldFilters[0].aFilters.splice(i, 1);
                i--;
            }
        }

        if (oldFilters[0].aFilters.length == 0) {
            oView.empleadosTable.getBinding("items").filter(undefined);
        } else oView.empleadosTable.getBinding("items").filter(oldFilters);


    },
    
    /**
     * Funcion que busca usuario
     * @param oEvt Evento de busqueda
     */
    searchUser: function(oEvt) {
        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        var value = oEvt.getParameter("query");
        if (value == undefined) {
            value = oEvt.getSource().getProperty("value");
        }
        var filter;

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        // Para la llamada inicial
        if (oView.empleadosTable.getBinding("items").aFilters.length != 1 ||
            oView.empleadosTable.getBinding("items").aFilters.length == undefined) {
            oController.setInitialFilter();
        }

        var oldFilters = oView.empleadosTable.getBinding("items").aFilters;

        if (value.length > 2) {

            for (var i = 0; i < oldFilters[0].aFilters.length; i++) {
                if (oldFilters[0].aFilters[i] != undefined) {
                    if (oldFilters[0].aFilters[i].sPath == "ENAME") {
                        oldFilters[0].aFilters.splice(i, 1);
                        i--;
                    }
                }
            }

            filter = new sap.ui.model.Filter("ENAME", sap.ui.model.FilterOperator.Contains, value);

            oldFilters[0].aFilters.push(filter);
            oView.empleadosTable.getBinding("items").filter(oldFilters);
        } else {

            for (var i = 0; i < oldFilters[0].aFilters.length; i++) {
                if (oldFilters[0].aFilters[i] != undefined) {
                    if (oldFilters[0].aFilters[i].sPath == "ENAME") {
                        oldFilters[0].aFilters.splice(i, 1);
                        i--;
                    }
                }
            }

            if (oldFilters[0].aFilters.length == 0) {
                oView.empleadosTable.getBinding("items").filter(undefined);
            } else oView.empleadosTable.getBinding("items").filter(oldFilters);
        }
    },


    /**
     * Funcion que envia un mail al gerente de cada empleado para la revisión de los partes
     */
    informarGerente: function() {


        var fn = this;
        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);


        var lang = getLangForCalls();
        var pernrTable = new Array();
        var table = oView.empleadosTable.getSelectedItems();

        var calendar = getAttributeValue("/periodoManager/results");

        var dateIni = util.Formatter.stringToString(calendar[0].ZhrDatum);
        var dateFin = util.Formatter.stringToString(calendar[calendar.length - 1].ZhrDatum);


        for (var i = 0; i < table.length; i++) {
            var actual = table[i].getBindingContext().getObject();
            pernrTable.push({
                "PERNR": actual.PERNR
            });
        }

        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
        var urlData = {
            "BEGDA": dateIni,
            "ENDDA": dateFin,
            "SOLICITANTE": "" + getAttributeValue("/userInfo/PERNR") + "",
            "TIPOMAIL": "3",
            "LANGU": "" + lang + "",
            "revision_nav": pernrTable,

        };

        if (pernrTable.length != 0) {

            var params = new CustomModelParameters();
            params.setService(ServiceConstants.Z_HR_CTLH_SRV);
            params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informarGerente);
            //			params.setResultData_path("/");
            callODataServiceCreate(params, urlData);

        } else {

            sap.m.MessageToast.show(getI18nText("common.mensajes.noEmpleados"));
        }

        oView.empleadosTable.removeSelections(true);
    },
    
    
    /**
     * Funcion que informa a los responsables de cada empleado seleccionado para la revision de los partes
     */
    informarResponsable: function() {


        var fn = this;
        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var lang = getLangForCalls();
        var pernrTable = new Array();
        var table = oView.empleadosTable.getSelectedItems();

        var calendar = getAttributeValue("/periodoManager/results");

        var dateIni = util.Formatter.stringToString(calendar[0].ZhrDatum);
        var dateFin = util.Formatter.stringToString(calendar[calendar.length - 1].ZhrDatum);


        for (var i = 0; i < table.length; i++) {
            var actual = table[i].getBindingContext().getObject();
            pernrTable.push({
                "PERNR": actual.PERNR
            });
        }

        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
        var urlData = {
            "BEGDA": "" + dateIni + "",
            "ENDDA": "" + dateFin + "",
            "SOLICITANTE": "" + getAttributeValue("/userInfo/PERNR") + "",
            "TIPOMAIL": "4",
            "LANGU": "" + lang + "",
            "revision_nav": pernrTable,

        };

        if (pernrTable.length != 0) {

            var params = new CustomModelParameters();
            params.setService(ServiceConstants.Z_HR_CTLH_SRV);
            params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informarResponsable);
            //			params.setResultData_path("/");
            callODataServiceCreate(params, urlData);

        } else {

            sap.m.MessageToast.show(getI18nText("common.mensajes.noEmpleados"));
        }

        oView.empleadosTable.removeSelections(true);
    },


//    showAprobarRechazarButtonsOnRespGer: function(show) {
//
//
//        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
//        oView.aprobarTodos.setEnabled(show);
//        oView.rechazarTodos.setEnabled(show);
//    },


    /**
     * NOTA DE CAMBIO
     */

    /**
     * Funcion que setea los valores de manager y responsable estan editando para gestionar las ediciones de conceptos, etc
     */
    setMode: function() {

        if (isGerProd() == true) {
            setPropertySAPUI5Model("/gerenteEdita", true);
        } else setPropertySAPUI5Model("/gerenteEdita", false);


        if (isResponsable() == true) {
            setAttributeValue("/responsableEdita", true);
        } else setAttributeValue("/responsableEdita", false);

    },

    
    /**
	 * Funcion para recuperar la visualizacion de columnas en el empleado
	 */
	getColumnas : function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	    var urlData = {
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'"
	    };
				
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerColumnasManager.key;
    	
	    success = 	function(data,response,request){
	    	
		      var p_data = data.d;
		      p_data.DiasPend = "X";
		      sap.ui.getCore().getModel().setProperty("/columnasManager",p_data);
		      
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
	enviarColumnas : function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
		var oController = oView.getController();

		var data = getAttributeValue("/columnasManager");
		delete data.__metadata;
		data.Pernr = getAttributeValue("/userInfo/PERNR");
		sap.ui.getCore().getModel().updateBindings();
		
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);	
		params.setSuccess([oController.refreshTableAfterColumnas]);
		params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarColumnasManager);
		callODataServiceCreate(params, data);
	},
	
	refreshTableAfterColumnas : function(){ 
		
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
		var oController = oView.getController();

        var periodoManager = getAttributeValue("/periodoManager/results");
 	   	oController.getCalendarioManager(util.Formatter.stringToString(periodoManager[0].ZhrDatum), true);
	},


	/**
     * Funcion que abre (e instancia) el dialogo de gestion de columnas de la tabla
     */
    openTableSettingsDialog: function() {

        var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();

        if (oView.tableSettingsDialog == undefined) {
        	oView.createTableSettingsDialog();
        }
        oView.tableSettingsDialog.open();
    },

    
    /**
     * Funcion que reacciona a la seleccion de los checkbox del dialogo para la gestion de columnas
     * @param index Index del check
     * @param todos Selecciona marcar todos
     */
    seleccionarColumnas: function(index, todos) {

    	var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
        var oDialog = oView.tableSettingsDialog;
        
        var columnas = getAttributeValue("/columnasManager");
        var configuracion =  getAttributeValue("/configuracion/MANAGER");
        
        if(todos == true){
        	todos = "X";
        }else todos = "";
        
        switch (index) {
            case 1:
            {
                columnas.Ename = "X";
                columnas.DiasPend = "X";
                break;
            }
            case 2:
            {
            	if ( configuracion.MAN_G_DIF001.COL_HE_D != undefined )
            		columnas.Dif90 = todos;
            	else columnas.Dif90 = "";
            	if ( configuracion.MAN_G_DIF001.COL_JE_D != undefined )
            		columnas.Dif91 = todos;
            	else columnas.Dif91 = "";
            	if ( configuracion.MAN_G_DIF001.COL_FT_D != undefined )
            		columnas.Dif92 = todos;
            	else columnas.Dif92 = "";
            	if ( configuracion.MAN_G_DIF001.COL_FS_D != undefined )
            		columnas.Dif93 = todos;
            	else columnas.Dif93 = "";
                break;
            }
            case 3:
            {
		        if ( configuracion.MAN_G_SAL001.COL_HE_G != undefined ) 
		        	columnas.Gen90 = todos;
            	else columnas.Gen90 = "";
            	if ( configuracion.MAN_G_SAL001.COL_HE_C != undefined )
            		columnas.Comp90 = todos;
            	else columnas.Comp90 = "";
            	if ( configuracion.MAN_G_SAL001.COL_JE_G != undefined )
            		columnas.Gen91 = todos;
            	else columnas.Gen91 = "";
            	if ( configuracion.MAN_G_SAL001.COL_JE_C != undefined )
            		columnas.Comp91 = todos;
            	else columnas.Comp91 = "";
            	if ( configuracion.MAN_G_SAL001.COL_FT_G != undefined )
            		columnas.Gen92 = todos;
            	else columnas.Gen92 = "";
            	if ( configuracion.MAN_G_SAL001.COL_FT_C != undefined )
            		columnas.Comp92 = todos;
            	else columnas.Comp92 = "";
            	if ( configuracion.MAN_G_SAL001.COL_FS_G != undefined )
            		columnas.Gen93 = todos;
            	else columnas.Gen93 = "";
            	if ( configuracion.MAN_G_SAL001.COL_FS_C != undefined )
            		columnas.Comp93 = todos;
            	else columnas.Comp93 = "";
                break;
            }
            case 4:
            {
		        if ( configuracion.MAN_G_SAL001.COL_JORN_PER != undefined ) 
		        	columnas.NUM_JOR_HOR = todos;
            	else columnas.NUM_JOR_HOR = "";
            	if ( configuracion.MAN_G_SAL001.COL_COND_COM != undefined )
            		columnas.COND_COMP = todos;
            	else columnas.COND_COMP = "";
            	if ( configuracion.MAN_G_SAL001.COL_COND_REA != undefined )
            		columnas.COND_REAL = todos;
            	else columnas.COND_REAL = "";
            	if ( configuracion.MAN_G_SAL001.COL_COND_JOR != undefined )
            		columnas.COND_JORN = todos;
            	else columnas.COND_JORN = "";
            	if ( configuracion.MAN_G_SAL001.COL_DIRE_COM != undefined )
            		columnas.DIRE_COMP = todos;
            	else columnas.DIRE_COMP = "";
            	if ( configuracion.MAN_G_SAL001.COL_DIRE_REA != undefined )
            		columnas.DIRE_REAL = todos;
            	else columnas.DIRE_REAL = "";
            	if ( configuracion.MAN_G_SAL001.COL_DIRE_JOR != undefined )
            		columnas.DIRE_JORN = todos;
            	else columnas.DIRE_JORN = "";
            	if ( configuracion.MAN_G_SAL001.COL_MONT_COM != undefined )
            		columnas.MONT_COMP = todos;
            	else columnas.MONT_COMP = "";
            	if ( configuracion.MAN_G_SAL001.COL_MONT_REA != undefined )
            		columnas.MONT_REAL = todos;
            	else columnas.MONT_REAL = "";
            	if ( configuracion.MAN_G_SAL001.COL_MONT_JOR != undefined )
            		columnas.MONT_JORN = todos;
            	else columnas.MONT_JORN = "";
            	if ( configuracion.MAN_G_SAL001.COL_REGU_COM != undefined )
            		columnas.REGU_COMP = todos;
            	else columnas.REGU_COMP = "";
            	if ( configuracion.MAN_G_SAL001.COL_REGU_REA != undefined )
            		columnas.REGU_REAL = todos;
            	else columnas.REGU_REAL = "";
            	if ( configuracion.MAN_G_SAL001.COL_REGU_JOR != undefined )
            		columnas.REGU_JORN = todos;
            	else columnas.REGU_JORN = "";
            	if ( configuracion.MAN_G_SAL001.COL_VIAJ_COM != undefined )
            		columnas.VIAJ_COMP = todos;
            	else columnas.VIAJ_COMP = "";
            	if ( configuracion.MAN_G_SAL001.COL_VIAJ_REA != undefined )
            		columnas.VIAJ_REAL = todos;
            	else columnas.VIAJ_REAL = "";
            	if ( configuracion.MAN_G_SAL001.COL_VIAJ_JOR != undefined )
            		columnas.VIAJ_JORN = todos;
            	else columnas.VIAJ_JORN = "";
            	if ( configuracion.MAN_G_SAL001.COL_TOTA_COM != undefined )
            		columnas.TOTA_COMP = todos;
            	else columnas.TOTA_COMP = "";
            	if ( configuracion.MAN_G_SAL001.COL_TOTA_REA != undefined )
            		columnas.TOTA_REAL = todos;
            	else columnas.TOTA_REAL = "";
            	if ( configuracion.MAN_G_SAL001.COL_TOTA_JOR != undefined )
            		columnas.TOTA_JORN = todos;
            	else columnas.TOTA_JORN = "";
                break;
            }
            
            case 5:
            {
    			if ( configuracion.MAN_G_ACU001.COL_DIET != undefined ) 
    				columnas.Dietas = todos;
            	else columnas.Dietas = "";
            	if ( configuracion.MAN_G_ACU001.COL_KM != undefined ) 
            		columnas.Km = todos;
            	else columnas.Km = "";
            	if ( configuracion.MAN_G_ACU001.COL_COMI != undefined ) 
            		columnas.Comida = todos;
            	else columnas.Comida = "";
            	if ( configuracion.MAN_G_ACU001.COL_VIAJE != undefined ) 
            		columnas.Viaje = todos;
            	else columnas.Viaje = "";
            	if ( configuracion.MAN_G_ACU001.COL_PLWE != undefined ) 
            		columnas.Finde = todos;
            	else columnas.Finde = "";
            	if ( configuracion.MAN_G_ACU001.COL_HOCO != undefined ) 
            		columnas.Hacom = todos;
            	else columnas.Hacom = "";
            	if ( configuracion.MAN_G_ACU001.COL_JEVI != undefined ) 
            		columnas.Jevia = todos;
            	else columnas.Jevia = "";
            	if ( configuracion.MAN_G_ACU001.COL_IMJE != undefined ) 
            		columnas.Jext = todos;
            	else columnas.Jext = "";
            	if ( configuracion.MAN_G_ACU001.COL_IMFT != undefined ) 
            		columnas.Ftra = todos;
            	else columnas.Ftra = "";
            	if ( configuracion.MAN_G_ACU001.COL_IMFE != undefined ) 
            		columnas.Fspc = todos;
            	else columnas.Fspc = "";
            	if ( configuracion.MAN_G_ACU001.COL_PLUS_CON != undefined ) 
            		columnas.PLUS_COND = todos;
            	else columnas.PLUS_COND = "";
            	
                break;
            }

        }


        sap.ui.getCore().getModel().setProperty("/columnasManager", columnas);
        sap.ui.getCore().getModel().updateBindings();
    },
    

    getPeriodos : function(){
		
		
		var fn = this;
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
        var oController = oView.getController();
		
		var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerPeriodos.key;
	    var urlData = {
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'",
	    		"CALENDAR" : "'X'"
	    };
	    
	    success = function (data) {
		      var p_data = data.d;
		      sap.ui.getCore().getModel().setProperty("/periodos", p_data);
		      oController.calcularFinAprobacion();
	    };
	    
	    callFunctionImport(entity,urlData,success);
	},
	
	
	onSelectionChange: function(oEvt) {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER);
		var oController = oView.getController();
		var oTable = oView.empleadosTable;
		
		if (oEvt.getParameter("listItems").length > 1) {
			oController.checkMultiplesUsuariosConstantesOnSelect(oEvt);
        } else {
        	if(oEvt.getParameter("selected") == true)
        		oController.checkUsuarioConstantesOnSelect(oEvt);
        }
		
	},
	
	
	checkMultiplesUsuariosConstantesOnSelect : function(oEvt){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER), oController = oView.getController();
		var oTable = oView.empleadosTable;
		var aItems = oEvt.getParameter("listItems");
		var aSelectedContexts = oTable.getSelectedContexts();

        for (var i = 0; i < aSelectedContexts.length; i++) {
            var oSelectedContext = aSelectedContexts[i].getObject();
            var oItem = aItems[i];
            var show = false;
            
            if (oSelectedContext.DIAS_PEND == 0) {
                show = oController.checkFinAprobacionConDivSubDiv(oSelectedContext);
            }
            oView.empleadosTable.setSelectedItem(oItem, show);
        }
		
	},
	
	
	checkFinAprobacionConDivSubDiv : function(objeto){
		
		var constantes =  getAttributeValue("/constantes/results");
		var fechaSinSubDiv, fechaConSubDiv, fecha, cons = "FIN_APRO";
		
		for(var j = 0 ; j<constantes.length; j++) {
			
			if(constantes[j].Werks == objeto.WERKS && constantes[j].Btrtl == objeto.BTRTL && constantes[j].ID_cte == cons){
				fechaConSubDiv = constantes[j].Fecha_fija;
			}
			if(constantes[j].Werks == objeto.WERKS && constantes[j].Btrtl == "" && constantes[j].ID_cte == cons){
				fechaSinSubDiv = constantes[j].Fecha_fija;
			}			
			if(fechaConSubDiv != undefined && fechaSinSubDiv != undefined){
				break;
			}
		};
		
		if(fechaConSubDiv != undefined){
			fecha = fechaConSubDiv;
		}else fecha = fechaSinSubDiv
		
		fecha = fecha.replace("-","").replace("-","");
	   	fecha = util.Formatter.stringToDate2(fecha);
	   	
		return util.Formatter.getEnabledFromConstante(fecha);
	},
	
	
	checkUsuarioConstantesOnSelect : function(oEvt) {
		
	 	var fn = this;
	 	var oView = sap.ui.getCore().byId(Common.Navigations.MANAGER), oController = oView.getController();
		var oTable = oView.empleadosTable;
	 	var selected = oEvt.getParameter("listItem")
        var object = selected.getBindingContext().getObject();
		var date = new Date();
		date = util.Formatter.dateToString(date);
		
	
	   if(object.DIAS_PEND > 0){
		   sap.m.MessageToast.show(getI18nText("common.mensajes.noEnviado"));
		   oView.empleadosTable.setSelectedItem(selected, false);
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
        
        if(dia == undefined) {
        	dia = new Date().getTime();
        }else {
            dia = util.Formatter.stringToDate4(dia);
            dia = dia.getTime();
        }
        
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
			}
        }
        if(indexPeriodo > 1){
        	result = true;
        }
        
        setAttributeValue("/fueraDePlazoAprobacion", result);
        return result;
	},
	
	
	
	
    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf view.Manager
     */
    //	onInit: function() {
    //
    //	},

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf view.Manager
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf view.Manager
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf view.Manager
     */
    //	onExit: function() {
    //
    //	}

});