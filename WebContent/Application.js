	jQuery.sap.declare("Application");
	jQuery.sap.require("sap.ui.app.Application");
	jQuery.sap.require("sap.m.App");
	
	//sap.m.App.extend("Application", {
	sap.ui.app.Application.extend("Application", {
		
		init : function() {
	        
			// Modelo general
			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			sap.ui.getCore().setModel(oModel);
			initStandardModels();
			var locale = lang;
			
			
			var finalLocale;
			
			if(locale == "es" || locale == "ca" || locale == "en"){
				finalLocale = locale;
			}else finalLocale = "es";
			setAttributeValue("/language",finalLocale);
			sap.ui.getCore().getConfiguration().setLanguage(finalLocale);
			var resourceModel = new sap.ui.model.resource.ResourceModel({bundleUrl:"model/resources.properties",bundleLocale: finalLocale});

//			sap.ui.getCore().getConfiguration().setLanguage("en");
			
			sap.ui.getCore().setModel(resourceModel, Common.GlobalModelNames.I18N);
			
	        jQuery(".buttonAyudaHeader").html(getI18nText("common.ayuda"));
	        jQuery(".buttonLogoutHeader").html(getI18nText("common.cerrar"));
			
		},
		
		main : function() {
			
			
			sap.ui.getCore().getModel().setProperty("/sociedad", undefined);
			
			// create app view and put to html root element
			var root = this.getRoot();
			this.app = new sap.m.SplitApp(Common.App.Name,{
				mode: sap.m.SplitAppMode.HideMode,
				masterPages: sap.ui.jsview(Common.Navigations.MENU_CONTROL, "view.MenuControl"),
				detailPages: [
				              sap.ui.jsview(Common.Navigations.INICIO, "view.Inicio"),
				              sap.ui.jsview(Common.Navigations.HOME, "view.Home"),
				              sap.ui.jsview(Common.Navigations.MANAGER, "view.Manager"),
				              sap.ui.jsview(Common.Navigations.EMPLEADO, "view.EmpleadoManager"),
				              sap.ui.jsview(Common.Navigations.INFORMES, "view.Informes"),
				              sap.ui.jsview(Common.Navigations.PLUSES, "view.ListadoPluses"),
				              sap.ui.jsview(Common.Navigations.CONFIG, "view.Configuracion"),
				              sap.ui.jsview(Common.Navigations.LIST_BOLSAS, "view.ListadoBolsasAntiguas"),
				              ]
			});
			

			this.app.placeAt(root);
		}
	});
