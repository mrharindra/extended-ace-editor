/*@ Harindra Chaudhary
 * 
 * defaultFileName:string,
 * isMultiFile:true|false,
 * theme:string,
 * callbackOnChangeFile:function name,
 * confirmOnCloseFile:true|false,
 * wordWrap,
 * 
 * */
var loader = false;
window.AceEditor = (function(){
	this.defaultConfig = {theme:"twilight",isMultiFile:false};
	this.AceEditorConfig = new Array();
	this.baseUrl='';
	
	var AceEditor = {
			init:function(editor_id,configObj){
				findBaseUrl(editor_id);
				loadCSS();
				var Editor = new Array();
				Editor['config'] = configObj;
				Editor['file'] = new Array();
				Editor['count'] = 0;
				Editor['width'] = '400px';
				Editor['height'] = '400px';
				AceEditorConfig[editor_id] = Editor;
				initEditor(editor_id);
				//load(editor_id);
			},

			getValue:function(editor_id){
				return AceEditorConfig[editor_id]['currentFile']['editor'].getValue();
			},
			setValue:function(editor_id, text){
				AceEditorConfig[editor_id]['currentFile']['editor'].setValue(text,1);
			},
			getCurrentFile:function(editor_id){
				return AceEditorConfig[editor_id]['currentFile'];
			},
			getFile:function(fileId, editor_id){
				return AceEditorConfig[editor_id]['file'][fileId];
			},
			getCurrentFileEditor:function(editor_id){
				return AceEditorConfig[editor_id]['currentFile']['editor'];
			},
			getFileEditor:function(fileId, editor_id){
				return AceEditorConfig[editor_id]['file'][fileId]['editor'];
			},
			getCurrentFileName:function(editor_id){
				return AceEditorConfig[editor_id]['currentFile']['fileName'];
			},
			getFileName:function(fileId,editor_id){
				return AceEditorConfig[editor_id]['file'][fileId]['fileName'];
			},
			changeCurrentFileName:function(editor_id,newFileName){
				if(newFileName !=undefined && newFileName != null && newFileName.trim().length > 0){
					var fileNameId = AceEditorConfig[editor_id]['currentFile']['fileNameId'];
					AceEditorConfig[editor_id]['currentFile']['fileName'] = newFileName;
					try{
						document.getElementById(fileNameId).firstChild.innerHTML = newFileName;
					}catch(err){console.log("Error in changeCurrentFileName");console.log(err);}
					
				}
			},
			openFile:function(editor_id, fileObj){
				var fileName = 'Untitled';
				var text ='';
				if(fileObj != undefined){
					if( fileObj['fileName'] != undefined ){
						fileName = fileObj['fileName'];
					}
					if( fileObj['text'] != undefined ){
						text = fileObj['text'];
					}
				}
				if(fileName.trim().length == 0){ 
					var filename = AceEditorConfig[editor_id]['config'].defaultFileName;
					if(filename == undefined || filename == null || filename.trim() == ""){
						filename = 'Untitled';
					}
				}
				var fileLen = AceEditorConfig[editor_id]['count'];
				file = newFile(editor_id,(fileLen+1),fileName);
				AceEditorConfig[editor_id]['count'] = fileLen+1;
				if(text.length > 0){
					file['editor'].setValue(text,1);
				}
				AceEditorConfig[editor_id]['file'][file.fileId] = file;
				changeFile(file['fileId'],editor_id);
				
			},
			toggleEditor:function(editor_id,el){
				toggleEditor(editor_id,el);
			},
			changeSyntax:function(editor_id,syntax){
				if(syntax != undefined && syntax.trim() !=""){
					AceEditorConfig[editor_id]['currentFile']['editor'].getSession().setMode("ace/mode/"+syntax);
					try{
						document.getElementById("selectSyntax_"+editor_id).value = syntax;
					}catch(err){console.log("Error in changeSyntax");console.log(err);}
				}else{
					try{
						document.getElementById("selectSyntax_"+editor_id).value = "";
					}catch(err){console.log("Error in changeSyntax");console.log(err);}
				}
			},
			getAllFiles: function(editor_id){
				return AceEditorConfig[editor_id]['file'];
			},
			closeFile: function( fileId, editor_id ){
				closeFile(fileId, editor_id);
			},
			closeCurrentFile: function(editor_id ){
				var fileId = AceEditorConfig[editor_id]['currentFile']['fileId'];
				closeFile(fileId, editor_id);
			},
			closeEmptyFile: function( editor_id ){
				for(var fileId in AceEditorConfig[editor_id]['file']){
					if( AceEditorConfig[editor_id]['file'][fileId]['editor'].getValue().trim() == "" ){
						closeFile(fileId, editor_id);
					}
				}
			}
	};
	return AceEditor;
})();

