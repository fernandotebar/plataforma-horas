sap.ui.jsfragment("fragment.AppHeader", {
	createContent: function(oCon) {
		 
	     this.logoutButton = new sap.m.Button({
	    	 icon: "sap-icon://log",
	    	 tooltip: "{I18N>menu.logout}",
	    	 press: function(){
	    		 
	    	 }
	     }).addStyleClass("logoutButton")
	     
	     var html = "<div align='right' class= 'superHeader '>" +
	 	"<button align='right' onclick='window.open('./docs/Manual de Usuario Horas.pdf','window','width=1024,height=800,resizable,scrollbars,toolbar,menubar') ;return false;' class='popup-button buttonAyudaHeader'></button>"+
		"<button align='right' onclick='window.close()' class='popup-button buttonLogoutHeader'></button>"+
		"</div>"+
		"<div class='LOGO superHeader'>"+
		"<a href='#' class='LOGO' onclick='window.close();'><img src='img/logoImagina.jpg' class='LOGO'></a>"+
		"</div>"+
		"<div id='LINKS' align='right' class= 'superHeader'>"+
		"<a href='http://www.globomedia.es' align='right' class='LINKS' onclick='window.open(this.href,'window','width=1024,height=800,resizable,scrollbars,toolbar,menubar') ;return false;'>GLOBOMEDIA.ES</a>"+
		"<a class='LINKS' >|</a>"+
		"<a href='http://www.mediapro.es' align='right' class='LINKS' onclick='window.open(this.href,'window','width=1024,height=800,resizable,scrollbars,toolbar,menubar') ;return false;'>MEDIAPRO.ES</a>"+
		"</div>"+
		"<div style='clear:both;border-bottom: 1px dotted #dedede !important;'></div>";
	     
	     var headerPrueba = new sap.ui.core.HTML({
	    	 content: html
	     });
		 
		 this.headerBar = new sap.m.Bar({
                contentLeft: [
                              new sap.m.Button({
                            	  icon: "sap-icon://menu2",
                            	  tap: function(oEvt){
                            		  var app = sap.ui.getCore().byId(Common.App.Name);                            		  
                            		  app.toMaster(Common.Navigations.MENU_CONTROL);
                            	  }
                              }).addStyleClass("sapUiVisibleOnlyOnPhone"),
                              new sap.m.Text()
                              ]
            }).addStyleClass("appHeader");
	       return this.headerBar;
	}
});