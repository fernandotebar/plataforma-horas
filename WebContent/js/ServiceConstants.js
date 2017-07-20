var ServiceConstants = {
	
	Host : "",
	HostLogin: "http://sapwd-dev-1.imagina.local/irj/go/km/docs",
	Format : "$format=json",
	Count : "&$inlinecount=allpages",
	
	
	Z_HR_CTLH_SRV : {
		key : "Z_HR_CTLH_SRV",
		EntitySet : {
			employeePlansSet : {
            	key : "employeePlansSet"
            },
            employeePlansDelSet : {
            	key : "employeePlansDelSet"
            },
            conceptoHora : {
            	key : "ObtenerConceptoHora"
            },
            conceptoHoraTodos : {
            	key : "ObtenerTodosConceptoHora"
            },
            conceptoDia : {
            	key : "ObtenerConceptoDia"
            },
            compensaciones : { // Function Import
            	key : "compensaciones"
            },
            compensacionesAntiguas : { // Function Import
            	key : "compensacionesAntiguas"
            },
            elementosPEP : {
            	key : "obtenerElementoPep"
            },
            calendario : { // Function Import
            	key : "employeeCalendar",
            	filters:{
            		FECHA:"FECHA"
				}
            },
            informacionDia : {
            	key : "detalleDiaSet",
            	filters:{
            		Pernr:"Pernr",
            		Fecha:"Fecha"
				}
            },
            borrarDia : {
            	key : "fborrar_dia",
            	filters:{
            		Pernr:"Pernr",
            		Fecha:"Fecha"
				}
            },
            enviarMes : {
            	key : "obtenerEnviarMes",
            	filters:{
            		PERNR:"PERNR",
            		FECHA:"FECHA"
				}
            },
            horariosDia : {
            	key : "horariosSet",
            	filters:{
            		BEGDA:"BEGDA"
				}
            },
            diariosDia : {
            	key : "diariosSet",
            	filters:{
            		BEGDA:"BEGDA"
				}
            },
            divisas : {
            	key : "obtenerDivisas",
            	filters:{
            		SPRAS:"SPRAS"
				}
            },
            categorias : {
            	key : "obtenerCategorias",
            	filters:{
            		PERNR:"PERNR"
				}
            },
            udsMedida : {
            	key : "obtenerudsMedida",
            	filters:{
            		SPRAS:"SPRAS"
				}
            },
            dominios : {
            	key : "obtenerDominios",
            	filters:{
            		LANGU:"LANGU",
            		DOMAIN_NAME:"DOMAIN_NAME"
				}
            },
            enviarMes : {
            	key : "obtenerEnviarMes",
            	filters:{
            		FECHA:"FECHA",
            		PERNR:"PERNR"
				}
            },
            enviarMail : {
            	key : "fMail1"
            },
            negativos : {
            	key : "obtenerNegativos"
            },
            obtenerDietas : {
            	key : "obtenerDietas"
            },
            obtenerCategoriaActual : {
            	key : "obtenerCategoriaActual"
            },
            obtenerEmpleados : {
            	key : "obtenerEmpleados"
            },
            obtenerSubordinados : {
            	key : "subordinadosResponsableSet"
            },
            // Manager
            totalesPorEmpleado : {
            	key : "DiferencialSet"
            },
            aprobarPersonas: {
            	key : "aprobmassSet"
            },
            aprobarPartes: {
            	key : "aprobdiasSet"
            },
            comprobarAusencia: {
            	key: "obtenerausencia2001"
            },
            informarGerente: {
            	key: "revisiondataSet"
            },
            informarResponsable: {
            	key: "revisiondataSet"
            },
            obtenerPeriodos : {
            	key : "obtenerPeriodos"
            },
            listadoPluses : {
            	key : "listadoPluses"
            },
            obtenerColumnasEmpleado : {
            	key : "obtenerColumnasEmpleado"
            },
            enviarColumnasEmpleado : {
            	key : "ColumnasEmpleadoSet"
            },
            obtenerColumnasManager : {
            	key : "obtenerColumnasManager"
            },
            enviarColumnasManager : {
            	key : "ColumnasManagerSet"
            },
            configuracion : {
            	key: "configuracion"
            },
            delegaciones : {
            	key: "delegacionesSet"
            },
            divisionPersonal : {
            	key: "obtenerDivSubdiv"
            },
            constantes : {
            	key: "obtenerConstantes"
            },
            reglasValidacion : {
            	key: "obtenerReglas"
            },
            textosBolsas : {
            	key: "obtenerTxtBolsasHoras"
            },
            obtenerTurno : {
            	key: "obtenerTurno"
            },
            enviarTurno : {
            	key: "turnoEmpleadoSet"
            },
            obtenerColisiones : {
            	key: "obtenerColisionesConceptos"
            },
            obtenerDescProduccion : {
            	key: "obtenerDescProduccion"
            },
            obtenerBolsas : {
            	key: "obtener9255"
            },
            enviarBolsa : {
            	key: "It9255Set"
            },
		}
	},
}