function findBaseUrl(editor_id){
	var editorEL = document.getElementById(editor_id);
	var scripts = document.getElementsByTagName('script');
	var url = "";
	for(var i=0; i<scripts.length; i++ ){
		if (scripts[i].src && scripts[i].src.match("ace_editor/main_ace_editor") ) {
			var src = unescape( scripts[i].src ); // use unescape for utf-8 encoded urls
			src = src.substring(0, src.lastIndexOf('/')+1);
			url = src;
			break;
		}
	}
	if(url.trim().length == 0){
		editorEL.innerHTML = "\".../ace_editor/main_ace_editor...\" not found in script src ! base directory must be \"ace_editor\" and main js file must be \"main_ace_editor.js\""; 
		throw "\".../ace_editor/main_ace_editor...\" not found in script src ! base directory must be \"ace_editor\" and main js file must be \"main_ace_editor.js\"";
	}
	this.baseURL = url;
}

function loadCSS(){
	if(!loader){
		if(this.baseURL != undefined && this.baseURL.length > 0){
			var sheet = document.createElement('link');
			sheet.setAttribute("rel","stylesheet");
			sheet.setAttribute("type","text/css");
			sheet.setAttribute("href",this.baseURL+"css/ace_editor.css");
			document.head.appendChild(sheet);
			loader = true;
		}
	}
}

function load(editor_id){
	var element = document.getElementById(editor_id);
	if(element == 'null' || element == undefined){
		setTimeout("load('"+editor_id+"')", 50);
	}
	else{
		initEditor(editor_id);
	}
}

function initEditor(editor_id){
	var initialValue = '';
	var el = document.getElementById(editor_id);
	if( el.tagName.toLowerCase() == "textarea"){
		initialValue =  el.value;	
	}else{
		initialValue =  el.innerText;
	}
	
	createDiv(editor_id);
	createNewFile(editor_id);

	AceEditorConfig[editor_id]['currentFile']['editor'].setValue( initialValue.trim(), 1);
}

function createNewFile(editor_id){
	var fileLen = this.AceEditorConfig[editor_id]['count'];
	
	var filename = this.AceEditorConfig[editor_id]['config'].defaultFileName;
	if(filename == undefined || filename == null || filename.trim() == ""){
		filename = 'Untitled';
	}
	
	file = newFile( editor_id, (fileLen+1), filename );
	this.AceEditorConfig[editor_id]['file'][file.fileId] = file;
	this.AceEditorConfig[editor_id]['count'] = fileLen+1;
	changeFile(file['fileId'],editor_id);
}

function changeFile(editorFileId,editor_id){
	try{
		var file = this.AceEditorConfig[editor_id]['file'][editorFileId];
		var elements = document.getElementsByClassName(file['fileClass']);
		for(var i=0;i<elements.length;i++ ){
			elements[i].style.display = "none";
		}
		document.getElementById(editorFileId).style.display = "block";
		this.AceEditorConfig[editor_id]['currentFile'] = this.AceEditorConfig[editor_id]['file'][editorFileId];
		
		var isMultiFile = this.AceEditorConfig[editor_id]['config'].isMultiFile;
		if(isMultiFile){
			elements = document.getElementsByClassName(file['fileNameClass']);
			for(var i=0;i<elements.length;i++ ){
				elements[i].className = elements[i].className.replace(" activeFile","");
			}
			var currentE = document.getElementById(file['fileNameId']); 
			currentE.className = currentE.className+" activeFile";
		}
		
		var editor = this.AceEditorConfig[editor_id]['currentFile']['editor'];
		editor.resize();
		var row = editor.getCursorPosition().row;
		var col = editor.getCursorPosition().column;
		var totalCol = editor.session.getLength();
		document.getElementById("status_"+editor_id).innerHTML = "Ln: "+row+", Ch: "+col+", | Total Ln: "+totalCol;
		
		selectSyntax(editor_id);
		selectFontSize(editor_id);
		
	}catch(err){console.log("Error in change file...");console.log(err);}
	
	try{
		var fileChangeCallback =   this.AceEditorConfig[editor_id]['config'].callbackOnChangeFile;
		if(fileChangeCallback != undefined && fileChangeCallback.length > 0){
			window[fileChangeCallback]();
		}
	}catch(err){ console.log("Error in change file callback...");console.log(err); }
	
}

