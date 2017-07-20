jQuery.sap.declare("util.Formatter");
sap.ui.core.Control.extend("control.MenuControl", {

    metadata : {                              

      properties : {
          "selected" : "string",
      }
    },
  
    renderer : function(oRm, oControl) {
    	
    	var categoria = new sap.m.Text({
    		text: {
    			path: "TXT_CATEGORIA",
    			formatter: function(cat){
    				return cat;
    			}
    		}
    	}).bindObject("/categoriaEmpleado").addStyleClass("menuTextCategoria");
    	
    	var informes = new sap.m.Text({
    		text: getI18nText("view.informes.menu")
    	}).addStyleClass("subMenuManagerItemText")
    	
    	
    	
    	var menuHtml = 
    		"<div class='menuItemContainer'>" + 
    		"<div id='menuCategoria' class='menuItem'>";
//    		oRm.renderControl(categoria);
    	var menuHtml2 ="</div>" + 
//			"<div class='menuImage'/>"+
    		"<span class='menuSection'> MENU</span>" +
    		"<div class='menuImage'/>"+
			"<div id='menuItemInicio' class='menuItem sapUiHideOnPhone'>" +
				"<span  class='menuIcon menuInicio sapUiIcon sapUiIconMirrorInRTL'/>"+
				"<span class='menuText sapUiHideOnPhone'>"+getI18nText('view.inicio.menu')+"</span>" +
			"</div>" +
			"<div id='menuItemImputar' class='menuItem'>" +
				"<span  class='menuIcon menuImputar sapUiIcon sapUiIconMirrorInRTL'/>"+
				"<span class='menuText'>"+getI18nText('view.imputarHoras.menu')+"</span>" +
			"</div>" + 
			"<div id='menuItemManager' class='menuItem'>" +
				"<span  class='menuIcon menuManager sapUiIcon sapUiIconMirrorInRTL'/>"+
				"<span class='menuText'>"+getI18nText('view.manager.menu')+"</span>" +
			"</div>" + 
			"<div id='menuItemReportes' class='menuItem'>" +
			"<span  class='menuIcon menuReportes sapUiIcon sapUiIconMirrorInRTL'/>"+
			"<span class='menuText'>"+getI18nText("view.informes.menu")+"</span>" +
			"</div>"  + 
			"<div id='menuItemDelegar' class='menuItem'>" +
			"<span  class='menuIcon menuDelegar sapUiIcon sapUiIconMirrorInRTL'/>"+
			"<span class='menuText'>"+getI18nText("view.delegar.menu")+"</span>" +
			"</div>"+
			"<div id='menuItemConfiguracion' class='menuItem'>" +
			"<span  class='menuIcon menuConfiguracion sapUiIcon sapUiIconMirrorInRTL'/>"+
			"<span class='menuText'>"+getI18nText('view.configuracion.menu')+"</span>" +
			"</div>" + 
			"</li>" +
			"</ul>";
			/*
			"<ul id='subMenuManager' class='subMenuManager'>" +
				"<li class='subMenuManagerItem'>";*/
			
			var menuHtml4 = "</div>";
		//Create wrapper div for the menu
		oRm.write("<div id='mainMenu' class='menu'"); 
		oRm.writeControlData(oControl);  // writes the Control ID and enables event handling - important!
		// oRm.addClass("menu");        // add a CSS class for styles common to all Control instances
		oRm.writeClasses();              // this call writes the above class plus enables support 
		oRm.write(">");
		
		oRm.write(menuHtml);
		oRm.renderControl(categoria);
		oRm.write(menuHtml2);
		
		oRm.write(menuHtml4); 
		oRm.write("</div>");
    },
    
    
    onAfterRendering:function(){
        //Get all li to register click event 
        var app = sap.ui.getCore().byId(Common.App.Name);

        jQuery(".menuItem").on("click", function(evt) {
        	
        	var continuar = checkRealUser();
        	
        	
        	if(this.id == "menuItemInicio" && continuar){        		
        		app.toDetail(Common.Navigations.INICIO);
        	}
        	
        	if(this.id == "menuItemImputar" && continuar){
        		app.toDetail(Common.Navigations.HOME);
        	}
        	
        	if(this.id == "menuItemManager" && continuar){
        		app.toDetail(Common.Navigations.MANAGER);
        	}
        	
        	if(this.id == "menuItemConfiguracion" && continuar){
        		app.toDetail(Common.Navigations.CONFIG);
        	}
        	
        	if(this.id == "menuItemReportes" && continuar){
//        		var continuar = checkRealUser();
        		app.toDetail(Common.Navigations.INFORMES);
//        		app.hideMaster();
        	}
        	
        	if(this.id == "menuItemDelegar" && continuar){
        		openDialogDelegar();
        	}
        	
        	
        	app.hideMaster();
        });
        
        
        
        jQuery(".menuItem:not(#menuCategoria), .menuIcon, .subMenuManager ").hover(function() {
            $(this).css('cursor','pointer');
        });
        
	}
	
	
	
    
 });
