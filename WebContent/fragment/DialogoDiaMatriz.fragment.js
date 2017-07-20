sap.ui.jsfragment("fragment.DialogoDiaMatriz", {
	
	createContent: function(oCon) {
		
		var oView = oCon.getView();
		
		var oTemplatePEP = new sap.ui.core.Item({
	    	   key: "{Pspnr}",
				text: "{Post1}",
		});
		
		var elementoPEPSelect = new sap.m.Select({
			enabled: {
				parts: ["/informacionDia/detalleparte/results/0/Stahd", "/gerenteEdita" , "/responsableEdita"],
				formatter: util.Formatter.modificarOnStahd
			},
			visible: {
				parts: ["/responsableEdita", "/gerenteEdita"],
				formatter: function(responsableEdita, gerenteEdita){
					if(responsableEdita == true || gerenteEdita == true){
						return true;
					}else return false;
				}
			},
			selectedKey: "{Pspnr}",
			width: "250px",
		}).bindItems("/elementosPEP/results",oTemplatePEP);
		
		
		
		var oTemplate = new sap.m.HBox({
			items: [
			        new sap.m.CheckBox({
			        	select: oCon.onSelectCheckboxMatriz,
			        	selected: {
			        		parts: ["/informacionDia/detalledia/results","Lgady"],
			        		formatter: function(conceptos, concept) {
			        			
			        			for (var i =0;i<conceptos.length ;i++) {
			        				if(conceptos[i].Lgady == concept) {
			        					return true;
			        				}
			        			}
			        			return false;			        			
			        		}
			        	}
			        }),
			        new sap.m.Text({text: "{Lgdtx}"}).addStyleClass("textMatrixDia"),
			        new sap.m.Button({
			        	press: oCon.openKmEditionDialog,
			        	icon: "sap-icon://measure",
			        	visible : {
			        		parts: ["Lgady","/informacionDia/detalledia/results"],
			        		formatter: function(concepto, conceptos) {
			        			for (var i =0;i<conceptos.length ;i++) {
			        				if(conceptos[i].Lgady == concepto && concepto == "KLMT") {
			        					return true;
			        				}
			        			}
			        			return false;
			        		}
			        	}
			        }).addStyleClass("buttonEditMatrixDia")
			        ]
		}).addStyleClass("itemMatrixDia");
		
		oView.matrizConceptosDia = new sap.m.FlexBox({
			visible: {
				path : "/configuracion/REPORTE/REP_REPOR001/DIA_MATR",
				formatter: util.Formatter.reactOnConfig
			},
			wrap: sap.m.FlexWrap.Wrap
		}).bindAggregation("items", "/conceptosDia/results", oTemplate).addStyleClass("containerMatrixDia"); 
		
		
		var conceptoDiaDialog = new sap.m.Dialog({
			showHeader: true,
			customHeader: new sap.m.Bar({
				contentMiddle: new sap.m.Text({text: "{I18N>conceptosDia.titulo}"})
			}),
			content: oView.matrizConceptosDia,
			afterOpen: function(){
				var binding = this.getBindingContext().getObject();				
				var app = sap.ui.getCore().byId("app");
				var vista = app.getCurrentDetailPage();
			},
			beforeClose: function(oEvt){
				if(window.pageYOffset > 0) {
				   this.addStyleClass("moveCustomDialog")
				}
				removeStripsDialogDia();
			},
			buttons:[
				new sap.m.Button({
					text: "{I18N>common.terminar}",
					press: function(){
							oCon.closeAddItemDialog();
					}
				})
					         
					         
			         ]     
		}).addStyleClass("customDialog")
		
		return conceptoDiaDialog;
		
	}

});
		