function closeFile(editorFileId,editor_id){
  var ans = true;
  if(this.AceEditorConfig[editor_id]['config'].confirmOnCloseFile){ ans = confirm("Do you want to close ?"); }
  if( ans == true ){
	try{
		var file = this.AceEditorConfig[editor_id]['file'][editorFileId];
		var fileNameNode = document.getElementById(file['fileNameId']);
		var editorNode = document.getElementById(editorFileId);
		
		if( fileNameNode.className.search('activeFile') > -1 ){
			var nextFile = fileNameNode.nextSibling;
			var prevFile = fileNameNode.previousSibling;
			if(nextFile != undefined && nextFile != null){
				nextFile.style.display = "block";
				nextFile.className = nextFile.className+" activeFile";
				var nextFileId = editorNode.nextSibling.id; 
				document.getElementById(nextFileId).style.display = "block";
				this.AceEditorConfig[editor_id]['currentFile'] = this.AceEditorConfig[editor_id]['file'][nextFileId];
			}
			else if(prevFile != undefined && prevFile != null){
				prevFile.style.display = "block";
				prevFile.className = prevFile.className+" activeFile";
				var prevFileId = editorNode.previousSibling.id;
				document.getElementById(prevFileId).style.display = "block";
				this.AceEditorConfig[editor_id]['currentFile'] = this.AceEditorConfig[editor_id]['file'][prevFileId];
			}
		}

		fileNameNode.parentNode.removeChild(fileNameNode);
		editorNode.parentNode.removeChild(editorNode);
		delete this.AceEditorConfig[editor_id]['file'][editorFileId];
		
	}catch(err){console.log("Error in closing file...");}
  }
	
}

function newFile(editor_id,fileNo,fileName){
	var file = new Array();
	file['fileId'] = editor_id+'FileId'+fileNo;
	file['fileClass'] = editor_id+"file";
	file['fileName'] = fileName;
	file['fileNameId'] = editor_id+'FileNameId'+fileNo;
	file['fileNameClass'] = editor_id+'FileNameClass';
	
	var isMultiFile = this.AceEditorConfig[editor_id]['config'].isMultiFile;
	if(isMultiFile){
		var fileNameDiv = document.createElement("div");
		fileNameDiv.setAttribute('id', file['fileNameId']);
		fileNameDiv.setAttribute('class', file['fileNameClass']+' fileName');
		
		var fileNameSpan = document.createElement("span");
		fileNameSpan.setAttribute('onclick', "changeFile('"+file['fileId']+"','"+editor_id+"')");
		fileNameSpan.innerHTML = fileName;
		fileNameDiv.appendChild(fileNameSpan);
		
		var fileCloseImg = document.createElement("img");
		fileCloseImg.setAttribute("src", this.baseURL+"/images/close.gif");
		fileCloseImg.setAttribute("onclick", "closeFile(\'"+file['fileId']+"\',\'"+editor_id+"\')");
		fileCloseImg.setAttribute("alt", "X");
		fileCloseImg.setAttribute("title", "Close");
		fileNameDiv.appendChild(fileCloseImg);
		
		document.getElementById('fileList_'+editor_id).appendChild(fileNameDiv);
	}
	
	var editorDiv = document.createElement("div");
	editorDiv.setAttribute('id', file['fileId']);
	editorDiv.setAttribute('class', file['fileClass']);
	document.getElementById('fileContainer_'+editor_id).appendChild(editorDiv);
	
	var theme = this.AceEditorConfig[editor_id]['config'].theme;
	if(theme == undefined || theme == null || theme.trim().length == 0){
		theme = this.defaultConfig.theme;
	}
	
	var editor = ace.edit(file['fileId']);
	editor.setTheme("ace/theme/"+theme);
	editor.setShowPrintMargin(false);
	if(this.AceEditorConfig[editor_id]['config'].wordWrap){
		editor.getSession().setUseWrapMode(true);	
	}else{
		editor.getSession().setUseWrapMode(false);
	}
	
	editor.setDisplayIndentGuides(false);
	editor.setAnimatedScroll(true);
	editor.resize();
	//editor.renderer.setHScrollBarAlwaysVisible(false);
	editor.getSession().selection.on('changeCursor', function(e) {
		var row = editor.getCursorPosition().row; //var a = editor.selection.getCursor().row;
		var col = editor.getCursorPosition().column; //var b = editor.selection.getCursor().column;
		var totalCol = editor.session.getLength();
		document.getElementById("status_"+editor_id).innerHTML = "Ln: "+row+", Ch: "+col+", | Total Ln: "+totalCol;
	});
	
	file['editor'] = editor;
	return file;
	
}

