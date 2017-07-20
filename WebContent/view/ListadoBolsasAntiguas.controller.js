sap.ui.controller("view.ListadoBolsasAntiguas", {

	
	onInit: function() {

		var oView = this.getView();
		setViewTitle(oView,"view.listadoBolsas.title");
		
	},
	
	onBeforeShow : function(oEvt) {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.LIST_BOLSAS);
    	var oController = oView.getController();
    	oController.getBolsasAntiguas();
		
	},
	
	/**
	 * Funcion para navegar atrás
	 */
	onNavBack: function(){
		
		var app = sap.ui.getCore().byId(Common.App.Name);
		app.backDetail();
	},
	
	
	 /**
     * Función que obtiene las bolsas para el periodo actual
     */
    getBolsasAntiguas: function() {

    	var oView = sap.ui.getCore().byId(Common.Navigations.LIST_BOLSAS);
    	var oController = oView.getController();
    	
        var lang = getLangForCalls();
        var fn = this;
        
        var urlData = {
    		"BEGDA" : "'20160101'",
    		"ENDDA" : "'"+ util.Formatter.dateToString(new Date()) +"'",
    		"TODAS" : "'X'",
            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
        };

        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerBolsas.key;
        success = function(data, response, request) {
            var p_data = data.d;
            sap.ui.getCore().getModel().setProperty("/bolsasAntiguas", p_data);
        }

        callFunctionImport(entity, urlData, success);
    },
    
	
    onSelectCheckBoxBolsa : function(oEvt) {
		

		var oView = sap.ui.getCore().byId(Common.Navigations.LIST_BOLSAS);
	    var oController = oView.getController();
	    
		var oCheckBox = oEvt.getSource();
		var selected = oEvt.getParameter("selected");
		var oContext = oCheckBox.getBindingContext().getObject();
		var ktart = oContext.Ktart;
		var bolsas = getAttributeValue("/bolsasAntiguas/results");
		var sociedad = getAttributeValue("/constantesUser/results/0/Werks");
		var segundo, newContext;
		
		oContext.Cobrar = (selected == true)? "X" : "";
		oContext.Fecha_Aplicacion = util.Formatter.dateToOdataDate(new Date());
		var infotipo94Creado = false;
		if(bolsas && sociedad == "EU01" && ktart == "90") {
    		
    		for(var i = 0; i < bolsas.length; i++) {
    			if( bolsas[i].Begda == oContext.Begda && bolsas[i].Endda == oContext.Endda 
    					&& bolsas[i].Ktart == "94"){

    				bolsas[i].Cobrar = (selected == true)? "X" : "";
    				bolsas[i].Fecha_Aplicacion = util.Formatter.dateToOdataDate(new Date());
    				var nuevo94 = bolsas[i];
    				segundo = function(){
    					oController.enviarBolsa(nuevo94);
    				}
    			}
    		}
    	}
		
		if( segundo != undefined )
			oController.enviarBolsa(oContext, segundo);
		else oController.enviarBolsa(oContext);
	},
	
	
	enviarBolsa : function(bolsa, segundo){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.LIST_BOLSAS);
	    var oController = oView.getController();
	
	    var lang = getLangForCalls();
	
	
	    var params = new CustomModelParameters();
	    params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	    params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarBolsa);
	    var success = [oController.showMessageResponse]
	    if(segundo)
	    	success.push(segundo);
	    success.push(oController.getBolsasAntiguas);
	    params.setSuccess(success);
//	    params.setResultData_path("/turnoEmpleado/results/0");
	    callODataServiceCreate(params, bolsa);
	
	},
	
	showMessageResponse : function(data){
		
		 sap.m.MessageToast.show(data.texto);
	}
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.ListadoBolsasAntiguas
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.ListadoBolsasAntiguas
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.ListadoBolsasAntiguas
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.ListadoBolsasAntiguas
*/
//	onExit: function() {
//
//	}

});