// DEV CONTROLLER


	jQuery.sap.require("util.Formatter");
	sap.ui.controller("view.Home", {
		
		// ON INIT PARA FASE 2
	    onInit: function() {

	        var oView = this.getView();
	        oView.createAusenciaDialog(this);
	        // En la primera llamada, cargamos los datos del mes actual

	        this.createLeyenda();
	        sap.ui.unified.CalendarDayType.Type11 = "Type11";
	        sap.ui.unified.CalendarDayType.Type12 = "Type12";

	        getDivisas();
	        getDominioEstadoParte();
	        getDominioTipoDia();
	        getDominioTipoDirecto();
	        getUdsMedida();
	        getDominioViajeInternacional();
	        

	        setPropertySAPUI5Model("/copiando", false);

	        setViewTitle(oView, "view.imputarHoras.title");
	    },
	    
	    /**
	     * Llamadas estandar para cada vez que se muestra la vista
	     */
	    onBeforeShowCalls : function() {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	        oController.getCalendario(new Date(),true);
	        oController.getPeriodos();
	        oController.getConceptosDia();
	        getDominioDentroFueraCentro();
	        
	        // Inicializamos algunos valores del modelo 
	        setPropertySAPUI5Model("/gerenteEdita", undefined);
	        setPropertySAPUI5Model("/responsableEdita", undefined);
	        setPropertySAPUI5Model("/infoAusenciaManager", undefined);
	        setPropertySAPUI5Model("/modoDialogo", undefined);
	        setPropertySAPUI5Model("/importeConceptoDia", new Object());
	        setAttributeValue("/gerenteEdita", undefined);
	        setAttributeValue("/responsableEdita", undefined);
	        
	        
	        
	    },
	    
	    
	    /**
	     * Recupera el calendario del empleado con el periodo correspondiente a una fecha
	     * @param date Fecha referencia para el periodo
	     */
	    getCalendario: function(date, recuperarDia) {

	        var fn = this;
	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();

	        var lang = getLangForCalls();

	        if (date instanceof Date == false) {
	            if (sap.ui.Device.system.phone == false)
	                date = oView.calendar.getSelectedDates()[0].getStartDate();
	            else date = oView.calendarPhone.getSelectedDates()[0].getStartDate();
	        }


	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

	        var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.calendario.key;
	        var urlData = {
	            "FECHA": "'" + util.Formatter.dateToString(date) + "'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	            "LANGU": "'" + lang + "'"
	        };
	        
	        // Si hay exito, calculamos el plazo máximo de imputacion, las nuevas fechas deshabilitadas, las compen-
	        // saciones y la información del día recibido.
	        success = function(data, response, request) {
	            var p_data = data.d;
	            var token = request.getResponseHeader("X-CSRF-Token");
	            setAttributeValue("/userInfo/xcsrf", token);
	            oController.setLegendData(p_data.results);
	            
	            
	            oController.setNewDisabledDates(p_data.results);
	            getCompensaciones(p_data.results[0].ZhrDatum);
	            getCompensacionesAntiguas(p_data.results[0].ZhrDatum);
	            oController.getConceptosHora(date);
		        oController.getConceptosHoraSelect(date);
		        
		        if(recuperarDia == true)
		        	oController.getInformacionDia(date);
	            sap.ui.getCore().getModel().setProperty("/calendario", p_data);
	        };
	        
	        var error = function (){
	        	reintentarLlamada(Common.Navigations.HOME, "common.mensajes.falloRecargaCalendario", entity, urlData, success, this.error);
	        }
	        
	        callFunctionImport(entity, urlData, success, error);
	    },

	    
	    /**
	     * Función para recuperar la informacion de un dia (parte, conceptos horarios y diarios)
	     * @param date Dia de referencia
	     */
	    getInformacionDia: function(date) {


	        var lang = getLangForCalls();

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";


	        var filters = new Array();
	        filters.push(new sap.ui.model.Filter(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia.filters.Fecha, sap.ui.model.FilterOperator.EQ, util.Formatter.normalToRead(date))); // util.Formatter.dateToString(date)
	        filters.push(new sap.ui.model.Filter(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia.filters.Pernr, sap.ui.model.FilterOperator.EQ, getAttributeValue("/userInfo/PERNR"))); //getAttributeValue("/userInfo/PERNR"))
	        filters.push(new sap.ui.model.Filter("LANGU", sap.ui.model.FilterOperator.EQ, lang));

	        var params = new CustomModelParameters();
	        params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	        params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia);
	        params.setFilterEntity(filters);
	        params.setExpand("detalleparte,detallehora,detalledia");
	        params.setSuccess([this.calcularFinImputacion, getColisiones, getDescripcionProduccion]);
	        params.setResultData_path("/informacionDia");
	        callODataServiceRead(params, undefined, false);
	    },
	    

	    /**
	     * Funcion para ordenar los conceptos horarios segun la hora de inicio
	     * @param data Lista de conceptos horarios
	     */
	    ordenarConceptos: function(data) {

	        var conceptosHora = data.detallehora.results;

	        data.detallehora.results.sort(function compareFunction(a, b) {

	            var horaA = a.Endhr.split(":")[0],
	                minutoA = a.Endhr.split(":")[1];
	            var horaB = b.Endhr.split(":")[0],
	                minutoB = b.Endhr.split(":")[1];

	            if (horaA > horaB || (horaA == horaB && minutoA > minutoB)) {
	                return -1;
	            } else return 1;

	        });


	    },

	    /**
	     * Función para asignar el modo de apertura y visibilidad de los botones de los diálogos
	     * @param oDialog Dialogo sobre el que 
	     * @param mode Modo (editar o crear)
	     */
	    setDialogMode: function(oDialog, mode) {

	        var buttons = oDialog.getButtons();
	        var accept = buttons[0],
	            reject = buttons[1],
	            terminar = buttons[2];

	        var matriz = false;
	        
	        if(getAttributeValue("/configuracion/REPORTE/REP_REPOR001/DIA_MATR") != undefined)
	        	matriz = true;
	        
//	        if(matriz == true) {
//	        	buttons[0].setVisible(true);
//	        }else {
        	if (mode === "EDIT") {
	            accept.setVisible(false);
	            if(buttons.length >1){
	            	reject.setVisible(false);
		            terminar.setVisible(true);
	            }
	            
	        }
	        if (mode === "CREATE") {
	            accept.setVisible(true);
	            if(buttons.length >1){
	            	reject.setVisible(true);
		            terminar.setVisible(false);
	            }
	        }
	        
	        
	        

	    },

	    /**
	     * Funcion para asignar al dialogo el valor con la informacion antigua en caso de que se cierren con escape
	     * @param oDialog Dialogo
	     * @param context Informacion
	     */
	    addInitialDataDialog: function(oDialog, context) {

	        var oView = this.getView();
	        var data = context.getObject();

	        var newData = jQuery.extend(true, {}, data);
	        var oldData = oDialog.getCustomData()[0];

	        if (oldData == undefined) {
	            oDialog.addCustomData(new sap.ui.core.CustomData({
	                key: "data",
	                value: newData
	            }))
	        } else {
	            oDialog.removeAllCustomData();
	            oDialog.addCustomData(new sap.ui.core.CustomData({
	                key: "data",
	                value: newData
	            }))
	        }

	    },

	    /**
	     * Función para abrir el diálogo de concepto horario con el contexto, la ruta y el modo seleccionado
	     * @param context Contexto del dialogo
	     */
	    openConceptoHoraDialog: function(context) {

	        var oView = this.getView();
	        var oController = oView.getController();
	        var oDialog = oView.conceptoHoraDialog;
	        var modo;

	        if (context != "") {
	            var path = context.getPath()
	            modo = "E"
	            oDialog.bindElement(path);
	            this.addInitialDataDialog(oDialog, context);
	            this.setDialogMode(oDialog, "EDIT");
	        } else {
	            modo = "C"
	            var index = getAttributeValue("/informacionDia/detallehora/results").length;
	            setPropertySAPUI5Model("/informacionDia/detallehora/results/" + index, new Object());
	            oDialog.bindElement("/informacionDia/detallehora/results/" + index);
	            oController.setDialogMode(oDialog, "CREATE");
	        }
	        setAttributeValue("/modoDialogo", modo);
	        oDialog.open();
	    },

	    /**
	     * Función para abrir el diálogo de concepto diario con el contexto, la ruta y el modo seleccionado
	     * @param context Contexto del dialogo
	     */
	    openConceptoDiaDialog: function(context) {

	        var oView = this.getView();
	        var oController = oView.getController();
	        var oDialog, modo, matriz = false;
	        
	        if(this.conceptoDiaDialog == undefined){
	        	if(getAttributeValue("/configuracion/REPORTE/REP_REPOR001/DIA_MATR") != undefined){
	        		matriz=true;
	        		oView.conceptoDiaDialog = sap.ui.jsfragment("fragment.DialogoDiaMatriz", this);
	            }else oView.conceptoDiaDialog = sap.ui.jsfragment("fragment.DialogoDia", this);
	            
	        }
	        
	        oDialog = oView.conceptoDiaDialog;
	        
	        if (context != "") {
	            var path = context.getPath();
	            modo = "E"
	            oDialog.bindElement(path);
	            this.addInitialDataDialog(oDialog, context);
	            oController.setDialogMode(oDialog, "EDIT");
	        } else {
	            modo = "C"
	            var index = getAttributeValue("/informacionDia/detalledia/results").length;
	            if(matriz == false)
	            	setPropertySAPUI5Model("/informacionDia/detalledia/results/" + index, new Object());
	            oDialog.bindElement("/informacionDia/detalledia/results/" + index);
	            oController.setDialogMode(oDialog, "CREATE");
	        }
	        setAttributeValue("/modoDialogo", modo);
	        oDialog.open();
	    },

	    /**
	     * Funcion para eliminar un concepto cuando el usuario clica X
	     * @param context Contexto bindeado al concepto
	     */
	    removeListItemConcepto: function(oContext, borrarConcepto) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        var path = oContext.getPath();
	        var actual = oContext.getObject();
	        var index = parseInt(path.substring(path.lastIndexOf('/') + 1));
	        var folder = path.substring(0, path.lastIndexOf('/'));
	        var conceptos = getAttributeValue(folder);
	        var horaInicialAux , horaFinalAux;
	        var esDia = folder.indexOf("detalledia") >= 0;
	        
	        var cambioDeHora = false;
	        // Si ha cambiado de hora, reponemos la hora final para ordenar los conceptos correctamente
	        var oldData = oView.conceptoHoraDialog.getCustomData()[0];
            if (oldData != undefined) {
                oldData = oView.conceptoHoraDialog.getCustomData()[0].getValue();
            }
	        
            if(oldData) {
	        	if(conceptos[index].Beghr != oldData.Beghr){ 
	        		horaInicialAux = conceptos[index].Beghr;
	        		conceptos[index].Beghr = oldData.Beghr;
		        	cambioDeHora = true;
		        }
				if(conceptos[index].Endhr != oldData.Endhr){ 
			    	horaFinalAux = conceptos[index].Endhr;
			    	conceptos[index].Endhr = oldData.Endhr;
			    	cambioDeHora = true;
			    }
	        }
	        
            var oldIndex = index;
	        var conceptoClicado = conceptos[index];
	        /*
             * Ordena los conceptos de mas tardio a mas temprano
             */
	        conceptos = oController.ordenarConceptosTardeTemprano(conceptos);
	        
	        // Buscamos el item por si ha cambiado el index tras ordenarlo
	        for(var j = 0; j<conceptos.length;j++) {
	        	if(conceptos[j] === conceptoClicado) {
	        		index = j;
	        	}
	        }
	        
            
	        var recorta;
	    	var listaConceptos, elemento2, elemento1, concepto1, concepto2;
	    	var reglasViajeEV = getAttributeValue("/reglas/VI_CI_IN");
	    	var reglasViaje = getAttributeValue("/reglas/DESP_VIA");
	        var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	        
	        var conceptoTieneRecorta2 = tieneRecorta2(conceptos[index].Lgahr) == true,
	        	conceptoTieneRecorta1 = tieneRecorta1(conceptos[index].Lgahr) == true,
	        	conceptoTieneRecortaD = tieneRecortaD(conceptos[index].Lgahr) == true,
//	        	conceptoTieneViaje = tieneRegla(conceptosHora[index].Lgahr, "VI_CI_IN"),
        		parteTieneRecorta2 = tieneRecorta2("") == true,
        		parteTieneRecorta1 = tieneRecorta2("") == true,
        		parteTieneRecortaD = tieneRecortaD("") == true;
	        	       
	        var tiene2 = (conceptoTieneRecorta2 == true || parteTieneRecorta2 == true)? true : false;
	        var conceptoAUsar2 = (tiene2 == true && conceptoTieneRecorta2 == true)? conceptos[index].Lgahr : "";
	        var tiene1 = (conceptoTieneRecorta1 == true || parteTieneRecorta1 == true)? true : false;
	        var conceptoAUsar1 = (tiene1 == true && conceptoTieneRecorta1 == true)? conceptos[index].Lgahr : "";
	        var tieneD = (conceptoTieneRecortaD == true || parteTieneRecortaD == true)? true : false;
	        var conceptoAUsarD = (tieneD == true && conceptoTieneRecortaD == true)? conceptos[index].Lgahr : "";
	        
	        
	        // RECORTA2
        	if(tiene2 == true){
        		recorta = 2;
        		concepto2 = getHaDesdeConcepto(conceptoAUsar2, "RECORTA2", 2);
        		concepto1 = getHaDesdeConcepto(conceptoAUsar2, "RECORTA2", 1);
        		
        		if(conceptos[index-2]){
	        		// Si efectivamente se han creado los HAs segun el recorta del concepto
        			// conceptoTieneRecorta2
        			if(conceptos[index-2].Lgahr == concepto2 && conceptos[index-1].Lgahr == concepto1){ 
        				conceptos[index].Endhr = conceptos[index-2].Endhr;
        				conceptos.splice(index-1, 1);
	                    index = index -1;
	                    conceptos.splice(index-1, 1);
	                    index = index -1;
	        		}
        		}
        		// parteTieneRecorta2
        		if(conceptos[index-1]){
	        		if( conceptos[index-1].Lgahr == concepto1 || conceptos[index-1].Lgahr == concepto2){
	        			conceptos[index].Endhr = conceptos[index-1].Endhr;
	        			conceptos.splice(index-1, 1);
	                    index = index -1;
	        		}
        		}
        	} 
        	
        	// RECORTA1
        	if(tiene1 ==  true){
        		recorta = 1;
        		concepto1 = getHaDesdeConcepto(conceptoAUsar1, "RECORTA1", 1)
        		
        		if(conceptos[index-1]){
	        		// Si efectivamente se han creado los HAs segun el recorta
	        		if(conceptos[index-1].Lgahr == concepto1){
	        			conceptos[index].Endhr = conceptos[index-1].Endhr;
	        			conceptos.splice(index-1, 1);
	                    index = index -1;
	        		}
        		}
        	}
        	
        	
        	// RECORTA D
        	if(tieneD ==  true){
        		recorta = 1;
        		conceptod = getHaDesdeConcepto(conceptoAUsar1, "RECORTAD", 1)
        		
        		if(conceptos[index-1]){
	        		// Si efectivamente se han creado los HAs segun el recorta
	        		if(conceptos[index-1].Lgahr == conceptod){
	        			conceptos[index].Endhr = conceptos[index-1].Endhr;
	        			conceptos.splice(index-1, 1);
	                    index = index -1;
	        		}
        		}
        	}
        	
        	
        	// Borramos el HAVI si existe
        	if(reglasViaje && dentroFueraParte != "3"){
        		if(reglasViaje[conceptos[index].Lgahr]){
        			for(var n = 0;n<conceptos.length;n++) {
        				if(conceptos[n].Lgahr == reglasViaje[conceptos[index].Lgahr][""].ID_CONC2) {
        					conceptos.splice(n, 1);
                            index = (index != 0)? index -1 : index;
                            n--;
            			}
        			}
        		}
        	}
        	// Borramos el HAVI si existe
        	if(reglasViajeEV && dentroFueraParte == "3"){
        		if(reglasViajeEV[conceptos[index].Lgahr]){
        			for(var n = 0;n<conceptos.length;n++) {
        				if(conceptos[n].Lgahr == reglasViajeEV[conceptos[index].Lgahr][dentroFueraParte].ID_CONC2) {
        					conceptos.splice(n, 1);
                            index = (index != 0)? index -1 : index;
                            n--;
            			}
        			}
        		}
        	}
    		
        	if(borrarConcepto == true) {
        		conceptos.splice(index, 1);
        		// Si habiamos modificado la hora, reponemos la original
	    	} else if(cambioDeHora == true){
	    		if(horaInicialAux){
	    			conceptos[index].Beghr = horaInicialAux;
	    		}
	    		if(horaFinalAux){
	    			conceptos[index].Endhr = horaFinalAux;
	    		}
	    	}
        	
        	if(borrarConcepto == false && esDia == false && index != oldIndex){
            	oView.conceptoHoraDialog.bindElement(folder + "/" + index);
        	}
        	
        	
        	
        	if (esDia == true) {
        		sap.ui.getCore().getModel().setProperty("/informacionDia/detalledia/results", conceptos);
        	} else {
//        		conceptos = oController.checkHAsSinConcepto(conceptos);
        		sap.ui.getCore().getModel().setProperty("/informacionDia/detallehora/results", conceptos);
        	}
        	
    		sap.ui.getCore().getModel().updateBindings();
    		
        	return conceptos;
	    },
	    
	    
	    
	    checkHAsSinConcepto : function(conceptos) {
	    	
	    	// Repasamos los conceptos
	    	for(var i = 0; i < conceptos.length; i++) {
	    		
	    		// Si encontramos un HA
	    		if( conceptoAcumulaEstaOculto(conceptos[i].Lgahr) == true){
	    			
	    			var algunoAcaba = false;
	    			//Volvemos a ver todos los conceptos
	    			for(var j = 0;j<conceptos.length;j++) {
	    				
	    				// Si alguno acaba donde empieza nuestro HA, bien
	    				if(conceptos[j].Endhr == conceptos[i].Beghr){
	    					algunoAcaba = true;
	    					break;
	    				}
	    				
	    			}
	    			// Si no hemos encontrado ninguno, borramos el HA 
	    			if(algunoAcaba == false){
	    				conceptos.splice(i,1);
	    				i--;
	    				continue;
	    			}
	    			
	    			
	    		}
	    		
	    	}
	    	
	    	return conceptos;
	    },
	    
	    

	    /**
	     * Funcion para validar un concepto diario en funcion del resto de conceptos introducidos
	     * @param context Datos del concepto
	     * @returns {Boolean} Resultado de la validacion
	     */
	    validarDialogDia: function(context) {

	        var data = context.getObject();
	        var correct = true;
	        correct = this.checkConceptoDia2(data);

	        // Si ha introducido KM y no ha dado a calcular, avisamos de que lo haga
	        if (data.Anzdy != undefined && (data.Betdy == "" || data.Betdy == "0.00")) {
	            correct = false;
	            showMessageStripDialogDia("conceptosDia.mensajes.sinImporte", "E");
	        }
	        return correct;
	    },

	    /**
	     * Funcion para recuperar la "categoria" segun el tipo de concepto
	     * @param concepto Concepto diario
	     * @returns Object Objeto con la categoría
	     */
	    getCategoriaConceptoDia: function(concepto) {

	        var categoria = {
	            mediaDieta: false,
	            dietaCP: false,
	            dieta: false,
	            comida: false,
	            viaje: false,
	            ticket: false,
	            kilometros: false,
	            finde: false
	        };

	        if (concepto == "TICE" || concepto == "TICO") {
	            categoria.ticket = true;
	        }
	        if (concepto == "PLVI") {
	            categoria.viaje = true;
	        }
	        if (concepto == "DIIC" || concepto == "DIIM" || concepto == "DINC" || concepto == "DINM") {
	            categoria.dietaCP = true;
	        }
	        if (concepto == "DIIC" || concepto == "DIIS" || concepto == "DINC" || concepto == "DINS") {
	            categoria.dieta = true;
	        }
	        if (concepto == "DIMS" || concepto == "DNMS" || concepto == "DIIM" || concepto == "DINM") {
	            categoria.mediaDieta = true;
	        }
	        if (concepto == "KLMT") {
	            categoria.kilometros = true;
	        }
	        if (concepto == "LNCH") {
	            categoria.comida = true;
	        }
	        if (concepto == "PLWE") {
	            categoria.finde = true;
	        }

	        return categoria;
	    },
	    
	    
	    aplicarExcepcionesValidacion : function(introducido) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	    	var colisiones = getAttributeValue("/colisiones");
	    	var result;
	    	var conceptosDia = getAttributeValue("/informacionDia/detalledia/results");
	    	
	    	
	    	if(conceptosDia.length == 1) {
            	result = true;
            }
	    	
	    	if (introducido == "PLWE") {
                var dia = getAttributeValue("/informacionDia/Fecha")
                var date = new Date(dia.split("T")[0]);
                var diaSemana = date.getDay();
                // Comprobar si es el plus de fin de semana y comprobar si efectivamente es fin de semana
                if (diaSemana == 6 || diaSemana == 0) {
                    result = true;
                } else {
                    showMessageStripDialogDia("conceptosDia.mensajes.dietas", "E");
                    result = false;
                }
                // Si no es plus de fin de semana, validamos correctamente
            }
	    	
	    	
	    	return result;
	    },
	    
	    checkConceptoDia2 : function (data) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	    	var colisiones = getAttributeValue("/colisiones");
	    	var introducido = data.Lgady;
	    	var conceptosDia = getAttributeValue("/informacionDia/detalledia/results");
	    	var indexElemento;
	    	for (var j = 0; j < conceptosDia.length; j++) {
	            if (data.Lgady == conceptosDia[j].Lgady) {
	                indexElemento = j;
	            }
	        }
	    	
	    	var result = oController.aplicarExcepcionesValidacion(introducido);
	    	
	    	// Primero repasamos los conceptos buscando validarlos
	    	for (var i = 0; i < conceptosDia.length && result == true; i++) {
	            
	            var actual = conceptosDia[i].Lgady;
	            if(indexElemento != i) {
		            var resultadoCheck = oController.checkConceptoDiaUnoUno(introducido,actual);
		            result = resultadoCheck["valida"];
	            }
	            
	    	}
	    	
	    	var borrar;
	    	
	    	// Después, si los hemos validado, borramos si es necesario con alguno
	    	for (var j = 0; j < conceptosDia.length; j++) {
	    		
	    		var actual = conceptosDia[j].Lgady;
    			var resultadoCheck = oController.checkConceptoDiaUnoUno(introducido,actual);
	            borrar = resultadoCheck.borrar;
	    		if(borrar) {
	    			break;
	    		}
		            
	    	}
	    	
	    	// Si validamos y hay que borrar
            if(result == true && borrar) {
            	for (var k = 0; k < conceptosDia.length; k++) {
            		if(conceptosDia[k].Lgady == resultadoCheck.borrar) {
            			conceptosDia.splice(k,1);
            			k--;
            		}

    	        }
            }
	    	
            if (result == false) {
                showMessageStripDialogDia("conceptosDia.mensajes.dietas", "E");
            } else sap.ui.getCore().getModel().updateBindings();
            
            
	    	return result;
	    },
	    
	    
	    checkConceptoDiaUnoUno : function(introducido, actual) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	    	var colisiones = getAttributeValue("/colisiones");
	    	
	    	// Si se permite la coexistencia de conceptos
	    	if(colisiones["1"][introducido] && colisiones["1"][introducido][actual]){
		    		return {
		    			"valida": true,
		    			"borrar" : undefined
		    		}
    		// Si hay que borrar el introducido
	    	}  else if (colisiones["2"][actual] && colisiones["2"][actual][introducido]) {
		    		return {
		    			"valida": true,
		    			"borrar" : actual
		    		}
    		// Si solo se permite uno
	    	} else if (colisiones["3"][introducido] ) {
		    		return {
		    			"valida": false,
		    			"borrar" : undefined
		    		}
	    	} else return {
    			"valida": false,
    			"borrar" : undefined
    		};
	    	
	    },
	    

	    /**
	     * Funcion que valida uno por uno los conceptos diarios con el que el usuario ha introducido o editado
	     * @param data Concepto que el usuario acaba de cerrar
	     * @returns {Boolean} Resultado de la validacion
	     */
	    checkConceptoDia: function(data) {


	        var result = false;
	        var conceptos = getAttributeValue("/informacionDia/detalledia/results");
	        var indexElemento, message;

	        for (var j = 0; j < conceptos.length; j++) {
	            if (data.Lgady == conceptos[j].Lgady) {
	                indexElemento = j;
	            }
	        }

	        for (var i = 0; i < conceptos.length; i++) {
	            var introducido = this.getCategoriaConceptoDia(data.Lgady);
	            var actual = this.getCategoriaConceptoDia(conceptos[i].Lgady);

	            // Si estamos analizando el mismo concepto que el que el usuario ha introducido
	            if (i == indexElemento) {
	            	// Si solo hay un concepto
	                if (conceptos.length == 1) {
	                    if (introducido.finde == true) {
	                        var dia = getAttributeValue("/informacionDia/Fecha")
	                        var date = new Date(dia.split("T")[0]);
	                        var diaSemana = date.getDay();
	                        // Comprobar si es el plus de fin de semana y comprobar si efectivamente es fin de semana
	                        if (diaSemana == 6 || diaSemana == 0) {
	                            result = true;
	                        } else {
	                            showMessageStripDialogDia("conceptosDia.mensajes.dietas", "E");
	                            break;
	                        }
	                        // Si no es plus de fin de semana, validamos correctamente
	                    } else {
	                        result = true;
	                    }
	                }
	            }
	            
	            var dia = getAttributeValue("/informacionDia/Fecha")
	            var date = new Date(dia.split("T")[0]);
	            var diaSemana = date.getDay();

	            // Si es fin de semana
	            if (introducido.finde == true) {
	                if (diaSemana == 6 || diaSemana == 0) {
	                    var pluses = 0;
	                    for (var j = 0; j < conceptos.length; j++) {
	                        if (conceptos[j].Lgady == "PLWE") {
	                            pluses++;
	                        }
	                    }
	                    if (pluses == 1) {
	                        result = true;
	                    }
	                }
	            // OK - Fin de semanas y tickets
	            } else if ((introducido.finde == true && actual.ticket == true) || (introducido.ticket == true && actual.finde == true)) {
	            	result = true;
	            // OK - Media dieta y PLVI
	            } else if ((introducido.mediaDieta == true && actual.viaje) || (introducido.viaje == true && actual.mediaDieta == true)) {
	            	result = true;
	            // OK - Fin de semanas y dietas
	            } else if ((introducido.dieta == true && actual.finde == true) || (introducido.finde == true && actual.dieta == true) ||
	                introducido.dieta == true && conceptos[i].Lgady == "PJEV") {
	                result = true;
	            // OK - Todo tipo de dietas y jornada extra en viaje
	            } else if (introducido.dieta == true && conceptos[i].Lgady == "PJEV" || introducido.dietaCP == true && conceptos[i].Lgady == "PJEV" ||
	                introducido.mediaDieta == true && conceptos[i].Lgady == "PJEV") {
	                result = true;
                // OK - Un ticket de comida y de cena
	            } else if (introducido.ticket == true && actual.ticket == true) {
                    result = true;
                } else if ((actual.viaje == true && introducido.dieta == true) || (actual.dieta == true && introducido.viaje == true)) {
	                result = true;
	            // OK - Tickets y dietas con pernoctacion borramos los tickets
	            } else if ((actual.ticket == true && introducido.dietaCP == true) || (actual.dietaCP == true && data.ticket == true)) {

	                conceptos.splice(i, 1);
	                i--;
	                result = true;
	                sap.ui.getCore().getModel().updateBindings();
                //OK - Medias dietas y tickets
	            } else 	if ((introducido.mediaDieta == true && actual.ticket == true) || (introducido.ticket == true && actual.mediaDieta == true)) {

	                    // si hay una media dieta y un ticket, hay que recorrerlo para ver si hay otro ticket
	                    var tickets = 0;
	                    for (var j = 0; j < conceptos.length; j++) {
	                        if (conceptos[j].Lgady == "TICE" || conceptos[j].Lgady == "TICO") {
	                            tickets++;
	                        }
	                    }

	                    if (tickets < 2) {
	                        result = true;
	                    }
                // OK - Media dieta nacional S/P y media dieta internacional S/P
                } else if ((data.Lgady == "DIMS" && conceptos[i].Lgady == "DNMS") || (data.Lgady == "DNMS" && conceptos[i].Lgady == "DIMS")) {
	                result = true;
	            // OK - Kilometros
	            } else if (introducido.kilometros == true) {
	                result = true;
	            // OK - Dietas y viajes
	            } else if ((introducido.dieta == true && actual.viaje == true) || (introducido.viaje == true && actual.dieta == true)) {
	                result = true;
	            // OK - Pluses de viaje (solo uno)
	            } else if (data.Lgady == "PLVI") {

	                var pluses = 0;
	                for (var j = 0; j < conceptos.length; j++) {
	                    if (conceptos[j].Lgady == "PLVI") {
	                        pluses++;
	                    }
	                }

	                if (pluses == 1) {
	                    result = true;
	                }
	            // OK - Pluses de jornada extra viaje (solo uno)
	            } else if (data.Lgady == "PJEV") {

	                var pluses = 0;
	                for (var j = 0; j < conceptos.length; j++) {
	                    if (conceptos[j].Lgady == "PJEV") {
	                        pluses++;
	                    }
	                }

	                if (pluses == 1) {
	                    result = true;
	                }
	            }
	            // Si no hemos validado, lanzamos mensaje genérico y paramos validación
	            if (result == false) {
	                showMessageStripDialogDia("conceptosDia.mensajes.dietas", "E");
	                break;
	            }

	        }
	        return result;
	    },
	    
	    
	    aplicarReglaJornadaExtraViaje : function(data){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
 
	    	var regla = getAttributeValue("/reglas/JE_VIAJE");
	    	var parteDia = getAttributeValue("/informacionDia/detalleparte/results/0")
	    	var estadoParte = parteDia.DentroFuera;
	    	var conceptosHora = getAttributeValue("/informacionDia/detallehora/results")
	    	var conceptos = getAttributeValue("/conceptosHora/results");
	    	
	    	
	    	var havis = new Array(), tieneHA = false;
	    	 var timeDataActual = util.Formatter.getAllTimeFromConcepto(data);
			 var duracion, nuevaDuracion, nuevoFin, nuevoInicio;
	        
	    	 var conceptosEnRegla = [];
	    	 for (var i = 0;i<conceptos.length;i++) {
	    		 if(regla[conceptos[i].Lgahr] != undefined){
	    			 conceptosEnRegla.push(conceptos[i].Lgahr);
	    		 }
	    	 }
	    	 var ha = regla[data.Lgahr][""].ID_CONC2;   
	    	 var horaTrabajoRegla = regla[data.Lgahr][""].HORA_INICIO1;    					 
				// Calculamos los tiempos del turno
	    	 horaTrabajoRegla = {
			    		Beghr: "00:00:00",
			    		Endhr: horaTrabajoRegla
			 }
			 
			 var timeDataTrabajoRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoRegla);
	    	 var duracionTrabajoRegla = (timeDataTrabajoRegla.fin.getTime() - timeDataTrabajoRegla.inicio.getTime() )/36e5;
	    	 
	    	 var totalHorasTrabajo = oController.calcularHorasTrabajadasDia(conceptosHora);
	    	 
	    	 
	    	 
	    	 var horaTotalRegla = regla[data.Lgahr][""].HORA_INICIO2;    					 
				// Calculamos los tiempos del turno
	    	 var dataHoraTotalRegla = {
			    		Beghr: "00:00:00",
			    		Endhr: horaTotalRegla
			 }
			 
			 var timeDataTotalRegla = util.Formatter.getAllTimeFromConcepto(dataHoraTotalRegla);
	    	 var duracionTotalRegla = (timeDataTotalRegla.fin.getTime() - timeDataTotalRegla.inicio.getTime() )/36e5;
	    	 
	    	 
	         var totalHoras = oController.calcularHorasTotalesDia(conceptosHora);
	         conceptosHora = oController.ordenarConceptosTardeTemprano(conceptosHora);
	        
	         
	      // Buscamos entre los conceptos si hay ya un PJEV, no entramos
			 for( var p = 0; p < conceptosHora.length; p++) {
				 if(conceptosHora[p].Lgahr == regla[data.Lgahr][""].ID_CONC2) {
					 tieneHA = true;
				 }
			 }
	         
	         // Si el trabajo es mayor que HORA1 y el tiempo total es mayor a la HORA 2
	         if(totalHorasTrabajo >= duracionTrabajoRegla && totalHoras >= duracionTotalRegla && tieneHA == false) {	        	 
	        	 var fechaAux = new Date();	        	 
	        	 var nuevoHAVI = {
	            		Beghr: "00:00:00",
	            		Endhr: regla[data.Lgahr][""].HORA_INICIO1,
	            		Lgahr : ha
	        	 };	        	
				conceptosHora.push(nuevoHAVI);    
	         }
	        
	    	return conceptosHora;
	    },
	    
	    
	    
	    aplicarReglasViajes : function(data) {
	    	
	    	 var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	 var oController = oView.getController();
	    	 
	    	 var regla = getAttributeValue("/reglas/DESP_VIA");
	    	 var parteDia = getAttributeValue("/informacionDia/detalleparte/results/0")
	    	 var estadoParte = parteDia.DentroFuera;
	    	 var conceptosHora = getAttributeValue("/informacionDia/detallehora/results")
	    	 var conceptos = getAttributeValue("/conceptosHora/results");
	    	 var reglasHORS = getAttributeValue("/reglas/HORS_JOR");
	    	 
	    	 var havis = new Array();
	    	 var timeDataActual = util.Formatter.getAllTimeFromConcepto(data);
			 var duracion, nuevaDuracion, nuevoFin, nuevoInicio;
	        
	    	 var conceptosEnRegla = [];
	    	 for (var i = 0;i<conceptos.length;i++) {
	    		 if(regla[conceptos[i].Lgahr] != undefined){
	    			 conceptosEnRegla.push(conceptos[i].Lgahr);
	    		 }
	    	 }
	    	 var ha = regla[data.Lgahr][""].ID_CONC2;   
	    	 var horaTrabajoRegla = regla[data.Lgahr][""].HORA_INICIO1;    					 
				// Calculamos los tiempos del turno
	    	 horaTrabajoRegla = {
			    		Beghr: "00:00:00",
			    		Endhr: horaTrabajoRegla
			 }
 			 
 			 var timeDataTrabajoRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoRegla);
	    	 var duracionTrabajoRegla = (timeDataTrabajoRegla.fin.getTime() - timeDataTrabajoRegla.inicio.getTime() )/36e5;
	    	 
	    	 var totalHorasTrabajo = oController.calcularHorasTrabajadasDia(conceptosHora);
	    	 
	    	 
	    	 
	    	 var horaTotalRegla = regla[data.Lgahr][""].HORA_INICIO2;    					 
				// Calculamos los tiempos del turno
	    	 var dataHoraTotalRegla = {
			    		Beghr: "00:00:00",
			    		Endhr: horaTotalRegla
			 }
			 
			 var timeDataTotalRegla = util.Formatter.getAllTimeFromConcepto(dataHoraTotalRegla);
	    	 var duracionTotalRegla = (timeDataTotalRegla.fin.getTime() - timeDataTotalRegla.inicio.getTime() )/36e5;
	    	 
	    	 
	         var totalHoras = oController.calcularHorasTotalesDia(conceptosHora);
	         conceptosHora = oController.ordenarConceptosTardeTemprano(conceptosHora);
	        
	         // Si el trabajo es mayor que HORA1 y el tiempo total es mayor a la HORA 2
	         if(totalHorasTrabajo >= duracionTrabajoRegla && totalHoras >= duracionTotalRegla) {
	        	 
	        	 var diferencia = (totalHoras - duracionTotalRegla )*36e5;
	        	 var fechaAux = new Date();
	        	 
	        	 var nuevoHAVI = {
 	            		Beghr: data.Beghr,
 	            		Endhr: data.Endhr,
 	            		Lgahr : ha,
 	            		Citacion : data.Citacion
	        	 };
	        	
				 
				 if(horaTotalRegla != "00:00:00"){
					 
					 var nuevoTimeData = util.Formatter.getAllTimeFromConcepto(nuevoHAVI);		        	 
					 var nuevoFin = new Date(diferencia);
					 nuevoFin = util.Formatter.setTwoDigits(nuevoFin.getHours()-1) + ":"+ util.Formatter.setTwoDigits(nuevoFin.getMinutes())+":"+util.Formatter.setTwoDigits(nuevoFin.getSeconds());
					 
					 nuevoHAVI.Beghr = "00:00:00"
					 nuevoHAVI.Endhr =  nuevoFin;
				 }
				 
				 
				 conceptosHora.push(nuevoHAVI);    
	         }
	        
	    	return conceptosHora;
	    },
	    
	    
	    
	    
	    
	    aplicarReglasExclusivamenteViajes : function(data) {
	    	
	    	 var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	 var oController = oView.getController();
	    	 
	    	 
	    	 var reglaIN = getAttributeValue("/reglas/VI_CI_IN");
	    	 var reglaFI = getAttributeValue("/reglas/VI_CI_FI");
	    	 var parteDia = getAttributeValue("/informacionDia/detalleparte/results/0")
	    	 var estadoParte = parteDia.DentroFuera;
	    	 var conceptosHora = getAttributeValue("/informacionDia/detallehora/results")
	    	 var conceptos = getAttributeValue("/conceptosHora/results");
	    	 var reglasHORS = getAttributeValue("/reglas/HORS_JOR");
	    	 
	    	 var havis = new Array();
	    	 var timeDataActual = util.Formatter.getAllTimeFromConcepto(data);
			 var duracion, nuevaDuracion, nuevoFin, nuevoInicio;
	        
	    	 var conceptosEnReglaIN = [], conceptosEnReglaFI = [];
	    	 for (var i = 0;i<conceptos.length;i++) {
	    		 if(reglaIN[conceptos[i].Lgahr] != undefined){
	    			 conceptosEnReglaIN.push(conceptos[i].Lgahr);
	    		 }
	    		 if(reglaFI[conceptos[i].Lgahr] != undefined){
	    			 conceptosEnReglaFI.push(conceptos[i].Lgahr);
	    		 }
	    	 }
	        
	        
	    	 for(var j = 0;j<conceptosHora.length;j++) {
	        	
	    		 var actual = conceptosHora[j];
	    		 if(arrayIncludes(actual.Lgahr,conceptosEnReglaIN) == true) {
	        		
	        		
	    			 var ruleDataIN = reglaIN[actual.Lgahr][estadoParte], ruleDataFI = reglaFI[actual.Lgahr][estadoParte], ruleData;
	    			 // Calculamos los tiempos de inicio y fin de la regla de citacion
	    			 var tiempoMaxCitacionIN = {
	    	            		Beghr: ruleDataIN.HORA_INICIO1,
	    	            		Endhr: ruleDataIN.HORA_INICIO2
	    			 };
	    			 var tiempoMaxCitacionFI = {
	    	            		Beghr: ruleDataFI.HORA_INICIO1,
	    	            		Endhr: ruleDataFI.HORA_INICIO2
	    			 };
	    			 var timeCitacionIN = util.Formatter.getAllTimeFromConcepto(tiempoMaxCitacionIN);
	    			 var horaMinCitacionIN = timeCitacionIN.inicio.getTime();
	    			 var horaMaxCitacionIN = timeCitacionIN.fin.getTime();
	    			 
	    			 var timeCitacionFI = util.Formatter.getAllTimeFromConcepto(tiempoMaxCitacionFI);
	    			 var horaMinCitacionFI = timeCitacionFI.inicio.getTime();
	    			 var horaMaxCitacionFI = timeCitacionFI.fin.getTime();
	    			  
	    			 
	    			 // Calculamos los tiempos de la citacion introducidos
	    			 var actualCitacion = {
	    	            		Beghr: "00:00:00",
	    	            		Endhr: actual.Citacion
	    			 }
	    			 var actualTimeCitacion = util.Formatter.getAllTimeFromConcepto(actualCitacion);
	    			 actual.Citacion = actualTimeCitacion.horaFin+":"+actualTimeCitacion.minutoFin+":"+actualTimeCitacion.segundoFin;
	    			 actualCitacion = actual.Citacion;
	    			 var horaCitacion = actualTimeCitacion.fin.getTime();
	    			 
	    			 if(horaMinCitacionIN < horaCitacion && horaCitacion < horaMaxCitacionIN){
	    				 ruleData = ruleDataIN;
	    			 } else ruleData = ruleDataFI;
	    			 
    				 // Comprobamos si hay que generar la duracion del propio viaje o del turno. Si es la del viaje
    				 if(actual.Lgahr == ruleData.ID_CONC1) {
    					 
    					 duracion = (timeDataActual.fin.getTime() - timeDataActual.inicio.getTime() );
    					 nuevaDuracion = new Date(duracion * ruleData.PORCENTAJE1/100);
    					 nuevoFin = actual.Endhr;
    					 nuevoInicio = actual.Beghr;
    					
					 // Si es la duracion del turno
    				 } else if(actual.Lgahr != ruleData.ID_CONC1) {
    					 
    					 var turno = reglasHORS[""][estadoParte].HORA_INICIO1;
    					// Calculamos los tiempos del turno
    	    			 turno = {
    	    	            		Beghr: "00:00:00",
    	    	            		Endhr: turno
    	    			 }
    	    			 
    	    			 var timeDataTurno = util.Formatter.getAllTimeFromConcepto(turno);
    					 duracion = (timeDataTurno.fin.getTime() - timeDataTurno.inicio.getTime());
    					 nuevaDuracion = duracion * ruleData.PORCENTAJE1/100;
    					 
    					 var finalTurno = new Date(timeDataTurno.inicio.getTime() + nuevaDuracion);
    					 nuevoFin = util.Formatter.setTwoDigits(finalTurno.getHours()) + ":"+ util.Formatter.setTwoDigits(finalTurno.getMinutes())+":"+util.Formatter.setTwoDigits(finalTurno.getSeconds());
    					 nuevoInicio = "00:00:00";
    				 }
    				 
    				 var tieneHA = false;
    				 // Buscamos entre los conceptos si hay ya un HA, si existe, pisamos su inicio y fin. Si no existe,
    				 // creamos uno
    				 for( var p = 0; p < conceptosHora.length; p++) {
    					 if(conceptosHora[p].Lgahr == ruleData.ID_CONC2) {
    						 conceptosHora[p].Beghr = nuevoInicio;
    						 conceptosHora[p].Endhr = nuevoFin;
    						 conceptosHora[p].Citacion = data.Citacion;
    						 tieneHA = true;
    					 }
    				 }
    					 
    				 var nuevoHavi = {
	    					 Lgahr : ruleData.ID_CONC2,
	    					 Beghr : nuevoInicio,
	    					 Endhr : nuevoFin,
	    					 Citacion : data.Citacion,
	    				 }
    				 if(tieneHA == false)
    					 havis.push(nuevoHavi);    				 
	    		 }	        	
	        
	      	 }
	    	 
	    	 if(havis.length > 0)
	    	 {
	    		 conceptosHora = conceptosHora.concat(havis)
	    	 }
	        
	    	return conceptosHora;
    	},
	    

	    /**
	     * Funcion de entrada para iniciar la validación de conceptos horarios
	     * @param context Datos del concepto introducido
	     * @param modo Modo de apertura del dialogo (visualizar / editar / crear)
	     * @returns {Boolean} Resultado de la validación
	     */
	    validarDialogHora: function(oContext, modo) {

	    	 var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	 var oController = oView.getController();
	        var data = oContext.getObject();
	        var path = oContext.getPath();
	        var correct = true;
	        var conceptosHora = getAttributeValue("/informacionDia/detallehora/results")
	        
	        correct = this.checkConceptoHora(data,oContext,  modo);
	        if(correct == true){
	        	conceptosHora = this.aplicarRecortarRegla(data);
	        	/*
	             * Ordena los conceptos de mas temprano a mas tardío
	             */
	        	sap.ui.getCore().getModel().setProperty("/informacionDia/detallehora/results", conceptosHora);
	        }
	        return correct;
	    },
	    
	    /**
	     * Calcula las horas acumuladas de un concepto en el dia
	     * @param concepto
	     * @returns {Number}
	     */
	    calcularHorasAcumuladasPorConcepto : function ( concepto){
	    	
	    	var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	    	var horasTotales = 0;
	    	
	    	for(var i =0;i<conceptos.length;i++) {
	    		if((concepto == undefined || conceptos[i].Lgahr == concepto)){
	    			
	    			var timeData = util.Formatter.getAllTimeFromConcepto(conceptos[i]);
	    			var duracionConcepto = Math.abs(timeData.fin.getTime() - timeData.inicio.getTime()) / 1000;
	    			horasTotales = horasTotales + duracionConcepto;
	    		}
	    	}
	    	return horasTotales;
	    },
	    
	    
	    /**
	     * Recorta un concepto generando su HA por la duracion dada
	     * @param concepto Concepto a recortar
	     * @param duracion Duracion a recotar
	     * @param conceptos Todos los conceptos
	     * @returns {___anonymous24667_24730}
	     */
	    recortarConceptoDuracion : function(concepto, duracion, conceptos, regla , index) {
	    	
	    	var timeData = util.Formatter.getAllTimeFromConcepto(concepto);
            
            var oldFin = new Date(1900, 01, 01, timeData.horaFin, timeData.minutoFin, timeData.segundoFin);
            var finalHAPR = new Date(1900, 01, 01, timeData.horaFin, timeData.minutoFin,timeData.segundoFin);
	    	var fueraDentroParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	var finAux = new Date(1900, 01, 01, timeData.horaFin, timeData.minutoFin, timeData.segundoFin);
            var tiempoRecortado;
            
			var ha = getHaDesdeConcepto(concepto.Lgahr, regla, index), hapr;
			var difMilli = duracion * 3600000;
			finAux.setTime(timeData.fin.getTime()- difMilli);
			var nuevoHoraFin = timeData.fin.getHours(), nuevoMinutosFin = timeData.fin.getMinutes(), nuevoSegundosFin = timeData.fin.getSeconds();
            
         // Si al tratar de recortar el concepto, el fin es previo al inicio, los igualamos y creamos el HAPR como siempre
            if (finAux.getTime() <= timeData.inicio.getTime()) {
                nuevoHoraFin = util.Formatter.setTwoDigits(timeData.horaInicio);
                nuevoMinutosFin = util.Formatter.setTwoDigits(timeData.minutoInicio);
                nuevoSegundosFin = util.Formatter.setTwoDigits(timeData.segundoInicio);
                concepto.Endhr = concepto.Beghr;
                tiempoRecortado = (timeData.fin.getTime() - timeData.inicio.getTime()) / 3600000;
            } else {
//                var nuevoHoraFin = timeData.fin.getHours(), nuevoMinutosFin = timeData.fin.getMinutes(), nuevoSegundosFin = timeData.fin.getSeconds();
                nuevoHoraFin = util.Formatter.setTwoDigits(finAux.getHours());
                nuevoMinutosFin = util.Formatter.setTwoDigits(finAux.getMinutes());
                nuevoSegundosFin = util.Formatter.setTwoDigits(finAux.getSeconds());
                concepto.Endhr = nuevoHoraFin + ":" + nuevoMinutosFin + ":" + nuevoSegundosFin;
                tiempoRecortado = (timeData.fin.getTime() - finAux.getTime()) / 3600000;
            }
			
			duracion = duracion - tiempoRecortado;
			
			// Copiamos el concepto
			hapr = jQuery.extend(true, {}, concepto);
			hapr.Lgahr = ha;
			
			 var nuevoHorasFinalHAPR = util.Formatter.setTwoDigits(finalHAPR.getHours());
			 var nuevoMinutosFinalHAPR = util.Formatter.setTwoDigits(finalHAPR.getMinutes());
			 var nuevoSegundosFinalHAPR = util.Formatter.setTwoDigits(finalHAPR.getSeconds());
						
			 hapr.Beghr = nuevoHoraFin + ":" + nuevoMinutosFin + ":" + nuevoSegundosFin;
			 hapr.Dschr = "";
			 hapr.Endhr = nuevoHorasFinalHAPR + ":" + nuevoMinutosFinalHAPR + ":" + nuevoSegundosFinalHAPR;
			 hapr.Seqnr = "001";
			 
			 hapr.ViajeInternacional = concepto.ViajeInternacional;
			 hapr.DentroFuera = concepto.DentroFuera;
			 hapr.Cobrar = concepto.Cobrar;
			 hapr.Dschr = concepto.Dschr;
			 hapr.Zplus = concepto.Zplus;
			 hapr.Zcategoria = concepto.Zcategoria;
			 hapr.Zsuperior = concepto.Zsuperior;
			 hapr.IdCategoria = concepto.IdCategoria;
			 hapr.Pspnr = concepto.Pspnr;
			
			return {"horas": duracion,
					"conceptos" : [concepto, hapr]
					};
	    },
	    
	    /**
	     * Recorta las horas dadas por el máximo del concepto 
	     * @param data Concepto introducido
	     */
	    aplicarRecortarRegla1 : function(data, insertarHa) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	        var reglas = getAttributeValue("/reglas/RECORTA1");
	    	var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	    	var conceptosCompensaciones = getAttributeValue("/conceptosCompensacion");
	    	var fueraDentroParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	
	    	var valorMax = reglas[data.Lgahr][fueraDentroParte].HORA_INICIO1;
    		
    		var hora = valorMax.split(":")[0],
            minuto = valorMax.split(":")[1],
            segundo = valorMax.split(":")[2];    		

    		var tiempoMaximo = parseInt(hora)*3600 + parseInt(minuto)*60 + parseInt(segundo);	    		
    		var duracionTotal= this.calcularHorasAcumuladasPorConcepto(data.Lgahr);
    		conceptos = oController.ordenarConceptosTardeTemprano(conceptos);
	    		
    		// Si el concepto sobrepasa el primer umbral de corte
    		if(duracionTotal > tiempoMaximo){
    			
    			// Restamos diferencia hasta umbral a la hora de fin del concepto
    			var diferencia = (duracionTotal - tiempoMaximo )/3600;
    			var u = conceptos.length - 1;

    			// Repasamos todos los conceptos del mas tardio al mas temprano mientras haya tiempo que recortar
    			while(diferencia>0 && u>=0){

    				// Cogemos únicamente los que son del mismo tipo del introducido
    				if(conceptos[u].Lgahr == data.Lgahr) {
    					var actual = conceptos[u];    					
    					var timeData = util.Formatter.getAllTimeFromConcepto(actual);
    	                
    	                // Si el concepto tiene duración (no ha sido recortado)
    	                if(timeData.inicio != timeData.fin){
	    	                var respuesta = oController.recortarConceptoDuracion(actual, diferencia, conceptos, "RECORTA1", 1);
    	                }
    	                diferencia = respuesta.horas;
    	                conceptos[u] = respuesta.conceptos[0];
    	                if(insertarHa == true)
    	                	conceptos.splice(u,0,respuesta.conceptos[1]);
    	                sap.ui.getCore().getModel().updateBindings();
    				}
    				u--;
    			}
    		}
	    	
	    },
	    
	    
	    /**
	     * Recorta las horas dadas por el máximo del concepto 
	     * @param data Concepto introducido
	     */
	    aplicarRecortarRegla2 : function(data,insertarHa) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	        var reglas = getAttributeValue("/reglas/RECORTA2");
	    	var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	    	var conceptosCompensaciones = getAttributeValue("/conceptosCompensacion")
	    	var fueraDentroParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	var diferencia;
	    	var infoRecorte = reglas[data.Lgahr][fueraDentroParte];
	    	var valorMax1 = infoRecorte.HORA_INICIO1, haMax1 = infoRecorte.ID_CONC1,
	    		valorMax2 = infoRecorte.HORA_INICIO2, haMax2 = infoRecorte.ID_CONC2;
    		
    		var hora1 = valorMax1.split(":")[0], minuto1 = valorMax1.split(":")[1], segundo1 = valorMax1.split(":")[2],
            hora2 = valorMax2.split(":")[0], minuto2 = valorMax2.split(":")[1], segundo2 = valorMax2.split(":")[2];  

    		var tiempoMaximo1 = parseInt(hora1)*3600 + parseInt(minuto1)*60 + parseInt(segundo1),
    			tiempoMaximo2 = parseInt(hora2)*3600 + parseInt(minuto2)*60 + parseInt(segundo2);
    		
    		var duracionTotal= this.calcularHorasAcumuladasPorConcepto(data.Lgahr);
    		var superaMax2 = duracionTotal > tiempoMaximo2, index = 2;
    		conceptos = oController.ordenarConceptosTardeTemprano(conceptos);
	    		    	
    		// Si el concepto sobrepasa el primer umbral de corte
    		if(duracionTotal > tiempoMaximo1){
    			
    			// Restamos diferencia hasta umbral a la hora de fin del concepto
    			if((duracionTotal - tiempoMaximo2 )/3600 >0)
    				diferencia = (duracionTotal - tiempoMaximo2 )/3600;
    			else {
    				index = 1;
    				diferencia = (duracionTotal - tiempoMaximo1 )/3600;
    			}
    			var u = conceptos.length - 1;

    			// Repasamos todos los conceptos del mas tardio al mas temprano mientras haya tiempo que recortar
    			while(diferencia>0 && u>=0){

    				// Cogemos únicamente los que son del mismo tipo del introducido
    				if(conceptos[u].Lgahr == data.Lgahr) {
    					var actual = conceptos[u];
    					var timeData = util.Formatter.getAllTimeFromConcepto(actual);
    	                
    	                // Si el concepto tiene duración (no ha sido recortado)
    	                if(timeData.inicio != timeData.fin){
	    	                var respuesta = oController.recortarConceptoDuracion(actual, diferencia, conceptos, "RECORTA2", index);
    	                }
    	                diferencia = respuesta.horas;
    	                respuesta.conceptos[0].Seqnr = "000";
    	                respuesta.conceptos[1].Seqnr = "001";
    	                conceptos[u] = respuesta.conceptos[0];
    	                if(insertarHa == true){
    	                	conceptos.splice(u,0,respuesta.conceptos[1]);
    	                }
    	                sap.ui.getCore().getModel().updateBindings();
    				}
    				
    				
    				if( diferencia < 0.016 && index == 2){
    					diferencia = (tiempoMaximo2 - tiempoMaximo1 )/3600;
    					index = 1;
    					u = conceptos.length-1;
    				} else u--;
    			}
    			
    		}
	    	
	    },
	    
	    
	    aplicarRecortarDiarios : function (data, insertarHa) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	        var reglas = getAttributeValue("/reglas/RECORTAD");
	    	var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	    	var conceptosCompensaciones = getAttributeValue("/conceptosCompensacion");
	    	var fueraDentroParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    		    	
	    	var valorMax = reglas[data.Lgahr][fueraDentroParte].HORA_INICIO1;
    		
    		var hora = valorMax.split(":")[0],
            minuto = valorMax.split(":")[1],
            segundo = valorMax.split(":")[2];    		

    		var tiempoMaximo = parseInt(hora)*3600 + parseInt(minuto)*60 + parseInt(segundo);	    		
    		var duracionTotal= this.calcularHorasAcumuladasPorConcepto(data.Lgahr);
    		conceptos = oController.ordenarConceptosTardeTemprano(conceptos);
	    		
    		// Si el concepto sobrepasa el primer umbral de corte
    		if(duracionTotal > tiempoMaximo){
    			
    			// Restamos diferencia hasta umbral a la hora de fin del concepto
    			var diferencia = (duracionTotal - tiempoMaximo )/3600;
    			var u = conceptos.length - 1;

    			// Repasamos todos los conceptos del mas tardio al mas temprano mientras haya tiempo que recortar
    			while(diferencia>0 && u>=0){

    				// Cogemos únicamente los que son del mismo tipo del introducido
    				if(conceptos[u].Lgahr == data.Lgahr) {
    					var actual = conceptos[u];
    					var timeData = util.Formatter.getAllTimeFromConcepto(actual);
    	                // Si el concepto tiene duración (no ha sido recortado)
    	                if(timeData.inicio != timeData.fin) {
	    	                var respuesta = oController.recortarConceptoDuracion(actual, diferencia, conceptos, "RECORTAD", 1);
    	                }
    	                diferencia = respuesta.horas;
    	                conceptos[u] = respuesta.conceptos[0];
    	                if(insertarHa == true){
	    	                	conceptos.splice(u,0,respuesta.conceptos[1]);
	    				}sap.ui.getCore().getModel().updateBindings();
    				}
    				
    				u--;
    			}
    		}
	    	
	    },
	    
	    
	    aplicarViajeDiarios1 : function (data) {
	    	
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	 
	    	var regla = getAttributeValue("/reglas/VI_DIA_1");
	    	var parteDia = getAttributeValue("/informacionDia/detalleparte/results/0")
	    	var dentroFuera = parteDia.DentroFuera;
	    	var conceptosHora = getAttributeValue("/informacionDia/detallehora/results")
	    	var conceptos = getAttributeValue("/conceptosHora/results");
	    	var reglasHORS = getAttributeValue("/reglas/HORS_JOR");
	    	var ruleData =  regla[data.Lgahr][""];
	    	
	    	
	    	var havis = new Array();
	    	var timeDataActual = util.Formatter.getAllTimeFromConcepto(data);
			var duracion, nuevaDuracion, nuevoFin, nuevoInicio;
	        
	    	var conceptosEnRegla = [];
	    	for (var i = 0;i<conceptos.length;i++) {
	    		 if(regla[conceptos[i].Lgahr] != undefined){
	    			 conceptosEnRegla.push(conceptos[i].Lgahr);
	    		 }
	    	}
	    	 
	    	var ha = ruleData.ID_CONC2;
	    	var horaTrabajoRegla = ruleData.HORA_INICIO2;
	    	// Calculamos los tiempos del turno
			horaTrabajoRegla = {
			    		Beghr: "00:00:00",
			    		Endhr: horaTrabajoRegla
			}
			
 			var timeDataTrabajoRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoRegla);
	    	var duracionTrabajoRegla = (timeDataTrabajoRegla.fin.getTime() - timeDataTrabajoRegla.inicio.getTime() )/36e5;
	    	
	    	var totalHorasTrabajo = oController.calcularHorasTrabajadasDia(conceptosHora);
	    	
	    	if(totalHorasTrabajo > duracionTrabajoRegla) {
	    		
	    		 var turno = reglasHORS[""][dentroFuera].HORA_INICIO1;
					// Calculamos los tiempos del turno
    			 turno = {
    	            		Beghr: "00:00:00",
    	            		Endhr: turno
    			 }
    			 
    			 var timeDataTurno = util.Formatter.getAllTimeFromConcepto(turno);
				 duracion = (timeDataTurno.fin.getTime() - timeDataTurno.inicio.getTime());
				 nuevaDuracion = duracion * ruleData.PORCENTAJE1/100;
				 
				 var finalTurno = new Date(timeDataTurno.inicio.getTime() + nuevaDuracion);
				 nuevoFin = util.Formatter.setTwoDigits(finalTurno.getHours()) + ":"+ util.Formatter.setTwoDigits(finalTurno.getMinutes())+":"+util.Formatter.setTwoDigits(finalTurno.getSeconds());
				 nuevoInicio = "00:00:00";
				 
				 var nuevoHavi = {
    					 Lgahr : ha,
    					 Beghr : "00:00:00",
    					 Endhr : nuevoFin
				 }
				 havis.push(nuevoHavi); 
				 
				 if(havis.length > 0){
					 conceptosHora = conceptosHora.concat(havis);
				 }
	    	}
	    	
	    	return conceptosHora;
	    },
	    
	    
	    /**
	     * PROVISIONAL
	     * @param data
	     */
	    aplicarViajeDiarios2 : function (data) {
	    	
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	 
	    	var regla = getAttributeValue("/reglas/VI_DIA_2");
	    	var parteDia = getAttributeValue("/informacionDia/detalleparte/results/0")
	    	var dentroFuera = parteDia.DentroFuera;
	    	var conceptosHora = getAttributeValue("/informacionDia/detallehora/results")
	    	var conceptos = getAttributeValue("/conceptosHora/results");
	    	var reglasHORS = getAttributeValue("/reglas/HORS_JOR");
	    	var ruleData =  regla[data.Lgahr][""];
	    	
	    	var havis = new Array();
	    	var timeDataActual = util.Formatter.getAllTimeFromConcepto(data);
			var duracion, nuevaDuracion, nuevoFin, nuevoInicio;
	        
	    	var conceptosEnRegla = [];
	    	for (var i = 0;i<conceptos.length;i++) {
	    		 if(regla[conceptos[i].Lgahr] != undefined){
	    			 conceptosEnRegla.push(conceptos[i].Lgahr);
	    		 }
	    	}
	    	 
	    	var ha = ruleData.ID_CONC2;
	    	var horaTrabajoMinRegla = ruleData.HORA_INICIO1;
	    	horaTrabajoMinRegla = {
		    		Beghr: "00:00:00",
		    		Endhr: horaTrabajoMinRegla
	    	};
	    	
	    	var timeDataTrabajoMinRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoMinRegla);
	    	var duracionTrabajoMinRegla = (timeDataTrabajoMinRegla.fin.getTime() - timeDataTrabajoMinRegla.inicio.getTime() )/36e5;
	    	
	    	var horaTrabajoMaxRegla = ruleData.HORA_INICIO2;
	    	// Calculamos los tiempos del turno
			horaTrabajoMaxRegla = {
			    		Beghr: "00:00:00",
			    		Endhr: horaTrabajoMaxRegla
			};
			
 			var timeDataTrabajoMaxRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoMaxRegla);
	    	var duracionTrabajoMaxRegla = (timeDataTrabajoMaxRegla.fin.getTime() - timeDataTrabajoMaxRegla.inicio.getTime() )/36e5;
	    	var totalHorasTrabajo = oController.calcularHorasTrabajadasDia(conceptosHora);
	    		    	
	    	if(totalHorasTrabajo > duracionTrabajoMinRegla && totalHorasTrabajo <= duracionTrabajoMaxRegla) {
	    		
    			 var viaje = {
    	            		Beghr: data.Beghr,
    	            		Endhr: data.Endhr
    			 }
    			 
    			 var timeDataViaje = util.Formatter.getAllTimeFromConcepto(viaje);
				 duracion = (timeDataViaje.fin.getTime() - timeDataViaje.inicio.getTime());
				 nuevaDuracion = duracion * ruleData.PORCENTAJE1/100;
				 
				 var finalViaje = new Date(timeDataViaje.inicio.getTime() + nuevaDuracion);
				 nuevoFin = util.Formatter.setTwoDigits(finalViaje.getHours()) + ":"+ util.Formatter.setTwoDigits(finalViaje.getMinutes())+":"+util.Formatter.setTwoDigits(finalViaje.getSeconds());
				 				 
				 var nuevoHavi = {
    					 Lgahr : ha,
    					 Beghr : data.Beghr,
    					 Endhr : nuevoFin
				 }
				 havis.push(nuevoHavi); 
				 
				 if(havis.length > 0){
					 conceptosHora = conceptosHora.concat(havis);
				 }
	    	}
	    	
	    	return conceptosHora;
	    },
	    
	    
	    aplicarRecortarRegla : function(data) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	       
	        var reglasRecorta1 = getAttributeValue("/reglas/RECORTA1");
	        var reglasRecorta2 = getAttributeValue("/reglas/RECORTA2");
	        var reglasDiarios1 = getAttributeValue("/reglas/VI_DIA_1");
	        var reglasDiarios2 = getAttributeValue("/reglas/VI_DIA_2");
	        var reglasRecortaD = getAttributeValue("/reglas/RECORTAD");
	        var reglasViaje = getAttributeValue("/reglas/DESP_VIA/");
	        var reglasViajeEV = getAttributeValue("/reglas/VI_CI_IN/");
	        var reglasViajePJEV = getAttributeValue("/reglas/JE_VIAJE/");
	    	var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	
	    	if(conceptoEsCompensacion(data.Lgahr) == false) {
		    	
		    	var hayRecorta1 = reglasRecorta1 != undefined;
		    	if(hayRecorta1){
		    		hayRecorta1 = reglasRecorta1[data.Lgahr] != undefined;
		    		if(hayRecorta1){
			    		hayRecorta1 = reglasRecorta1[data.Lgahr][dentroFueraParte] != undefined;
			    	}
		    	}
		    		
		    	var hayRecorta2 = reglasRecorta2 != undefined;
		    	if(hayRecorta2){
		    		hayRecorta2 = reglasRecorta2[data.Lgahr] != undefined;
		    		if(hayRecorta2){
			    		hayRecorta2 = reglasRecorta2[data.Lgahr][dentroFueraParte] != undefined;
			    	}
		    	}
		    	
		    	var hayRecortaD = reglasRecortaD != undefined;
		    	if(hayRecortaD){
		    		hayRecortaD = reglasRecortaD[data.Lgahr] != undefined;
		    		if(hayRecortaD){
			    		hayRecortaD = reglasRecortaD[data.Lgahr][dentroFueraParte] != undefined;
			    	}
		    	}
		    	
		    	
		    	// Aqui hay que convertir los HA en concepto único 
		    	for(var j = 0;j<conceptos.length;j++) {
		    		
		    		var respuesta = oController.convertirHaEnConceptoUnico(j, conceptos);
		    		conceptos = respuesta.conceptosHora;
		    		if(respuesta.recortado == true) {
		    			j--;
		    		}
		    	}
		    	
		    	
		    	/*
		    	 * VIAJES
		    	 */
		    	
		    	var introducido = jQuery.extend(true, {}, data);
		    	
		    	
		    	var conceptoTieneViajeDiarios1 = false;
		        if(reglasDiarios1){
		        	if(reglasDiarios1[data.Lgahr] == undefined) {
			        	for(var i = 0; i<conceptos.length;i++) {
				        	if(reglasDiarios1[conceptos[i].Lgahr]){
				        		conceptoTieneViajeDiarios1 = true;
				        			data = conceptos[i];
				        	}
				        }
			        } else conceptoTieneViajeDiarios1 = true;
		        }
		        
		        
		        var conceptoTieneViajeDiarios2 = false;
		        if(reglasDiarios2){
		        	if(reglasDiarios2[data.Lgahr] == undefined) {
			        	for(var i = 0; i<conceptos.length;i++) {
				        	if(reglasDiarios2[conceptos[i].Lgahr]){
				        		conceptoTieneViajeDiarios2 = true;
				        			data = conceptos[i];
				        	}
				        }
			        } else conceptoTieneViajeDiarios2 = true;
		        }
		        
		     // Usuarios diarios
		    	var hayViajeDiarios1 = (reglasDiarios1 != undefined);
		    	if(hayViajeDiarios1){
		    		hayViajeDiarios1 = reglasDiarios1[data.Lgahr] != undefined;
		    		if(hayViajeDiarios1){
		    			hayViajeDiarios1 = reglasDiarios1[data.Lgahr][""] != undefined;
			    	}
		    	}
		    	
		    	// Usuarios diarios
		    	
		    	var hayViajeDiarios2 = (reglasDiarios2 != undefined);
		    	if(hayViajeDiarios2){
		    		hayViajeDiarios2 = reglasDiarios2[data.Lgahr] != undefined;
		    		if(hayViajeDiarios2){
		    			hayViajeDiarios2 = reglasDiarios2[data.Lgahr][""] != undefined;
			    	}
		    	}
		        
		        
		    	
		    	 // Si, a pesar de ser otro concepto el que estamos validando, si tenemos un viaje, el data será el viaje
		        var conceptoTieneNoSoloViaje = false;
		        if(reglasViaje){
		        	if(reglasViaje[data.Lgahr] == undefined) {
			        	for(var i = 0; i<conceptos.length;i++) {
				        	if(reglasViaje[conceptos[i].Lgahr]){
				        		conceptoTieneNoSoloViaje = true;
				        			data = conceptos[i];
				        	}
				        }
			        } else conceptoTieneNoSoloViaje = true;
		        }
		        
		        
		        
		     // Si, a pesar de ser otro concepto el que estamos validando, si tenemos un viaje, el data será el viaje
		        var conceptoTieneExclusivamenteViaje = false;
		        if(reglasViajeEV){
		        	if(reglasViajeEV[data.Lgahr] == undefined) {
				        for(var i = 0; i<conceptos.length;i++) {
				        	if(reglasViajeEV[conceptos[i].Lgahr]){
				        		conceptoTieneExclusivamenteViaje = true;
				        		data = conceptos[i];
				        	}
				        }
			        } else conceptoTieneExclusivamenteViaje = true;
		        }
		        
		        /*
		         * PJEV
		         */
		        var conceptoTienePJEV = false;
		        if(reglasViajePJEV){
		        	if(reglasViajePJEV[data.Lgahr] == undefined) {
				        for(var i = 0; i<conceptos.length;i++) {
				        	if(reglasViajePJEV[conceptos[i].Lgahr]){
				        		conceptoTienePJEV = true;
				        		data = conceptos[i];
				        	}
				        }
			        } else conceptoTienePJEV = true;
		        }
		        
		        
		    	/*
		    	 * VIAJES
		    	 */
		    	if(conceptoTieneExclusivamenteViaje == true && dentroFueraParte == "3"){
	    			conceptos = oController.aplicarReglasExclusivamenteViajes(data);
	    		} else if( hayViajeDiarios2 == true || hayViajeDiarios1 == true){
	    			
	    			if(tieneRecortaD(introducido.Lgahr) == true){
	    				oController.aplicarRecortarDiarios(introducido, false);
	    	            sap.m.MessageToast.show(getI18nText("common.mensajes.turnoRecortado"))
	    			}
	    			
	    			if(hayViajeDiarios2 == true)
	    				conceptos = oController.aplicarViajeDiarios2(data);
	    			else if(hayViajeDiarios1 == true)
	    				conceptos = oController.aplicarViajeDiarios1(data);
	    		}
		    	
		    	else if((conceptoTieneNoSoloViaje == true || conceptoTienePJEV == true)
		    			&& hayViajeDiarios2 == false && hayViajeDiarios1 == false){
	    			
	    			if(tieneRecorta2(introducido.Lgahr) == true){
	    				oController.aplicarRecortarRegla2(introducido, false);
	    	            sap.m.MessageToast.show(getI18nText("common.mensajes.turnoRecortado"))
	    			}else if(tieneRecorta1(introducido.Lgahr) == true){
	    				oController.aplicarRecortarRegla1(introducido, false);
	    	            sap.m.MessageToast.show(getI18nText("common.mensajes.turnoRecortado"))
	    			}
	    			
	    			if(conceptoTieneNoSoloViaje == true)
	    				conceptos = oController.aplicarReglasViajes(data);
	    			else if(conceptoTienePJEV == true)
	    				conceptos = oController.aplicarReglaJornadaExtraViaje(data);
	    		}
		    	
		    	/*
		    	 * RECORTA NORMAL
		    	 */
		    	if(tieneRecorta2(data.Lgahr) == true && conceptoTieneExclusivamenteViaje == false && conceptoTieneNoSoloViaje == false){
		    		oController.aplicarRecortarRegla2(introducido, true);
	    		}else if(tieneRecorta1(data.Lgahr) == true && conceptoTieneExclusivamenteViaje == false && conceptoTieneNoSoloViaje == false){
	    			oController.aplicarRecortarRegla1(introducido, true);
	    		}else if(tieneRecortaD(data.Lgahr) == true && conceptoTieneExclusivamenteViaje == false && conceptoTieneNoSoloViaje == false
	    				&& hayViajeDiarios2 == false && hayViajeDiarios1 == false){
	    			oController.aplicarRecortarDiarios(introducido, true);
	    		}
		    	
	    	}
	    	
	    	return conceptos;
	    	
	    },
	    
	    aplicarExcepcionesValidacion : function(data) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	var reglasViaje = getAttributeValue("/reglas/VI_CI_IN");
	    	
	    	if(reglasViaje) {
	    		var existeRegla = (reglasViaje[data.Lgahr] == undefined)? false: true;
		    	var hayHoraCitacion = util.Formatter.reactOnConfig(getAttributeValue("/configuracion/REPORTE/REP_REPOR001/HOR_CIT"));
		        
		        if(hayHoraCitacion == true && existeRegla == true && data.Citacion == undefined && reglasViaje[data.Lgahr][dentroFueraParte]){
	            	oView.horaCitacion.setValueState("Error");
		            return false;
	            } else {
	            	if(data.Citacion)
	            		data.Citacion = util.Formatter.setTwoDigits(data.Citacion.split(":")[0]) +":"+util.Formatter.setTwoDigits(data.Citacion.split(":")[1])+":"+util.Formatter.setTwoDigits(data.Citacion.split(":")[2])
	            	oView.horaCitacion.setValueState("None");
	            	return true;
	            }
	    	}
	    	return true;
	    },
	    

	    
	    /**
	     * Función que valida el concepto horario con el resto de conceptos horarios introducidos
	     * @param data Datos del concepto horario introducido
	     * @param modo Modo de apertura del dialogo (visualizar / editar / crear)
	     * @returns {Boolean} Resultado de la validación
	     */
	    checkConceptoHora: function(data,oContext,  modo) {
	        var result = true;
	        var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	        var compensaciones = getAttributeValue("/compensaciones/results");
	        var conceptosCompensaciones = getAttributeValue("/conceptosCompensacion");
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	dentroFueraParte = (dentroFueraParte) ? dentroFueraParte : "";
	        
	        var responsableEdita = getAttributeValue("/responsableEdita");
	        var gerenteEdita = getAttributeValue("/gerenteEdita");
	        var empleadoEdita = ( responsableEdita == undefined && gerenteEdita == undefined );
	        
	        var messages = new Array();
	        var solapado = false,
	            compens = true,
	            maxComp = false,
	            mismoConcepto = false,
	            indexElemento,
	            esCompensacion = conceptoEsCompensacion(data.Lgahr);
	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	        var horaInicio, minutoInicio, horaFin, minutoFin, inicio, fin;
	        var timeData;
	        
	        if(data.Beghr && data.Endhr) {
	        	timeData = util.Formatter.getAllTimeFromConcepto(data);
	        	data.Beghr =  timeData.horaInicio+":"+timeData.minutoInicio+":00";
	        	data.Endhr =  timeData.horaFin+":"+timeData.minutoFin+":00";
	        
	            inicio = timeData.inicio;
	            fin = timeData.fin;
	            oView.horaInicio.setValueState("None");
	            oView.horaFin.setValueState("None");
	            
	        } else {
	            var context = oView.conceptoHoraDialog.getBindingContext();
	            var path = oView.conceptoHoraDialog.getBindingContext().getPath();
	            oView.horaInicio.setValueState("Error");
	            oView.horaFin.setValueState("Error");
	            return false;
	        }
	        
	        if( oController.aplicarExcepcionesValidacion(data) == false){
	        	return false;
	        }
	        
	        
           
	        

	        /*
	         * Si el concepto puede tener asociado funciones superiores, controlamos que no sean vacías
	         */ 
	        if (data.Zcategoria == "X" && (data.IdCategoria == undefined || data.IdCategoria == "")) {
	            oView.radioButtonCategoria.getButtons()[1].setValueState("Error");
	            result = false;
	        } else {
	            oView.radioButtonCategoria.getButtons()[1].setValueState("None");
	        }

	        if (data.Zsuperior == "X" && (data.IdCategoria == undefined || data.IdCategoria == "")) {
	            oView.radioButtonCategoria.getButtons()[2].setValueState("Error");
	            result = false;
	        } else {
	            oView.radioButtonCategoria.getButtons()[2].setValueState("None");
	        }
	        
	        // Duracion minima
	        if(oController.checkDuracionMinima(data) == false) {
	        	showMessageStripDialogHora("common.mensajes.duracionMinima", "E");
            	result = false;
	        }
	        
	        
            /*
             * Si es el concepto que hemos introducido y solo estamos visualizando (desde el manager),
             * entonces si tiene un HA asociado, no borrarlo. En caso contrario lo borramos
             */
	        conceptos = oController.removeListItemConcepto(oContext, false);
	            
	        
	        for (var j = 0; j < conceptos.length; j++) {
                if (data.Lgahr == conceptos[j].Lgahr &&
                		data.Beghr == conceptos[j].Beghr &&
                			data.Endhr == conceptos[j].Endhr) {
                    indexElemento = j;
                }
            }
	        
	        /*
	         * Empezamos a recorrer los conceptos
	         */
	        for (var i = 0; i < conceptos.length && solapado == false && result == true; i++) {
	            var actual = conceptos[i];
	            timeDataActual = util.Formatter.getAllTimeFromConcepto(actual);
	            var resultados;

	            if (i === indexElemento) {
	                mismoConcepto = true;
	            } else mismoConcepto = false;

	            if (mismoConcepto == false && esCompensacion == false && (conceptoSolapa(data.Lgahr) != true && conceptoSolapa(actual.Lgahr) != true)) {
	            	resultados = oController.comprobarSolapamiento(inicio, fin, timeDataActual.inicio, timeDataActual.fin);
	            	result = resultados[0];
		            solapado = resultados[1];
	            }
	            
	            

	            

	            /*
	             * Si uno de ellos es vacaciones y estás introduciendo otros conceptos
	             */
	            if (actual.Lgahr == "HOLY") {
	                if (result == true)
	                    showMessageStripHeader("conceptosHora.mensajes.vacaciones");
	                else showMessageStripDialogHora("conceptosHora.mensajes.vacaciones", "W");
	            }
	            
	            
	            
	            // Si no puede repetirse
	            if (((conceptoPuedeRepetirse(data.Lgahr) == false  &&
	                    data.Lgahr == actual.Lgahr && indexElemento != i) && modo == "C")) {
	                result = false;
	                showMessageStripDialogHora("conceptosHora.mensajes.repetido", "E");
	            }
	            
	            var dia = getAttributeValue("/informacionDia/Fecha")
	            var date = new Date(dia.split("T")[0]);
	            var diaSemana = date.getDay();

	            /*
	             * Si es fin de semana y lo esta introduciendo en dia laborable
	             */
	            if (data.Lgahr == "WKND" && (diaSemana != 6 && diaSemana != 0)) {
	                showMessageStripDialogHora("conceptosHora.mensajes.findesemana", "E");
	                result = false;
	            }

	            


	        }
	        // Hora inicio y hora fin
	        if (inicio > fin) {
	            result = false;
	            showMessageStripDialogHora("conceptosHora.mensajes.horas", "E");
	        }


	        var compens = true;
	        /*
	         * Recortar en caso de compensacion
	         */ 
	        if (conceptoEsCompensacion(data.Lgahr) == true) {
	        	if(inicio == fin){
		            showMessageStripDialogHora("common.mensajes.duracionCompensacion", "E");
	        		result = false;
	        	}
	        	
	            var compensaLibremente = getAttributeValue("/categoriaEmpleado/ZFREE_COMPEN");
	            var prioridadCompensacion = getAttributeValue("/configuracion/REPORTE/REP_COMPE001/COM_PRI1");
	            
	            if(oController.checkDuracionMinima(data) == false) {
	            	showMessageStripDialogHora("common.mensajes.duracionMinima", "E");
	            	compens = false;
	            }
	            
	         // Para las compensaciones, calculamos con su duracion y las horas generadas y compensadas, si ha superado
	            // el maximo negativo
	            maxComp = oController.comprobarMaximoNegativoCompensaciones(data);
	            
	            if (compens == true && (compensaLibremente == "" || prioridadCompensacion != undefined) && maxComp == false) {
	                compens = this.checkCompensacion(data.Lgahr);
	            }
	            if (compens == true && maxComp == false)
	                solapado = this.recortarTurnoNormal(data);
	        }
	        
	        /*
	         * Duración máxima de los conceptos
	         */
	        var reglaDurMax = getAttributeValue("/reglas/DUR_MAX");
	        if(reglaDurMax){
	        	if(reglaDurMax[data.Lgahr]){

			        var duracion = Math.abs(timeDataActual.fin.getTime() - timeDataActual.inicio.getTime()) / 36e5;
			        if(reglaDurMax[data.Lgahr][dentroFueraParte]){
			        	var limiteConcepto = reglaDurMax[data.Lgahr][dentroFueraParte].HORA_INICIO1;
			        	var inicioLimite =  util.Formatter.standardhorarioToTime("00:00:00");
		                var finLimite = util.Formatter.standardhorarioToTime(limiteConcepto);
		                var duracionTotal= this.calcularHorasAcumuladasPorConcepto(data.Lgahr)/3600;
		                var duracionMaxima = Math.abs(finLimite - inicioLimite) / 36e5;
			        	if(duracionTotal > duracionMaxima){
				            result = false;
				            showMessageStripDialogHora("common.turnoMayor", "E");
				        }
			        }
			        
		        }
	        }
	        
	        /*
	         * Si está solapado, mostramos un mensaje
	         */
	        if (solapado == true) {
	            result = false;
	            showMessageStripDialogHora("common.solapados", "E");
	        }
	        

			/*
			 * Si todo hay ido bien, llamamos a la funcion de consultar ausencias si no es manager
			 */
			var esManager = getAttributeValue("/responsableEdita") == true || getAttributeValue("/gerenteEdita") == true;
			if (result == true && compens == true && maxComp == false && oView.ausenciaDialog.isOpen() == false && esManager == false) {
			    this.consultarAusencias(data);
			}

			 /*
			  * Devolvemos booleano con el resultado de los tres tipos de validación
			  */
			 return result == true && compens == true && maxComp == false;
	    },
	    
	    checkDuracionMinima : function (data) {
	    	
	    	var reglas = getAttributeValue("/reglas/DUR_MINI");
    		var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
    		
    		if(reglas) {
    			if(reglas[data.Lgahr]){
    				if(reglas[data.Lgahr][dentroFueraParte]){
    					var duracion = reglas[data.Lgahr][dentroFueraParte].HORA_INICIO1;
    	    	    	
    	        		var timeData = util.Formatter.getAllTimeFromConcepto(data);
    	                var duracionConcepto = Math.abs(timeData.fin - timeData.inicio) / 36e5;
    	                
    	                var compensacionMinima = {
    	                		Beghr: "00:00:00",
    	                		Endhr: duracion
    	                }
    	                var timeMinimo = util.Formatter.getAllTimeFromConcepto(compensacionMinima);
    	                var duracionMinima = Math.abs(timeMinimo.fin - timeMinimo.inicio) / 36e5;
    	        		
    	                if(duracionConcepto >= duracionMinima) {
    	                	return true;
    	                } else return false;
        			}
    			}
    			
    		}
    		
            return true;
	    },
	    
	    
	    comprobarMaximoNegativoCompensaciones : function(data) {
	    	
	    	var tipoComp, diferenciaCompensada, index, horasRestantes, bolsa, compensacion;
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	var reglas = getAttributeValue("/reglas");
	    	var compensaciones = getAttributeValue("/compensaciones/results");
	    	var compensacionesAntiguas = getAttributeValue("/compensacionesAntiguas/results");
	        var negativos = getAttributeValue("/negativos");
	        
	        
	        var timeDataData = util.Formatter.getAllTimeFromConcepto(data);
            var duracionConcepto = Math.abs(timeDataData.fin.getTime() - timeDataData.inicio.getTime()) / 36e5;
	    	
	    	var tieneCompensa = reglas["COMPENSA"][data.Lgahr] != undefined;
	    	// Para bolsas actuales, comprobamos los negativos
	    	if(tieneCompensa == true){
	    		bolsa = reglas["COMPENSA"][data.Lgahr][dentroFueraParte];
		    	if(bolsa != undefined)
		    		bolsa = bolsa.ID_CONC1;
		    	if(bolsa == undefined)
		    		bolsa = reglas["COMPENSA"][data.Lgahr][""].ID_CONC1;
		    	tipoComp = "NEG" + bolsa;
		    	
	            /*
	             * Si ha llegado al máximo de diferencia de compensacion permitido, mostramos un mensaje.
	             */
	            for(var j =0;j<compensaciones.length;j++) {
	            	if(compensaciones[j].Ktart == bolsa) {
	            		compensacion = compensaciones[j];
	            	}
	            }
	            
	            diferenciaCompensada = compensacion.Anzhl - compensacion.Kverb;
	            horasRestantes = diferenciaCompensada - negativos[tipoComp];
	            if (duracionConcepto > horasRestantes) {
	                showMessageStripDialogHora("conceptosHora.mensajes.maximoCompensacion", "E");
	                return true;
	            }
            // para bolsas pasadas
	    	} else {
	    		bolsa = data.Lgahr.substring(2,4);
	    		for(var i =0;i<compensacionesAntiguas.length;i++) {				        	    					   
				   if(compensacionesAntiguas[i].Ktart == bolsa){
					   horasRestantes = compensacionesAntiguas[i].Anzhl - compensacionesAntiguas[i].Kverb;
				   }
	    		}
	    		if (duracionConcepto > horasRestantes) {
	                showMessageStripDialogHora("conceptosHora.mensajes.maximoCompensacion", "E");
	                return true;
	            }
	    		
	    		
	    	}
	    	return false;
	    	
	    	
	    },
	    
	    comprobarSolapamiento : function(inicio, fin, inicioActual, finActual) {
	    	
	    	var result = true,
	    	solapado = false;
	    	
	    	/*
             * Comprobamos si solapan
             */
            
                // Si el concepto empieza antes del inicio del actual
                if (inicio < inicioActual) {
                    // Si el concepto acaba durante o despues del actual
                    if (fin > inicioActual) {
                        result = false;
                        solapado = true;
                    }
                    // Si el concepto empieza despues del inicio actual
                }
                if (inicio > inicioActual) {
                    // Si el actual acaba despues del inicio del concepto
                    if (finActual > inicio) {
                        result = false;
                        solapado = true;
                    }
                }
                if (inicio == inicioActual) {
                    // Si el actual acaba despues del inicio del concepto
                    if (inicio != fin) {
                        result = false;
                        solapado = true;
                    }
                }
            
	    	return [result, solapado];
	    	
	    },
	    
	    eliminarHAEditandoConcepto : function(index, data, conceptos) {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var reglas = getAttributeValue("/reglas");
	    	var elim = false;
	    	var oldData = oView.conceptoHoraDialog.getCustomData()[0];
            if (oldData != undefined) {
                oldData = oView.conceptoHoraDialog.getCustomData()[0].getValue();
                
                if(oldData.Endhr != oView.conceptoHoraDialog.getBindingContext().getObject().Endhr) {
                	
                }
                
                var oldEnd = oldData.Endhr;	
                var haLgahr = getHaDesdeConcepto(data.Lgahr, "RECORTA1",1);
                
                if(haLgahr != undefined){
                	for (var n = 0; n < conceptos.length; n++) {
                        if (conceptos[n].Lgahr == haLgahr && conceptos[n].Beghr == oldEnd) {
                            conceptos.splice(n, 1);
                            index--;
                            elim = true;
//                            return true;
                        }
                    }
                } else {
                	
                	haLgahr = getHaDesdeConcepto(data.Lgahr, "RECORTA2",1);
                	for (var n = 0; n < conceptos.length; n++) {
                        if (conceptos[n].Lgahr == haLgahr && conceptos[n].Beghr == oldEnd) {
                        	haLgahr2 = getHaDesdeConcepto(data.Lgahr, "RECORTA2",2);
                        	if(conceptos[n-1].Lgahr == haLgahr2 && conceptos[n-1].Beghr == conceptos[n].Endhr){
                        		conceptos.splice(n-1, 1);
                        		n--;
                        		index--;
                                elim = true;
                        	}
                            conceptos.splice(n, 1);
                            n--;
                            index--;
                            elim = true;
//                            return true;
                        }
                    }
                	
                }
                
            }
	    	return {
	    		nuevoIndex : index,
	    		eliminado : elim,
	    		conceptos : conceptos
	    	}
	    },


	    /**
	     * Función para consultar si para un día el empleado tiene una ausencia registrada en el infotipo 2006
	     */
	    consultarAusencias: function() {


	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);

	        var lang = getLangForCalls();


	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	        var urlData = {
	            "FECHA": "'" + util.Formatter.stringToString(getAttributeValue("/informacionDia/Fecha")) + "'",
	            "PERNR": "'" + getAttributeValue("/informacionDia/Pernr") + "'",
	            "LANGU": "'" + lang + "'"
	        };
	        var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.comprobarAusencia.key;
	        success = function(data, response, request) {
	            var p_data = data.d;
	            var responsable = getAttributeValue("/responsableEdita");
	            var gerente = getAttributeValue("/gerenteEdita");
	            if (p_data.TEXTO != "") {
	                var texto = new sap.m.Text({
	                    text: p_data.TEXTO
	                })
	                sap.ui.getCore().getModel().setProperty("/infoAusenciaReporte", p_data.TEXTO);
//	                oView.ausenciaDialog.addContent(texto);
	                oView.ausenciaDialog.open();
	            }
	        }
	        
	        callFunctionImport(entity, urlData, success);
	    },


	    /**
	     * Función para comprobar si una compensacion introducida se solapa con otros conceptos.
	     * @param data Datos del concepto de compensación
	     * @returns {Boolean} Resultado de la comprobación
	     */
	    checkCompensacionSolapa: function(data) {


	        var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	        var reglas = getAttributeValue("/reglas");
	        var inicio, fin, inicioActual, finActual;
	        var solapado = false;
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	var conceptosAfectados = [];
	    	var infoSolapamiento = {
	    			solapa: undefined,
	    			borrar : undefined,
	    			index : undefined
	    	}
	    	
	        var conceptoARecortar = reglas["BORRALIM"][data.Lgahr][dentroFueraParte];
	        if(conceptoARecortar != undefined)
	        	conceptoARecortar = conceptoARecortar.ID_CONC1;
	        if(conceptoARecortar == undefined)
	        	conceptoARecortar = reglas["BORRALIM"][data.Lgahr][""].ID_CONC1;
	        
	        var indexElemento;
	        for (var j = 0; j < conceptos.length; j++) {
                if (data.Lgahr == conceptos[j].Lgahr) {
                    indexElemento = j;
                }
            }
	        	
	        for (var i = 0; i < conceptos.length ; i++) {

	        	
	        	if(indexElemento == i){
	        		continue;
	        	}
	            var actual = conceptos[i];
                var podemosBorrar = actual.Lgahr == conceptoARecortar;
	            var infoSolapamiento = {"solapa" : true, "index": i, "borrar" : podemosBorrar};
	            
                var haSolapado = false;
                inicio = util.Formatter.standardhorarioToTime(data.Beghr);
                fin = util.Formatter.standardhorarioToTime(data.Endhr);
                
                inicioActual = util.Formatter.standardhorarioToTime(actual.Beghr);
                finActual = util.Formatter.standardhorarioToTime(actual.Endhr);
                
                // Si la compensacion empieza antes del inicio del actual
                if (inicio < inicioActual) {
                    // Si la compensacion acaba durante o despues del actual
                    if ( fin >= finActual) {
                    	infoSolapamiento.tipo = "borrar";
                    	conceptosAfectados.push(infoSolapamiento);
                    	// Si la compensacion acaba antes del fin del actual
                    } else if (fin < finActual && fin > inicioActual) {
                    	infoSolapamiento.tipo = "inicio";
                    	conceptosAfectados.push(infoSolapamiento);
                    }
                    
                } // Si la compensacion empieza despues del inicio actual
                if (inicio > inicioActual) {
                    // Si la compensacion acaba despues del inicio del concepto
                    if (fin < finActual) {
                    	infoSolapamiento.tipo = "partir";
                    	conceptosAfectados.push(infoSolapamiento);
                    } else if (fin >= finActual && inicio < finActual) {
                    	infoSolapamiento.tipo = "fin";
                    	conceptosAfectados.push(infoSolapamiento);
                    }
                }
                if (inicio == inicioActual) {
                	// Si la compensacion acaba despues del inicio del concepto
                    if (fin < finActual) {
                    	infoSolapamiento.tipo = "inicio";
                    	conceptosAfectados.push(infoSolapamiento);
                    } else if (fin >= finActual) {
                    	infoSolapamiento.tipo = "borrar";
                    	conceptosAfectados.push(infoSolapamiento);
                    }
                }
	            
	        }

	        return conceptosAfectados;
	    },


	    /**
	     * Funcion que recorta el turno normal en caso de que el usuario haya introducido una compensacion y se solape
	     * @param data Datos del concepto de compensacion
	     * @returns Boolean 
	     */
	    recortarTurnoNormal: function(data) {


	        var oView = this.getView();
	        var oController = oView.getController();
	        
	        var inicio = util.Formatter.standardhorarioToTime(data.Beghr);
	        var fin = util.Formatter.standardhorarioToTime(data.Endhr);
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	        var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	        var reglas = getAttributeValue("/reglas");
	        var solapa = true;
	        
	        var respuestaSolapamiento = this.checkCompensacionSolapa(data);
	        // No solapa con ningun concepto
	        if(!respuestaSolapamiento ){
        		solapa = false;
        	}
	        var conceptoARecortar = reglas["BORRALIM"][data.Lgahr][dentroFueraParte];
	        if(conceptoARecortar != undefined)
	        	conceptoARecortar = conceptoARecortar.ID_CONC1;
	        if(conceptoARecortar == undefined)
	        	conceptoARecortar = reglas["BORRALIM"][data.Lgahr][""].ID_CONC1

	        
	        for(var p = 0; p<respuestaSolapamiento.length; p++) {
	        	
	        	var actual = respuestaSolapamiento[p];
	        	
	        	if(actual.solapa == true && actual.borrar == false) {
	        		return true;
	        	}
	        	
	        	switch(actual.tipo) {
	        	
	        	case "inicio": {
	        		conceptos[actual.index].Beghr = data.Endhr;
	        		break;
	        	}
	        	
	        	case "fin": {
	        		conceptos[actual.index].Endhr = data.Beghr;
	        		break;
	        	}
	        	case "partir": {
	        		var finalNewTurno = conceptos[actual.index].Endhr;
                    conceptos[actual.index].Endhr = data.Beghr;
                    var newTurno = jQuery.extend(true, {}, conceptos[actual.index]);
                    newTurno.Beghr = data.Endhr;
                    newTurno.Endhr = finalNewTurno;

                    conceptos.push(newTurno);
                    compensacionSolapa = false;
                    oController.openTurnoNormalModificadoDialog();
	        		break;
	        	}
	        	
	        	case "borrar" : {
	        		conceptos.splice(actual.index, 1);
                    for(var u = p; u<respuestaSolapamiento.length; u++) {
                    	respuestaSolapamiento[u].index--;
                    }
	        		break;
	        	}
	        	}
	        	
	        	
	        }
	         
	        
	        sap.ui.getCore().getModel().updateBindings();
	        return false;
	    },

	    /**
	     * Funcion que comprueba si el usuario esta tratando de compensarse tipos de concepto con menos prioridad
	     * que otros teniendo horas pendientes en estos ultimos
	     */
	    checkCompensacion: function(codigo) {
	    	
	        var correct = true;
	        var negativos = getAttributeValue("/negativos");
	        var conceptosHora = getAttributeValue("/conceptosHora/results");
	        var compensaciones = getAttributeValue("/compensaciones/results");
	        var conceptosCompensan = getAttributeValue("/reglas/COMPENSA");
	        var prioridadCompensacion1 = (getAttributeValue("/reglas/COMPRI_1"))? getAttributeValue("/reglas/COMPRI_1")[""][""].ID_CONC1: undefined,
	        	prioridadCompensacion2 = (getAttributeValue("/reglas/COMPRI_2"))? getAttributeValue("/reglas/COMPRI_2")[""][""].ID_CONC1: undefined,
	        	prioridadCompensacion3 = (getAttributeValue("/reglas/COMPRI_3"))? getAttributeValue("/reglas/COMPRI_3")[""][""].ID_CONC1: undefined,
	        	prioridadCompensacion4 = (getAttributeValue("/reglas/COMPRI_4"))? getAttributeValue("/reglas/COMPRI_4")[""][""].ID_CONC1: undefined;
	        
	        	
        	for (var i = 0;i<compensaciones.length;i++) {
        		 if(prioridadCompensacion1 && prioridadCompensacion1 == compensaciones[i].Ktart) {
        			 compensaciones[i].PRIO = 1;
        		 }if(prioridadCompensacion2 && prioridadCompensacion2 == compensaciones[i].Ktart) {
        			 compensaciones[i].PRIO = 2;
        		 }if(prioridadCompensacion3 && prioridadCompensacion3 == compensaciones[i].Ktart) {
        			 compensaciones[i].PRIO = 3;
        		 }if(prioridadCompensacion4 && prioridadCompensacion4 == compensaciones[i].Ktart) {
        			 compensaciones[i].PRIO = 4;
        		 }
        	}	
	        	
	        	
        	
	        var bolsaCodigo;
	        var index;
	        var revisar = false;
    		if(conceptosCompensan[codigo]) {
    			bolsaCodigo = conceptosCompensan[codigo][""].ID_CONC1;
    		}
        	
	        
	        for (var j = compensaciones.length-1; j>=0; j--) {
	        	
	        	if (revisar == true && compensaciones[j].Anzhl > compensaciones[j].Kverb) {
	                correct = false;
	                break;
	            }
	        	
	        	
	        	if(compensaciones[j].Ktart == bolsaCodigo) {
	        		revisar = true;
	        	}
	        }
	        
	        
	        

	        if (correct == false)
	            showMessageStripDialogHora("conceptosHora.mensajes.compensaciones", "E");

	        return correct;
	    },

	    /**
	     * Funcion que añade un item en la lista de conceptos horarios del dia
	     * @param dialogData Lista de conceptos horarios
	     */
	    addListItemConceptoHora: function(dialogData) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        this.closeAddItemDialog();
	        var index = getAttributeValue("/informacionDia/detallehora/results").length;

	        setAttributeValue("/informacionDia/detallehora/results/" + index, dialogData);

	        var item = sap.ui.jsfragment("fragment.ListItemConceptosHora", this);
	        oView.listConceptoHora.addItem(item);
	    },
	    
	    /**
	     * Funcion que cierra todos los dialogos de conceptos abiertos
	     */
	    closeAddItemDialog: function() {

	        var oView = this.getView();
	        var oDialogHora = oView.conceptoHoraDialog;
	        var oDialogDia = oView.conceptoDiaDialog;
	        var oDialogObservaciones = oView.observacionesDialog;
	        if(oDialogHora != undefined)
	        	oDialogHora.close();
	        if(oDialogDia != undefined)
	        	oDialogDia.close();
	    },

	    /**
	     * Funcion para abrir dialogo de conceptos horarios
	     * @param oEvt Evento de clicado sobre el boton del item
	     */
	    editConceptoHora: function(oEvt) {

	        var oContext = oEvt.getSource().getBindingContext();
	        this.openConceptoHoraDialog(oContext);
	    },

	    /**
	     * Funcion para abrir dialogo de conceptos diario
	     * @param oEvt Evento de clicado sobre el boton del item
	     */
	    editConceptoDia: function(oEvt) {

	        var oContext = oEvt.getSource().getBindingContext();
	        this.openConceptoDiaDialog(oContext);
	    },


	    /**
	     * Funcion que crea el parte del día (para la sesión, no en backend) en caso de que no lo tenga creado 
	     * @param data Información del dia
	     * @returns
	     */
	    createParteStandard: function(informacionDia) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var noHayParte = informacionDia.detalleparte.results.length == 0;
	        var noHayHoras = informacionDia.detallehora.results.length == 0;
	        var calendario = getAttributeValue("/calendario/results");
	        var reglas = getAttributeValue("/constantesUser/results");
	        var parte = informacionDia.detalleparte.results[0];

	        // Si no hay parte
	        if (noHayParte == true && calendario != undefined) {
	        	setPropertySAPUI5Model("/informacionDia/detalleparte/results/0", new Object());

	            var newParte = {};
	            for (var i = 0; i < calendario.length; i++) {
	                var selectedDate = oView.calendar.getSelectedDates()[0].getStartDate();
	                selectedDate = util.Formatter.dateToString2(selectedDate);
	                if (selectedDate == calendario[i].ZhrDatum) {
	                    newParte.Hrbeg = calendario[i].Hrbeg;
	                    newParte.Hrend = calendario[i].Hrend;
	                    // Si tiene turno partido
	                    if(calendario[i].Hrbeg2 != "00:00:00" && calendario[i].Hrend2 != "00:00:00") {
	                    	newParte.Hrbeg2 = calendario[i].Hrbeg2;
		                    newParte.Hrend2 = calendario[i].Hrend2;
	                    }
	                    // Tipo de dia
	                    newParte.Tdyhd = calendario[i].TipoDia2;
	                    // Estado del parte
	                    newParte.Stahd = calendario[i].Status_parte;
	                    
	                    var tieneDentroFuera = getAttributeValue("/configuracion/REPORTE/REP_REPOR001/PAR_CENTRO") == "X";                        
	                    newParte.DentroFuera = (tieneDentroFuera == true)? "1" : "";
	                    // Ponemos el 9251
	                    informacionDia.detalleparte.results[0] = newParte;
	                    
	                    if (noHayHoras == true) {
	                        var turno = {
	                            Lgahr: "TURN",
	                            Beghr: calendario[i].Hrbeg,
	                            Endhr: calendario[i].Hrend,
	                            Dschr: "",
	                            Zplus: "",
	                            Zcategoria: "",
	                            Zsuperior: "",
	                        };
	                        
	                        
	                        informacionDia.detallehora.results[0] = turno;
	                        // Si tiene turno partido
	                        if(calendario[i].Hrbeg2 != "00:00:00" && calendario[i].Hrend2 != "00:00:00") {
	                        	var turno2 = {
	    	                            Lgahr: "TURN",
	    	                            Beghr: calendario[i].Hrbeg2,
	    	                            Endhr: calendario[i].Hrend2,
	    	                            Dschr: "",
	    	                            Zplus: "",
	    	                            Zcategoria: "",
	    	                            Zsuperior: "",
	    	                        };
	                        	informacionDia.detallehora.results[1] = turno2;
		                    }
	                    }
	                }
	            }
	            
	            /*
	             * Repasamos los conceptos diarios para ver si hay algun mandatory y creamos un elemento
	             */
	            var conceptos = getAttributeValue("/conceptosDia/results"), mandatory = new Array(); 
	            for(var j = 0;j<conceptos.length;j++){
	            	if(conceptos[j].Mandatory == "X") {
	            		mandatory.push(conceptos[j])
	            	}
	            }
	            
				for(var u = 0;u<mandatory.length;u++) {
					this.createConceptosMandatory(mandatory[u],informacionDia);
				}
				
	        }
	        return informacionDia;
	    },


	    /**
	     * Funcion que crea los tickets de comida para los dias cuyo parte no exista
	     * @param data Informacion del dia
	     * @returns
	     */
	    createConceptosMandatory: function(concepto, informacionDia) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var noHayParte = informacionDia.detalleparte.results.length == 0;
	        var noHayDias = informacionDia.detalledia.results.length == 0;
	        var calendario = getAttributeValue("/calendario/results");
