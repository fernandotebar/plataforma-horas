var itemsBusy = 0;

function setEntorno (){
	
	var host = document.location.host.split(":")[0];
	var hostExterno = document.location.origin;
	
	if (hostExterno == undefined) {
		hostExterno = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}
	if(host.indexOf("localhost") != -1){
		ServiceConstants.Host = "http://sapgw-dev-1.imagina.local:8000/sap/opu/odata/sap";
	}else
	if(host.indexOf("dev") != -1){
		ServiceConstants.Host = hostExterno + "/sap/opu/odata/sap";
	}
//	if(host.indexOf("partesdetrabajo.liquidmedia.es") != -1)
	else{
		ServiceConstants.Host = hostExterno + "/sap/opu/odata/sap";
	}
}




function loginError() {
	
	if(sap.ui.Device.system.phone == true){
		jQuery("#MenuControl").css("filter", "blur(6px)");
	}
	
	var loginErrorDialog = new sap.m.Dialog({
		showHeader: false,
		draggable: false,
		modal : true,
		afterClose : function() {
			this.open()
		},
		content: new sap.m.Text({text: "{I18N>common.mensajes.errorLogin}"})
	});
	
	loginErrorDialog.open();
}


function checkNoRoles (data) {
	
	if(data.Rol.results.length == 0)
		loginError();
}


function getLangForCalls() {
	
	
	var lang = getAttributeValue("/language");
	if(lang == "es" || lang == "ES")
		lang = "S";
	else if(lang == "ca" || lang == "CA")
		lang = "c";
	else if(lang == "en" || lang == "EN")
		lang = "E";
	
	return lang;
}


function arrayIncludes (data, array) {
	
	for(var i = 0;i<array.length;i++) {
		
		if(data === array[i]){
			return true;
		}
	}
	return false;
}

function organizeReglas (array) {
	
	
	
	var idReglas = [], conceptos = [], reglas = {};	
	for(var i = 0; i < array.length; i++){
		
		var reglaActual = array[i].ID_REGLA;
		// Si encontramos una seccion nueva
		if(arrayIncludes(reglaActual, idReglas) == false ){
			idReglas.push(reglaActual);
			var concepto = {};
			// Recorremos el array 
			conceptos = new Array();
			for( var j = 0;j< array.length ; j++){
				
				// Por cada funcion de la seccion actual
				if( array[j].ID_REGLA == reglaActual){
										
					var conceptoActual = array[j].LGAHR;
					var funcion = {};
					// Si encontramos una funcion nueva
					if(arrayIncludes(conceptoActual, conceptos) == false ){
						conceptos.push(conceptoActual);
						
						// Recorremos el array 
						for( var k = 0;k< array.length ; k++){
							// Por cada funcion de la seccion actual
							if( array[k].ID_REGLA == reglaActual && array[k].LGAHR == conceptoActual) {
								funcion[array[k].ID_NAVE] = array[k];	
							}
						}
						concepto[conceptoActual] = funcion;
					}
					
				}
				
			}
			reglas[reglaActual] = concepto;
		}		
	}
	
	sap.ui.getCore().getModel().setProperty("/reglas", reglas);
	setUserVisibility();
}


function getReglasValidacion () {
	
    var fecha = new Date();
    fecha = util.Formatter.dateToString(fecha);
    
    var urlData = {
        "FECHA": "'" + fecha + "'",
        "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
    };

    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.reglasValidacion.key;

    success = function(data, response, request) {
        var p_data = data.d;
        if(p_data.length != 0) {
        	organizeReglas(p_data.results);
        } else loginError();
        
		sap.ui.getCore().getModel().updateBindings();
    };

    callFunctionImport(entity, urlData, success);
}


//function get


function getConfiguracion () {
	
    var fecha = new Date();
    fecha = util.Formatter.dateToString(fecha);
    
    var urlData = {
        "FECHA": "'" + fecha + "'",
        "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
    };

    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.configuracion.key;

    success = function(data, response, request) {
        var p_data = data.d;
        organizeConfig(p_data.results);
    	
		sap.ui.getCore().getModel().updateBindings();
    }

    callFunctionImport(entity, urlData, success);
}

function organizeConfig (array) {
	
	var secciones = [], funciones = [], config = {};	
	for(var i = 0; i < array.length; i++){
		
		var seccionActual = array[i].Seccion;
		// Si encontramos una seccion nueva
		if(arrayIncludes(seccionActual,secciones) == false){
			secciones.push(seccionActual);
			var seccion = {};
			// Recorremos el array 
			for( var j = 0;j< array.length ; j++){
				
				// Por cada funcion de la seccion actual
				if( array[j].Seccion == seccionActual){
										
					var funcionActual = array[j].Funcion;
					var funcion = {};
					// Si encontramos una funcion nueva
					if(arrayIncludes(funcionActual,funciones) == false){
						funciones.push(funcionActual);
						
						// Recorremos el array 
						for( var k = 0;k< array.length ; k++){
							// Por cada funcion de la seccion actual
							if( array[k].Seccion == seccionActual && array[k].Funcion == funcionActual) {
								var frameActual = array[k].Frame;
								funcion[frameActual] = "X";	
							}
						}
						seccion[funcionActual] = funcion;
					}
					
				}
				
			}
			config[seccionActual] = seccion;
		}		
	}
	
	sap.ui.getCore().getModel().setProperty("/configuracion", config);
	setUserVisibility();
}



function getFragmentFromSociedad(ubicacion){
	
	var sociedad = getAttributeValue("/sociedad");
	if(sociedad == undefined){
		sociedad = "LIQUIDMEDIA";
	}
	var fragment = ubicacion[sociedad];
	
	var folder = "";
	// Si tiene un fragment especial
	if (fragment == undefined){
		fragment = ubicacion["Default"];
	}else {
		switch(sociedad) {
		
		case "LIQUIDMEDIA" : {
			folder = "LiquidMedia.";
			break;
		}
		
		default: {
			folder = "LiquidMedia.";
			break;
		}
		}
	}
	
	return "fragment." + folder + fragment;
	
}


function getListaHAs () {
	
	var reglas = getAttributeValue("/reglas/RECORTA1");
	
}


function showBusy(){
	itemsBusy++;
	sap.ui.core.BusyIndicator.show(10);
}


function hideBusy(){
	setTimeout(function(){
		if(--itemsBusy <= 0){
			sap.ui.core.BusyIndicator.hide();
			itemsBusy=0;
		}
	}, 500);
}
jQuery(function($){
	$(document).ajaxStart(function() {
		showBusy();
	});
	$(document).ajaxStop(function() {
		hideBusy();
	});  
});

function getAttributeValue(path){
	return sap.ui.getCore().getModel().getProperty(path);
}

function setAttributeValue(path, value){
	addAttributeValue(path, value);

}

function addAttributeValue(path, value, bItemInArray){
	var obj = getAttributeValue(path);
	if(obj!=null && typeof obj == "object" && obj.length != undefined){ //this is an array
		if(bItemInArray){
			obj.push(value);
			this.setAttributeInModel(path, obj);
		}else{
			this.setAttributeInModel(path, value);	
		}
	}else if(obj!=null && typeof obj == "object" && obj.length == undefined){ //this is an object
		var parentPath = path;
		if(path.lastIndexOf("/")>0){
			parentPath = path.substring(0,path.lastIndexOf("/"));
		}
		var parentObj = getAttributeValue(parentPath);
		var attr = path.substring(path.lastIndexOf("/")+1);
		parentObj[attr] = value;
		this.setAttributeInModel(parentPath, parentObj);
	}else{
		this.setAttributeInModel(path, value);
	}
	
}

/*
 * function for put atribute values in model and also in dirty model
 */
function setAttributeInModel(path, value){
	// Deep copy
	if (typeof value==="object")
		newObject=jQuery.extend(true, {}, value);
	else
		newObject=value;
	
	sap.ui.getCore().getModel(Common.DirtyModel).setProperty(path, newObject);	
	sap.ui.getCore().getModel().setProperty(path,value);
}

function removeAtributeValue(path, index){
	var source=getAtributeValue(path);
	var destination= []; 
	for (var i=0;i<source.length;i++){
		if (i!=index)destination.push(source[i]);
	}	
	this.setAtributeValue(path, destination);
}

function getI18nText(idText, params){
	return sap.ui.getCore().getModel(Common.GlobalModelNames.I18N).getResourceBundle().getText(idText, params);
}

/* Function for create intermediate objects before setting property value if they don't exists.
 * When intermediate properties exists, the parameter property is setted */
function setPropertySAPUI5Model(property, value){
	var array = property.split("/");
	var strProperty = "";
	for(var i = 0; i<array.length; i++){
		if(array[i]!=""){
			strProperty+="/"+array[i];
		}
		if(array[i]!="" && getAttributeValue(strProperty)==undefined){
			if(i == array.length-1){
				setAttributeValue(strProperty, value);	
			}else{
				setAttributeValue(strProperty, new Object());
			}
		}
	}
}

function isPhone (){
	
	return jQuery.device.is.phone;
}


function setViewTitle(view, text){
	view.header.getContentLeft()[1].bindText("I18N>"+text+"");
}


