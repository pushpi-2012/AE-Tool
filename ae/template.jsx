var currentPath = values.split("|")[1];
var unitPath = currentPath +"/"+ values.split("|")[0];
var json2 = currentPath+"/ae/json2.jsx";
$.evalFile(json2);

initilize();

var myComp;
var layerIndex = 0;
var jsonData;

//*****************ALL EFFECTS CODE STARTS FROM HERE*********************************//
/* function fadeIn(layer, obj, mainObj){
	layer.opacity.addKey(obj.start+obj.delay);
	layer.opacity.addKey(obj.start+obj.delay+obj.duration);
	//layer.opacity.setValueAtKey(1, 1);
	layer.opacity.setValueAtKey(2, obj.opacity);
}

function fadeOut(layer, obj, mainObj){
	layer.opacity.addKey(obj.start+obj.delay);
	layer.opacity.addKey(obj.start+obj.delay+obj.duration);
	//layer.opacity.setValueAtKey(1, 100);
	layer.opacity.setValueAtKey(2, obj.opacity);
}

function slideIn(layer, obj){
	var easeIn = new KeyframeEase(0.5, 50);
	var easeOut = new KeyframeEase(0.75, 90);
	layer.position.addKey(obj.start+obj.delay);
	layer.position.addKey(obj.start+obj.delay+obj.duration);
	layer.position.setValueAtKey(2, [obj.x, obj.y, 0]);
	
	//layer.position.setTemporalEaseAtKey(1, [easeIn]);
	//layer.position.setTemporalEaseAtKey(2, [easeOut]);
}

function slideOut(layer, obj, mainObj){
	var easeIn = new KeyframeEase(0.5, 50);
	var easeOut = new KeyframeEase(0.75, 90);
	layer.position.addKey(obj.start+obj.delay);
	layer.position.addKey(obj.start+obj.delay+obj.duration);
	//layer.position.setValueAtKey(1, [mainObj.pos.x, mainObj.pos.y, 0]);
	layer.position.setValueAtKey(2, [obj.x, obj.y, 0]);
	
	//layer.position.setTemporalEaseAtKey(1, [easeIn]);
	//layer.position.setTemporalEaseAtKey(2, [easeOut]);
}

function zoomIn(layer, obj, mainObj){
	var easeIn = new KeyframeEase(0.5, 50);
	var easeOut = new KeyframeEase(0.75, 90);
	layer.scale.addKey(obj.start+obj.delay);
	layer.scale.addKey(obj.start+obj.delay+obj.duration);
	
	if(obj.w != undefined){
		//layer.scale.setValueAtKey(1, [parseFloat(mainObj.pos.w)*100/layer.width, parseFloat(mainObj.pos.h)*100/layer.height, 0]);
		layer.scale.setValueAtKey(2, [parseFloat(obj.w)*100/mainObj.pos.w, parseFloat(obj.h)*100/mainObj.pos.h, 0]);
	}else{
		//layer.scale.setValueAtKey(1, [mainObj.pos.scale, mainObj.pos.scale, 0]);
		layer.scale.setValueAtKey(2, [obj.scale, obj.scale, 0]);
	}
	
	//layer.scale.setTemporalEaseAtKey(1, [easeIn]);
	//layer.scale.setTemporalEaseAtKey(2, [easeOut]);
}

function zoomOut(layer, obj, mainObj){
	var easeIn = new KeyframeEase(0.5, 50);
	var easeOut = new KeyframeEase(0.75, 90);
	layer.scale.addKey(obj.start+obj.delay);
	layer.scale.addKey(obj.start+obj.delay+obj.duration);
	
	if(obj.w != undefined){
		//layer.scale.setValueAtKey(1, [parseFloat(mainObj.pos.w)*100/layer.width, parseFloat(mainObj.pos.h)*100/layer.height, 0]);
		layer.scale.setValueAtKey(2, [parseFloat(obj.w)*100/mainObj.pos.w, parseFloat(obj.h)*100/mainObj.pos.h, 0]);
	}else{
		//layer.scale.setValueAtKey(1, [mainObj.pos.scale, mainObj.pos.scale, 0]);
		layer.scale.setValueAtKey(2, [obj.scale, obj.scale, 0]);
	}
	
	//layer.scale.setTemporalEaseAtKey(1, [easeIn]);
	//layer.scale.setTemporalEaseAtKey(2, [easeOut]);
}

function addEffect(layer, obj){
	for(var j=0; j<obj.effect.length; j++){
		if (!layer.Effects.property(obj.effect[j].name)){
			var effect = layer.Effects.addProperty(obj.effect[j].name);
			effect.property("Transition Completion").addKey(obj.start+obj.effect[j].delay);
			effect.property("Transition Completion").addKey(obj.start+obj.effect[j].delay+obj.effect[j].duration);
			effect.property("Transition Completion").setValueAtKey(1, 100);
			effect.property("Transition Completion").setValueAtKey(2, 0);
		}
	}
} */