function createDiv(editor_id){
	var editorDiv = null;
	var editorEL = document.getElementById(editor_id);
	if(editorEL.style.width=='' && editorEL.style.height == ''){
		editorEL.innerHTML = "Error: set width and height of element having id=\""+editor_id+"\"  using inline css i.e. style=\"width: ..px;height: ..px;\"";
		throw "Error: set width and height of element having id=\""+editor_id+"\"  using inline css i.e. style=\"width: ..px;height: ..px;\"";
	}
	
	if(editorEL.tagName.toLowerCase() == "div"){
		var textarea = document.createElement("textarea");
		textarea.setAttribute("id", "textarea_"+editor_id);
		textarea.setAttribute("name", "textarea_"+editor_id);
		textarea.setAttribute("class", "textarea_"+editor_id);
		textarea.style.display="none";
		textarea.style.width = editorEL.style.width;
		textarea.style.height = editorEL.style.height;
		textarea.onblur = updateFileValue;
		editorEL.innerHTML = "";
		editorEL.parentNode.insertBefore(textarea, editorEL);
		editorEL.className = editorEL.className+" editorClass";
		editorDiv = editorEL;
		
	}
	else if(editorEL.tagName.toLowerCase() == "textarea"){
		var newEditorDiv = document.createElement("div");
		newEditorDiv.setAttribute("id", "div_"+editor_id);
		newEditorDiv.setAttribute("class", "editorClass");
		newEditorDiv.style.width = editorEL.style.width;
		newEditorDiv.style.height = editorEL.style.height;
		editorEL.style.display = "none";
		editorEL.parentNode.insertBefore(newEditorDiv, editorEL.nextSibling);
		editorEL.onblur = updateFileValue;
		
		editorDiv = newEditorDiv;
	}
	
	var helpDiv = document.createElement("div");
	helpDiv.setAttribute('id', 'help_'+editor_id);
	helpDiv.setAttribute('class', 'editor_help');
	var closeImg = '<img src=\"'+this.baseURL+'/images/close.gif\" onclick=\"helpToggle(\'help_'+editor_id+'\')\" alt=\"X\" title=\"Close\"/>';
	
	helpDiv.innerHTML = '<p class=\"closeImg\">'+closeImg+'</p><b>Shortcuts:</b><br/><br/>'+
						'Tab:- add tabulation to text<br/>'+
						'Shift+Tab:- remove tabulation to text<br/>'+
						'Ctrl+f:- search/open search area<br/>'+
						'Ctrl+h:- replace / open search area<br/>'+
						'Ctrl+l:- go to line<br/>'+
						'Ctrl+z:- undo<br/>'+
						'Ctrl+y:- redo<br/>';
						
	editorDiv.appendChild(helpDiv);
	
	var toolbar = document.createElement("div");
	toolbar.setAttribute('id', 'toolbar_'+editor_id);
	toolbar.setAttribute('class', 'editor_toolbar');
	toolbar.innerHTML = toolbarFn(editor_id);
	editorDiv.appendChild(toolbar);
	
	
	var isMultiFile = this.AceEditorConfig[editor_id]['config'].isMultiFile;
	if(isMultiFile){
		var fileList = document.createElement("div");
		fileList.setAttribute('id', 'fileList_'+editor_id);
		fileList.setAttribute('class', 'editor_filelist');
		editorDiv.appendChild(fileList);
	}
	
	var fileContainer = document.createElement("div");
	fileContainer.setAttribute('id', 'fileContainer_'+editor_id);
	fileContainer.setAttribute('class', 'editor_fileContainer');
	
	
	var isMultiFile = this.AceEditorConfig[editor_id]['config'].isMultiFile;
	if(isMultiFile == true){
		if(editorDiv.style.height.search("px") > -1){
			fileContainer.style.height = (parseInt(editorDiv.style.height) - 70) +"px";
		}
		else{
			fileContainer.style.height = (parseInt(editorDiv.offsetHeight) - 70) +"px";
		}
	}
	else{
		if(editorDiv.style.height.search("px") > -1){
			fileContainer.style.height = (parseInt(editorDiv.style.height) - 50) +"px";
		}
		else{
			fileContainer.style.height = (parseInt(editorDiv.offsetHeight) - 50) +"px";
		}
	}
	AceEditorConfig[editor_id]['cheight'] = fileContainer.style.height;
	AceEditorConfig[editor_id]['cwidth'] = fileContainer.style.width;
	editorDiv.appendChild(fileContainer);
	
	var statusDiv = document.createElement("div");
	statusDiv.setAttribute('class', 'editor_status');
	var status = '<span id=\"status_'+editor_id+'\" class=\"editorStatus\"></span>';	
	statusDiv.innerHTML = status; 
	editorDiv.appendChild(statusDiv);
	
	
	var toggleDiv = document.createElement("div");
	toggleDiv.setAttribute('id', 'toggle_'+editor_id);
	toggleDiv.setAttribute('class', 'editor_toggle');
	var toggle = '<span><input type=\"checkbox\" onclick=\"AceEditor.toggleEditor(\''+editor_id+'\',this);\" checked="true">Toggle editor</span>';
	toggleDiv.innerHTML = toggle;
	editorDiv.parentNode.insertBefore(toggleDiv, editorDiv.nextSibling);
	
	AceEditorConfig[editor_id]['width'] = editorDiv.style.width;
	AceEditorConfig[editor_id]['height'] = editorDiv.style.height;
	
}