function callFunctionImport(entity,urlData,success,error) {
	
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
	
	$.ajax({
		type: "GET",
	    url: urlBase + entity,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");
			request.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate;");	
	    },
	    success: success,
	    error: error
	});
	
}


function createHeaderRequestObject(pCustomModelParameters){
	
	
	var header = { 
//		"client_language" : "ES" //Employee language,
//	    'Accept' : 'application/json',
		"Cache-Control": "no-cache, no-store, must-revalidate;",
		"Pragma": "no-cache;",
		"Content-Type": "application/json; charset= utf-8",
		"X-CSRF-Token": getAttributeValue("/userInfo/xcsrf")
		};
	
	
	return header;
}

function makeBasicAuth(uname, pword){
    var tok = uname + ':' + pword;
    var hash = $.base64.btoa(tok);
    //alert("The Authentication details are : " + tok);
    return "Basic " + hash;
}

	/*
	 * Function for executing read function of an OData service.
	 * 		@param  service           - Sevice name  (pe. ServiceConstants.ACCOUNT_DETAILS)
	 * 		@param  entity            - Entity name  (pe. ServiceConstants.ACCOUNT_DETAILS.EntitySet.ACCOUNTDETAILS)
	 * 		@param  filterEntity      - String with the entity filter
	 *		@param  filtersEntitySet  - Array with sap.ui.model.Filter
	 * 		@param  p_success         - Function exectuted when read OData is successfully
	 * 		@param  p_error			 - Function exectuted when error is generated
	 */
	function callODataLoginService(username, password, p_success, p_error){

		
		var userHardcode = "46461204P";
		var pwdHardcode = "mediapro1";
		var usrPass = makeBasicAuth(userHardcode, pwdHardcode);
	    callbackVars = {
	    	success : p_success,
	    	error : p_error    	
	    };
		$.ajax({
	        type: "GET",
	        url: ServiceConstants.HostLogin,
//	        username: userHardcode,
//	        password: pwdHardcode,
			beforeSend: function(request) {
				request.setRequestHeader('Accept' , 'application/json');
				request.setRequestHeader("Content-Type", "application/json");
				request.setRequestHeader("Authorization", usrPass);	
			},
	        error: function (data) {
	        },
	        success: function (data,response,request) {
	        	var cookie = request.getResponseHeader("Cookie");
	        	var setCookie = request.getResponseHeader("Set-Cookie");
	        	setAttributeValue("/session",document.cookie);
	        	
	        	p_success(data,response);
	        },
	    });
	    
	}


	function checkVisibility(rol){
		
		var roles = getAttributeValue("/userInfo/Rol/results");
//		var config = getAttributeValue("/configuracion");
		
		// Antes de evaluar los roles, repasamos la configuración
		switch(rol){
		
		case 'Imputar': {
			
			var menuImputar = getAttributeValue("/configuracion/ACCESOS/REP_AUT001/MENU_REP");
			if(menuImputar == undefined)
				return false;
			break;
		}
		case 'Manager': {
			
			var menuManager = getAttributeValue("/configuracion/ACCESOS/MAN_AUT001/MENU_MAN");
			if(menuManager == undefined)
				return false;
			break;
		}
		case 'Informes': {
			
			var menuImputar = getAttributeValue("/configuracion/ACCESOS/LIST_AUT001/MENU_INF");
			if(menuImputar == undefined)
				return false;
			break;
		}
		case 'Configuracion': {
					
			var menuConfiguracion = getAttributeValue("/configuracion/ACCESOS/CON_AUT001/MENU_CONF");
			if(menuConfiguracion == undefined)
				return false;
			else return true;
		}
		case 'Delegar': {
			
			var menuImputar = getAttributeValue("/configuracion/ACCESOS/DEL_AUT001/MENU_DEL");
			if( isDeptoPersonas() == true || (isDelegado() == true && menuImputar == "X")){
				return true;
			} else return false;
		}
		
		}
		
	
		if(roles != undefined && rol != "Configuracion" && rol != "Delegar"){
			for(var i =0; i<roles.length;i++){
				var grupo = Common.Roles[rol];
				
				for(var j =0;j<grupo.length;j++){
					if(grupo[j] === roles[i].Short)
						return true;
				}
					
			}
			return false;
		}
		
	}
	

	
	function setUserVisibility () {
		
		var showImputar = checkVisibility("Imputar");
		var showManager = checkVisibility("Manager");
		var showInformes = checkVisibility("Informes");
		var showConfiguracion = checkVisibility("Configuracion");
		var delegando = getAttributeValue("/delegando");
		var showDelegar;
		if(delegando == false){
			var showDelegar = checkVisibility("Delegar");
		}else showDelegar = true;
		
		
		jQuery("#menuItemImputar").css("display", showImputar? "flex" : "none");
		jQuery("#menuItemManager").css("display", showManager? "flex" : "none");
		jQuery("#menuItemReportes").css("display", showInformes? "flex" : "none");
		jQuery("#menuItemConfiguracion").css("display", showConfiguracion? "flex" : "none");
		jQuery("#menuItemDelegar").css("display", showDelegar? "flex" : "none");
		
	}
	
	function isEmpleado(){
		
		var responsable = false;
		var roles = getAttributeValue("/userInfo/Rol/results");
		if(roles){
			for(var i =0;i<roles.length;i++){
				if(roles[i].Short == "PCH_R0000001"){
					return true;
				}
			}
			return false;
		}
	}
	
	function isResponsable(){
		
		var responsable = false;
		var roles = getAttributeValue("/userInfo/Rol/results");
		if(roles){
			for(var i =0;i<roles.length;i++){
				if(roles[i].Short == "PCH_R0000002"){
					return true;
				}
			}
			return false;
		}
	}
	
	function isGerProd(){
		
		var gerprod = false
		var roles = getAttributeValue("/userInfo/Rol/results");
		if(roles){
			for(var i =0;i<roles.length;i++){
				if(roles[i].Short == "PCH_R0000003" || roles[i].Short == "PCH_R0000004"){
					return true;
				}
			}
			return false;
		}
	}
	
	function isDeptoPersonas(){
		
		var depto = false
		var roles = getAttributeValue("/userInfo/Rol/results");
		if(roles){
			for(var i =0;i<roles.length;i++){
				if(roles[i].Short == "PCH_R0000005"){
					return true;
				}
			}
			return false;
		}
	}
	
	function isDelegado(){
		
		var depto = false
		var roles = getAttributeValue("/userInfo/Rol/results");
		if(roles){
			for(var i =0;i<roles.length;i++){
				if(roles[i].Short == "PCH_R0000006"){
					return true;
				}
			}
			return false;
		}
	}

	
	
	/*
	 * Function for executing read function of an OData service.
	 * 		@param  service           - Sevice name  (pe. ServiceConstants.ACCOUNT_DETAILS)
	 * 		@param  entity            - Entity name  (pe. ServiceConstants.ACCOUNT_DETAILS.EntitySet.ACCOUNTDETAILS)
	 * 		@param  filterEntity      - String with the entity filter
	 *		@param  filtersEntitySet  - Array with sap.ui.model.Filter
	 */
	function callODataServiceFunctionImport(pCustomModelParameters, p_control){
		
		
//		showBusy();
		
	    var url = ServiceConstants.Host+"/"+pCustomModelParameters.getService().key;
		var entityStr = "/"+pCustomModelParameters.getEntity().key;
		if(pCustomModelParameters.getFilterEntity()!=undefined){
			entityStr+= "?";
			var filterz = pCustomModelParameters.getFilterEntity();
			for(var i=0;i<filterz.length; i++){
				if(i!=0)
					entityStr += "&";
				var oper = (filterz[i].sOperator == "EQ")? "=" : "";
				entityStr += filterz[i].sPath + oper + "'"+filterz[i].oValue1+ "'";
				
			}
			
	    }
	    
	    var filters = undefined;
	    if(pCustomModelParameters.getFiltersEntitySet()!=undefined){
	    	filters = pCustomModelParameters.getFiltersEntitySet();
	    }
	    
	    //Create header request with common string -> callODataServiceRead - callFunctionODataService
	    var header = createHeaderRequestObject(pCustomModelParameters);
	    
	   	var oModel = new control.CustomModel(url,{headers : header});
	    oModel.setCustomModelParameters(pCustomModelParameters);
	   
//	    //console.log(  "URL: "+url+ " / Entity:" + entityStr +  " Skip: " + pCustomModelParameters.getSkip() +  " Top: "+ pCustomModelParameters.getTop() + " OrderBy: " +pCustomModelParameters.getOrderBy());


	    //If selectFilters should be applied to read call
	    if(pCustomModelParameters.getUseFilterSelect()){
	    	var selectFilters = "";
	    	
	    	if(pCustomModelParameters.getFilterSelect()!=undefined && pCustomModelParameters.getFilterSelect().length > 0){
	    		if(selectFilters!="") selectFilters += ",";
	    		selectFilters += pCustomModelParameters.getFilterSelect();
	    	}
	    	if(selectFilters.length > 0){
	    		urlParams['$select']=selectFilters;  
	    	}
	    }
	    
	    //console.log(entityStr);
	    //console.log(filters);
	    oModel.read(entityStr, { 
			filters : filters,
			success: function(p_data, textStatus){
				var data = p_data;
				//console.log(data);
				
				if(pCustomModelParameters.getResultData_path()!=undefined && p_control != undefined && p_control.getMetadata().getName()=="control.Table"){
					if(pCustomModelParameters.getGrowingModel()){
						var currData = getAttributeValue(pCustomModelParameters.getResultData_path());
						if(currData != undefined && currData.results != undefined && data.results != undefined){
							var newData = new Array();
							newData = currData.results.concat(data.results);
							currData.results = newData;
						}
						setAttributeValue(pCustomModelParameters.getResultData_path(), currData);
					}else{
						setAttributeValue(pCustomModelParameters.getResultData_path(), data);
					}
					if(data!=undefined && data.__count != undefined)
						p_control.setTotalReg(data.__count);
					p_control.refreshItemCount();
				}else if(pCustomModelParameters.getResultData_path()!=undefined){
					setAttributeValue(pCustomModelParameters.getResultData_path(), data);
				}
				
				if(pCustomModelParameters.getSuccess() !=undefined) 
					pCustomModelParameters.getSuccess()(data);
					

//				onSuccess(data);
//				hideBusy();
			},
			error : function(data){
				var obj = data.responseText;
//				displayODataMessages(obj,true);//Second param is "true" because call isn't success
//				onError(data); 
//				
//				var view = currentNavContainer.getCurrentPage();
//				var controller = view.getController();
//				if(controller!=undefined && controller.errorMethod!=undefined){
//					alert("se ha encontrado la función errorMethod");
//				}
//				hideBusy();
			}
			
		});
	}
	
	
