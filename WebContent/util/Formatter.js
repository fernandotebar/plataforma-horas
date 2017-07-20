jQuery.sap.declare("util.Formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("Constants");

util.Formatter = {
		
		
	compensacionesDecimals : function(value){
		
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			  maxFractionDigits: 2,
			  groupingEnabled: true,
			  groupingSeparator: ",",
			  decimalSeparator: "."
			});
		
		
		if(value != undefined){
			value = oNumberFormat.format(value);
			return parseFloat(value);
		}
		 return "";
	},
	
	dateToOdataDate : function(date) {
		
		var milli = date.getTime();
		return "\/Date("+milli+")\/";
	},
	
	dateToTimestamp : function(date){
		var mon = date.getMonth()+1;
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		
		return ""+date.getFullYear()+"-"+month+"-"+datez+"T00:00:00";
	},
	
	normalToRead : function(date){
		var mon = date.getMonth()+1;
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		
		return "datetime'"+date.getFullYear()+"-"+month+"-"+datez+"T00:00:00'";
	},
	
	fechaDiaToString : function(texto){
		
		var year = texto.substring(0,4);
		var month = texto.substring(5,7);
		var day = texto.substring(8,10);
		
		return day+"-"+month+"-"+year;
	},
	
	stringToString : function(texto){
		
		var year = texto.substring(0,4);
		var month = texto.substring(5,7);
		var day = texto.substring(8,10);
		
		return year + ""+month+""+day;
	},
		
	stringToDate2 : function(texto){
		
		var year = texto.substring(0,4);
		var month = texto.substring(4,6);
		var day = texto.substring(6,8);
		
		return new Date(year,month-1,day);
	},
	
	stringToDate4 : function(texto){
		
		if(texto != undefined){
			var year = texto.substring(0,4);
			var month = texto.substring(5,7);
			var day = texto.substring(8,10);
			
			return new Date(year,month-1,day);
		}
		
	},
	
	stringToDate3 : function(texto){
		
		var year = texto.substring(4,8);
		var month = texto.substring(2,4);
		var day = texto.substring(0,2);
		
		return new Date(year,month-1,day);
	},
	
	stringToString2 : function(texto){
		
		if(texto != undefined){
			var year = texto.substring(0,4);
			var month = texto.substring(5,7);
			var day = texto.substring(8,10);
			
			return year+""+month+""+day;
		}
		
	},
		
	
	abapDatetoShow3 : function(date){
		
		
		if(date) {
			var newDate = util.Formatter.stringToDate4(date);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern : "EEEE, dd  MMMM  yyyy" 
			});
			newValue = dateFormat.format(newDate);
			
			
			return newValue;
		}
		
		
		