function updateFileValue(event){
	//var editor_id = event.srcElement.id.replace("textarea_","");
	//var value = event.srcElement.value
	var editor_id = this.id.replace("textarea_","");
	var value = this.value;
	AceEditorConfig[editor_id]['currentFile']['editor'].setValue( value,1);
}



function toolbarFn(editor_id){
	var toolStr = this.AceEditorConfig[editor_id]['config'].toolbar;
	var toolbar = '';
	var separator = '<div class="separator">&nbsp;</div>';
	
	if(toolStr != undefined && toolStr.length > 0){
		var tools = toolStr.split(",");
		for(var i = 0; i<tools.length; i++){
			
			var tool = '';
			switch(tools[i].toString().trim().toLowerCase() ){
				case 'new_file':{
					tool = newFileTool(editor_id);break;
				}
				case 'full_screen':{
					tool = fullScreenTool(editor_id);break;
				}
				case 'select_syntax':{
					tool = selectSyntaxTool(editor_id);break;
				}
				case 'select_font':{
					tool = selectFontTool(editor_id);break;
				}
				case 'select_theme':{
					tool = selectThemeTool(editor_id);break;
				}
				case 'word_wrap':{
					tool = wordWrapTool(editor_id);break;
				}
				case 'help':{
					tool = helpTool(editor_id);break;
				}
			}
			if(toolbar.trim().length > 0 ){
				toolbar += separator;
			}
			toolbar += tool;
			
		}
	}
	else{
		toolbar += newFileTool(editor_id);
		if(toolbar.trim().length > 0){
			toolbar += separator;
		}
		toolbar += fullScreenTool(editor_id) + separator + selectSyntaxTool(editor_id) + separator + selectFontTool(editor_id);
		toolbar += separator + selectThemeTool(editor_id) + separator + wordWrapTool(editor_id) + separator + helpTool(editor_id);
	}
	
	return toolbar;
}

function newFileTool(editor_id){
	var isMultiFile = this.AceEditorConfig[editor_id]['config'].isMultiFile;
	var newFile = '';
	if(isMultiFile == true){
		newFile = '<div onclick=\"createNewFile(\''+editor_id+'\')\"><img src=\"'+this.baseURL+'/images/newFile.png\" alt=\"NewFile\" title=\"Open new file\" /></div>';
	}
	return newFile;
}