/*
 * Function for executing read function of an OData service.
 * 		@param  service           - Sevice name  (pe. ServiceConstants.ACCOUNT_DETAILS)
 * 		@param  entity            - Entity name  (pe. ServiceConstants.ACCOUNT_DETAILS.EntitySet.ACCOUNTDETAILS)
 * 		@param  filterEntity      - String with the entity filter
 *		@param  filtersEntitySet  - Array with sap.ui.model.Filter
 */
function callODataServiceRead(pCustomModelParameters, p_control, manager){
	
    if (pCustomModelParameters.getSkip()===0)
    	pCustomModelParameters.setSkip(Common.modelSkipDefault);
   
    if (pCustomModelParameters.getTop()===0)
    	pCustomModelParameters.setTop(Common.modelMaxSize);
    
    if(pCustomModelParameters.getNewSearch()){
    	pCustomModelParameters.setSkip(0);
    }
    
	
//	showBusy();
	
    var url = ServiceConstants.Host+"/"+pCustomModelParameters.getService().key;
	var entityStr = "/"+pCustomModelParameters.getEntity().key;
    
	if(pCustomModelParameters.getFilterEntity()!=undefined){
		entityStr += "("
		var filterz = pCustomModelParameters.getFilterEntity();
		for(var i=0;i<filterz.length; i++){
			if(i>0)
				entityStr += ","
			var oper = (filterz[i].sOperator == "EQ")? "=" : "";
			if(filterz[i].oValue1.indexOf("datetime") == -1)
				entityStr += filterz[i].sPath + oper + "'"+filterz[i].oValue1+ "'";
			else entityStr += filterz[i].sPath + oper +filterz[i].oValue1;
		}
		
    	entityStr +=  ")";
    }
    
    var filters = undefined;
    if(pCustomModelParameters.getFiltersEntitySet()!=undefined){
    	filters = pCustomModelParameters.getFiltersEntitySet();
    }
    
    //Create header request with common string -> callODataServiceRead - callFunctionODataService
    var header = createHeaderRequestObject(pCustomModelParameters);
    
   	var oModel = new control.CustomModel(url,{headers : header});
    oModel.setCustomModelParameters(pCustomModelParameters);
   
    //console.log(  "URL: "+url+ " / Entity:" + entityStr +  " Skip: " + pCustomModelParameters.getSkip() +  " Top: "+ pCustomModelParameters.getTop() + " OrderBy: " +pCustomModelParameters.getOrderBy());

    var urlParams = {};
    if(pCustomModelParameters.getUrlParameters() != undefined){
		urlParams= pCustomModelParameters.getUrlParameters();
	}
    if(pCustomModelParameters.getExpand()!=undefined){
       	urlParams['$expand']=pCustomModelParameters.getExpand();
    }
    if(pCustomModelParameters.getExportType() != undefined){
       	urlParams['$format']=pCustomModelParameters.getExportType();
    }
    if(pCustomModelParameters.getFilterEntity()==undefined && !pCustomModelParameters.getIgnoreSkipTop()){
    	urlParams['$skip']=pCustomModelParameters.getSkip();
   		urlParams['$top']=pCustomModelParameters.getTop();
    	urlParams['$inlinecount']="allpages";   	
    }
    
    if(pCustomModelParameters.getOrderBy() != ""){
    	urlParams['$orderby']=pCustomModelParameters.getOrderBy();  
    }

    //If selectFilters should be applied to read call
    if(pCustomModelParameters.getUseFilterSelect()){
    	var selectFilters = "";
    	
    	if(pCustomModelParameters.getFilterSelect()!=undefined && pCustomModelParameters.getFilterSelect().length > 0){
//    		if(selectFilters!="") selectFilters += ",";
    		var filterz=  pCustomModelParameters.getFilterSelect();
    		
    		for(var i=0;i<filterz.length; i++){
    			
    			var oper = (filterz[i].sOperator == "EQ")? " eq " : "";
    			if(filterz[i].oValue1.indexOf("datetime") == -1)
    				selectFilters += filterz[i].sPath + oper + "'"+filterz[i].oValue1+ "'";
    			else selectFilters += filterz[i].sPath + oper +filterz[i].oValue1;
    		}
    	}
    	if(selectFilters.length > 0){
    		urlParams['$filter']=selectFilters;  
    	}
    }
    
    oModel.read(entityStr, { 
		urlParameters : urlParams,
		filters : filters,
		success: function(p_data, textStatus){
			var data = p_data;
			
			if(pCustomModelParameters.getResultData_path()!=undefined && p_control != undefined && p_control.getMetadata().getName()=="control.Table"){
				if(pCustomModelParameters.getGrowingModel()){
					var currData = getAttributeValue(pCustomModelParameters.getResultData_path());
					if(currData != undefined && currData.results != undefined && data.results != undefined){
						var newData = new Array();
						newData = currData.results.concat(data.results);
						currData.results = newData;
					}
					setAttributeValue(pCustomModelParameters.getResultData_path(), currData);
				}else{
					setAttributeValue(pCustomModelParameters.getResultData_path(), data);
				}
				if(data!=undefined && data.__count != undefined)
					p_control.setTotalReg(data.__count);
				p_control.refreshItemCount();
			}else if(pCustomModelParameters.getResultData_path()!=undefined){
				if(pCustomModelParameters.getResultData_path() == "/informacionDia" && manager == false){
						var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
						p_data = oView.getController().createParteStandard(p_data);
				      sap.ui.getCore().getModel().setProperty("/informacionDia", p_data);
				}else if(pCustomModelParameters.getResultData_path() == "/informacionDia" && manager == true){
					sap.ui.getCore().getModel().setProperty("/informacionDia", p_data);
				}else sap.ui.getCore().getModel().setProperty(pCustomModelParameters.getResultData_path(), p_data);
			}
			
			var success = pCustomModelParameters.getSuccess();
			
			if(success !=undefined ){
				for(var i=0;i<pCustomModelParameters.getSuccess().length;i++){
					pCustomModelParameters.getSuccess()[i](data);
				}
			} 
				
				
		},
		error : function(data){
			var obj = data.responseText;
			
			
			
			if(data.response.statusCode == "401" || data.response.statusCode == "403"){
				loginError();
			}
			
			var error = pCustomModelParameters.getError();
			
			if(error !=undefined ){
				for(var i=0;i<pCustomModelParameters.getError().length;i++){
					pCustomModelParameters.getError()[i](data);
				}
			} 
			
			
			
		}
		
	});
}



function callODataServiceCreate(pCustomModelParameters,obj,refreshCall){

	showBusy();
	
	var oHeaders=  createHeaderRequestObject(pCustomModelParameters);

    var url = ServiceConstants.Host+"/"+pCustomModelParameters.getService().key;
   	var oModel = new control.CustomModel(url,{headers : oHeaders});
    oModel.setCustomModelParameters(pCustomModelParameters);
	
	var entityStr = "/" + pCustomModelParameters.getEntity().key;
	
	
	if(pCustomModelParameters.getFilterEntity()!=undefined){
		entityStr += "("
		var filterz = pCustomModelParameters.getFilterEntity();
		for(var i=0;i<filterz.length; i++){
			if(i>0)
				entityStr += ","
			var oper = (filterz[i].sOperator == "EQ")? "=" : "";
			entityStr += filterz[i].sPath + oper + "'"+filterz[i].oValue1+ "'";
			
		}
		
    	entityStr +=  ")";
    }
	
	var jsonData = JSON.stringify(obj);
	var pService = pCustomModelParameters.getService();

    
	OData.request({
		requestUri : url+entityStr,
		method:"POST",
		headers: {
			"X-CSRF-Token" : getAttributeValue("/userInfo/xcsrf"),
			"ContentType" : "application/json; charset=utf-8"
		},
		data:obj
    },
    //Success function
    function(data,textStatus){
    	//console.log(data);
    	
    	if(data.RESPUESTA != undefined && data.revision_nav != undefined){
    		if(data.RESPUESTA.text != ""){
    			sap.m.MessageToast.show(data.Response.text);
    		}
    	}else if(data.aprobdiasok_nav != undefined){
    		
    	}else if(data.aprobmassokNav != undefined){
    		
    	}else if(data.Response != undefined ){
				if(data.Response.text != undefined){
					if(data.Response.text != "" ){
						sap.m.MessageToast.show(data.Response.text);
					}
				}
    	}
    	
    	sap.ui.getCore().getModel().setProperty(pCustomModelParameters.getResultData_path(), data);
    	
    	var success = pCustomModelParameters.getSuccess();
		
		if(success !=undefined ){
			for(var i=0;i<pCustomModelParameters.getSuccess().length;i++){
				pCustomModelParameters.getSuccess()[i](data);
			}
		}
		
		
		hideBusy();
	},function(err){

		if(err.response.statusCode == "401" || err.response.statusCode == "403"){
			loginError();
		}
		
		if(pCustomModelParameters.getError() != undefined)
			pCustomModelParameters.getError()(err);
		hideBusy();
	});	  
}