//		if(date){
//			var year = date.substring(0,4);
//			var month = date.substring(5,7);
//			var day = date.substring(8,10);
//			
//			var dayWeek = new Date(year,month,day).getDay();
//		
//			return day +"/"+month+"/"+ year;
//		}
	},
	
	abapDatetoShow2 : function(date){
		
		if(date){
			var year = date.substring(0,4);
			var month = date.substring(5,7);
			var day = date.substring(8,10);
			
			var dayWeek = new Date(year,month,day).getDay();
		
			return day +"/"+month+"/"+ year;
		}
	},
	
	abapDatetoShow : function(date){
		
		if(date){
		var year = date.substring(0,4);
		var month = date.substring(4,6);
		var day = date.substring(6,8);
		
		var dayWeek = new Date(year,month,day).getDay();
		var text = getI18nText("common.semana."+dayWeek);
		
		return text + " "+ day + " "+ getI18nText("conceptosHora.de") +  " " + getI18nText("common.mes."+month) + " "+ getI18nText("conceptosHora.de") +  " " + year;
		}
	},
	
	datetimeToString : function(date){
		var mon = date.getMonth()+1;
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		return date.getFullYear()+ ""+ month+ ""+datez;
	},
		
	dateToString : function(date){
		var mon = date.getMonth()+1;
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		return date.getFullYear()+ ""+ month+ ""+datez;
	},
	
	dateToString2 : function(date){
		var mon = date.getMonth()+1;
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		return date.getFullYear()+ "-"+ month+ "-"+datez;
	},
	
	dateToString3 : function(date){
		var mon = date.getMonth()+1;
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		return  datez+ "/"+ month+  "/"+ date.getFullYear();
	},
	
	dateToString4 : function(date){
		var mon = date.getMonth();
		
		var datez = date.getDate() <10 ? "0"+date.getDate() : date.getDate();
		var month = mon <10 ? "0"+mon : mon;
		if(sap.ui.Device.system.phone == true){
			return  datez+ " "+ getI18nText("common.mes.phone."+mon)+" "+ date.getFullYear();
		}else return  datez+ " "+ getI18nText("common.mes."+mon)+" "+ date.getFullYear();
	},
		
	stringToDate : function(texto){
		
		var dia = texto.split("-")[2];
		var mes = texto.split("-")[1];
		var anyo = texto.split("-")[0];
		return new Date(anyo, mes-1, dia);
	},	
		
	currencyFormatter : sap.ui.core.format.NumberFormat.getCurrencyInstance({
             maxFractionDigits: 2,
             groupingEnabled: true,
             groupingSeparator: ",",
             decimalSeparator: ".",
             currencyCode: false
     }),
     
     
     aprobarRechazar : function(estado, directo,responsableEdita){
 		
    	 var fueraAprobacion = getAttributeValue("/fueraDePlazoAprobacion"); 
    	
 		if((estado == "E" || estado == "M") && responsableEdita == true && fueraAprobacion == false){
 			return true;
 		}else return false
 	},
 	
 	modificarOnStahd : function(estado,gerenteEdita, responsableEdita, concepto){
 		

 		var fueraRevision = getAttributeValue("/fueraDePlazoRevision");
 		var empleadoDirecto = getAttributeValue("/manager/empleadoSelected/DIRECTO");
 		
 		if(gerenteEdita == true){
 			if(fueraRevision == true){
 				return false;
 			}
			if( (estado == "A" || estado == "N"|| estado == "E" || estado == "M")){
				if(concepto == undefined){
					return true;
				}else{
					if(concepto != "HAPR" && concepto != "HAFT" && concepto != "HAFS" && concepto != "HAJE" )
						return true;
					else return false
				}
			}
		}
		
		if(responsableEdita == true){
 			if(fueraRevision == true){
 				return false;
 			}
			if( (estado == "E" || estado == "M")  ){
				if(concepto == undefined){
					return true;
				}else{
					if(concepto != "HAPR" && concepto != "HAFT" && concepto != "HAFS" && concepto != "HAJE" )
						return true;
					else return false
				}
			}else return false;
		}
 		
 		var fuera = getAttributeValue("/fueraDePlazo");
 		// Para pantalla de reporte de horas, o bien estar dentro del plazo de edición o ser responsable o gerente 
 		if((responsableEdita == undefined || responsableEdita == false) && (gerenteEdita == undefined || gerenteEdita == false) && (estado == "" ||estado == "R" ||estado == "B" ) && (fuera == false  )){
			return true;
 		}	else return false;
 		
 	},
 	
 	
 	reactOnConfig : function(acceso) {
		if(acceso == "X"){
			return true;
		} else {
			return false;
		}
 	},
 	
 	
 	getEnabledFromConstante : function(fecha) {
 		
 		if(fecha != undefined){
 			if (new Date().getTime() > fecha.getTime()) {
 	            return false;
 	        }
 	        return true;
 		}
 		    	
        return false;
 	},
 	
 	selectWhenColumnaSelected : function(valor){
		if(valor == "X")
			return true
		else return false
	},
	
	
	selectWhenColumnaConfiguracionSelected : function(valor,acceso){
		if(valor == "X" && acceso == "X")
			return true
		else return false
	},
	
    decimalFormat : sap.ui.core.format.NumberFormat.getFloatInstance({
         maxFractionDigits: 2,
         groupingEnabled: true,
         groupingSeparator: ",",
         decimalSeparator: "."
     }),
		
	convertToNumber :  function(value) {
		var numberOutput = parseFloat(value);
		
        return numberOutput;
	},
    
	getFormattedCurrency : function(value, code) {
    	if(value){ 
    		return this.currencyFormatter.format(value, code);
    	}
    	return "";
    },
    
    roundToDecimal : function(value) {
        return this.decimalFormat.format(value);
    },
    
    formatDate : function(dateStr) {
        var date = new Date(dateStr);
        var mthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var formattedDate = date.getDate() +" "+ mthNames[date.getMonth()] +" "+ date.getFullYear();
        return formattedDate;
    },
    
    formatDateSimple : function(dateStr) {
    	var date = this.getJavascriptDate(dateStr);
    	var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : Common.DateFormat.SHORT });
	    return dateFormat.format(date);
    },
    
    getJavascriptDate : function(dateStr){
    	var dateObj = new Date();
    	if(typeof dateStr != 'undefined'){
    		if(typeof dateStr === 'object'){
    			dateObj = new Date(dateStr);
	    	} else {
	    		dateObj = new Date(eval(dateStr.replace("/Date(", "").replace(")/", "")));	    		
	    	}
    	}	
	    return	dateObj;
    },
    
    /*formatDateTest : function(dateStr) {
    	var date = null;
    	var formattedDate = "";
    	if(typeof dateStr != 'undefined'){
    		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "MM/dd/yyyy" });
	    	if(typeof dateStr === 'object'){
	    		date = new Date(dateStr);
	    	} else {
	    		date = new Date(eval(dateStr.replace("/Date(", "").replace(")/", "")));	    		
	    	}	        
	        return date;
    	}
        return formattedDate;        
    },*/
    
    getDateForDays : function(days){
    	var todaysDate = new Date();
    	if(days){
    		todaysDate = todaysDate.setDate(todaysDate.getDate() + parseInt(days));
    	}
    	return new Date(todaysDate);
    },
    
    parseDate : function(dateStr, dateFormat){
    	var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : dateFormat });
    	return dateFormat.parse(dateStr);
    },
    
    convertToDateTimeString : function(d) {
        //YYYY-MM-DDThh:mm:ss
        var date = d;
        var day         = (date.getDate() < 10) ? "0"+date.getDate() : date.getDate();
        var month       = ((date.getMonth() + 1) < 10) ? "0"+(date.getMonth() + 1) : (date.getMonth() + 1);
        var hours       = (date.getHours() < 10) ? "0"+date.getHours() : date.getHours();
        var minutes     = (date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes();
        var seconds     = (date.getSeconds() < 10) ? "0"+date.getSeconds() : date.getSeconds();
        var fDate = date.getFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds;
        return fDate;
    },
    
    standardhorarioToTime : function(data) {
    	
    	var hora = data.split(":")[0];
        var minuto = data.split(":")[1];
        
        if (hora.length < 2) {
        	hora = "0" + hora;
        }
        if (minuto.length < 2) {
        	minuto = "0" + minuto;
        }
        
        return new Date(2000, 01, 01, hora , minuto , 00).getTime();
    	
    },
    
    getAllTimeFromConcepto : function(data) {
    	
    	var result = {
			horaInicio : this.setTwoDigits(data.Beghr.split(":")[0]),
	    	minutoInicio : this.setTwoDigits(data.Beghr.split(":")[1]),
	    	segundoInicio : this.setTwoDigits(data.Beghr.split(":")[2]),
	    	horaFin : this.setTwoDigits(data.Endhr.split(":")[0]),
	    	minutoFin : this.setTwoDigits(data.Endhr.split(":")[1]),
	    	segundoFin : this.setTwoDigits(data.Endhr.split(":")[2]),
	    	inicio : new Date(1900, 01, 01, this.setTwoDigits(data.Beghr.split(":")[0]), this.setTwoDigits(data.Beghr.split(":")[1]), this.setTwoDigits(data.Beghr.split(":")[2])),
        	fin : new Date(1900, 01, 01, this.setTwoDigits(data.Endhr.split(":")[0]), this.setTwoDigits(data.Endhr.split(":")[1]), this.setTwoDigits(data.Endhr.split(":")[2]))
    	}
    	
        return result;
    },
    
    setTwoDigits : function(data) {
    	
    	return ((""+data.toString().length) <2) ? "0" + data.toString() : data.toString();
    	
    }
    
    
 };