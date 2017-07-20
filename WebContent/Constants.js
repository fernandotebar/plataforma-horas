/**
* Javascript file containing all the constants.
*/
jQuery.sap.declare("Constants");
/** Common Constants used in Application */




Variables = {
	
	FIN_APRO: 13,
	FIN_IMPU : 2,
	FIN_REVI: 13,
	PLVIPA_E : "20170101",
	PLVIPA_M : "20170101",
	PLMOPA_E : 60,
	PLMOPA_M : 60
};

Common = {
		App:{
			Name: "app"
		},
		
		Constants: {
			Display: "DISPLAY",
			Edit: "EDIT"
			
		},
		
		Filters: {
			Lang: 'ILANGU',
			User: 'PERNR',
			Token : 'TOKEN'
		},
		
		Navigations:{
			LOGIN : 'Login',
			INICIO: 'Inicio',
			HOME : 'Home',
			MENU_CONTROL: "MenuControl",
			MANAGER: 'Manager',
			EMPLEADO: 'EmpleadoManager',
			INFORMES: 'Informes',
			PLUSES: 'ListadoPluses',
			CONFIG: 'Configuracion',
			TURNO: 'ConfigTurno',
			BOLSAS: 'ConfigBolsas',
			LIST_BOLSAS : 'ListadoBolsasAntiguas'
		},
		GlobalModelNames : {
			I18N : 'I18N'
		},
		
		Roles : {  // 1 empleado 2 responsable 3 productor 4 gerente
			Imputar : ["PCH_R0000001"],
			Manager : ["PCH_R0000002","PCH_R0000003", "PCH_R0000004"],
			Aprobar: ["PCH_R0000002"],
			Modificar : ["PCH_R0000002","PCH_R0000003", "PCH_R0000004"],
			Informes : ["PCH_R0000001","PCH_R0000002","PCH_R0000003", "PCH_R0000004"]
		}
};

var Fragments = {
		
	HOME : {
		COMPENSACIONES: {
			LIQUIDMEDIA : "CompensacionesLiquidMedia",
			OTRA : "abc"
		},
		DIA : {
			LIQUIDMEDIA : "ContentInfoDiaLiquidMedia",
			OTRA : "abc"
		},
		HORARIO : {
			LIQUIDMEDIA : "DialogoHoraLiquidMedia",
			OTRA : "abc"
		},
		DIARIO : {
			LIQUIDMEDIA : "DialogoDiaLiquidMedia",
			OTRA : "abc"
		},
		ITEMS : {
			LIQUIDMEDIA : "abc",
			OTRA : "abc"
		},
		
	},
	MANAGER : {
		FILTROS : {
			LIQUIDMEDIA : "FiltrosManagerLiquidMedia",
			OTRA : "abc"
		}
	},
	EMPLEADO : {
		FILTROS : {
			LIQUIDMEDIA : "FiltrosEmpleadoLiquidMedia",
			OTRA : "abc"
		}
	}
	
};