//	        var calendario = getAttributeValue("/informacionDia/detalledia/results");
	        var parte = informacionDia.detalleparte.results[0];

	        var newParte = {};
	        if (calendario != undefined) {
	            for (var i = 0; i < calendario.length; i++) {
	                var selectedDate = oView.calendar.getSelectedDates()[0].getStartDate();
	                selectedDate = util.Formatter.dateToString2(selectedDate);
	                if (selectedDate == calendario[i].ZhrDatum && calendario[i].TipoDia == "") {
	                    //					
	                    var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	                    var urlData = {
	                        "FECHA": "'" + util.Formatter.dateToString(new Date()) + "'",
	                        "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	                        "LGAHR": "'"+concepto.Lgady+"'",
	                        "CANTIDAD": "'0'"
	                    };

	                    entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas.key;
	                    success = function(dataLlamada, response, request) {
	                        var p_data = dataLlamada.d;
//	                        console.log(p_data);

	                        var dieta = {
	                            Lgady: concepto.Lgady,
	                            Waers: "EUR",
	                            Zeidy: concepto.Zeinh,
	                            Betdy: p_data.IMPORTE_UN
	                        };

	                        informacionDia.detalledia.results.push(dieta);
	                        sap.ui.getCore().getModel().updateBindings();
	                    };

	                    callFunctionImport(entity, urlData, success);


	                }
	            }
	        }

	        return informacionDia;
	    },




	    /**
	     * Método para responder al click de un elemento del calendario
	     * @param oEvt Evento de clicado de un día
	     */
	    onDateSelection: function(oEvt) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        var calendarSelected
	        var daySelected;
	        var oldDia = getAttributeValue("/informacionDia/Fecha");
	        var oldDiaDate = util.Formatter.stringToString(oldDia);
	        if (oEvt != undefined) {
	            daySelected = oEvt.getSource().getSelectedDates()[0].getStartDate();
	        } else if (diaInfoDia != undefined) {
	            daySelected = util.Formatter.stringToDate2(oldDia);
	        } else {
	            daySelected = new Date();
	        }

	        removeStripsHeader();

	        var enPeriodo = this.checkHoyPeriodo(daySelected)
	        var calendario = getAttributeValue("/calendario/results");
	        if (enPeriodo == true || calendario == undefined) {
	            if (oldDia != undefined && util.Formatter.dateToString(daySelected) != oldDiaDate) {
	                this.enviarDia("B", true);
	            } else {
	            	this.getCalendario(daySelected,true);
	            }
	        }

	    },


	    /**
	     * Funcion que envia la informacion del dia 
	     * @param modo 
	     */
	    enviarDia: function(modo, recuperarDia) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        var draftIndicator = oView.header.getContentRight()[0];
	        var status = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
	        var lang = getLangForCalls();
	        
	        removeStripsHeader();

	        if (status != "E" && status != "A" && status != "M" && status != "N" && status != "C" && (this.getFueraDePlazo() == false)) {
	            setAttributeValue("/informacionDia/detalleparte/results/0/Stahd", modo);
	        }
			
			
			var fecha = getAttributeValue("/informacionDia/Fecha");
	        	var newDate; 
			if(fecha.indexOf("Date") >= 0) {
				fecha = parseInt(fecha.substring(6, 19));
				fecha = new Date(fecha);
				newDate = util.Formatter.dateToTimestamp(fecha)
			} else newDate = fecha;
			
			var conceptosHora = getAttributeValue("/informacionDia/detallehora/results");
			
			conceptosHora = oController.checkHAsSinConcepto(conceptosHora);

	        var data = {
	            Pernr: getAttributeValue("/userInfo/PERNR"),
	            Modificador: getAttributeValue("/userInfo/PERNR"),
	            Fecha: newDate,
	            detalleparte: getAttributeValue("/informacionDia/detalleparte/results"),
	            detallehora: conceptosHora,
	            detalledia: getAttributeValue("/informacionDia/detalledia/results"),
	            "LANGU": "" + lang + "",
	        };

	        data.detalleparte = (data.detalleparte.length == 0) ? new Array() : data.detalleparte;
	        data.detallehora = (!data.detallehora || data.detallehora.length == 0) ? new Array() : data.detallehora;
	        data.detalledia = (!data.detalledia || data.detalledia.length == 0) ? new Array() : data.detalledia;

	        var user;
	        // Buscamos un usuario para setear a los infotipos
	        for (var i = 0; i < data.detallehora.length; i++) {
	        	var actual = data.detallehora[i];
	        	if(actual.Uname != "") {
	        		user = actual.Uname;
	        	}
	        }
	        
	        
			if(data.detalleparte[0]) {
				
				for (var i = 0; i < data.detalleparte.length; i++) {
					delete data.detalleparte[0].__metadata;

					var fecha, newDate; 
					var actual = data.detalleparte[i];
					if(actual.Begda) {
						fecha = actual.Begda;
						if(fecha.indexOf("Date") >= 0) {
							fecha = parseInt(fecha.substring(6, 19));
							fecha = new Date(fecha);
							fecha.setHours(0);
							newDate = util.Formatter.dateToTimestamp(fecha)
						} else newDate = fecha;
					} else {
						newDate = getAttributeValue("/informacionDia/Fecha");
					}					
					if(data.detalleparte[i].Uname == undefined)
						data.detalleparte[i].Uname = user;
					data.detalleparte[i].Begda = newDate;
					data.detalleparte[i].Endda = newDate;
					data.detalleparte[i].Infty = "9251";
					data.detalleparte[i].Pernr = getAttributeValue("/userInfo/PERNR");
					
					var aedtm = new Date();
					aedtm.setHours(12);
					aedtm = util.Formatter.dateToTimestamp(aedtm);
					if(data.detalleparte[i].Aedtm == undefined)
						data.detalleparte[i].Aedtm = aedtm;
					
				}
			}
			
			if(data.detallehora[0]) {
				for (var i = 0; i < data.detallehora.length; i++) {
					delete data.detallehora[i].__metadata;
					var fecha, newDate; 
					var actual = data.detallehora[i];
					if(actual.Begda) {
						fecha = actual.Begda;
						if(fecha.indexOf("Date") >= 0) {
							fecha = parseInt(fecha.substring(6, 19));
							fecha = new Date(fecha);
							fecha.setHours(12);
							newDate = util.Formatter.dateToTimestamp(fecha)
						} else newDate = fecha;
					
					} else {
						newDate = getAttributeValue("/informacionDia/Fecha");
					}
					
					
					if(data.detallehora[i].Uname == undefined)
						data.detallehora[i].Uname = user;
					data.detallehora[i].Begda = newDate;
					data.detallehora[i].Endda = newDate;
					data.detallehora[i].Infty = "9252";
					data.detallehora[i].Pernr = getAttributeValue("/userInfo/PERNR");

					var aedtm = new Date();
					aedtm.setHours(12);
					aedtm = util.Formatter.dateToTimestamp(aedtm);
					if(data.detallehora[i].Aedtm == undefined)
						data.detallehora[i].Aedtm = aedtm;
				}
			}
	        if(data.detalledia[0]) {
				 for (var j = 0; j < data.detalledia.length; j++) {
					delete data.detalledia[j].__metadata;
					var actual = data.detalledia[j];
					var fecha, newDate;
					if(actual.Begda) {
						fecha = actual.Begda;
						if(fecha.indexOf("Date") >= 0) {
							fecha = parseInt(fecha.substring(6, 19));
							fecha = new Date(fecha);
							fecha.setHours(0);
							newDate = util.Formatter.dateToTimestamp(fecha)
						} else newDate = fecha;
					
					} else {
						newDate = getAttributeValue("/informacionDia/Fecha");
					}
					if(data.detalledia[j].Uname == undefined)
						data.detalledia[j].Uname = user;
					data.detalledia[j].Begda = newDate;
					data.detalledia[j].Endda = newDate;
					data.detalledia[j].Infty = "9253";
					data.detalledia[j].Pernr = getAttributeValue("/userInfo/PERNR");

					var aedtm = new Date();
					aedtm.setHours(12);
					aedtm = util.Formatter.dateToTimestamp(aedtm);
					if(data.detalledia[j].Aedtm == undefined)
						data.detalledia[j].Aedtm = aedtm;
					
				}
			}
	        
	        
	       
	        var dayEnviar;
	        // Dependiendo del tipo de día y  de si esta fuera de plazo para imputar, continuamos enviando
	        if (status != "E" && status != "A" && status != "M" && status != "N" && status != "C" && (this.getFueraDePlazo() == false)) {

	            var params = new CustomModelParameters();
	            dayEnviar = util.Formatter.stringToDate(getAttributeValue("/informacionDia/Fecha"));

	            data.detallehora = oView.getController().ajustarHorasDia();
	            params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	            params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.informacionDia);
				
	            var reactToSuccess = function(data){
	            	
	            	if(data.Response.ok == "" ){
	            		reintentarLlamadaEnviar(Common.Navigations.HOME,data.Response.text,  modo, data)
	            	} else {
						data = oController.adaptResponseToSend(data);
						sap.ui.getCore().getModel().setProperty("/informacionDia", data);
	            		oController.getCalendario(data, recuperarDia);
	            	}
	            }
	            
	            if (getAttributeValue("/responsableEdita") == undefined && getAttributeValue("/gerenteEdita") == undefined) {
	                params.setSuccess([checkSendMail, reactToSuccess]);
	            } else params.setSuccess([ oController.createParteStandard]);
