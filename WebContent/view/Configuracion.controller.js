sap.ui.controller("view.Configuracion", {

	
	
	 onInit: function() {
	
	        var oView = this.getView();
	        setViewTitle(oView, "view.configuracion.title");
	},
	
	onBeforeShow : function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.CONFIG);
    	var oController = oView.getController();
		getCompensaciones();
		oController.getBolsas(new Date());
    	oController.getTurno();
	},
	
	 /**
     * Función que obtiene las bolsas para el periodo actual
     */
    getBolsas: function(date) {

        var lang = getLangForCalls();
        var fn = this;
        var urlData = {
    		"TODAS" : "''",
    		"BEGDA" : "'"+ util.Formatter.dateToString(date) +"'",
    		"ENDDA" : "'"+ util.Formatter.dateToString(date) +"'",
            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
        };

        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerBolsas.key;

        success = function(data, response, request) {
            var p_data = data.d;
            sap.ui.getCore().getModel().setProperty("/bolsas", p_data);
        }
        callFunctionImport(entity, urlData, success);
    },
    
    /**
	 * Función que obtiene TODOS los tipos de conceptos horarios
	 */
	getTurno: function() {
	
	
	    var lang = getLangForCalls();
	    var fn = this;
	    var urlData = {
	//        "LANG": "'" + lang + "'",
			"FECHA" : "'"+ util.Formatter.dateToString(new Date()) +"'",
	        "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
	    };
	
	    var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	
	    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerTurno.key;
	
	    success = function(data, response, request) {
	        var p_data = data.d;
	        sap.ui.getCore().getModel().setProperty("/turnoEmpleado", p_data);
	
	    }
	
	    callFunctionImport(entity, urlData, success);
	},
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Configuracion
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Configuracion
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Configuracion
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Configuracion
*/
//	onExit: function() {
//
//	}

});