checkSendMail = function(){
	
	var calendario = getAttributeValue("/calendario/results");
	var diaEnviado = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd")
	var fechaEnviado = getAttributeValue("/informacionDia/Fecha")
	var send = true;
	var fechaCalendar;
	var num = 0;
	if(diaEnviado == "E"){
		for(var i=0;i<calendario.length;i++){
			
			if(calendario[i].Status_parte == "" || calendario[i].Status_parte == "B"){
				fechaCalendar = calendario[i].ZhrDatum;
				num++;
				send = false;
			}
		}
		
		if(num == 1){
			var fechaBuenaCalendar = util.Formatter.stringToString(fechaCalendar);
//			var fechaBuenaDia = util.Formatter.stringToString(fechaEnviado);
			
			var fechaBuenaDia = parseInt(fechaEnviado.substring(6,19));
			fechaBuenaDia = new Date(fechaBuenaDia);
			fechaBuenaDia = util.Formatter.dateToString(fechaBuenaDia);
			
			if(fechaBuenaCalendar == fechaBuenaDia){
				send = true;
			}
		}
		
		if(send == true){
			// Llamar a servicio del mail
			var homeController = sap.ui.getCore().byId(Common.Navigations.HOME).getController();
			homeController.sendMail();
		}
	}
	
	
}

checkRealUser = function(){
	
	var correcto = true;
	var rol = getAttributeValue("/userInfo/Rol/results");
	var nombre = getAttributeValue("/userInfo/NOMBRE");
	var apellido = getAttributeValue("/userInfo/APELLIDO");
	
	if(rol  == undefined && (nombre == undefined || nombre == "" ) && (apellido == undefined || apellido == "" )){
		correcto = false;
//		logout();
	}
	
	return true; //correcto
}



getDivisas = function(){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";
    var urlData = { "SPRAS": "'"+getAttributeValue("/language")[1].toUpperCase()+"'" };
	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.divisas.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
//	      setAttributeValue("/calendario",p_data);
	      setAttributeValue("/divisas", p_data);
	    }
	});
	
}

getUdsMedida = function(){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

	var lang = getLangForCalls();
    var urlData = { "SPRAS": "'"+lang+"'" };
	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.udsMedida.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
//	      setAttributeValue("/calendario",p_data);
	      setAttributeValue("/udsMedida", p_data);
	    }
	});
	
	
}

getNegativos = function(){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

	var lang = getLangForCalls();
	
    var urlData = {
    		"FECHA": "'"+util.Formatter.dateToString(new Date())+"'",
    		"PERNR": "'"+getAttributeValue("/userInfo/PERNR") +"'",
    };

	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.negativos.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
//	      setAttributeValue("/calendario",p_data);
	      setAttributeValue("/negativos", p_data);
	    }
	});
	
	
}


getDominioEstadoParte = function(){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

	var lang = getLangForCalls();
    var urlData = {
    		"LANGU": "'"+lang+"'",
    		"DOMAIN_NAME": "'ZHRD_CTLH_STAHD'",
    };

	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.dominios.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
//	      setAttributeValue("/calendario",p_data);
	      setAttributeValue("/estadosParte", p_data);
//	      setLeyenda("estado",p_data);
	    }
	});
	
	
}

	setLeyenda = function(tipo, data){
		
		var leyenda = getAttributeValue("/leyenda"), index;
		
		if(leyenda == undefined){

			setPropertySAPUI5Model("/leyenda", {"results": new Array()});
			leyenda = getAttributeValue("/leyenda");
		}

		for(var j=0;j<data.results.length;j++){
			
			index = leyenda.results.length+1;
			data.results[j].INDEX = index;
			leyenda.results.push(data.results[j]);
		}
		
			
		
		
	},


getDominioTipoDia = function(){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

	var lang = getLangForCalls();
    var urlData = {
    		"LANGU": "'"+lang+"'",
    		"DOMAIN_NAME": "'ZHRD_CTLH_TDYHD'",
    };

	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.dominios.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
	      setAttributeValue("/tiposDia", p_data);
//	      setLeyenda("tipo",p_data);
	    }
	});
	
	
}
	
	getDominioTipoDirecto = function(){
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

		var lang = getLangForCalls();
	    var urlData = {
	    		"LANGU": "'"+lang+"'",
	    		"DOMAIN_NAME": "'ZHR_CTLH_DOM_TIP_DIREC'",
	    };

		$.ajax({
			type: "GET",
		    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.dominios.key,
		    contentType: "application/json",
	        dataType: "json",
		    data: urlData,
		    beforeSend : function(request){
				request.setRequestHeader("X-CSRF-Token", "Fetch");	
		    },
		    success: function(data,response,request){
		      var p_data = data.d;
		      setAttributeValue("/tipoDirecto", p_data);
		    }
		});
		
		
	}
	
	
	getDominioDentroFueraCentro = function(){
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

		var lang = getLangForCalls();
	    var urlData = {
	    		"LANGU": "'"+lang+"'",
	    		"DOMAIN_NAME": "'ZHR_CTLH_DOM_IN_OUT'",
	    };

		$.ajax({
			type: "GET",
		    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.dominios.key,
		    contentType: "application/json",
	        dataType: "json",
		    data: urlData,
		    beforeSend : function(request){
				request.setRequestHeader("X-CSRF-Token", "Fetch");	
		    },
		    success: function(data,response,request){
		      var p_data = data.d;
		      setAttributeValue("/dentroFueraCentro", p_data);
		    }
		});
		
		
	}
	
	getDominioViajeInternacional = function(){
		
		var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

		var lang = getLangForCalls();
	    var urlData = {
	    		"LANGU": "'"+lang+"'",
	    		"DOMAIN_NAME": "'ZHR_CTLH_DOM_VIAJ_INTER'",
	    };

		$.ajax({
			type: "GET",
		    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.dominios.key,
		    contentType: "application/json",
	        dataType: "json",
		    data: urlData,
		    beforeSend : function(request){
				request.setRequestHeader("X-CSRF-Token", "Fetch");	
		    },
		    success: function(data,response,request){
		      var p_data = data.d;
		      var token = request.getResponseHeader("X-CSRF-Token");
		      setAttributeValue("/userInfo/xcsrf", token);
		      setAttributeValue("/viajeInternacional", p_data);
		    }
		});
		
		
	}
	
	
	

getCategorias = function(manager, tipo){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

	var lang = getLangForCalls();
	var pernr;
	if(manager == true){
		pernr = getAttributeValue("/manager/empleadoSelected/PERNR");
	}else pernr = getAttributeValue("/informacionDia/Pernr");
	
    var urlData = { "PERNR": "'"+pernr+"'",
    				"LANGU": "'"+lang+"'",
    				"RESPONSABILIDAD" : "'" + tipo + "'"
    		};
	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.categorias.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
//	      setAttributeValue("/categorias", p_data);
	      sap.ui.getCore().getModel().setProperty("/categorias", p_data);	
		sap.ui.getCore().getModel().updateBindings();
	    }
	});
	
}


getCategoriaActual = function(){
	
	var urlBase = ServiceConstants.Host+"/"+ ServiceConstants.Z_HR_CTLH_SRV.key+"/";

	var lang = getLangForCalls();
    var urlData = { "PERNR": "'"+getAttributeValue("/userInfo/PERNR")+"'" };
	$.ajax({
		type: "GET",
	    url: urlBase + ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerCategoriaActual.key,
	    contentType: "application/json",
        dataType: "json",
	    data: urlData,
	    beforeSend : function(request){
			request.setRequestHeader("X-CSRF-Token", "Fetch");	
	    },
	    success: function(data,response,request){
	      var p_data = data.d;
	      var token = request.getResponseHeader("X-CSRF-Token");
	      setAttributeValue("/userInfo/xcsrf", token);
//	      setAttributeValue("/calendario",p_data);
	      setAttributeValue("/categoriaEmpleado", p_data);
	      $(".menuTextCategoria").text(p_data.TXT_CATEGORIA);
	    }
	});
	
}