//	            params.setResultData_path("/informacionDia");
	            callODataServiceCreate(params, data);
	        } else oController.getCalendario(dayEnviar,recuperarDia);
	    },

	    adaptResponseToSend : function(data) {
			
			
			var fecha = data.Fecha;
			var newDate; 
			if(fecha.indexOf("Date") >= 0) {
				fecha = parseInt(fecha.substring(6, 19));
				fecha = new Date(fecha);
				newDate = util.Formatter.dateToTimestamp(fecha)
			} else newDate = fecha;
			
			data.Fecha = newDate;
			newDate = undefined;
			fecha = undefined;
			data.detalleparte = (data.detalleparte.length == 0) ? {"results": new Array()} : data.detalleparte;
	        data.detallehora = (!data.detallehora || data.detallehora.length == 0) ? {"results": new Array()} : data.detallehora;
	        data.detalledia = (!data.detalledia || data.detalledia.length == 0) ? {"results": new Array()} : data.detalledia;

	        // Borramos los metadata porque causan problemas
	        if(data.detalleparte[0]) {
				
				for (var i = 0; i < data.detalleparte.length; i++) {
					delete data.detalleparte[0].__metadata;

					var fecha, newDate; 
					var actual = data.detalleparte[i];
					if(actual.Begda) {
						fecha = actual.Begda;
						if(fecha.indexOf("Date") >= 0) {
							fecha = parseInt(fecha.substring(6, 19));
							fecha = new Date(fecha);
							fecha.setHours(0);
							newDate = util.Formatter.dateToTimestamp(fecha)
						} else newDate = fecha;
					}else {
						newDate = getAttributeValue("/informacionDia/Fecha");
					}
					
					if(data.detalleparte[i].Uname == undefined)
						data.detalleparte[i].Uname = user;
					data.detalleparte[i].Begda = newDate;
					data.detalleparte[i].Endda = newDate;
					data.detalleparte[i].Infty = "9251";
					data.detalleparte[i].Pernr = getAttributeValue("/userInfo/PERNR");
					var aedtm = new Date();
					aedtm.setHours(12);
					aedtm = util.Formatter.dateToTimestamp(aedtm);
					if(data.detalleparte[i].Aedtm == undefined)
						data.detalleparte[i].Aedtm = aedtm;
					
				}
			}
			
			if(data.detallehora[0]) {
				for (var i = 0; i < data.detallehora.length; i++) {
					delete data.detallehora[i].__metadata;
					var fecha, newDate; 
					var actual = data.detallehora[i];
					if(actual.Begda) {
						fecha = actual.Begda;
						
					
						if(fecha.indexOf("Date") >= 0) {
							fecha = parseInt(fecha.substring(6, 19));
							fecha = new Date(fecha);
							fecha.setHours(12);
							newDate = util.Formatter.dateToTimestamp(fecha)
						} else newDate = fecha;
					
					} else {
						newDate = getAttributeValue("/informacionDia/Fecha");
					}
					
					if(data.detallehora[i].Uname == undefined)
						data.detallehora[i].Uname = user;
					data.detallehora[i].Begda = newDate;
					data.detallehora[i].Endda = newDate;
					data.detallehora[i].Infty = "9252";
					data.detallehora[i].Pernr = getAttributeValue("/userInfo/PERNR");
					var aedtm = new Date();
					aedtm.setHours(12);
					aedtm = util.Formatter.dateToTimestamp(aedtm);
					if(data.detallehora[i].Aedtm == undefined)
						data.detallehora[i].Aedtm = aedtm;
				}
			}
	        if(data.detalledia[0]) {
				 for (var j = 0; j < data.detalledia.length; j++) {
					delete data.detalledia[j].__metadata;
					var actual = data.detalledia[j];
					var fecha, newDate;
					if(actual.Begda) {
						fecha = actual.Begda;
						if(fecha.indexOf("Date") >= 0) {
							fecha = parseInt(fecha.substring(6, 19));
							fecha = new Date(fecha);
							fecha.setHours(0);
							newDate = util.Formatter.dateToTimestamp(fecha)
						} else newDate = fecha;
					
					} else {
						newDate = getAttributeValue("/informacionDia/Fecha");
					}
					if(data.detalledia[j].Uname == undefined)
						data.detalledia[j].Uname = user;
					data.detalledia[j].Begda = newDate;
					data.detalledia[j].Endda = newDate;
					data.detalledia[j].Infty = "9253";
					data.detalledia[j].Pernr = getAttributeValue("/userInfo/PERNR");
					var aedtm = new Date();
					aedtm.setHours(12);
					aedtm = util.Formatter.dateToTimestamp(aedtm);
					if(data.detalleparte[j].Aedtm == undefined)
						data.detalledia[j].Aedtm = aedtm;
				}
			}
			
			if(!data.detallehora){
				data.detallehora= []
			}else if(!data.detallehora.results && data.detallehora){
				data.detallehora.results = data.detallehora;
			}
			if(!data.detalledia){
				data.detalledia= []
			}else if(!data.detalledia.results && data.detalledia){
				data.detalledia.results = data.detalledia;
			}
			return data;
		},

	    
	    /**
	     * Funcion que envía el periodo entero
	     */
	    enviarMes: function() {

	        var fn = this;
	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

	        var urlData = {
	            "FECHA": "'" + util.Formatter.dateToString(new Date()) + "'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	            "ACTOR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	        };
	        removeStripsHeader();

	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarMes.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	            var token = request.getResponseHeader("X-CSRF-Token");
	            setAttributeValue("/informacionDia/detalleparte/results/0/Stahd", "E");
	            var fechaSelected = getAttributeValue("/informacionDia/Fecha");
	            fn.getCalendario(new Date(fechaSelected),true);
	            fn.sendMail();

	        };

	        callFunctionImport(entity, urlData, success);

	    },

	    /**
	     * Funcion que envia el mail despues de enviar el ultimo parte (o de enviar mes)
	     */
	    sendMail: function() {

	        var fn = this;
	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

	        var index = getAttributeValue("/calendario/results").length - 1;

	        var urlData = {
	            "EMPLEADO": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	            "PERNR": "'" + getAttributeValue("/informacionDia/detalleparte/results/0/Zresponsable") + "'",
	            "LANGU": "'" + getAttributeValue("/userInfo/ILANGU") + "'",
	            "BEGDA": "'" + util.Formatter.stringToString(getAttributeValue("/calendario/results/0/ZhrDatum")) + "'",
	            "ENDDA": "'" + util.Formatter.stringToString(getAttributeValue("/calendario/results/" + index + "/ZhrDatum")) + "'",
	        };

	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.enviarMail.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	        }

	        callFunctionImport(entity, urlData, success);
	    },

	    /**
	     * Funcion que asigna los valores de la leyenda del calendario
	     * @param data
	     */
	    setLegendData: function(data) {

	        var legendData = new Array();
	        for (var j = 0; j < data.length; j++) {

	            var actual = data[j].DescDia;
	            var k = 0;
	            var esta = false;
	            while (k < legendData.length && esta == false) {
	                if (actual == legendData[k].desc) {
	                    esta = true;
	                }
	                k++;
	            }
	            if (esta == false) {
	                legendData[k] = {
	                    index: k + 1,
	                    desc: actual
	                };
	            }
	        }
	        setAttributeValue("/legend", legendData);
	    },

	    /**
	     * Funcion para calcular las nuevas fechas deshabilitadas fuera del periodo cuando cambiamos de periodo
	     * @param calendar Calendario del home
	     */
	    setNewDisabledDates: function(calendar) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oCalendar = oView.calendar;
	        var oCalendarPhone = oView.calendarPhone;
	        var specialDates = oCalendar.getSpecialDates();
	        var disabledAntes = new sap.ui.unified.DateRange({
	            startDate: new Date("1900", "01", "01"),
	            endDate: util.Formatter.stringToDate(calendar[0].ZhrDatum)
	        });

	        var disabledDespues = new sap.ui.unified.DateRange({
	            startDate: util.Formatter.stringToDate(calendar[calendar.length - 1].ZhrDatum),
	            endDate: new Date("2029", "12", "31")
	        });

	        oCalendar.removeAllDisabledDates();
	        oCalendar.addDisabledDate(disabledAntes);
	        oCalendar.addDisabledDate(disabledDespues);

	        oCalendarPhone.removeAllDisabledDates();
	        oCalendarPhone.addDisabledDate(disabledAntes);
	        oCalendarPhone.addDisabledDate(disabledDespues);

	    },

	    /**
	     * Función que obtiene TODOS los tipos de conceptos horarios
	     */
	    getConceptosHora: function(date) {


	        var lang = getLangForCalls();
	        var fn = this;
	        var urlData = {
	            "LANG": "'" + lang + "'",
	    		"FECHA" : "'"+ util.Formatter.dateToString(date) +"'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
	        };

	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoHoraTodos.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	            setCompensaciones(p_data);
	            sap.ui.getCore().getModel().setProperty("/conceptosHora", p_data);

	        }

	        callFunctionImport(entity, urlData, success);
	    },
	    
	    /**
	     * Funcion que obtiene unicamente los conceptos que se mostraran en el desplegable de conceptos horarios
	     * para seleccionarlos
	     */
	    getConceptosHoraSelect: function(date) {


	        var lang = getLangForCalls();
	        var fn = this;
	        var urlData = {
	            "LANG": "'" + lang + "'",
	    		"FECHA" : "'"+ util.Formatter.dateToString(date) +"'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
	        };

	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoHora.key;
	        
	        /*
	         * En el success eliminamos todos los HAs
	         */
	        success = function(data, response, request) {
	            var p_data = data.d;
	            
	            for (var i = 0; i < p_data.results.length; i++) {
	                if (conceptoEstaOculto(p_data.results[i].Lgahr) == true) {
	                    p_data.results.splice(i, 1);
	                    i--;
	                }
	            }

	            sap.ui.getCore().getModel().setProperty("/conceptosHoraSelect", p_data);
	        }

	        callFunctionImport(entity, urlData, success);
	    },
	    
	    /**
	     * Función que obtiene TODOS los tipos de conceptos horarios
	     */
	    getConceptosDia: function() {
	        var lang = getLangForCalls();

	        var fn = this;
	        var urlData = {
	            "LANG": "'" + lang + "'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
	        };

	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";

	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.conceptoDia.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	            setAttributeValue("/conceptosDia", p_data);
	        }


	        callFunctionImport(entity, urlData, success);

	    },

	    
	    

	    /**
	     * Funcion que recupera las compensaciones 
	     * @param fecha
	     */
	    

	    /**
	     * Funcion que copia los conceptos horarios y diarios del día seleccionado
	     */
	    copiarDia: function() {

	        var fn = this;
	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        setCopiando(true);
	        removeStripsHeader();
	        oView.copiarDia.setText(getI18nText("footerActions.pegarDia"));
	        oView.copiarDia.attachPress(oView.getController().pegarDia);
	        oView.copiarDia.detachPress(oView.getController().copiarDia);
	        var horasSeleccionado = getAttributeValue("/informacionDia/detallehora/results");
	        var diasSeleccionado = getAttributeValue("/informacionDia/detalledia/results");
	        setAttributeValue("/copiahoras", horasSeleccionado);
	        setAttributeValue("/copiadias", diasSeleccionado);
	    },
	    
	    
	    
	    quitarCopiarDia : function(oEvt) {

	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	    	oView.copiarDia.attachPress(oController.copiarDia);
            oView.copiarDia.detachPress(oController.pegarDia);
	    	oView.copiarDia.setText(getI18nText("footerActions.copiarDia"));
	    	oView.copiarDia.setPressed(false);
	    	setCopiando(false);
	    	
	    },
	    
	    /**
	     * Funcion que pega los conceptos copiados sobre el dia seleccionado en caso de que se pueda
	     * @param oEvt
	     */
	    pegarDia: function(oEvt) {

	        var statusDia = getAttributeValue("/informacionDia/detalleparte/results/0/Stahd");
	        removeStripsHeader();
	        var fn = this;
	        var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        if (statusDia != "E" && statusDia != "A" && statusDia != "M" && statusDia != "N" && statusDia != "C") {


//	            oView.copiarDia.setText(getI18nText("footerActions.copiarDia"));
//	            oView.copiarDia.attachPress(oView.getController().copiarDia);
//	            oView.copiarDia.detachPress(oView.getController().pegarDia);
	            var horasCopiado = getAttributeValue("/copiahoras");
	            var diasCopiado = getAttributeValue("/copiadias");
	            
	            if(horasCopiado) {
					for (var i = 0; i < horasCopiado.length; i++) {
	                horasCopiado[i].Begda = getAttributeValue("/informacionDia/Fecha");
	                horasCopiado[i].Endda = getAttributeValue("/informacionDia/Fecha");
	                delete horasCopiado[i].Aedtm;

	                // Si es HAPR, no se copia
//	                if (conceptoAcumulaEstaOculto(horasCopiado[i].Lgahr) == true) {
//	                    horasCopiado.splice(i, 1);
//	                }
	            }
				}
	            
	            if(diasCopiado) {
					for (var j = 0; j < diasCopiado.length; j++) {
	                diasCopiado[j].Begda = getAttributeValue("/informacionDia/Fecha");
	                diasCopiado[j].Endda = getAttributeValue("/informacionDia/Fecha");
	                delete diasCopiado[j].Aedtm;
	            }
				}
	            setAttributeValue("/informacionDia/detallehora/results", horasCopiado);
	            setAttributeValue("/informacionDia/detalledia/results", diasCopiado);
	            oView.copiarDia.setPressed(true);
//	            setCopiando(false);
	        } else {
	            oView.copiarDia.setPressed(true);
	            sap.m.MessageToast.show(getI18nText("common.mensajes.pegarEnviado"))
	        }
	    },
	    
	    /**
	     * Funcion que borra el parte y todos los conceptos (horarios y diarios) del día actual
	     */
	    borrarDia: function() {

	        var fn = this;
	        var newParte = {
	            Tdyhd: "",
	            Stahd: ""
	        };
	        
	        var oldTurnoIni = getAttributeValue("/informacionDia/detalleparte/results/0/Hrbeg");
	        var oldTurnoFin = getAttributeValue("/informacionDia/detalleparte/results/0/Hrend");

	        setAttributeValue("/informacionDia/detalleparte/results/0", newParte);
	        setAttributeValue("/informacionDia/detallehora/results", undefined);
	        setAttributeValue("/informacionDia/detalledia/results", undefined);

	        var params = new CustomModelParameters();
	        params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	        params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.borrarDia);
	        
	        var date = getAttributeValue("/informacionDia/Fecha");
	        
			if(date.indexOf("Date") >= 0) {
				date = parseInt(date.substring(6, 19));
				date = new Date(date);
			} else {
				date = new Date(date);
			}
			var newDate = util.Formatter.dateToString(date)
			
	        
	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	        var urlData = {
	            "FECHA": "'" + newDate + "'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'"
	        };
	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.borrarDia.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	            sap.ui.getCore().getModel().updateBindings();