function addKeys(layer, pos){
	for(var j=0; j<pos.length; j++){
		layer.scale.addKey(pos[j].keyframe);
		layer.position.addKey(pos[j].keyframe);
		layer.opacity.addKey(pos[j].keyframe);

		if(j>=1){
			layer.scale.setValueAtKey((j+1), [parseFloat(pos[j].w)*100/layer.width, parseFloat(pos[j].h)*100/layer.height, 0]);
			layer.opacity.setValueAtKey((j+1), [pos[j].opacity]);
			layer.position.setValueAtKey((j+1), [pos[j].x, pos[j].y, 0]);
		}
	}
}

function animate(layer, obj){
	var easeIn = new KeyframeEase(0.5, 50);
	var easeOut = new KeyframeEase(0.75, 90);
	
	layer.scale.addKey(obj.start+obj.delay);
	layer.scale.addKey(obj.start+obj.delay+obj.duration);
	if(obj.w != undefined){
		layer.scale.setValueAtKey(2, [parseFloat(obj.w)*100/mainObj.pos.w, parseFloat(obj.h)*100/mainObj.pos.h, 0]);
	}else{
		layer.scale.setValueAtKey(2, [obj.scale, obj.scale, 0]);
	}
	
	layer.position.addKey(obj.start+obj.delay);
	layer.position.addKey(obj.start+obj.delay+obj.duration);
	layer.position.setValueAtKey(2, [obj.x, obj.y, 0]);
	
	layer.opacity.addKey(obj.start+obj.delay);
	layer.opacity.addKey(obj.start+obj.delay+obj.duration);
	layer.opacity.setValueAtKey(2, obj.opacity);
}


//*****************ALL EFFECTS CODE END HERE*********************************//

function initilize(){
	jsonData = readJson(new File(unitPath+"/data.json"));
	var myItemCollection = app.project.items;
	emptyAssetsLibrary(myItemCollection);
	myComp = myItemCollection.addComp(jsonData.project.name, jsonData.project.width, jsonData.project.height, 1, jsonData.project.duration, jsonData.project.fps);
	myComp.openInViewer();
	
	var ele = jsonData.project.elements;
	var tlayer;
	for(var i=0; i<ele.length; i++){
		var obj = ele[i];
		switch(obj.type){
			case "text":
				tlayer = myComp.layers.addText(obj.val);
				addTxtLayer(tlayer, obj, obj.pos[0]);
				break;
			
			case "image":
				if(obj.val == "shape"){
					tlayer = myComp.layers.addSolid([1.0,0.0,0], "square", obj.pos[0].w, obj.pos[0].h, 1);
					addShape(tlayer, obj.pos[0]);
				}else{
					tlayer = addMediaLayer(myComp, obj);
					addImgLayer(tlayer, obj, obj.pos[0]);
				}
				break;
			case "video":
				tlayer = addMediaLayer(myComp, obj);
				addImgLayer(tlayer, obj, obj.pos[0]);
				
				/*obj.effect && addEffect(tlayer, obj);
				 if(obj.anim){
					for(var j=0; j<obj.anim.length; j++){
						var tobj = obj.anim[j];
						this[tobj.name](tlayer, tobj, obj);
					}
				} */
				
				break;
			
			case "gallery":
				tlayer = addGallery(obj);
				break;
		}
		
		addKeys(tlayer, obj.pos);
		layerIndex++;
		setObjInOut(tlayer, obj);
	}

	var taskId = app.scheduleTask("ameRender()", 200, false);
	
	function err(errString) {
		//alert(errString) ;
	}
	app.onError = err;
	//app.project.save();
}

