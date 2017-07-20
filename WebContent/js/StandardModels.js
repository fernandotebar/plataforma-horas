function initStandardModels() {
	
	var mainMenu = [
			{
				Key  : MapViewsApp[Common.Navigations.HOME].idView,
				Icon : "sap-icon://create-entry-time",
				Text : "view.imputarHoras.menu"
			},
			{
				Key  : MapViewsApp[Common.Navigations.MANAGER].idView,
				Icon : "sap-icon://manager",
				Text : "view.manager.menu"
			}
	]
	
	setAttributeValue("/"+Common.Navigations.Home, mainMenu);
	
}