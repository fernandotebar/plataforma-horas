sap.ui.controller("view.ConfigBolsas", {

	
	onSelectCheckBoxBolsa : function(oEvt) {
		

		var oView = sap.ui.getCore().byId(Common.Navigations.BOLSAS);
	    var oController = oView.getController();
	    
		var oCheckBox = oEvt.getSource();
		var selected = oEvt.getParameter("selected");
		var bolsas = getAttributeValue("/bolsas/results");
		var sociedad = getAttributeValue("/constantesUser/results/0/Werks");
		var oContext = oCheckBox.getBindingContext().getObject();
		var ktart = oContext.Ktart;
		var infotipoCreado = false;
		var bolsaEnviar, segundo, newContext;
		
		oContext.Cobrar = (selected == true)? "X" : "";
		oContext.Fecha_Aplicacion = util.Formatter.dateToOdataDate(new Date());
		oContext.Infty = "9255";
		oContext.Pernr = getAttributeValue("/userInfo/PERNR");
		delete oContext.Anzhl;
		delete oContext.Kverb;
		delete oContext.__metadata;
		
		/*
		 * Para el envio de infotipo 94
		 */
		var infotipo94Creado = false;
		var newContext;
		if(bolsas && sociedad == "EU01" && ktart == "90") {
			for(var i = 0; i < bolsas.length; i++) {
    			if( bolsas[i].Begda == oContext.Begda && bolsas[i].Endda == oContext.Endda 
    					&& bolsas[i].Ktart == "94"){
    				bolsas[i].Cobrar = (selected == true)? "X" : "";
    				bolsas[i].Fecha_Aplicacion = util.Formatter.dateToOdataDate(new Date());
    				newContext = bolsas[i];
    				infotipo94Creado = true;
    			}
			}
			
			segundo = function(){
				oController.enviarBolsa(newContext);
			}
    	}
		if(segundo)
			oController.enviarBolsa(oContext, segundo);
		else oController.enviarBolsa(oContext);
		
	},
	
	
	enviarBolsa : function(bolsa, segundo){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.BOLSAS);
	    var oController = oView.getController();
	
	    var lang = getLangForCalls();
	
	
	    var params = new CustomModelParameters();
	    params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	    params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarBolsa);
	    if(segundo)
	    	params.setSuccess([ oController.showMessageResponse, segundo]);
	    else params.setSuccess([ oController.showMessageResponse]);
//	    params.setResultData_path("/turnoEmpleado/results/0");
	    callODataServiceCreate(params, bolsa);
	
	},
	
	
	showMessageResponse : function(data){
		
		 sap.m.MessageToast.show(data.texto);
	}
	
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.ConfigBolsas
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.ConfigBolsas
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.ConfigBolsas
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.ConfigBolsas
*/
//	onExit: function() {
//
//	}

});