logout = function(){
	
	alert("Hacer logout aqui");
//	document.location.replace( app+ "?lang=" +locale);
	
}

getCopiando = function(){
	return getAttributeValue("/copiando");
}

setCopiando = function(bool){
	 setAttributeValue("/copiando", bool);
}

showDraftSaved = function(oView){
	
	var draftIndicator = oView.getHeader.getContentRight()[0];
	draftIndicator.showDraftSaved();
	
}

deleteHAPR = function(data){
	
	for(var i=0;i<data.results.length;i++){
		if(data.results[i].Lgahr == "HAPR")
			data.results.splice(i,1);
	}
	
}


showMessageStripHeader = function( texto ){
	
	var strip =  new sap.m.MessageStrip({
			text: "{I18N>"+texto+"}",
			icon : "sap-icon//alert",
			type: sap.ui.core.MessageType.Warning,
			showIcon : true,
			showCloseButton : true,
			}
		).addStyleClass("messageStrip");
			
	 
	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	oView.header.insertContentRight(strip,0);
}

checkMessageStripsHora = function(text){
	
	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	var contenido = oView.conceptoHoraDialog.getContent();
	
	for(var i =0;i< contenido.length; i++){
		var sClass = contenido[i].getMetadata().getName();
		if(sClass == "sap.m.MessageStrip"){
			if(contenido[i].getText() == getI18nText(text)){
				return false;
			}
		}
		
	}
	return true;
}

checkMessageStripsDia = function(text){
	
	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	var contenido = oView.conceptoDiaDialog.getContent();
	
	for(var i =0;i< contenido.length; i++){
		var sClass = contenido[i].getMetadata().getName();
		if(sClass == "sap.m.MessageStrip"){
			if(contenido[i].getText() == getI18nText(text)){
				return false;
			}
		}
		
	}
	return true;
}

showMessageStripDialogHora = function( texto , tipo){
	
	
	var strip =  new sap.m.MessageStrip({
			text: "{I18N>"+texto+"}",
			icon : "sap-icon//error",
			type: (tipo == "E")? sap.ui.core.MessageType.Error: sap.ui.core.MessageType.Warning,
			showIcon : true,
			showCloseButton : true,
			}
		).addStyleClass("messageStrip");
			
	 
	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	if(checkMessageStripsHora(texto) == true)
		oView.conceptoHoraDialog.insertContent(strip,0);
}