function fullScreenTool(editor_id){
	return '<div onclick=\"fullScreen(\''+editor_id+'\')\"><img src=\"'+this.baseURL+'/images/fullscreen.gif\" alt=\"Full scree\" title=\"Full screen\" /></div>';
}

function selectSyntaxTool(editor_id){
	var syntax = '<div><select onchange=\"changeSyntax(\''+editor_id+'\',this)\" id=\"selectSyntax_'+editor_id+'\">'+
	'<option value="">--Syntax--</option>'+
	'<option value=\"java\">Java</option>'+
	'<option value=\"c_cpp\">C</option>'+
	'<option value=\"c_cpp\">C++/CPP</option>'+
	'<option value=\"php\">PHP</option>'+
	'<option value=\"perl\">Perl</option>'+
	'<option value=\"python\">Python</option>'+
	'</select>'+
	'</div>';
	return syntax;
}

function selectFontTool(editor_id){
	var fontSize = '<div><select onchange=\"changeFont(\''+editor_id+'\',this)\" id=\"selectFont_'+editor_id+'\">'+
	'<option value=\"\">--Font size--</option>'+
	'<option value=\"10px\">10px</option>'+
	'<option value=\"11px\">11px</option>'+
	'<option value=\"12px\">12px</option>'+
	'<option value=\"13px\">13px</option>'+
	'<option value=\"14px\">14px</option>'+
	'<option value=\"15px\">15px</option>'+
	'<option value=\"16px\">16px</option>'+
	'<option value=\"18px\">18px</option>'+
	'<option value=\"20px\">20px</option>'+
	'</select>'+
	'</div>';
	return fontSize;
}

function selectThemeTool(editor_id){
	var theme = '<div><select onchange=\"changeTheme(\''+editor_id+'\',this)\">'+
	'<option value=\"\">--Theme--</option>'+
	'<option value="twilight">Twilight</option>'+
	'<option value=\"eclipse\">Eclipse</option>'+
	'<option value=\"ambiance\">Ambiance</option>'+
	'<option value=\"textmate\">Textmate</option>'+
	'<option value=\"solarized_light\">Solarized</option>'+
	'<option value=\"xcode\">XCode</option>'+
	'<option value=\"cobalt\">Cobalt</option>'+
	'<option value=\"vibrant_ink\">Vibrant</option>'+
	'<option value=\"monokai">Monokai</option>'+
	'<option value=\"kr_theme">krTheme</option>'+
	'</select>'+
	'</div>';
	return theme;
}

function wordWrapTool(editor_id){
	return '<div onclick=\"word_wrap(\''+editor_id+'\')\"><img src=\"'+this.baseURL+'/images/word_wrap.gif\" alt=\"Word wrap\" title=\"Word wrap on/off\" /></div>';
}

function helpTool(editor_id){
	return '<div onclick=\"helpToggle(\'help_'+editor_id+'\')\"><img src=\"'+this.baseURL+'/images/help.gif\" alt=\"Help\" title=\"Shortcuts\" /></div>';
}



function fullScreen(editor_id){
	var editor = document.getElementById(editor_id);
	if(editor.tagName.toLowerCase() == 'textarea'){
		editor = document.getElementById("div_"+editor_id);
	}
	var position = editor.style.position;
	if(position == undefined || position == '' || position.trim() == '' || position == 'static' || position == 'relative'){
		editor.style.position = "absolute";
		editor.style.width = screen.availWidth - 20+"px";
		editor.style.height = screen.availHeight+"px";
		document.getElementById('fileContainer_'+editor_id).style.height = (screen.availHeight - 130)+"px"; 
		//editor.style.top = "0";
		editor.style.top = window.pageYOffset+"px";
		editor.style.left = "0";
		editor.style.right = "0";
		editor.style.bottom = "0";
		editor.style.zIndex = "1000";
		this.AceEditorConfig[editor_id]['currentFile']['editor'].resize();
	}
	else {
		editor.style.position = "relative";
		editor.style.width = AceEditorConfig[editor_id]['width'];
		editor.style.height = AceEditorConfig[editor_id]['height'];
		editor.style.zIndex = "";
		editor.style.top = "";
		editor.style.left = "";
		editor.style.right = "";
		editor.style.bottom = "";
		document.getElementById('fileContainer_'+editor_id).style.height = AceEditorConfig[editor_id]['cheight'];
		document.getElementById('fileContainer_'+editor_id).style.width= AceEditorConfig[editor_id]['cwidth'];
		this.AceEditorConfig[editor_id]['currentFile']['editor'].resize();
	}
}

