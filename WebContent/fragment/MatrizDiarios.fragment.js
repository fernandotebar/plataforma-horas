sap.ui.jsfragment("fragment.MatrizDiarios", {
	
	
	createContent: function(oCon) {
		
		var oView = sap.ui.getCore().byId(Common.Navigations.HOME);
		
		var oTemplate = new sap.m.HBox({
			items: [new sap.m.CheckBox(), new sap.m.Text({text: "{Lgdtx}"}).addStyleClass("textMatrixDia")]
		}).addStyleClass("itemMatrixDia");
		
		
		var matrizConceptosDia = new sap.m.FlexBox({
			visible: {
				path : "/configuracion/REPORTE/REP_REPOR001/DIA_MATR",
				formatter: util.Formatter.reactOnConfig
			},
//			wrap: sap.m.FlexWrap.Wrap
		}).bindAggregation("items", "/conceptosDia/results", oTemplate).addStyleClass("containerMatrixDia"); 
				
		
		oView.containerDia = new sap.m.Page({
			content: matrizConceptosDia
		}).addStyleClass("navContainerMatrixDia");
		
		return oView.containerDia;
	}
	
});