showMessageStripDialogDia = function( texto , tipo){
	
	
	var strip =  new sap.m.MessageStrip({
			text: "{I18N>"+texto+"}",
			icon : "sap-icon//error",
			type: (tipo == "E")? sap.ui.core.MessageType.Error: sap.ui.core.MessageType.Warning,
			showIcon : true,
			showCloseButton : true,
			}
		).addStyleClass("messageStrip");
			
	 
	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	if(checkMessageStripsDia(texto) == true)
		oView.conceptoDiaDialog.insertContent(strip,0);
}

	removeStripsDialogHora = function(){
	
		var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
		var contenidoDialog = oView.conceptoHoraDialog.getContent();
		
		var contador = 0;
		
//		while(i< oView.conceptoHoraDialog.getContent().length)
		for(var i =0;i< contenidoDialog.length; i++){
			var sClass = contenidoDialog[i].getMetadata().getName();
			if(sClass == "sap.m.MessageStrip"){
				contador++;
			}
		}
		for(var j =0 ;j<contador;j++)
			oView.conceptoHoraDialog.removeContent(0);
}
	
	removeStripsDialogDia = function(){
		
		var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
		var contenidoDialog = oView.conceptoDiaDialog.getContent();
		
		var contador = 0;
		
//		while(i< oView.conceptoHoraDialog.getContent().length)
		for(var i =0;i< contenidoDialog.length; i++){
			var sClass = contenidoDialog[i].getMetadata().getName();
			if(sClass == "sap.m.MessageStrip"){
				contador++;
			}
		}
		for(var j =0 ;j<contador;j++)
			oView.conceptoDiaDialog.removeContent(0);
	}
	
	removeStripsHeader =function(){

		var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
		var contenidoHeader = oView.header.getContentRight();
		var contador = 0;
		
		for(var i =0;i< contenidoHeader.length; i++){
			var sClass = contenidoHeader[i].getMetadata().getName();
			if(sClass == "sap.m.MessageStrip"){
				contador++;
			}
		}
		for(var j =0 ;j<contador;j++)
			oView.header.removeContentRight(0);
	}
	
	
	cargarDivisionesDelegar = function() {
		
		var fn = this;


		var date = new Date();
		date = util.Formatter.dateToString(date);
		
        var lang = getLangForCalls();
        var urlData = {
            "FECHA": "'" + date + "'"
        };
        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.divisionPersonal.key;

        success = function(data, response, request) {
            var p_data = data.d;
            organizarDivisionesPersonal(data.d.results);
        };

        callFunctionImport(entity, urlData, success);
		
		
	}
	
	organizarDivisionesPersonal = function(arrayDivisiones) {
		
		var div = new Array();
		var div2 = new Array();
		for(var i = 0;i<arrayDivisiones.length;i++) {
			
			if(div.indexOf(arrayDivisiones[i].WERKS) == -1){
				var divisionActual = arrayDivisiones[i].WERKS;
				div.push(divisionActual);
				div2.push({"key": divisionActual , "text": arrayDivisiones[i].WERKS, "add": arrayDivisiones[i].NAME1, });
			}
		}
		
		sap.ui.getCore().getModel().setProperty("/divisionesPersonal", div2);
		sap.ui.getCore().getModel().setProperty("/divisionPersonalFI", arrayDivisiones);
	}
	
	cargarUsuariosDelegar = function(division, subdivision) {
		
		var fn = this;		
		var date = new Date();
		date = util.Formatter.dateToString(date);
		var roles = [];
		var arrayRoles = getAttributeValue("/userInfo/Rol/results");
		
		for (var i = 0;i < arrayRoles.length ; i++){
			roles.push({"SHORT" : arrayRoles[i].Short})
		}
		
        var lang = getLangForCalls();
        var data = {
            "FECHA":  date,
            "PERNR":  getAttributeValue("/userInfo/PERNR") ,
            "WERKS":  division,
            "BTRTL":  subdivision,
            "delegaciones_nav":  roles,
            "delegacionesEmp_nav": [],
        };
        
        var params = new CustomModelParameters();
        params.setService(ServiceConstants.Z_HR_CTLH_SRV);
        params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.delegaciones);
        if(division != undefined)
        	params.setSuccess([rebindUsuarios]);
        params.setResultData_path("/empleadosDelegar");
        callODataServiceCreate(params, data);
	}
	
	
	rebindUsuarios = function(){
				
		var oSelectDelegar = sap.ui.getCore().byId("selectDelegar");		   
		var oSuggestionItemTemplate = new sap.m.SuggestionItem({
			key: "{PERNR}",
			text: "{ENAME}",
			description: "{PERNR}"
		});
		oSelectDelegar.bindAggregation("suggestionItems","/empleadosDelegar/delegacionesEmp_nav/results",oSuggestionItemTemplate);
	}
	
    entrarDelegar = function(oEvt) {
    	
        var app = sap.ui.getCore().byId(Common.App.Name);
        var oController = sap.ui.getCore().byId(Common.Navigations.INICIO).getController();
        var oSelect = sap.ui.getCore().byId("selectDelegar");
        var oTextPernr = sap.ui.getCore().byId("selectedPernrDelegar");
        var pernr = oTextPernr.getText();
        var oButton =  sap.ui.getCore().byId("entrarDelegar");
        var oDialogDelegar = sap.ui.getCore().byId("dialogDelegar");
        
        if(pernr != undefined && pernr != "") {
        	
            oButton.unbindProperty("text");
            oButton.setText(getI18nText("common.mensajes.delegarBoton"));
            oButton.detachPress(entrarDelegar);
            oButton.attachPress(salirDelegar);
            
            oDialogDelegar.close();
            
        	oController.getBasicInfo(pernr);
            app.toDetail(Common.Navigations.INICIO);
            sap.ui.getCore().getModel().setProperty("/delegando", true);
        }else oButton.setPressed(false);
        
    	
    }
        
    salirDelegar = function(oEvt) {

	    var app = sap.ui.getCore().byId(Common.App.Name);
	    var oController = sap.ui.getCore().byId(Common.Navigations.INICIO).getController();
	    var oButton =  sap.ui.getCore().byId("entrarDelegar");
	    var oDialogDelegar = sap.ui.getCore().byId("dialogDelegar");
	    var nombre = getAttributeValue("/userInfo/NOMBRE"), apellido1 = getAttributeValue("/userInfo/APELLIDO1"),apellido2 = getAttributeValue("/userInfo/APELLIDO2");
	
	    oButton.detachPress(salirDelegar);
	    oButton.attachPress(entrarDelegar);
	    
	    oButton.setText(getI18nText("common.entrar"));
    	oController.getBasicInfo();
	    app.toDetail(Common.Navigations.INICIO);
	    sap.ui.getCore().getModel().setProperty("/delegando", false);
	    sap.m.MessageToast.show(getI18nText("common.mensajes.delegarSalir") + nombre + " "+ apellido1 + " "+ apellido2 + getI18nText("common.mensajes.delegarSalir2"));
		 oDialogDelegar.close();
    	
    }
        
   controlDelegar = function(oView){
	   	   
	   var app = sap.ui.getCore().byId(Common.App.Name);
       var oButton = sap.ui.getCore().byId("buttonDelegar");
       
       if(oButton != undefined) {
    	   var delegando = oButton.getPressed();
           
           if(delegando == false) {
        	   if(oView.getId() == Common.Navigations.INICIO){
            	   oButton.setEnabled(true);
               }else oButton.setEnabled(false);
           } else oButton.setEnabled(true);
       }
   }
   
   reactToDivisionSelect = function(oEvt) {
	   
	   	var divSelected = oEvt.getParameter("selectedItem").getKey();	   	
  		var divisiones = getAttributeValue("/divisionPersonalFI");  		
  		var subdivs = [], subdivs2 = [{"key": "" , "text": "", "add": "" }];
  		
  		for(var i =0;i<divisiones.length;i++) {
  			
  			if(divisiones[i].WERKS == divSelected && subdivs.indexOf(divSelected) == -1){
  				var subdivActual = divisiones[i].BTRTL;
  				subdivs.push(subdivActual);
  				subdivs2.push({"key": divisiones[i].BTRTL , "text": divisiones[i].BTRTL, "add": divisiones[i].BTEXT });
			}
  		}
  		
  		sap.ui.getCore().getModel().setProperty("/subDivisionesPersonal", subdivs2);
	   	
  		var oItemSubDivision = new sap.ui.core.ListItem({
			key: "{key}",
			text: "{text}",
			additionalText: "{add}"
		});
		var oSubDivisionDelegar = sap.ui.getCore().byId("subDivisionDelegar");
		oSubDivisionDelegar.unbindItems();
		oSubDivisionDelegar.bindItems("/subDivisionesPersonal",oItemSubDivision)
		cargarUsuariosDelegar(divSelected,"");
   }
   
   
   reactToSubDivisionSelect = function (oEvt) {
	   
	   var division = sap.ui.getCore().byId("divisionDelegar").getSelectedKey();
	   var subdivision = oEvt.getParameter("selectedItem").getKey();
	   
	   var oSelectDelegar = sap.ui.getCore().byId("selectDelegar");
	   oSelectDelegar.unbindAggregation("suggestionItems");
	   cargarUsuariosDelegar(division,subdivision);
   }
   
   
   openDialogDelegar = function (){
	   
	   var oDialogDelegar = sap.ui.getCore().byId("dialogDelegar");
	   
	   var oItemDivision = new sap.ui.core.ListItem({
			key: "{key}",
			text: "{text}",
			additionalText: "{add}"
		});
	   
	   var oSuggestionItemTemplate = new sap.m.SuggestionItem({
			key: "{PERNR}",
			text: "{ENAME}",
			description: "{PERNR}"
		});
	   
	   if(oDialogDelegar == undefined){
		   
		   var oDialogDelegar = new sap.m.Dialog("dialogDelegar",{
			   customHeader : new sap.m.Bar({
				   contentMiddle: new sap.m.Text({text: "Acceder como..."})
			   }),
			   content: [
			             new sap.m.VBox({
			            	 items: [
				            	 new sap.m.VBox({
				            		 visible: isDeptoPersonas(),
				            		 items: [
				            		         new sap.m.Title({text: "Division de personal"}),
				            		         new sap.m.Select("divisionDelegar",{
				            		        	 enabled: {
				            		        		 path: "/delegando",
				            		        		 formatter: function(delegando){
				            		        			 if(delegando == true)
				            		        				 return false;
				            		        			 else return true;
				            		        		 }
				            		        	 },
				            		        	 showSecondaryValues : true,
				            		        	 forceSelection: false,
				            		        	 change:reactToDivisionSelect
				            		         }).bindItems("/divisionesPersonal",oItemDivision)
				            		         ]
				            	 }),
				            	 new sap.m.VBox({
				            		 visible: isDeptoPersonas(),
				            		 items: [
				            		         new sap.m.Title({text: "Subdivision de personal"}),
				            		         new sap.m.Select("subDivisionDelegar",{
				            		        	 enabled: {
				            		        		 path: "/delegando",
				            		        		 formatter: function(delegando){
				            		        			 if(delegando == true)
				            		        				 return false;
				            		        			 else return true;
				            		        		 }
				            		        	 },
				            		        	 showSecondaryValues : true,
				            		        	 forceSelection: false,
				            		        	 change:reactToSubDivisionSelect
				            		         })
				            		         ]
				            	 }),
				            	 new sap.m.VBox({
				            		 items: [
				            		         new sap.m.Title({text: "Empleados"}),
				            		         new sap.m.Text("selectedPernrDelegar",{visible: false}),
				            		         new sap.m.SearchField("selectDelegar",{
				            		        	 enabled: {
				            		        		 path: "/delegando",
				            		        		 formatter: function(delegando){
				            		        			 if(delegando == true)
				            		        				 return false;
				            		        			 else return true;
				            		        		 }
				            		        	 },
												enableSuggestions: true,
												search: function(oEvt) {
													
													if(oEvt.getParameter("clearButtonPressed") == false){
														if(oEvt.getParameter("suggestionItem")){
															var pernr = oEvt.getParameter("suggestionItem").getKey();
															var oTextPernr = sap.ui.getCore().byId("selectedPernrDelegar")
															oTextPernr.setText(pernr);
														}
													}
												},
												suggest: function (event) {
													
													var oSF = sap.ui.getCore().byId("selectDelegar");
													var value = event.getParameter("suggestValue");
													var filters = [];
													if (value) {
														filters = [new sap.ui.model.Filter([
			                                               new sap.ui.model.Filter("PERNR", function(sText) {
				                                            	return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
				                                               }),
				                                           new sap.ui.model.Filter("ENAME", function(sDes) {
					                                            return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
					                                           })
			                                               ], false)];
													}
										 
													oSF.getBinding("suggestionItems").filter(filters);
													oSF.suggest();
												}
											}).bindAggregation("suggestionItems","/empleadosDelegar/delegacionesEmp_nav/results", oSuggestionItemTemplate).addStyleClass("selectDelegar"),
											new sap.m.ToggleButton("entrarDelegar",{
//												enabled: false,
												 text: "{I18N>common.entrar}",
												 press: entrarDelegar
											})
				            		         
			            		         ]
				            	 })
			            	 ]
			             }).addStyleClass("formDialogContainer formDialogFullWidth formDialogDelegar")
			             
		             ],
	             endButton: new sap.m.Button({
	            	 visible: {
	            		parts: ["/delegando","/userInfo/Rol/results"],
	            		formatter: function(delegando, roles){
	            			if(delegando == true && roles.length == 0){
	            				return false;
	            			}else return true;
	            		}
	            	 },
	            	 text: "{I18N>common.salir}",
	            	 press: function(oEvt){
	            		 oDialogDelegar.close();
	            	 }
	             }),
	             beforeOpen: function (oEvt){
	            	 
	            	 var delegando = getAttributeValue("/delegando");
	            	 if( delegando == false && tieneRoles() == true){
	            		 if(isDeptoPersonas() == true ){
		            		 cargarDivisionesDelegar();
		            	 }
	            		 cargarUsuariosDelegar();
	            	 }
	             }
		   }).addStyleClass("customDialog");
	   
	   }
	   
	   oDialogDelegar.open();
   }
   
   tieneRoles = function() {
	   
	   var roles = [];
		var arrayRoles = getAttributeValue("/userInfo/Rol/results");
		
		if(arrayRoles.length == 0) {
			return false;
		} else return true;
	   
   }
   
   
   checkDelegadoNoRoles = function(userInfo) {
	   var oDialogDelegar = sap.ui.getCore().byId("dialogDelegar");
	   if(userInfo.Rol.results.length == 0) {
		  
		   oDialogDelegar.open();
	   } else {
		   sap.m.MessageToast.show(getI18nText("common.mensajes.delegarEntrar") + userInfo.NOMBRE + " "+ userInfo.APELLIDO1 + " "+ userInfo.APELLIDO2);
		   oDialogDelegar.close();
	   }
   }
   
   getConstantesAll = function(){
	   
	   var fn = this;


		var date = new Date();
		date = util.Formatter.dateToString(date);
		
       var lang = getLangForCalls();
       var urlData = {
           "FECHA": "'" + date + "'",
           "PERNR": "''",
       };
       entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.constantes.key;

       success = function(data, response, request) {
           var p_data = data.d;
           sap.ui.getCore().getModel().setProperty("/constantes", p_data);
       };

       callFunctionImport(entity, urlData, success);
   }
   
   getConstantesUser = function(){
	   
	   var fn = this;
	   
		var date = new Date();
		date = util.Formatter.dateToString(date);
		
       var lang = getLangForCalls();
       var urlData = {
           "FECHA": "'" + date + "'",
           "PERNR": "'"+getAttributeValue("/userInfo/PERNR") +"'",
       };
       entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.constantes.key;

       success = function(data, response, request) {
           var p_data = data.d;
           sap.ui.getCore().getModel().setProperty("/constantesUser", p_data);
       };

       callFunctionImport(entity, urlData, success);
   }
   
   getConstante = function (nombre, constantes) {
	   
	   var fecha;
	   var externo = true;
	   var constanteEncontrada = false;
	   
		if(constantes == undefined){
			externo = false;
			constantes = getAttributeValue("/constantesUser/results");
		}
		
	   	if(constantes != undefined){
	   		for (var i =0;i<constantes.length;i++) {
		   		if(constantes[i].ID_cte == nombre){
		   			fecha = constantes[i].Fecha_fija;
		   		}
		   	}
	   		
	   		if(  fecha != undefined ){
	   			if(fecha.length > 0) {
	   				constanteEncontrada = true;
				   	fecha = fecha.replace("-","").replace("-","");
				   	fecha = util.Formatter.stringToDate2(fecha);
	   			}
	   		}
	   	}
	   	
	   	
	   	if( constanteEncontrada == false) {
	   		
	   		var numDias = Variables[nombre];
	   		var periodos = getAttributeValue("/periodos/results");
	   		
	   		switch(nombre){
	   		
		   		case 'FIN_APRO': {}
				case 'FIN_IMPU': {}
				case 'FIN_REVI': {
					var finPeriodo = parseInt(periodos[0].Begda.substring(6, 19));
					fecha = new Date(finPeriodo);
					fecha.setHours(0);
					fecha.setDate(fecha.getDate() + numDias - 1); 
					break;
				}
				case 'PLVIPA_E': {}
				case 'PLVIPA_M': {
					fecha = util.Formatter.stringToDate2(numDias);
					break;
		   		}
				case 'PLMOPA_E': {}
				case 'PLMOPA_M': {
					
					var finPeriodo = parseInt(periodos[0].Begda.substring(6, 19));
					fecha = new Date(finPeriodo);
					fecha.setHours(0);
					fecha.setDate(fecha.getDate() - numDias - 1); 
					break;
		   		}
	   		}
	   		
	   		
	   		
	   	}
	   	
	   	return fecha;
   }
   
   
   setCambioUsuario = function() {
	   sap.ui.getCore().getModel().setProperty("/cambioUsuario", true);
   }
   
   getPeriodos = function(){
		
		
		var fn = this;
		
		var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerPeriodos.key;
	    var urlData = {
	    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'",
	    		"CALENDAR" : "'X'"
	    };
	    
	    success = function (data) {
		      var p_data = data.d;
		      sap.ui.getCore().getModel().setProperty("/periodos", p_data);
	    };
	    
	    callFunctionImport(entity,urlData,success);
	}
   
   checkOnTimeFecha = function(day) {
	   
	   if(new Date().getFullYear() == day.getFullYear() && new Date().getMonth() == day.getMonth() && new Date().getDate() <= day.getDate()){
		   return true;
	   } else return false;
	   
   }
   
   
   setCompensaciones = function(conceptos) {
	   
	   var compens = new Array();
	   for(var i = 0;i<conceptos.results.length;i++ ){
		   
		   if(conceptos.results[i].Wthtx == "X"){
			   compens.push(conceptos.results[i].Lgahr)
		   }
	   }

       sap.ui.getCore().getModel().setProperty("/conceptoCompensacion", compens);
   }
   
   function  conceptoEsCompensacion (concepto) {
	   
	   
	   var conceptosCompensaciones = getAttributeValue("/conceptoCompensacion")
	   for(var n = 0;n<conceptosCompensaciones.length;n++){
       	if (concepto == conceptosCompensaciones[n]) {
	            return true;
	        }
       }
	   return false;
   }
   
   conceptoPuedeRepetirse = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
       	if (concepto == conceptos[n].Lgahr) {
	            return conceptos[n].Repeticion == "X";
	        }
       }
	   return false;
   }
   
   conceptoSolapa = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
       	if (concepto == conceptos[n].Lgahr) {
       		return  conceptos[n].Solapa == "X";
        }
       }
	   return false;
   }
   
   conceptoEstaOcultoSolapa = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
       	if (concepto == conceptos[n].Lgahr) {
       		return conceptos[n].Oculto == "X" && conceptos[n].Solapa == "X";
        }
       }
	   return false;
   }
   
   conceptoEstaOculto = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
       	if (concepto == conceptos[n].Lgahr) {
       		return conceptos[n].Oculto == "X";
        }
       }
	   return false;
   }
   
   conceptoAcumula = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
	       	if (concepto == conceptos[n].Lgahr ) {
	       		return conceptos[n].Cumul == "X";
	        }
       }
	   return false;
   }
   
   conceptoAcumulaEstaOculto = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
	       	if (concepto == conceptos[n].Lgahr ) {
	       		return conceptos[n].Oculto == "X" && conceptos[n].Cumul == "X";
	        }
       }
	   return false;
   }
   
   conceptoAcumulaNoEstaOculto = function(concepto) {
	   
	   var conceptos = getAttributeValue("/conceptosHora/results")
	   for(var n = 0;n<conceptos.length;n++){
	       	if (concepto == conceptos[n].Lgahr ) {
	       		return  conceptos[n].Cumul == "X" && conceptos[n].Oculto == "";
	        }
       }
	   return false;
   }
   
   
   getConceptoDesdeHa = function(concepto, dentroFueraParte) {
	   	   
	   var reglas = getAttributeValue("/reglas");
	   
	   var listaConceptos = reglas["RECORTA1"];
	   if(dentroFueraParte == undefined)
		   dentroFueraParte = "1";
	   var conceptos = [], conceptosSalida = [];
	   var conceptosAcumulan = getAttributeValue("/conceptosHora/results");
	   for(var i = 0; i< conceptosAcumulan.length; i++) {
		   if(conceptoAcumulaNoEstaOculto(conceptosAcumulan[i].Lgahr) == true){
			   conceptos.push(conceptosAcumulan[i].Lgahr);
		   }
	   }
	   
	   for(var j = 0;j<conceptos.length;j++) {
		   if(listaConceptos[conceptos[j]] != undefined)
			   if(listaConceptos[conceptos[j]][dentroFueraParte] != undefined){
				   if(listaConceptos[conceptos[j]][dentroFueraParte].ID_CONC1 == concepto){
					   conceptosSalida.push(conceptos[j])
				   }
			   }
		   		   
	   }
	   return conceptosSalida;
   }
   
   
   getHaDesdeConcepto = function(concepto, reglaRecorte, index) {
	   
	   var reglas = getAttributeValue("/reglas"), concept;
       var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
       if(dentroFueraParte == undefined){
    	   dentroFueraParte == "";
       }
       
       if(tieneRegla(concepto, reglaRecorte) == true) {
    	   var recorte = reglas[reglaRecorte][concepto][dentroFueraParte];
    	   
    	   if(recorte == undefined)
    		   recorte = reglas[reglaRecorte][concepto][""];
    	   if(recorte == undefined)
    		   return undefined;
    	   if(index)
    		   concept = recorte["ID_CONC"+index];
    	   else concept = recorte["ID_CONC1"];
    	   return concept;
       } else return false;
       
	   
   }
   
   
   tieneRegla = function(concepto, regla) {
	   
	   var reglas = getAttributeValue("/reglas"), concept;
       var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
       
       var tieneRecorte = reglas[regla];
       if(tieneRecorte != undefined){
       		tieneRecorte = reglas[regla][concepto];
	       if(tieneRecorte == undefined){
	    	   return false;
	       }
       }else return false
	   var recorteCon = reglas[regla][concepto][dentroFueraParte];
	   var recorteSin = reglas[regla][concepto][""];
	   if(recorteSin == undefined && recorteCon == undefined) {
		   return false;
	   } else return true;
	   
   }
   
   
   tieneRecorta2 = function(concepto) {
	   
	   var reglas = getAttributeValue("/reglas"), concept;
       var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
       
       var tieneRecorte = reglas["RECORTA2"];
       if(tieneRecorte != undefined){
       		tieneRecorte = reglas["RECORTA2"][concepto];
	       if(tieneRecorte == undefined){
	    	   return false;
	       }
       }else return false
	   var recorteCon = reglas["RECORTA2"][concepto][dentroFueraParte];
	   var recorteSin = reglas["RECORTA2"][concepto][""];
	   if(recorteSin == undefined && recorteCon == undefined) {
		   return false;
	   } else return true;
	   
   }
   
   
   
   tieneRecorta1 = function(concepto) {
	   
	   var reglas = getAttributeValue("/reglas"), concept;
       var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
       
       var tieneRecorte = reglas["RECORTA1"];
       if(tieneRecorte != undefined){
       		tieneRecorte = reglas["RECORTA1"][concepto];
	       if(tieneRecorte == undefined){
	    	   return false;
	       }
       }else return false;
       
	   var recorteCon = reglas["RECORTA1"][concepto][dentroFueraParte];
	   var recorteSin = reglas["RECORTA1"][concepto][""];
	   if(recorteSin == undefined && recorteCon == undefined) {
		   return false;
	   } else return true;
	   
   }
   
   
   tieneRecortaD = function(concepto) {
	   
	   var reglas = getAttributeValue("/reglas"), concept;
       var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
       
       var tieneRecorte = reglas["RECORTAD"];
       if(tieneRecorte != undefined){
       		tieneRecorte = reglas["RECORTAD"][concepto];
	       if(tieneRecorte == undefined){
	    	   return false;
	       }
       }else return false;
       
	   var recorteCon = reglas["RECORTAD"][concepto][""];
	   var recorteSin = reglas["RECORTAD"][concepto][dentroFueraParte];
	   if(recorteSin == undefined && recorteCon == undefined) {
		   return false;
	   } else return true;
	   
   }
   
   /**
    * Función que obtiene TODOS los tipos de conceptos horarios
    */
   getConceptosHora = function() {
	   
	   
       var lang = getLangForCalls();
       var fn = this;
       var urlData = {
           "LANG": "'" + lang + "'",
           "FECHA" : "'"+ util.Formatter.dateToString(new Date()) +"'",
           "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
       };
       
       var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
       
       entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoHora.key;
       
       success = function(data, response, request) {
           var p_data = data.d;
           setCompensaciones(p_data);
           sap.ui.getCore().getModel().setProperty("/conceptosHora", p_data);
       }

       callFunctionImport(entity, urlData, success);
   }
   
   /**
    * Función que obtiene los textos de bolsas de compensacion
    */
   getTextosBolsas =  function() {
       var lang = getLangForCalls();

       var fn = this;
       var urlData = {
           "LANGU": "'" + lang + "'",
   		"FECHA" : "'"+ util.Formatter.dateToString(new Date()) +"'",
           "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
       };

       var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

       entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.textosBolsas.key;

       success = function(data, response, request) {
           var p_data = data.d;
           sap.ui.getCore().getModel().setProperty("/textosBolsas", p_data);
       }


       callFunctionImport(entity, urlData, success);

   }
   
   
   getDescripcionProduccion = function() {

       var fn = this;
       var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

       var urlData = {
           "FECHA": "'" + util.Formatter.dateToString(new Date()) + "'",
           "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
       };

       entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDescProduccion.key;

       success = function(data, response, request) {
           var p_data = data.d;
           for(var i = 0;i< p_data.results.length;i++){
           	if(p_data.results[i].TEXT == ""){
           		p_data.results.splice(i,1);
           	}
           }
           sap.ui.getCore().getModel().setProperty("/descripcionesProduccion", p_data);

       };

       callFunctionImport(entity, urlData, success);

   }
   
   
   /**
    * Función para obtener las colisiones de los conceptos diarios
    */
   getColisiones = function() {
   	

       var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
       var urlData = {
           "FECHA": "'" + util.Formatter.stringToString(getAttributeValue("/informacionDia/Fecha")) + "'",
           "PERNR": "'" + getAttributeValue("/informacionDia/Pernr") + "'"
       };
       
       var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerColisiones.key;
       success = function(data, response, request) {
           var p_data = data.d;
           sap.ui.getCore().getModel().setProperty("/colisionesOriginal", p_data);
           organizeColisiones(p_data.results);
       }
       
       callFunctionImport(entity, urlData, success);
   }
   
   
   getConflictosConceptosDia = function(a, b, concepto) {
	   
	   if ((a.finde == true && b.ticket == true) || (b.ticket == true && a.finde == true))
		   return true;
	   if ((a.mediaDieta == true && b.viaje) || (b.viaje == true && a.mediaDieta == true)) 
		   return true;
	   if ((a.dieta == true && b.finde == true) || (b.finde == true && a.dieta == true) ||
               a.dieta == true && concepto == "PJEV")
		   return true;
	   if (a.dieta == true && concepto == "PJEV" || a.dietaCP == true && concepto == "PJEV" ||
               a.mediaDieta == true && concepto == "PJEV")
		   return true;
   }
   
   
   reintentarLlamada = function (oPage, mensaje, entity, urlData, success, error ) {
	   
	   
	   var oView = sap.ui.getCore().byId(oPage);
       var oController = oView.getController();
       
       
	   if(oView.reintentarDialog == undefined) {
   		oView.reintentarDialog = new sap.m.Dialog({
               showHeader: true,
//               draggable: true,
               title: "{I18N>common.error}",
//               type: 'Error',
               content: new sap.m.Text({
                   text: "{I18N>"+mensaje+"}"
               }),
               beginButton: new sap.m.Button({
                   text: "{I18N>common.reintentar}",
                   press: function(oEvt) {
                   	callFunctionImport(entity, urlData, success, error);
                       oView.reintentarDialog.close();
                   }
               }),
               endButton: new sap.m.Button({
                   text: "{I18N>common.cancelar}",
                   press: function() {
                   	oView.reintentarDialog.close();
                   }
               }),
               beforeOpen: function(){
               	if(window.pageYOffset > 0) {
            		   this.addStyleClass("moveCustomDialog")
            	   }else this.removeStyleClass("moveCustomDialog")
               }
           }).addStyleClass("customDialog");
	   	}
	   	
		oView.reintentarDialog.open();
		
   }
   
   
   reintentarLlamadaEnviar = function (oPage,mensaje, modo, data) {
	   
	   
	   var oView = sap.ui.getCore().byId(oPage);
       var oController = oView.getController();
       
       
	   if(oView.reintentarDialog == undefined) {
   		oView.reintentarDialog = new sap.m.Dialog({
               showHeader: true,
//               draggable: true,
               title: "{I18N>common.error}",
//               type: 'Error',
               content: new sap.m.Text({text: mensaje+". "+getI18nText("common.mensajes.deseaIntentar") }),
               beginButton: new sap.m.Button({
                   text: "{I18N>common.reintentar}",
                   press: function(oEvt) {
                   	oController.enviarDia(modo);
                       oView.reintentarDialog.close();
                   }
               }),
               endButton: new sap.m.Button({
                   text: "{I18N>common.cancelar}",
                   press: function() {
                	   oController.getCalendario(data);
                   	oView.reintentarDialog.close();
                   }
               }),
               beforeOpen: function(){
               	if(window.pageYOffset > 0) {
            		   this.addStyleClass("moveCustomDialog")
            	   }else this.removeStyleClass("moveCustomDialog")
               }
           }).addStyleClass("customDialog");
	   	}
	   	
		oView.reintentarDialog.open();
		
   }
   
   
   function organizeColisiones (array) {
		
		
		var idPermisos = [], conceptos = [], colisiones = {};	
		for (var i = 0; i < array.length; i++) {
			
			var permisoActual = array[i].PERMISOS;
			// Si encontramos una seccion nueva
			if(arrayIncludes(permisoActual, idPermisos) == false ){
				idPermisos.push(permisoActual);
				var concepto = {};
				// Recorremos el array 
				conceptos = new Array();
				for( var j = 0;j< array.length ; j++){
					
					// Por cada funcion de la seccion actual
					if( array[j].PERMISOS == permisoActual){
											
						var conceptoActual = array[j].ID_CONCEPTO1;
						var funcion = {};
						// Si encontramos una funcion nueva
						if(arrayIncludes(conceptoActual, conceptos) == false ){
							conceptos.push(conceptoActual);
							
							// Recorremos el array 
							for( var k = 0;k< array.length ; k++){
								// Por cada funcion de la seccion actual
								if( array[k].PERMISOS == permisoActual && array[k].ID_CONCEPTO1 == conceptoActual) {
									funcion[array[k].ID_CONCEPTO2] = array[k];	
								}
							}
							concepto[conceptoActual] = funcion;
						}
						
					}
					
				}
				colisiones[permisoActual] = concepto;
			}		
		}
		
		sap.ui.getCore().getModel().setProperty("/colisiones", colisiones);
	}
   
     function getCompensaciones (fecha) {

       var params = new CustomModelParameters();
       params.setService(ServiceConstants.Z_HR_CTLH_SRV);
       params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.compensaciones);
       params.setResultData_path("/compensaciones");

       if (fecha == undefined) {
           fecha = util.Formatter.dateToString(new Date());
       } else if (fecha instanceof Object == true) {
           fecha = parseInt(fecha.Fecha.substring(6, 19));
           fecha = new Date(fecha);
           fecha = util.Formatter.dateToString(fecha);
       } else fecha = util.Formatter.stringToString(fecha)


       var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
       var urlData = {
           "FECHA": "'" + fecha + "'",
           "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
       };

       entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.compensaciones.key;

       success = function(data, response, request) {
           var p_data = data.d;
           var token = request.getResponseHeader("X-CSRF-Token");
           setAttributeValue("/userInfo/xcsrf", token)
           sap.ui.getCore().getModel().setProperty("/compensaciones", p_data);
       }

       callFunctionImport(entity, urlData, success);
   }
     
     function getCompensacionesAntiguas (fecha) {


         if (fecha == undefined) {
             fecha = util.Formatter.dateToString(new Date());
         } else if (fecha instanceof Object == true) {
             fecha = parseInt(fecha.Fecha.substring(6, 19));
             fecha = new Date(fecha);
             fecha = util.Formatter.dateToString(fecha);
         } else fecha = util.Formatter.stringToString(fecha)


         var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
         var urlData = {
             "FECHA": "'" + fecha + "'",
             "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
         };

         entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.compensacionesAntiguas.key;

         success = function(data, response, request) {
             var p_data = data.d;
             sap.ui.getCore().getModel().setProperty("/compensacionesAntiguas", p_data);
         }

         callFunctionImport(entity, urlData, success);
     }
	