function changeFont(editor_id,obj){
	if(obj.value.trim() !=""){
		var fileId = this.AceEditorConfig[editor_id]['currentFile']['fileId'];
		document.getElementById(fileId).style.fontSize = obj.value;
	}
}

function changeSyntax(editor_id,obj){
	if(obj.value.trim() !=""){
		this.AceEditorConfig[editor_id]['currentFile']['editor'].getSession().setMode("ace/mode/"+obj.value);
	}
}

function word_wrap(editor_id){
	var word_wrap = this.AceEditorConfig[editor_id]['currentFile']['editor'].getSession().getUseWrapMode();
	if(word_wrap){
		this.AceEditorConfig[editor_id]['currentFile']['editor'].getSession().setUseWrapMode(false);
	}else{
		this.AceEditorConfig[editor_id]['currentFile']['editor'].getSession().setUseWrapMode(true);
	}
}


function changeTheme(editor_id,obj){
	if(obj.value.trim() != ""){
		for(var fileId in this.AceEditorConfig[editor_id]['file']){
			this.AceEditorConfig[editor_id]['file'][fileId]['editor'].setTheme("ace/theme/"+obj.value);
		}
		this.AceEditorConfig[editor_id]['config']['theme'] = obj.value;
	}
}

function helpToggle(help_editor){
	var helpDiv = document.getElementById(help_editor);
	if(helpDiv != undefined && (helpDiv.style.display == 'block' || helpDiv.style.display == '')){
		helpDiv.style.display = "none";
	}
	else if( helpDiv != undefined && helpDiv.style.display == 'none' ){
		helpDiv.style.display = "block";
	}
}


function toggleEditor(editor_id,el){
	var editorEL = document.getElementById(editor_id);
	if(editorEL.tagName.toLowerCase() == "div"){
		if(el.checked){
			AceEditorConfig[editor_id]['currentFile']['editor'].setValue( document.getElementById("textarea_"+editor_id).value,1);
			document.getElementById("textarea_"+editor_id).style.display = "none";
			editorEL.style.display = "block";
		}
		else{
			document.getElementById("textarea_"+editor_id).value = AceEditorConfig[editor_id]['currentFile']['editor'].getValue(); 
			document.getElementById("textarea_"+editor_id).style.display = "block";
			editorEL.style.display = "none";			
		}
		
	}
	else if(editorEL.tagName.toLowerCase() == "textarea"){
		if(el.checked){
			AceEditorConfig[editor_id]['currentFile']['editor'].setValue( editorEL.value,1);
			document.getElementById("div_"+editor_id).style.display = "block";
			editorEL.style.display = "none";
		}
		else{
			editorEL.value = AceEditorConfig[editor_id]['currentFile']['editor'].getValue();
			document.getElementById("div_"+editor_id).style.display = "none";
			editorEL.style.display = "block";			
		}
	}
}

function selectSyntax(editor_id){
	var sEl = document.getElementById("selectSyntax_"+editor_id);
	if(sEl != undefined){
		var syntaxMode = this.AceEditorConfig[editor_id]['currentFile']['editor'].getSession().getMode().$id;
		if(syntaxMode != undefined && syntaxMode != null){
			syntaxMode = syntaxMode.substring( syntaxMode.lastIndexOf('/')+1 );
			sEl.value = syntaxMode;
		}
		else{
			sEl.value = "";
		}
	}
}

function selectFontSize(editor_id){
	var sEl = document.getElementById("selectFont_"+editor_id);
	if(sEl != undefined){
		var fileId = this.AceEditorConfig[editor_id]['currentFile']['fileId'];
		var fontSize = document.getElementById(fileId).style.fontSize;
		if(fontSize != ''){
			sEl.value = fontSize;
		}else{
			sEl.value = "";
		}
	}
}