//	            console.log(p_data);
	            fn.getCalendario(date,true);
	            if (p_data.TEXTO != "" && p_data.TEXTO != undefined)
	                sap.m.MessageToast.show(p_data.TEXTO);
	        }

	        callFunctionImport(entity, urlData, success);
	    },

	    
	    /**
	     * Función que comprueba si los conceptos horarios suman mas de 24 horas
	     * @returns {Boolean} Resultado
	     */
	    comprobarMayor24: function() {

	        var conceptosHora = getAttributeValue("/informacionDia/detallehora/results");
	        var conceptos = getAttributeValue("/conceptosHora/results");
	        var horasTotales = 0;
	        if (conceptos.length > 0) {

	            for (var i = 0; i < conceptosHora.length; i++) {
	            	
	            	var timeData = util.Formatter.getAllTimeFromConcepto(conceptosHora[i]);
	                var duracionConcepto = Math.abs(timeData.fin - timeData.inicio) / 36e5;

	                for (var j = 0; j < conceptos.length; j++) {
	                    if ((conceptosHora[i].Lgahr == conceptos[j].Lgahr) && conceptos[j].Cumul == "X")
	                        horasTotales += duracionConcepto;
	                }

	            }
	        }

	        return horasTotales >= 24;

	    },
	    
	    calcularHorasTotalesDia : function(conceptosHora) {
	    	
	    	var horasTotales = 0;
	    	for (var i = 0; i < conceptosHora.length; i++) {
            	
	    		if(conceptoEstaOculto(conceptosHora[i].Lgahr) == false){
	    			var inicio =  util.Formatter.standardhorarioToTime(conceptosHora[i].Beghr);
	                var fin = util.Formatter.standardhorarioToTime(conceptosHora[i].Endhr);
	                
	                var duracionConcepto = Math.abs(fin - inicio) / 36e5;
	                horasTotales += duracionConcepto;
	    		}
                
                    
            }
	    	
	    	return horasTotales;
	    },
	    
	    calcularHorasTrabajadasDia : function(conceptosHora) {
	    	
	    	var horasTotales = 0;
	    	for (var i = 0; i < conceptosHora.length; i++) {
            	
                var inicio =  util.Formatter.standardhorarioToTime(conceptosHora[i].Beghr);
                var fin = util.Formatter.standardhorarioToTime(conceptosHora[i].Endhr);
                
                var duracionConcepto = Math.abs(fin - inicio) / 36e5;
                
                if(conceptoAcumula(conceptosHora[i].Lgahr))
                	horasTotales += duracionConcepto;
                    
            }
	    	
	    	return horasTotales;
	    },
	    
	    
	    ordenarConceptosTempranoTarde : function(conceptos) {
	    	
	    	
	    	/*
             * Ordena los conceptos de mas tardio a mas temprano
             */
            conceptos.sort(function compareFunction(a, b) {

                var finA = new Date(1900, 01, 01, a.Endhr.split(":")[0], a.Endhr.split(":")[1], a.Endhr.split(":")[2]).getTime();
                var finB = new Date(1900, 01, 01, b.Endhr.split(":")[0], b.Endhr.split(":")[1], b.Endhr.split(":")[2]).getTime();

                if (finA > finB) {
                    return 1;
                } else return -1;
            });
            return conceptos;
	    },
	    
	    ordenarConceptosTardeTemprano : function(conceptos) {
	    	
	    	
	    	/*
             * Ordena los conceptos de mas tardio a mas temprano
             */
            conceptos.sort(function compareFunction(a, b) {
            	
            	if(a.Beghr && b.Beghr && a.Endhr && b.Endhr){
            		
	            	var iniA = new Date(1900, 01, 01, a.Beghr.split(":")[0], a.Beghr.split(":")[1], a.Beghr.split(":")[2]).getTime();
	                var iniB = new Date(1900, 01, 01, b.Beghr.split(":")[0], b.Beghr.split(":")[1], b.Beghr.split(":")[2]).getTime();
	                var finA = new Date(1900, 01, 01, a.Endhr.split(":")[0], a.Endhr.split(":")[1], a.Endhr.split(":")[2]).getTime();
	                var finB = new Date(1900, 01, 01, b.Endhr.split(":")[0], b.Endhr.split(":")[1], b.Endhr.split(":")[2]).getTime();
	
	                if (finA > finB ) {
	                    return -1;
	                } else if ( finA == finB){
	                	if(iniA < iniB){
	                		return 1;
	                	}
	                	return -1;
	                }
	                return 1;
            	} else return  -1;
            });
            return conceptos;
	    },
	    
	    
	    convertirHaEnConceptoUnico : function(index, conceptosHora) {
	    	
	    	var recorta;
	    	var recortado = false;
	    	var listaConceptos, elemento2, elemento1, concepto1, concepto2;
	        var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	        
	        
	        var conceptoTieneRecorta2 = tieneRecorta2(conceptosHora[index].Lgahr) == true,
        	conceptoTieneRecorta1 = tieneRecorta1(conceptosHora[index].Lgahr) == true,
    		parteTieneRecorta2 = tieneRecorta2("") == true,
    		parteTieneRecorta1 = tieneRecorta2("") == true;
        	       
	        var tiene2 = (conceptoTieneRecorta2 == true || parteTieneRecorta2 == true)? true : false;
	        var conceptoAUsar2 = (tiene2 == true && conceptoTieneRecorta2 == true)? conceptosHora[index].Lgahr : "";
	        var tiene1 = (conceptoTieneRecorta1 == true || parteTieneRecorta1 == true)? true : false;
	        var conceptoAUsar1 = (tiene1 == true && conceptoTieneRecorta1 == true)? conceptosHora[index].Lgahr : "";
        
        
	        if(tiene2 == true){
	    		recorta = 2;
	    		concepto2 = getHaDesdeConcepto(conceptoAUsar2, "RECORTA2", 2);
	    		concepto1 = getHaDesdeConcepto(conceptoAUsar2, "RECORTA2", 1);
	    		
	    		if(conceptosHora[index-2]){
	        		// Si efectivamente se han creado los HAs segun el recorta del concepto
	    			// conceptoTieneRecorta2
	    			if(conceptosHora[index-2].Lgahr == concepto2 && conceptosHora[index-1].Lgahr == concepto1){ 
	                    conceptosHora[index].Endhr = conceptosHora[index-2].Endhr;
	                    conceptosHora.splice(index-1, 1);
	                    index = index -1;
	                    conceptosHora.splice(index-1, 1);
	                    index = index -1;
	                    recortado = true;
	        		}
	    		}
	    		// parteTieneRecorta2
	    		if(conceptosHora[index-1]){
	        		if( conceptosHora[index-1].Lgahr == concepto1 || conceptosHora[index-1].Lgahr == concepto2){
	                    conceptosHora[index].Endhr = conceptosHora[index-1].Endhr;
	                    conceptosHora.splice(index-1, 1);
	                    index = index -1;
	        		}
	    		}
	    	} 
	        
	        if(tiene1 =  true){
	    		recorta = 1;
	    		concepto1 = getHaDesdeConcepto(conceptoAUsar1, "RECORTA1", 1);
	    		
	    		if(conceptosHora[index-1]){
	        		// Si efectivamente se han creado los HAs segun el recorta
	        		if(conceptosHora[index-1].Lgahr == concepto1){
	                    conceptosHora[index].Endhr = conceptosHora[index-1].Endhr;
	                    conceptosHora.splice(index-1, 1);
	                    index = index -1;
	                    recortado = true;
	        		}
	    		}
	    	}
	        
		    	
        	sap.ui.getCore().getModel().updateBindings();
	    	return {recortado : recortado,
	    		conceptosHora: conceptosHora};
	    },
	    
	    
	    /**
	     * Funcion que modifica los conceptos horarios en caso de que se superen las 12 horas de duracion. Esta funcion
	     * crea los HAs
	     * @returns
	     */
	    ajustarHorasDia: function() {


	        var oView = this.getView();
	        var oController = oView.getController();
	        var fn = this;
	        var divisionPersonal = getAttributeValue("/constantesUser/results/0/Werks");
	        var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	        var conceptosHora = getAttributeValue("/informacionDia/detallehora/results");
	        var conceptos = getAttributeValue("/conceptosHora/results");
	        var reglas = getAttributeValue("/reglas");
	        var hayHAPR = false, indexHAPR;
	        if (conceptosHora.length > 0) {

	            var horasTotales = oController.calcularHorasTrabajadasDia(conceptosHora)
	            var horaMaxima;
	            var indexMasTardio = 0;
	            var haprArray = new Array();
	            var horaMasTardia = util.Formatter.standardhorarioToTime(conceptosHora[0].Endhr);
	            if(dentroFueraParte == undefined)
	            	dentroFueraParte = "";
	            if(dentroFueraParte == "3")
	            	horaMaxima = "23:59";
	            else horaMaxima = reglas["MAX_TRAB"][""][dentroFueraParte].HORA_INICIO1;
	            	
	            var inicio =  util.Formatter.standardhorarioToTime("00:00:00");
                var fin = util.Formatter.standardhorarioToTime(horaMaxima);
                
                var duracionMaxima = Math.abs(fin - inicio) / 36e5;
                /*
                 * Ordena los conceptos de mas tardio a mas temprano
                 */
                conceptosHora = oController.ordenarConceptosTardeTemprano(conceptosHora);
                
                
                
                conceptosHora = oController.aplicarReglaMaximoTrabajo(conceptosHora);
	            // Si sobrepasamos el limite de trabajo diario
	            if (horasTotales > duracionMaxima) {

	                var diferencia = horasTotales - duracionMaxima;
	                
	             // Si tiene un HAPR asociado, le ponemos su duración
	                for(var n = 0;n<conceptosHora.length;n++){
	                	if(conceptoAcumulaNoEstaOculto(conceptosHora[n].Lgahr)){

	                		var respuesta = oController.convertirHaEnConceptoUnico(n,conceptosHora);
	                		conceptosHora = respuesta.conceptosHora;
	                	}
	                }
                    
	                oController.aplicarRecortarGeneral();
	                return conceptosHora;

				/*
				 *  Si no tenemos más de 12 horas en el dia, borramos cualquier HAPR y anadimos su duracion a su
				 *  concepto asociado SI ES LIQUIDMEDIA
				 */
	            } else {

	                for(var u = 0; u < conceptosHora.length;u++) {
	                	var duracionTotalConcepto;
	                	var actual = conceptosHora[u];
	                	
	                	if(conceptoAcumulaNoEstaOculto(actual.Lgahr) == true) {
	                		duracionTotalConcepto = this.calcularHorasAcumuladasPorConcepto(actual.Lgahr)/3600;
	                		
	                		/*
	                		 * Si tiene una regla de 
	                		 */
	                		var reglaDurMax = getAttributeValue("/reglas/DUR_MAX");
	            	        if(reglaDurMax){
	            	        	if(reglaDurMax[actual.Lgahr]){
	            			        if(reglaDurMax[actual.Lgahr][dentroFueraParte]){
	            			        	var horaMaxima = reglas["DUR_MAX"][actual.Lgahr][dentroFueraParte].HORA_INICIO1;
	        	                    	
	        	                        var inicio =  util.Formatter.standardhorarioToTime("00:00:00");
	        	                        var fin = util.Formatter.standardhorarioToTime(horaMaxima);
	        	                        
	        	                        var duracionMaxima = Math.abs(fin - inicio) / 36e5;
	        	                		
	        	                		if(duracionTotalConcepto <= duracionMaxima) {
	        	                			var respuesta = oController.convertirHaEnConceptoUnico(u, conceptosHora)
	        	                			conceptosHora = respuesta.conceptosHora;
	        	                			if(respuesta.recortado == true)
	                    	        			u=0;
	        	                		}
	            			        }
            			        }
            	        	} else {
            	        		var respuesta = oController.convertirHaEnConceptoUnico(u, conceptosHora)
	                			conceptosHora = respuesta.conceptosHora;
            	        		if(respuesta.recortado == true)
            	        			u=0;
            	        	}
	                		
	                		
	                	}
	                }
	                
	            }
	        }
	        
	        conceptosHora = oController.ordenarConceptosTempranoTarde(conceptosHora);
	        return conceptosHora;
	    },
	    
	    
	    
	    aplicarReglaMaximoTrabajo : function( conceptosHora ){

	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	    	var reglas = getAttributeValue("/reglas");
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	var ruleData = reglas["MAX_TRAB"][""][dentroFueraParte];
	    	
	    	if(ruleData ) {
	    		
	    		if(ruleData.ID_CONC2 != ""){
	    		
		    		var horaTrabajoMaxRegla = ruleData.HORA_INICIO1;
			    	// Calculamos los tiempos del turno
					horaTrabajoMaxRegla = {
					    		Beghr: "00:00:00",
					    		Endhr: horaTrabajoMaxRegla
					};
					
		 			var timeDataTrabajoMaxRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoMaxRegla);
			    	var duracionTrabajoMaxRegla = (timeDataTrabajoMaxRegla.fin.getTime() - timeDataTrabajoMaxRegla.inicio.getTime() )/36e5;
			    	
			    	var horaTrabajoMinRegla = ruleData.HORA_INICIO2;
			    	
			    	horaTrabajoMinRegla = {
				    		Beghr: "00:00:00",
				    		Endhr: horaTrabajoMinRegla
			    	};
			    	
			    	var timeDataTrabajoMinRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoMinRegla);
			    	var duracionTrabajoMinRegla = (timeDataTrabajoMinRegla.fin.getTime() - timeDataTrabajoMinRegla.inicio.getTime() )/36e5;
			    	
			    	
			    	var totalHorasTrabajo = oController.calcularHorasTrabajadasDia(conceptosHora);
		    		
		    		if(totalHorasTrabajo <= duracionTrabajoMaxRegla && totalHorasTrabajo >= duracionTrabajoMinRegla) {
		    			
		    			var duracion = duracionTrabajoMaxRegla - totalHorasTrabajo;
		    			var ha = ruleData.ID_CONC2;
		    			
		    			
		    			var inicioHavi = {
	    					Beghr: "00:00:00",
				    		Endhr: "00:00:00"
		    			};
		    			
		    			
		    			var timeDataTrabajoMinRegla = util.Formatter.getAllTimeFromConcepto(horaTrabajoMinRegla);
		    			var nuevaDuracion = timeDataTrabajoMinRegla.inicio.getTime() + duracion*36e5;
		    			var nuevoFin = new Date(nuevaDuracion);
		    			
		    			nuevoFin = util.Formatter.setTwoDigits(nuevoFin.getHours()) + ":"+ util.Formatter.setTwoDigits(nuevoFin.getMinutes())+":"+util.Formatter.setTwoDigits(nuevoFin.getSeconds());
					 	
		    			
		    			var nuevoHavi = {
		    					 Lgahr : ha,
		    					 Beghr : "00:00:00",
		    					 Endhr : nuevoFin
						 }
		    			
		    			conceptosHora.push(nuevoHavi);
	    			
		    		}
	    		
	    		}
	    	}
	    	return conceptosHora;
	    },
	    
	    
	    /**
	     * Recorta las horas dadas por el máximo del concepto 
	     * @param data Concepto introducido
	     */
	    aplicarRecortarGeneral : function() {
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	        var oController = oView.getController();
	        
	        var reglas = getAttributeValue("/reglas");
	    	var conceptos = getAttributeValue("/informacionDia/detallehora/results");
	    	var conceptosCompensaciones = getAttributeValue("/conceptosCompensacion")
	    	var dentroFueraParte = getAttributeValue("/informacionDia/detalleparte/results/0/DentroFuera");
	    	if(!dentroFueraParte)
	    		dentroFueraParte = "";
	    	var recorta = "RECORTA2";
	    	var recorta1 = reglas["RECORTA1"], recorta2 = reglas["RECORTA2"], recortad = reglas["RECORTAD"], diferencia, index = 2;
	    	var infoRecorte, valorMax1, valorMax2, haMax1, haMax2, hora1,
	    		hora2, minuto1, minuto2, segundo1, segundo2, tiempoMaximo1, tiempoMaximo2, superaMax1, superaMax2;
	    	
	    	
	    	var horaMaxima = reglas["MAX_TRAB"][""][dentroFueraParte].HORA_INICIO1;
        	
            var inicio =  util.Formatter.standardhorarioToTime("00:00:00");
            var fin = util.Formatter.standardhorarioToTime(horaMaxima);
            
            var duracionMaxima = Math.abs(fin - inicio) / 36e5;
	    	
    		var duracionTotal = oController.calcularHorasTrabajadasDia(conceptos);
    		conceptos = oController.ordenarConceptosTardeTemprano(conceptos);
	    	
    		// Si el concepto sobrepasa el primer umbral de corte
    		if(duracionTotal > duracionMaxima){
    			
    			var tieneRecortaVacio = false;    			
    			// Restamos diferencia hasta umbral a la hora de fin del concepto
    			if(tieneRecorta2("")){
    				infoRecorte = recorta2[""][dentroFueraParte];
    				valorMax2 = infoRecorte.HORA_INICIO2, haMax2 = infoRecorte.ID_CONC2;
    				hora2 = valorMax2.split(":")[0], minuto2 = valorMax2.split(":")[1], segundo2 = valorMax2.split(":")[2]; 
    				tiempoMaximo2 = parseInt(hora2)*3600 + parseInt(minuto2)*60 + parseInt(segundo2);
    				tieneRecortaVacio = true;
    	    		tiempoMaximo2 = tiempoMaximo2/3600;
    				superaMax2 = duracionTotal > tiempoMaximo2;
    				diferencia = (duracionTotal - tiempoMaximo2 );
    				valorMax1 = infoRecorte.HORA_INICIO1, haMax1 = infoRecorte.ID_CONC1;
    	    		hora1 = valorMax1.split(":")[0], minuto1 = valorMax1.split(":")[1], segundo1 = valorMax1.split(":")[2];
    	    		tiempoMaximo1 = parseInt(hora1)*3600 + parseInt(minuto1)*60 + parseInt(segundo1);
    	    		tiempoMaximo1 = tiempoMaximo1/3600;
    	    		if(diferencia <= 0){
    	    			diferencia = (duracionTotal - tiempoMaximo1 );
    	    			index = 1;
    	    		}
    	    			
    			}else if(tieneRecorta1("")){
    				recorta = "RECORTA1";
    	    		index = 1;
    	    		infoRecorte = recorta1[""][dentroFueraParte];
    	    		valorMax1 = infoRecorte.HORA_INICIO1, haMax1 = infoRecorte.ID_CONC1;
    	    		hora1 = valorMax1.split(":")[0], minuto1 = valorMax1.split(":")[1], segundo1 = valorMax1.split(":")[2];
    	    		tiempoMaximo1 = parseInt(hora1)*3600 + parseInt(minuto1)*60 + parseInt(segundo1);
    	    		tiempoMaximo1 = tiempoMaximo1/3600;

    				tieneRecortaVacio = true;
    	    		superaMax1 = duracionTotal > tiempoMaximo1;
    				diferencia = (duracionTotal - tiempoMaximo1 );
    			}else if(tieneRecortaD("")){
    				recorta = "RECORTAD";
    	    		index = 1;
    	    		infoRecorte = recortad[""][dentroFueraParte];
    	    		valorMax1 = infoRecorte.HORA_INICIO1, haMax1 = infoRecorte.ID_CONC1;
    	    		hora1 = valorMax1.split(":")[0], minuto1 = valorMax1.split(":")[1], segundo1 = valorMax1.split(":")[2];
    	    		tiempoMaximo1 = parseInt(hora1)*3600 + parseInt(minuto1)*60 + parseInt(segundo1);
    	    		tiempoMaximo1 = tiempoMaximo1/3600;

    				tieneRecortaVacio = true;
    	    		superaMax1 = duracionTotal > tiempoMaximo1;
    				diferencia = (duracionTotal - tiempoMaximo1 );
    			} else{
    				recorta = "RECORTA1";
    	    		index = 1;
    				diferencia = (duracionTotal - duracionMaxima );
    			}
    			
    			var u = 0;

    			// Repasamos todos los conceptos del mas tardio al mas temprano mientras haya tiempo que recortar
    			while(diferencia>0 && u<=conceptos.length-1){

    				
					var actual = conceptos[u];					
					if(conceptoAcumulaNoEstaOculto(actual.Lgahr)) {
						
						var oldLgahr = actual.Lgahr;
						actual.Lgahr = "";
						
						if(tieneRecortaVacio == false){
							actual.Lgahr = oldLgahr;
						}
						var timeData = util.Formatter.getAllTimeFromConcepto(actual);
		                
		                // Si el concepto tiene duración (no ha sido recortado)
		                if(timeData.inicio != timeData.fin){
			                var respuesta = oController.recortarConceptoDuracion(actual, diferencia, conceptos, recorta, index);
		                }
		                conceptos[u].Lgahr = oldLgahr;
		                if(respuesta.horas != diferencia){
		                	diferencia = respuesta.horas;
			                conceptos[u] = respuesta.conceptos[0];
			                conceptos.splice(u,0,respuesta.conceptos[1]);
			                u++;
		                }
		                
					}
					if( diferencia < 0.016 && index == 2 && recorta == "RECORTA2"){
						diferencia = (tiempoMaximo2 - tiempoMaximo1 );
						index = 1;
						u = 0;
					}else u++;
    			}
    			
    			
    		}
	    	
	    },
	    
	    
	    /**
	     * Funcion que calcula y setea el plazo máximo para imputar a pasado para un empleado
	     * @param calendar
	     */
	    calcularFinImputacionPasado : function(dia) {
	    	
	    	
	    	dia = dia.Fecha;
	    	var fechaMaxImputacion = getConstante("PLMOPA_E"), result = false;
	    	
	        if (dia != undefined) {
	            if (new Date().getTime() > fechaMaxImputacion.getTime()) {
	                result = true;
	            }
	            setAttributeValue("/fueraDePlazoPasado", result);
	        }
	    },
	    
	    /**
	     * Funcion que calcula y setea el plazo máximo para imputar a pasado para un empleado
	     * @param calendar
	     */
	    calcularFinImputacion: function(dia) {

	    	
	    	var periodos = getAttributeValue("/periodos/results");
//			var dia = getAttributeValue("/calendario/results/0/ZhrDatum");
	        
	        
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
	        
	        
	        dia = util.Formatter.stringToDate4(dia.Fecha);
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
	        	fechaMaxImputacion = getConstante("FIN_IMPU");
	        	if (checkOnTimeFecha(fechaMaxImputacion) == false) {
					result = true;
				}
	        }
	        if(indexPeriodo > 1){
	        	fechaMaxImputacion = getConstante("PLMOPA_E");
	        	if ( dia < fechaMaxImputacion.getTime()) {
	                result = true;
	            }
	        }
	        
            
            setAttributeValue("/fueraDePlazo", result);
	        
	    },

	    /**
	     * Funcion para recuperar si estamos o no fuera de plazo
	     */
	    getFueraDePlazo: function() {
	        return getAttributeValue("/fueraDePlazo");
	    },

	    
	    /**
	     * Funcion para recuperar el importe de un concepto diario
	     * @param data Concepto diario
	     */
	    calcularImporteDieta: function(data) {


	        var params = new CustomModelParameters();
	        params.setService(ServiceConstants.Z_HR_CTLH_SRV);
	        params.setEntity(ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas);
	        params.setResultData_path("/importeConceptoDia");
	        //		callODataServiceRead(params);
	        var anzdy = "",
	            lgady;

	        if (data.Anzdy == undefined || data.Betdy == undefined || data.Betdy == "0.00") {
	            anzdy = "'0'";
	        } else anzdy = "'" + data.Anzdy + "'";

	        if (data.Lgady == undefined) {
	            var data = new Object();
	            data.Lgady = "DIIS";
	        }

	        var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	        var urlData = {
	            "FECHA": "'" + util.Formatter.dateToString(new Date()) + "'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	            "LGAHR": "'" + data.Lgady + "'",
	            "CANTIDAD": anzdy
	        };
	        
	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	            sap.ui.getCore().getModel().setProperty("/importeConceptoDia", p_data);
	            sap.ui.getCore().getModel().refresh(true)
	        };

	        callFunctionImport(entity, urlData, success);
	    },
	    
	    
	    /**
	     * Funcion para comprobar si el día seleccionado en el calendario corresponde al periodo actual
	     * @param daySelected Dia seleccionado
	     * @returns {Boolean} Resultado
	     */
	    checkHoyPeriodo: function(daySelected) {

	        var calendario = getAttributeValue("/calendario/results");
	        var enPeriodo = false;
	        if (calendario != undefined) {
	            for (var i = 0; i < calendario.length; i++) {
	                var actual = util.Formatter.stringToString(calendario[i].ZhrDatum);

	                var dateSelected;

	                if (daySelected instanceof Date == true) {
	                    dateSelected = util.Formatter.dateToString(daySelected)
	                } else dateSelected = util.Formatter.stringToString(daySelected)
	                if (dateSelected == actual) {
	                    return true;
	                }
	            }
	            return false;
	        }
	    },

	    /**
	     * Funcion que crea el modelo de leyenda
	     */
	    createLeyenda: function() {


	        var lang = getAttributeValue("/language");


	        if (lang == "ca") {
	            var data = [

	                {
	                    type: "Type01",
	                    key: "B",
	                    text: "Esborrany"
	                },
	                {
	                    type: "Type02",
	                    key: "N",
	                    text: "Aprovat amb modificacions"
	                },
	                {
	                    type: "Type03",
	                    key: "R",
	                    text: "Rebutjat"
	                },
	                {
	                    type: "Type04",
	                    key: "M",
	                    text: "Modificat"
	                },
	                {
	                    type: "Type05",
	                    key: "C",
	                    text: "Comptabilitzat"
	                },
	                {
	                    type: "Type06",
	                    key: "A",
	                    text: "Aprovat"
	                },
	                {
	                    type: "Type07",
	                    key: "E",
	                    text: "Enviat"
	                },
	                {
	                    type: "Type08",
	                    key: "",
	                    text: "Inicial"
	                },
	                {
	                    type: "Type09",
	                    key: "L",
	                    text: "Lliure"
	                },
	                {
	                    type: "Type10",
	                    key: "F",
	                    text: "Festiu"
	                },
	                {
	                    type: "Type11",
	                    key: "S",
	                    text: "Festiu especial"
	                },
	                {
	                    type: "Type12",
	                    key: "",
	                    text: "Torn normal"
	                }

	            ]
	        } else if (lang == "es") {
	            var data = [

	                {
	                    type: "Type01",
	                    key: "B",
	                    text: "Borrador"
	                },
	                {
	                    type: "Type02",
	                    key: "N",
	                    text: "Aprobado con modificaciones"
	                },
	                {
	                    type: "Type03",
	                    key: "R",
	                    text: "Rechazado"
	                },
	                {
	                    type: "Type04",
	                    key: "M",
	                    text: "Modificado"
	                },
	                {
	                    type: "Type05",
	                    key: "C",
	                    text: "Contabilizado"
	                },
	                {
	                    type: "Type06",
	                    key: "A",
	                    text: "Aprobado"
	                },
	                {
	                    type: "Type07",
	                    key: "E",
	                    text: "Enviado"
	                },
	                {
	                    type: "Type08",
	                    key: "",
	                    text: "Inicial"
	                },
	                {
	                    type: "Type09",
	                    key: "L",
	                    text: "Libre"
	                },
	                {
	                    type: "Type10",
	                    key: "F",
	                    text: "Festivo"
	                },
	                {
	                    type: "Type11",
	                    key: "S",
	                    text: "Festivo especial"
	                },
	                {
	                    type: "Type12",
	                    key: "",
	                    text: "Turno normal"
	                }

	            ];
	        } else if (lang == "en") {
	            var data = [

	                {
	                    type: "Type01",
	                    key: "B",
	                    text: "Draft"
	                },
	                {
	                    type: "Type02",
	                    key: "N",
	                    text: "Approved with modifications"
	                },
	                {
	                    type: "Type03",
	                    key: "R",
	                    text: "Rejected"
	                },
	                {
	                    type: "Type04",
	                    key: "M",
	                    text: "Modified"
	                },
	                {
	                    type: "Type05",
	                    key: "C",
	                    text: "Accounted"
	                },
	                {
	                    type: "Type06",
	                    key: "A",
	                    text: "Approved"
	                },
	                {
	                    type: "Type07",
	                    key: "E",
	                    text: "Sent"
	                },
	                {
	                    type: "Type08",
	                    key: "",
	                    text: "Initial"
	                },
	                {
	                    type: "Type09",
	                    key: "L",
	                    text: "Day off"
	                },
	                {
	                    type: "Type10",
	                    key: "F",
	                    text: "Holiday"
	                },
	                {
	                    type: "Type11",
	                    key: "S",
	                    text: "Special holiday"
	                },
	                {
	                    type: "Type12",
	                    key: "",
	                    text: "Shift"
	                }

	            ];
	        }



	        setPropertySAPUI5Model("/leyenda/results", new Object());
	        setAttributeValue("/leyenda/results", data)

	    },
	    
	    /**
	     * Funcion para instanciacion lazy del dialog de enviar mes
	     */
	    openConfirmationMesDialog : function(){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	if(oView.confirmationMesDialog == undefined) {
	    		oView.createConfirmationMesDialog(oController);
	    	}
	    	
	    	oView.confirmationMesDialog.open();
	    },
	    
	    /**
	     * Funcion para instanciacion lazy del dialog de recorte del turno normal si introduce una 
	     * compensacion
	     */
	    openTurnoNormalModificadoDialog : function(){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	if(oView.turnoNormalModificadoDialog == undefined) {
	    		oView.createTurnoNormalModificadoDialog(oController);
	    	}
	    	
	    	oView.turnoNormalModificadoDialog.open();
	    },
	    
	    /**
	     * Funcion para instanciacion lazy del dialog de creacion de HA (actualmente no se usa)
	     */
	    openHAPRDialog : function(){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	if(oView.haprDialog == undefined) {
	    		oView.createHAPRDialog(oController);
	    	}
	    	
	    	oView.haprDialog.open();
	    },
	    
	    /**
	     * Funcion para instanciacion lazy del dialog de borrar dia
	     */
	    openConfirmationBorrarDialog : function(){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	if(oView.confirmationBorrarDialog == undefined) {
	    		oView.createConfirmationBorrarDialog(oController);
	    	}
	    	
	    	oView.confirmationBorrarDialog.open();
	    },
	    
	    /**
	     * Funcion para instanciacion lazy del dialog de borrar dia
	     */
	    openCambioCentroDialog : function(){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var oController = oView.getController();
	    	if(oView.cambioCentroDialog == undefined) {
	    		oView.createCambioCentroDialog(oController);
	    	}
	    	
	    	oView.cambioCentroDialog.open();
	    },

	    getPeriodos : function(){
			
			
			var fn = this;
			
			var entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerPeriodos.key;
		    var urlData = {
		    		"PERNR" : "'"+getAttributeValue("/userInfo/PERNR")+"'",
		    		"CALENDAR" : "'X'"
		    };
		    
		    success = function (data) {
			      var p_data = data.d;
			      
			      p_data.results.sort(function compareFunction(a, b) {

			        	var diaActual = parseInt(a.Begda.substring(6, 19));
			        	var diaActualB = parseInt(b.Begda.substring(6, 19));

			            if (diaActual > diaActualB) {
			                return -1;
			            } else return 1;

			      });
			      sap.ui.getCore().getModel().setProperty("/periodos", p_data);
		    };
		    
		    callFunctionImport(entity,urlData,success);
		},
		
		
		switchPageDiarios : function(){
			
			var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
			var muestraMatriz = getAttributeVaue("/configuracion/REPORTE/REP_REPOR001/DIA_MATR");
			var oContent = oView.containerDia.getContent();
			var oListConceptos = oContent[0];
			var oMatriz;
			if(oContent.length == 2)
				oMatriz = oContent[1];
			
			
			if(oListConceptos.getVisible() == true){
				
				if(muestraMatriz == "X"){
					oMatriz.setVisible(true);
				}
			}
			
			
			for(var i =0; i<oPages.length;i++){
				if(oPages[i].getId() != oViewActual.getId()){
					oView.containerDia.to(oPages[i]);
				}
			}
			
		},
		
		onSelectCheckboxMatriz : function(oEvt) {
			
			var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
			var oController = oView.getController();
			var contexto = oEvt.getSource().getBindingContext().getObject();
//			var path = oEvt.getSource().getBindingContext()
			
			
			if(oEvt.getParameter("selected")){
				
				
				var index = getAttributeValue("/informacionDia/detalledia/results").length;
				var anzdy  = "'0'";

				
				var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
		        var urlData = {
		            "FECHA": "'" + util.Formatter.dateToString(new Date()) + "'",
		            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
		            "LGAHR": "'" + contexto.Lgady + "'",
		            "CANTIDAD": anzdy
		        };
		        
		        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas.key;

		        success = function(data, response, request) {
		            var p_data = data.d;
		            
		            var nuevoConcepto = {
							"Lgady" : contexto.Lgady,
							"Betdy" : p_data.IMPORTE_UN,
							"Waers" : "EUR",
							"Zeidy" : contexto.Zeinh
					};
					var path = "/informacionDia/detalledia/results/" + index;
			        setPropertySAPUI5Model(path, nuevoConcepto);
			        
			        if(contexto.Lgady == "KLMT"){
			        	oController.openKmEditionDialog(path);
			        }
		            sap.ui.getCore().getModel().refresh(true);
		        };
		        
	        	callFunctionImport(entity, urlData, success);
		        
			} else {
				
				var conceptosDia = getAttributeValue("/informacionDia/detalledia/results");				
				for (var j = 0;j<conceptosDia.length;j++) {					
					if(conceptosDia[j].Lgady == contexto.Lgady){
						conceptosDia.splice(j, 1);
						sap.ui.getCore().getModel().updateBindings()
						break;
					}
				}
				
			}
			oController.reactToSelectionCheckboxMatriz(oEvt);
		},
		
		
		reactToSelectionCheckboxMatriz : function(oEvt) {
			
			var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
			oView.matrizConceptosDia;
			
			// Aqui poner la logica para deshabilitar otros checkboxes despues de haber pulsado uno
			
			
		},
		
		
		/**
	     * Funcion para instanciacion lazy del dialog de borrar dia
	     */
	    openKmEditionDialog : function(path){
	    	
	    	var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
	    	var conceptosDia = getAttributeValue("/informacionDia/detalledia/results");
	    	var oController = oView.getController();
	    	if(oView.kmsDialog == undefined) {
	    		oView.createKmsDialog(oController);
	    	}
	    	
	    	// Editamos 
	    	if(path instanceof Object){
	    		for(var i =0;i<conceptosDia.length;i++) {
	    			if(conceptosDia[i].Lgady == "KLMT"){
	    				path = "/informacionDia/detalledia/results/" + i;
	    			}
	    		}
	    	}
	    	
	    	oView.kmsDialog.bindElement(path);
	    	oView.kmsDialog.open();
	    },
		
	    
	    getKmsDiariosMatriz : function (context) {
	    	
	    	var oldData = context.getObject(), path = context.getPath();
	    	var urlBase = ServiceConstants.Host + "/" + ServiceConstants.Z_HR_CTLH_SRV.key + "/";
	        var urlData = {
	            "FECHA": "'" + util.Formatter.dateToString(new Date()) + "'",
	            "PERNR": "'" + getAttributeValue("/userInfo/PERNR") + "'",
	            "LGAHR": "'" + oldData.Lgady + "'",
	            "CANTIDAD": "'" + oldData.Anzdy + "'"
	        };
	        
	        entity = ServiceConstants.Z_HR_CTLH_SRV.EntitySet.obtenerDietas.key;

	        success = function(data, response, request) {
	            var p_data = data.d;
	            
	            var nuevoConcepto = {
						"Lgady" : oldData.Lgady,
						"Betdy" : p_data.TOTAL,
						"Waers" : "EUR",
						"Zeidy" : oldData.Zeidy,
						"Anzdy" : oldData.Anzdy
				};

		        sap.ui.getCore().getModel().setProperty(path, nuevoConcepto);

				sap.ui.getCore().getModel().updateBindings();
	            sap.ui.getCore().getModel().refresh(true);
	        };

	        callFunctionImport(entity, urlData, success);
	    	
	    },
	    
	    
	    
	    borrarParte : function(oEvt) {
	    	
	    	sap.ui.getCore().getModel().setProperty("/informacionDia/detalledia/results", []);
	    	sap.ui.getCore().getModel().setProperty("/informacionDia/detallehora/results", []);
			sap.ui.getCore().getModel().updateBindings();
	    },
	    
	    
	    
	    
	    
	    

	    /**
	     * Called when a controller is instantiated and its View controls (if available) are already created.
	     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	     * @memberOf view.Home
	     */
	    //	onInit: function() {
	    //
	    //	},

	    /**
	     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	     * (NOT before the first rendering! onInit() is used for that one!).
	     * @memberOf view.Home
	     */
	    //	onBeforeRendering: function() {
	    //
	    //	},

	    /**
	     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	     * This hook is the same one that SAPUI5 controls get after being rendered.
	     * @memberOf view.Home
	     */


	    /**
	     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	     * @memberOf view.Home
	     */
	    //	onExit: function() {
	    //
	    //	}

	});