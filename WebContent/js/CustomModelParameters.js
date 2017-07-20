function CustomModelParameters (pService,pEntity,pFilterEntity,pFiltersEntitySet,pResultData_path,pSuccess,pError,pUrlParameters,pSkip,pTop,pExpand,pOrderBy,pWithBlanks,pExportType,pFilterSelect,pUseFilterSelect,pGrowingModel, pNewSearch){

	this.service = pService;
	this.entity = pEntity;
	this.filterEntity = pFilterEntity;
	this.filtersEntitySet = pFiltersEntitySet;
	this.resultData_path = pResultData_path;
	this.success = pSuccess;
	this.error = pError;
	this.urlParameters = pUrlParameters;
	this.skip = pSkip;
	this.top = pTop;
	this.expand = pExpand;
	this.orderBy = pOrderBy;
	this.withBlanks = pWithBlanks;
	this.exportType = pExportType;
	
	if(pFilterSelect!=undefined) 
		this.growingModel = pGrowingModel;
	else 
		this.growingModel = false;
	
	if(pFilterSelect!=undefined) 
		this.filterSelect = pFilterSelect;
	
	if(pUseFilterSelect!=undefined) 
		this.useFilterSelect = pUseFilterSelect;
	else this.useFilterSelect = true; 
	
	this.ignoreSkipTop = false;

	this.newSearch = false;
	if(pNewSearch)
		this.newSearch = pNewSearch;
	
	this.getOrderBy= function(){
		if (this.orderBy==undefined)this.orderBy="";
		return this.orderBy;
	}
	this.setOrderBy= function(val){
		this.orderBy=val;
	}
	this.getService= function(){
		return this.service;
	}
	this.setService= function(val){
		this.service=val;
	}
	this.getEntity= function(){
		return this.entity;
	}
	this.setEntity= function(val){
		this.entity=val;
	}
	this.getFilterEntity= function(){
		return this.filterEntity;
	}
	this.setFilterEntity= function(val){
		this.filterEntity=val;
	}
	this.getFiltersEntitySet= function(){
		return this.filtersEntitySet;
	}
	this.setFiltersEntitySet= function(val){
		this.filtersEntitySet=val;
	}
	this.getResultData_path= function(){
		return this.resultData_path;
	}
	this.setResultData_path= function(val){
		this.resultData_path=val;
	}
	this.getSuccess= function(){
		return this.success;
	}
	this.setSuccess= function(val){
		this.success=val;
	}
	this.getError= function(){
		return this.error;
	}
	this.setError= function(val){
		this.error=val;
	}
	this.getUrlParameters= function(){
		return this.urlParameters;
	}
	this.setUrlParameters= function(val){
		this.urlParameters=val;
	}
	this.getSkip= function(){
		if (this.skip==undefined)this.skip=0;
		return this.skip;
	}
	this.setSkip= function(val){
		this.skip=val;
	}
	this.getTop= function(){
		if (this.top==undefined)this.top=0;
		return this.top;
	}
	this.setTop= function(val){
		this.top=val;
	}
	this.getExpand= function(){
		return this.expand;
	}
	this.setExpand= function(val){
		this.expand=val;
	}
	this.getWithBlanks= function(){
		return this.withblanks;
	}
	this.setWithBlanks= function(val){
		this.withblanks=val;
	}
	this.getExportType = function(){
		return this.exportType;
	}
	this.setExportType = function(val){
		this.exportType =val;
	}
	this.getIgnoreSkipTop = function(){
		return this.ignoreSkipTop;
	}
	this.setIgnoreSkipTop = function(val){
		this.ignoreSkipTop = val;
	}
	this.getNewSearch = function(){
		return this.newSearch;
	}
	this.setNewSearch = function(val){
		this.newSearch = val;
	}
	this.getUseFilterSelect = function(){
		return this.useFilterSelect;
	}
	this.setUseFilterSelect = function(val){
		this.useFilterSelect =val;
	}
	this.getFilterSelect = function(){
		return this.filterSelect;
	}
	this.setFilterSelect = function(val){
		this.filterSelect = val;
	}
	this.getGrowingModel = function(){
		return this.growingModel;
	}
	this.setGrowingModel = function(val){
		this.growingModel = val;
	}
} 
