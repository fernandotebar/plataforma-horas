sap.ui.controller("view.ConfigTurno", {

	
	onInit: function() {
		
        var oView = this.getView();
//        setViewTitle(oView, "view.configuracion.title");
	},
	
	onBeforeShow : function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.TURNO);
		var oController = oView.getController();
		oController.getTurno();
	},
	
	
	reactToInicioTurno: function(oEvt) {

		var oDatePicker = oEvt.getSource();
		var path = oDatePicker.getBindingContext().getPath();
		var fecha = oEvt.getParameter("value");
		var fe = util.Formatter.stringToDate2(fecha);
		
		var diaSemana = fe.getDay();
		if(diaSemana != 1){
			if(diaSemana < 1){
				diaSemana = diaSemana +7; 
			}
			fe.setDate(fe.getDate() - diaSemana +1);
			var nuevaFecha = util.Formatter.dateToString(fe);
			sap.m.MessageToast.show(getI18nText("common.mensajes.inicioTurnoLunes"))
			oDatePicker.setValue(nuevaFecha);										
			fe.setHours(12);										
			var nuevoString = "/Date("+fe.getTime()+")/";										
			sap.ui.getCore().getModel().setProperty(path+"/Begda", nuevoString);
		}
		else {
			var nuevoString = "/Date("+fecha.getTime()+")/";
			sap.ui.getCore().getModel().setProperty(path+"/Begda", fecha);
		}	
		
		
	},
	
	enviarTurno : function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.TURNO);
	    var oController = oView.getController();
	
	    var lang = getLangForCalls();
	    
	
	    var data = getAttributeValue("/turnoEmpleado/results/0");
	    delete data.__metadata;
	    data.Schdl = "";
	
	    var params = new CustomModelParameters();
	    params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	    params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarTurno);
	    params.setSuccess([ oController.mostrarMensajeAlEnviar]);
	    params.setResultData_path("/turnoEmpleado/results/0");
	    callODataServiceCreate(params, data);
	
	},
	
	
	mostrarMensajeAlEnviar : function(data){
		
		if(data.texto)
			sap.m.MessageToast.show(data.texto);
		
		
	},
	
	invalidarDia : function(oEvt) {
		
		
		
	},
	
	validarTurno : function() {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.TURNO);
	    var oController = oView.getController();
		
		var turno = getAttributeValue("/turnoEmpleado/results/0");
		var correcto = true;
		
		
		var IturnL1 = sap.ui.getCore().byId("IturnL1"), FturnL1 = sap.ui.getCore().byId("FturnL1");
		var IturnL2 = sap.ui.getCore().byId("IturnL2"), FturnL2 = sap.ui.getCore().byId("FturnL2");
		var IturnM1 = sap.ui.getCore().byId("IturnM1"), FturnM1 = sap.ui.getCore().byId("FturnM1");
		var IturnM2 = sap.ui.getCore().byId("IturnM2"), FturnM2 = sap.ui.getCore().byId("FturnM2");
		var IturnX1 = sap.ui.getCore().byId("IturnX1"), FturnX1 = sap.ui.getCore().byId("FturnX1");
		var IturnX2 = sap.ui.getCore().byId("IturnX2"), FturnX2 = sap.ui.getCore().byId("FturnX2");
		var IturnJ1 = sap.ui.getCore().byId("IturnJ1"), FturnJ1 = sap.ui.getCore().byId("FturnJ1");
		var IturnJ2 = sap.ui.getCore().byId("IturnJ2"), FturnJ2 = sap.ui.getCore().byId("FturnJ2");
		var IturnV1 = sap.ui.getCore().byId("IturnV1"), FturnV1 = sap.ui.getCore().byId("FturnV1");
		var IturnV2 = sap.ui.getCore().byId("IturnV2"), FturnV2 = sap.ui.getCore().byId("FturnV2");
		var IturnS1 = sap.ui.getCore().byId("IturnS1"), FturnS1 = sap.ui.getCore().byId("FturnS1");
		var IturnS2 = sap.ui.getCore().byId("IturnS2"), FturnS2 = sap.ui.getCore().byId("FturnS2");
		var IturnD1 = sap.ui.getCore().byId("IturnD1"), FturnD1 = sap.ui.getCore().byId("FturnD1");
		var IturnD2 = sap.ui.getCore().byId("IturnD2"), FturnD2 = sap.ui.getCore().byId("FturnD2");
	
	
		if(oController.validarParesHora(turno.IturnL1 , turno.FturnL1 ) == false){
			
			IturnL1.setValueState("Error");
			FturnL1.setValueState("Error");
			return false;
		}else {
			IturnL1.setValueState("None");
			FturnL1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnL1 , turno.IturnL2 ) == false){
			
			FturnL1.setValueState("Error");
			IturnL2.setValueState("Error");
			return false;
		}else {
			FturnL1.setValueState("None");
			IturnL2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnL2 , turno.FturnL2 ) == false){
			
			IturnL2.setValueState("Error");
			FturnL2.setValueState("Error");
			return false;
		}else {
			IturnL2.setValueState("None");
			FturnL2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnM1 , turno.FturnM1 ) == false){
			
			IturnM1.setValueState("Error");
			FturnM1.setValueState("Error");
			return false;
		}else {
			IturnM1.setValueState("None");
			FturnM1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnM1 , turno.IturnM2 ) == false){
			
			FturnM1.setValueState("Error");
			IturnM2.setValueState("Error");
			return false;
		}else {
			FturnM1.setValueState("None");
			IturnM2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnM2 , turno.FturnM2 ) == false){
			
			IturnM2.setValueState("Error");
			FturnM2.setValueState("Error");
			return false;
		}else {
			IturnM2.setValueState("None");
			FturnM2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnX1 , turno.FturnX1 ) == false){
			
			IturnX1.setValueState("Error");
			FturnX1.setValueState("Error");
			return false;
		}else {
			IturnX1.setValueState("None");
			FturnX1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnX1 , turno.IturnX2 ) == false){
			
			FturnX1.setValueState("Error");
			IturnX2.setValueState("Error");
			return false;
		}else {
			FturnX1.setValueState("None");
			IturnX2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnX2 , turno.FturnX2 ) == false){
			IturnX2.setValueState("Error");
			FturnX2.setValueState("Error");
			return false;
		}else {
			IturnX2.setValueState("None");
			FturnX2.setValueState("None");
			correcto = true;
		}
		
		if(oController.validarParesHora(turno.IturnJ1 , turno.FturnJ1 ) == false){
			IturnJ1.setValueState("Error");
			FturnJ1.setValueState("Error");
			return false;
		}else {
			IturnJ1.setValueState("None");
			FturnJ1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnJ1 , turno.IturnJ2 ) == false){
			
			FturnJ1.setValueState("Error");
			IturnJ2.setValueState("Error");
			return false;
		}else {
			FturnJ1.setValueState("None");
			IturnJ2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnJ2 , turno.FturnJ2 ) == false){
			IturnJ2.setValueState("Error");
			FturnJ2.setValueState("Error");
			return false;
		}else {
			IturnJ2.setValueState("None");
			FturnJ2.setValueState("None");
			correcto = true;
		}
		
		if(oController.validarParesHora(turno.IturnV1 , turno.FturnV1 ) == false){
			IturnV1.setValueState("Error");
			FturnV1.setValueState("Error");
			return false;
		}else {
			IturnV1.setValueState("None");
			FturnV1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnV1 , turno.IturnV2 ) == false){
			
			FturnV1.setValueState("Error");
			IturnV2.setValueState("Error");
			return false;
		}else {
			FturnV1.setValueState("None");
			IturnV2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnV2 , turno.FturnV2 ) == false){
			IturnV2.setValueState("Error");
			FturnV2.setValueState("Error");
			return false;
		}else {
			IturnV2.setValueState("None");
			FturnV2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnS1 , turno.FturnS1 ) == false){
			IturnS1.setValueState("Error");
			FturnS1.setValueState("Error");
			return false;
		}else {
			IturnS1.setValueState("None");
			FturnS1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnS1 , turno.IturnS2 ) == false){
			
			FturnS1.setValueState("Error");
			IturnS2.setValueState("Error");
			return false;
		}else {
			FturnS1.setValueState("None");
			IturnS2.setValueState("None");
			correcto = true;
		}
	
		if(oController.validarParesHora(turno.IturnS2 , turno.FturnS2 ) == false){
			IturnS2.setValueState("Error");
			FturnS2.setValueState("Error");
			return false;
		}else {
			IturnS2.setValueState("None");
			FturnS2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnD1 , turno.FturnD1 ) == false){
			IturnD1.setValueState("Error");
			FturnD1.setValueState("Error");
			return false;
		}else {
			IturnD1.setValueState("None");
			FturnD1.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.FturnD1 , turno.IturnD2 ) == false){
			
			FturnD1.setValueState("Error");
			IturnD2.setValueState("Error");
			return false;
		}else {
			FturnD1.setValueState("None");
			IturnD2.setValueState("None");
			correcto = true;
		}
		if(oController.validarParesHora(turno.IturnD2 , turno.FturnD2 ) == false){
			IturnD2.setValueState("Error");
			FturnD2.setValueState("Error");
			return false;
		}else {
			IturnD2.setValueState("None");
			FturnD2.setValueState("None");
			correcto = true;
		}
	
	
		return correcto;
	},
	
	validarParesHora : function(a, b) {
		
		var horaA = {
	    		Beghr: "00:00:00",
	    		Endhr: a
		}
		
		var horaB = {
	    		Beghr: "00:00:00",
	    		Endhr: b
		}
		 
		 var timeA = util.Formatter.getAllTimeFromConcepto(horaA);
		var timeB = util.Formatter.getAllTimeFromConcepto(horaB);
		
		if(timeA.fin.getTime() > timeB.fin.getTime()) {
			return false;
		} else return true;
		
	}
	
	
	
	
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.ConfigTurno
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.ConfigTurno
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.ConfigTurno
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.ConfigTurno
*/
//	onExit: function() {
//
//	}

});