function addShape(tlayer, obj){
	tlayer.property("Anchor Point").setValue([0, 0]);
	tlayer.property("Position").setValue([parseFloat(obj.x), parseFloat(obj.y)]);
}

function emptyProject(){
	if(app.project.items.length == 0){ return false; }
	
	var icount = app.project.items.length;
	for(var j=icount; j>0; j--){
		app.project.item(j).remove();
	}
	
	//app.project.save();
    return true;
}

function emptyAssetsLibrary(myItemCollection){
	for(var j=1; j<myItemCollection.length; j++){
		myItemCollection[j].remove();
	}
}

function addMediaLayer(comp, obj){
	var file = new File(unitPath+"/"+obj.val);
	var item = app.project.importFile(new ImportOptions(file));
	var tlayer = comp.layers.add(item);
	return tlayer;
}

function addImgLayer(tlayer, obj, pos){
	tlayer.property("Anchor Point").setValue([0, 0]);
	tlayer.property("Position").setValue([parseFloat(pos.x), parseFloat(pos.y)]);
	tlayer.property("Scale").setValue([parseFloat(pos.w)*100/tlayer.width, parseFloat(pos.h)*100/tlayer.height]);
	tlayer.property("Opacity").setValue([parseFloat(pos.opacity)]);
}

function addTxtLayer(tlayer, obj, pos){	
    var txt = tlayer.property("Source Text").value;
    txt.fillColor = obj.props.clr.split(",");
    txt.fontSize = obj.props.size;
    txt.font = obj.props.font;
	txt.justification = ParagraphJustification.LEFT_JUSTIFY;
	
	tlayer.property("Source Text").setValue(txt);
	tlayer.property("Position").setValue([pos.x, pos.y]);
	tlayer.property("Anchor Point").setValue([0, 0]);
	
	if(pos.opacity != undefined){
		tlayer.property("Opacity").setValue([pos.opacity]);
	}
}

function addGallery(obj){
	var pos = obj.pos[0];
	var gallery = app.project.items.addComp(obj.id, 3000, pos.h, 1, jsonData.project.duration, jsonData.project.fps);
	gallery.openInViewer();
	
	var tlayer;
	var xpos = 0;
	var ypos = 0;
	for(var j=0; j<obj.slides.length; j++){
		var tcomp = app.project.items.addComp("slide_"+j, obj.slides[j].pos.w, obj.slides[j].pos.h, 1, jsonData.project.duration, jsonData.project.fps);
		tcomp.openInViewer();
		
		//add background to every slide//
		//tcomp.layers.addSolid(obj.slides[j].pos.clr.split(","), "bgrect", obj.slides[j].pos.w, obj.slides[j].pos.h, 1);
		
		var tobj = obj.slides[j];
		for(var k=0; k<tobj.el.length; k++){
			if(tobj.el[k].type == "image"){
				tlayer = addMediaLayer(tcomp, tobj.el[k]);
				addImgLayer(tlayer, tobj.el[k], tobj.el[k].pos);
			}else if(tobj.el[k].type == "text"){
				tlayer = tcomp.layers.addText(tobj.el[k].val);
				addTxtLayer(tlayer, tobj.el[k], tobj.el[k].pos);
			}
		}
		
		var clayer = gallery.layers.add(tcomp);
		clayer.property("Anchor Point").setValue([0, 0]);
		clayer.property("Position").setValue([xpos, ypos]);
		
		if(obj.direction == "H"){
			if(obj.slideHGap != null){
				xpos += obj.slides[j].pos.w+obj.slideHGap;
			}else{
				xpos += obj.slides[j].pos.w+obj.slideHGap;
			}
			
		}else{
			if(obj.slideVGap != null){
				ypos += obj.slides[j].pos.h+obj.slideVGap;
			}else{
				ypos += obj.slides[j].pos.h+obj.slideVGap;
			}
		}
	}
	
	tlayer = myComp.layers.add(gallery);
	tlayer.property("Anchor Point").setValue([0, 0]);
	tlayer.property("Position").setValue([parseFloat(pos.x), parseFloat(pos.y)]);
	
	addMask(tlayer, obj);
	animateGallery(tlayer, obj);
	
	return tlayer;
}

