sap.ui.controller("view.Inicio", {

	onInit : function(){
		setEntorno();
		var oView = this.getView();
		setViewTitle(oView,"view.inicio.title");
		setPropertySAPUI5Model("/delegando", false);
	},
		
	callsAfterSuccessfulLogin : function(oEvt){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.INICIO);
		var oController = oView.getController();
		if(oEvt == undefined || oEvt.data.delegarPernr == undefined){
			oController.getBasicInfo();
		} else {
			var pernr = oEvt.data.delegarPernr;
			oController.getBasicInfo(pernr);
		}
	},
		
	getBasicInfo: function(pernr){
		
		var filters = new Array();
		filters.push(new sap.ui.model.Filter(Common.Filters.Lang, sap.ui.model.FilterOperator.EQ, getAttributeValue("/language").toUpperCase()));
		if(pernr != undefined){
			filters.push(new sap.ui.model.Filter(Common.Filters.User, sap.ui.model.FilterOperator.EQ, pernr));
		}
		
		var params= new CustomModelParameters();
		params.setService(ServiceConstants.Z_HR_CTLH_SRV);
		if(pernr == undefined){
			params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.employeePlansSet);
		}else params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.employeePlansDelSet);
		
		params.setFilterEntity(filters);
		params.setExpand("Rol")
		params.setResultData_path("/userInfo");	
		var success = [getCategoriaActual,getNegativos,getConfiguracion,getConstantesUser,getConstantesAll,getConceptosHora, getPeriodos ,getReglasValidacion, getTextosBolsas];
		if(pernr != undefined){
			success.push(checkDelegadoNoRoles);
		} else {
			success.push(checkNoRoles);
		}
		success.push(setCambioUsuario);
		params.setSuccess(success);
		
		// Incluir parámetro de error para salir de la aplicacion si no encontramos datos personales
		if(pernr == undefined){
			params.setError([loginError]);
		}
//		else params.setError([openDialogDelegar]);
		params.setSkip(0);
		callODataServiceRead(params);
	},	
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Inicio
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Inicio
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Inicio
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Inicio
*/
//	onExit: function() {
//
//	}

});