function customEase(){ }

function animateGallery(tlayer, tobj){
	var obj = tobj.transition;
	
	for(var j=0; j<obj.values.length; j++){
		var currentPos = tlayer.property("Position").value;
		
		//need to find more easing properties//
		var easeIn = new KeyframeEase(0.5, 50);
		var easeOut = new KeyframeEase(0.75, 90);
		
		var slide = tlayer.property("Position");
		if(tobj.direction == "H"){
			slide.setValueAtTime(obj.values[j].start+obj.values[j].delay, [tobj.pos[0].x-(obj.values[j].distance*(j)), tobj.pos[0].y, 0]);
			slide.setValueAtTime(obj.values[j].start+obj.values[j].delay+obj.values[j].duration, [tobj.pos[0].x-(obj.values[j].distance*(j+1)), tobj.pos[0].y, 0]);
		}else{			
			slide.setValueAtTime(0, [obj.values[j].start+obj.values[j].delay, tobj.pos[0].y-(obj.values[j].distance*j), 0]);
			slide.setValueAtTime(0, [obj.values[j].start+obj.values[j].delay+obj.values[j].duration, tobj.pos[0].y-(obj.values[j].distance*(j+1)), 0]);
		}
		
		if(j==0 || j%2==0){
			slide.setTemporalEaseAtKey(j+2, [easeIn], [easeOut]);
		}
	}
}

function addMask(tlayer, obj) {
	var pos = obj.pos[0];
	var slayer = myComp.layers.addSolid([1.0,1.0,0], "my square", pos.w, pos.h, 1);
	slayer.property("Anchor Point").setValue([0, 0]);
	slayer.property("Position").setValue([parseFloat(pos.x), parseFloat(pos.y)]);
	slayer.enabled = false;
	tlayer.setTrackMatte(slayer, TrackMatteType.ALPHA);
}

function setObjInOut(tlayer, obj){
	myComp.openInViewer();
	tlayer.startTime = parseFloat(obj.in);
	tlayer.outPoint = parseFloat(obj.out);
}

function readJson(file){
	file.open('r');
	$.sleep(100);
	var jdata = file.read();
	jdata = JSON.parse(jdata);
	file.close();
	
	return jdata;
}

function ameRender(){
	var item = app.project.renderQueue.items.add(myComp);
	var module = item.outputModule(1);
	//module.file = new File(jsonData.project.output+"/"+jsonData.project.name);
	module.file = new File(currentPath+"/output/"+jsonData.project.unit+"/"+jsonData.project.name);
	
	function statusChanged(){
		//alert(app.project.renderQueue.item(1).status);
	};
	
	//because there will be only one item in the queue at a time//
	app.project.renderQueue.item(1).onstatus = statusChanged();
	app.project.renderQueue.queueInAME(true);


	var activeProject = app.project;
	if (activeProject !== null) {
		activeProject.close(CloseOptions.DO_NOT_SAVE_CHANGES);
	}
}

app.exitAfterLaunchAndEval = false;