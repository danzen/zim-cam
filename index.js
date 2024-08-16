// ZIM - https://zimjs.com - Code Creativity!
// JavaScript Canvas Framework for General Interactive Media
// free to use - donations welcome of course! https://zimjs.com/donate

import zim from "zimjs";

// ZIM CAM - see https://zimjs.com/code#libraries for examples

// ~~~~~~~~~~~~~~~~~~~~~~~~
// DESCRIPTION - Cam was coded in 2021 (c) ZIM
// Captures a video cam and tracks motion to create effects and a cursor.
// Can capture motion in different regions specified by a DisplayObect
// or the default is the whole stage. 

// The Cam Module has Cam(), CamMotion(), CamCursor(), CamAsk(), CamAlpha() and CamControls()

// DOCS
// Docs are provided at https://zimjs.com/docs.html
// See CAM MODULE at bottom
// ~~~~~~~~~~~~~~~~~~~~~~~~


zim.Cam = function(width, height, flip, facingMode, config) {
	var sig = "width, height, flip, facingMode, config";
	var duo; if (duo = zob(zim.Cam, arguments, sig, this)) return duo;
	
	if (zot(width)) width = 640;
	if (zot(height)) height = 480;
	if (zot(flip)) flip = true;
	if (zot(facingMode)) facingMode = true; // or "user", "environment", "exact_user" or "exact_environment"
	if (zot(config)) config = true;
							
	this.zimContainer_constructor(width, height);
	this.type = "Cam";        
	var that = this;   
	that.noMouse();  
	this.ready = false;   
	
	var video = this.tag = document.createElement("video");
	video.setAttribute("autoplay", true);
					
	if (facingMode !== true) {
		var supports = navigator.mediaDevices.getSupportedConstraints();
		if (supports && supports['facingMode']) {
			if (config === true) config = {};            
			if (facingMode=="user") config.facingMode = "user";
			else if (facingMode=="exact_user") config.facingMode = {exact:"user"};
			else if (facingMode=="environment") config.facingMode = "environment";
			else if (facingMode=="exact_environment") config.facingMode = {exact:"environment"};
			else if (zim.isEmpty(config)) config = true;
			else if (facingMode=="auto" && config.facingMode) delete config.facingMode; 
			that.facingMode = facingMode;
		}
	}
			
	if (navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices
			.getUserMedia({video:config})
			.then(function (stream) {
				video.srcObject = stream; 
				var count = 0;
				getVideo();
				function getVideo() {
					if (count++ > 5) {
						that.dispatchEvent("error");
						return;
					}
					video.addEventListener("stalled", getVideo);
					video.addEventListener("error", getVideo);
					video.addEventListener("canplay", init);
				}               
				function init() {
					video.removeEventListener("stalled", getVideo);
					video.removeEventListener("error", getVideo);
					video.removeEventListener("canplay", init);
					var w = video.videoWidth?video.videoWidth:width;
					var h = video.videoHeight?video.videoHeight:height;
					var display = that.display = new zim.Container(w,h).scaleTo(that,100/that.scaleX,100/that.scaleY,FULL).addTo(that);
					var cam = that.bitmap = new zim.Bitmap(video, w, h).addTo(display); 
					if (flip) {
						cam.scaleX *= -1;  
						cam.regX = -cam.width/(cam.scaleX?cam.scaleX:1);
					}                                                 
					that.resetSize = function() {
						that.setBounds(0,0,w,h);
						cam.sca(1,1);
						return that;
					} 
					that.snapshot = function() {
						return new zim.Bitmap(that.display.clone());
					}   
					var _paused = false;
					that.pause = function(state) {
						if (zot(state)) state = true;
						state = state?true:false;
						if (state != _paused) {
							var stream = video.srcObject;
							var tracks = stream.getTracks();
							if (state == true) that.pausePic = that.snapshot().scaleTo(that,100/that.scaleX,100/that.scaleY,FULL).addTo(that);
							else if (that.pausePic) {
								that.pausePic.dispose();
								that.pausePic = null;
							}
							for (var i = 0; i < tracks.length; i++) {
								var track = tracks[i];
								track.enabled = !state;
							}
							_paused = state;
						}      
						return that;                      
					}
					that.toggle = function() {
						that.pause(!_paused);
						return that;
					}
					that.keyOut = function(color, tolerance, replacement) {
						if (that.ticker) zim.Ticker.remove(that.ticker);
						that.ticker = zim.Ticker.add(function () {
							that.bitmap.keyOut(color, tolerance, replacement);
						}); 
						return that;
					}
					that.setFacingMode = async function(facingMode) {
						var supports = navigator.mediaDevices.getSupportedConstraints();
						if (supports && supports['facingMode']) { 
							if (config === true) config = {};                                
							if (facingMode=="user") config.facingMode = "user";
							else if (facingMode=="exact_user") config.facingMode = {exact:"user"};
							else if (facingMode=="environment") config.facingMode = "environment";
							else if (facingMode=="exact_environment") config.facingMode = {exact:"environment"};
							else if (facingMode=="auto" && config.facingMode) delete config.facingMode; 
							else return that;   
							that.facingMode = facingMode;                                                          
							try {                                    
								var tracks = stream.getTracks();
								tracks.forEach(function(track) {track.stop();});
								stream = await navigator.mediaDevices.getUserMedia({video:config});
							} catch (e) {
								zogr("ZIM CAM ERROR: " + e);
								return that;
							}
							video.srcObject = null;
							video.srcObject = stream;
							video.play();                                
						}
						return that;
					}
					Object.defineProperty(that, 'paused', {
						get: function() {
							return _paused;
						},
						set: function(value) {
							value = value?true:false;
							if (value != _paused) that.pause(value);
						}
					});
					var _flipped = flip?true:false;
					that.flip = function(state) {
						if (zot(state)) state == true; 
						state = state?true:false;
						if (_flipped != state) {
							cam.scaleX *= -1;  
							if (cam.regX==0) cam.regX = -cam.width/(cam.scaleX?cam.scaleX:1);
							else cam.regX = 0;
							_flipped = state;
						}                            
					}
					Object.defineProperty(that, 'flipped', {
						get: function() {
							return _flipped;
						},
						set: function(value) {
							value = value?true:false;
							if (value != _flipped) that.flip(value);
						}
					});
					that.dispose = function(a,b,disposing) {
						var stream = video.srcObject;
						var tracks = stream.getTracks();
						for (var i = 0; i < tracks.length; i++) {
							var track = tracks[i];
							track.stop();
						}
						video.srcObject = null;
						that.bitmap.dispose();
						if (that.pausePic) {
							that.pausePic.dispose();
							that.pausePic = null;
						}
						Ticker.alwaysOff();
						if (!disposing) that.zimContainer_dispose(true);
						return true;
					}                  
					
					that.ready = true;	
					that.dispatchEvent("ready");                        
					Ticker.always();                         	
				}                   
			})
			.catch(function (error) {
				that.dispatchEvent("error");    
			});
	} else {
		zim.timeout(.05, function() {
			that.dispatchEvent("error");
		});
	} 
			
}
zim.extend(zim.Cam, zim.Container, ["clone", "dispose"], "zimContainer", false);

zim.CamMotion = function(obj, preview, smooth, damp, sensitivity, precision, period, colorFilter, colorSensitivity, mode, visualizerObj, visualizerColor, visualizerBaseColor, visualizerScale, visualizerBaseScale, guideH, guideV, randomize, cam, frame, facingMode, config) {
	var sig = "obj, preview, smooth, damp, sensitivity, precision, period, colorFilter, colorSensitivity, mode, visualizerObj, visualizerColor, visualizerBaseColor, visualizerScale, visualizerBaseScale, guideH, guideV, randomize, cam, frame, facingMode, config";
	var duo; if (duo = zob(zim.CamMotion, arguments, sig, this)) return duo;
	if (zot(cam)) cam = new zim.Cam(null, null, null, facingMode, config);
	if (zot(frame)) frame = zdf;
	var stage = frame.stage;
	var stageW = stage.width;
	var stageH = stage.height;
	this.zimContainer_constructor(stageW, stageH);
	this.type = "CamMotion";
	var that = this;    
	that.noMouse(); 
	that.cam = cam;  
	cam.on("error", function() {
		that.dispatchEvent("error"); 
	});        
	if (zot(preview)) preview = .1;
	if (isNaN(preview)) preview = 0;
	if (zot(smooth)) smooth = 1;
	if (zot(damp)) damp = .05;
	if (zot(sensitivity)) sensitivity = .5;
	if (zot(precision)) precision = .5;
	if (zot(period)) period = .05;
	sensitivity = zim.constrain(sensitivity, 0, 1); 
	precision = zim.constrain(precision, 0, 1); 
	if (zot(colorSensitivity)) colorSensitivity = .2;
	this.colorSensitivity = colorSensitivity;
	this.colorFilter = colorFilter;
	if (zot(mode)) mode = 0; // 0 red, 1 green, 2 blue 
	if (mode != 0 && mode != 1 && mode != 2) mode = 0;
	if (!zot(visualizerObj) && !visualizerObj.type) visualizerObj = "circle";
	if (zot(visualizerObj) && (!zot(visualizerColor) || !zot(visualizerBaseColor) || !zot(visualizerScale) || !zot(visualizerBaseScale))) visualizerObj = "circle";
	if (zot(visualizerColor)) visualizerColor = zim.red;  
	if (zot(visualizerBaseColor)) visualizerBaseColor = zim.dark; 
	if (zot(visualizerScale)) visualizerScale = 1;  
	if (zot(visualizerBaseScale)) visualizerBaseScale = 0;  
	if (zot(guideH)) guideH = "auto"; // LEFT, CENTER, RIGHT, AUTO, AVE
	if (zot(guideV)) guideV = "top"; // TOP, CENTER, BOTTOM, AUTO, AVE  
	if (zot(randomize)) randomize = true;  
			
	if (zot(obj)) obj = stage;  
	that.obj = obj;              
	if (!cam.parent) cam.scaleTo(this).addTo(this); // will be FILL   
	cam.alpha = preview; 
	
	that.rawX = that.motionX = stageW/2;
	that.rawY = that.motionY = stageH/2;   
	
	that.dampX = new zim.Damp(stageW/2, damp);     
	that.dampY = new zim.Damp(stageH/2, damp);        
			
	var numX, numY, startX, startY, spacing, last;
	var bounds = obj.getBounds();
	if (!bounds) {zogy("ZIM CamMotion - please provide obj with bounds set"); return;} 
	var tL = obj.localToGlobal(bounds.x,bounds.y);
	var bR = obj.localToGlobal(bounds.x+bounds.width,bounds.y+bounds.height);        
	function setup() {
		spacing = 10+(1-precision) * 90;
		numX = Math.floor(obj.width / spacing);
		numY = Math.floor(obj.height / spacing);
		startX = (obj.width-spacing*(numX-1))/2;
		startY = (obj.height-spacing*(numY-1))/2;
		if (spacing > obj.width) {startX = obj.width/2; numX = 1;}
		if (spacing > obj.height) {startY = obj.height/2; numY = 1;}
		if (cam.ready) init();
		else cam.on("ready", init, null, true);
	}      
	setup();
	
	function init() {  
		that.camPoints = [];  
		that.points = [];  
		that.data = [];
		zim.loop(numY, function(y) {
			zim.loop(numX, function(x) {
				var rX = randomize?rand(-spacing/3,spacing/3):0;
				var rY = randomize?rand(-spacing/3,spacing/3):0;
				var camPoint = obj.localToLocal(startX+spacing*x+rX, startY+spacing*y+rY, cam.display); 
				that.camPoints.push(camPoint);           
				var point = obj.localToLocal(startX+spacing*x+rX, startY+spacing*y+rY, that); 
				that.points.push(point);          
				that.data.push(0);   
			});
		});       
		smooth = zim.constrain(smooth, 0, .999); 
		var buffer = Math.floor(1+smooth*10); 
		var bufferArrayX = [];
		var bufferArrayY = [];
		if (that.interval) that.interval.clear();         
		that.interval = zim.interval(period, function() { 
			cam.display.cache();
			var myContext = cam.display.cacheCanvas.getContext('2d');
			var temp = [];
			var countX = 0;
			var countY = 0;
			var totX = 0;
			var totY = 0;
			var minX = 10000;
			var minY = 10000;
			var maxX = 0;
			var maxY = 0;
			that.active = false;
			zim.loop(that.camPoints, function(camPoint, i) {
				var d = myContext.getImageData(camPoint.x, camPoint.y, 1, 1).data; 
				// color at mode (red/green/blue) within += sensitivity
				if (last && (d[mode]>last[i]+10+90*(1-sensitivity) || d[mode]<last[i]-10-90*(1-sensitivity))) {
					if (!zot(that.colorFilter)) {
						var h1 = zim.convertColor(that.colorFilter,"hsl")[0]; // hue of desired color
						var h2 = zim.convertColor("rgb("+d[0]+","+d[1]+","+d[2]+")","hsl")[0]; // hue of desired color
						var close = false;
						if (Math.abs(h1-h2) < that.colorSensitivity*20) close = true;
						else if (Math.abs(Math.min(h1,h2)+360-Math.max(h1,h2)) < that.colorSensitivity*20) close = true; 
					}
					if (!zot(that.colorFilter) && !close) {
						that.data[i] = 0;
					} else {
						that.data[i] = 1;
						totX += that.points[i].x;
						totY += that.points[i].y;
						countX++;
						countY+=1;
						maxX = Math.max(maxX, that.points[i].x);
						maxY = Math.max(maxY, that.points[i].y);
						minX = Math.min(minX, that.points[i].x);
						minY = Math.min(minY, that.points[i].y);
						that.active = true;
					}
				} else {
					that.data[i] = 0;
				}    
				temp[i] = d[mode];
			}); 
			last = temp;                
			cam.display.uncache();
			if (totX > 0 && totY > 0) {
				bufferArrayX.push((guideH=="left")?minX:(guideH=="right")?maxX:(guideH=="center")?minX+(maxX-minX)/2:(guideH=="auto")?minX+(maxX-minX)*((totX/countX)-tL.x)/(bR.x-tL.x):(totX/countX));                    
				bufferArrayY.push((guideV=="top")?minY:(guideV=="bottom")?maxY:(guideV=="center")?minY+(maxY-minY)/2:(guideV=="auto")?minY+(maxY-minY)*((totY/countY)-tL.y)/(bR.y-tL.y):(totY/countY));                    
			} else {
				bufferArrayX.shift(); // so buffer reduces to last motion position
				bufferArrayY.shift();
			}
			var ll = bufferArrayX.length;
			if (ll > 0) {
				if (ll>buffer) {
					bufferArrayX.shift();
					bufferArrayY.shift();
					ll = bufferArrayX.length;
				}
				// if dynamically reduce smooth will need to move towards new smooth
				if (ll>buffer) {
					bufferArrayX.shift();
					bufferArrayY.shift();
					ll = bufferArrayX.length;
				}
				var tX = 0;
				var tY = 0;
				for (var i=0; i<bufferArrayX.length; i++) {
					tX+=bufferArrayX[i];
					tY+=bufferArrayY[i];
				}
				that.rawX = tX/bufferArrayX.length;
				that.rawY = tY/bufferArrayY.length;
			}
			if (that.visualizer) {                                     
				that.visualizer.loop(function(ob,i) {
					ob.color = that.data[i]?ob.blush:ob.bass;
					if (ob.oomp!=ob.orig) ob.animate({scale:that.data[i]?ob.oomp:ob.orig}, period*2);
				});                     
			}      
			that.dispatchEvent("data");
			if (that.active) that.dispatchEvent("active");
			else that.dispatchEvent("inactive");
		});
		zim.timeout(.05, function() {                
			if (visualizerObj) {
				that.visualizer = new zim.Container(stageW, stageH).addTo(that);
				zim.loop(that.points, function(point) {
					var si = zik(visualizerScale);
					var siB = zik(visualizerBaseScale);
					var co = zik(visualizerColor);
					var coB = zik(visualizerBaseColor);
					if (!zot(visualizerObj) && (visualizerObj=="circle" || !visualizerObj.clone)) {
						var c = new zim.Circle(40,coB).sca(siB).loc(point,null,that.visualizer);                            
					} else {
						var c = visualizerObj.clone().centerReg({add:false}).loc(point,null,that.visualizer);
						c.color = coB;
					}
					c.orig = siB;
					c.oomp = si;
					c.bass = coB;
					c.blush = co;
				});                   
			}
			if (!that.ready) that.dispatchEvent("ready");
			that.ready = true;
		});            
	}  
	
	that.ticker = zim.Ticker.add(function() {
		that.motionX = that.dampX.convert(that.rawX)
		that.motionY = that.dampY.convert(that.rawY)
		that.dispatchEvent("cursor");
	}, stage)
	
	Object.defineProperty(that, 'smooth', {
		get: function() {
			return smooth;
		},
		set: function(value) {
			smooth = zim.constrain(value, 0, .999); 
			buffer = Math.floor(1+smooth*10);
		}
	});
	
	Object.defineProperty(that, 'sensitivity', {
		get: function() {
			return sensitivity;
		},
		set: function(value) {
			sensitivity = zim.constrain(value, 0, 1); 
			setup();
		}
	});
	
	Object.defineProperty(that, 'precision', {
		get: function() {
			return precision;
		},
		set: function(value) {
			precision = zim.constrain(value, 0, 1); 
			setup();
		}
	});
	
	this.dispose = function(a,b,disposing) {
		that.cam.dispose();
		if (that.interval) that.interval.clear();
		if (that.visualizer) that.visualizer.dispose();
		if (!disposing) this.zimContainer_dispose(true);
		return true;
	}        
};
zim.extend(zim.CamMotion, zim.Container, ["clone", "dispose"], "zimContainer", false);

zim.CamCursor = function(cursor, preview, camMotion, radius, color, borderColor, borderWidth, stillColor, stillBorderColor, stillTime, colorFilter, colorSensitivity, cam, facingMode, config) {
	var sig = "cursor, preview, camMotion, radius, color, borderColor, borderWidth, stillColor, stillBorderColor, stillTime, colorFilter, colorSensitivity, cam, facingMode, config";
	var duo; if (duo = zob(zim.CamCursor, arguments, sig, this)) return duo;
	if (zot(preview)) preview = .1;
	if (zot(radius)) radius = 10;
	if (zot(color)) color = zim.blue;
	if (zot(borderColor)) borderColor = zim.purple;
	if (zot(stillColor)) stillColor = borderColor;
	if (zot(stillBorderColor)) stillBorderColor = color;
	if (zot(borderWidth)) borderWidth = 5;
	if (zot(cursor)) {
		cursor = new zim.Circle(radius, color, borderColor, borderWidth);
	}   
	if (zot(camMotion)) camMotion = new zim.CamMotion({preview:preview, cam:cam, facingMode:facingMode, config:config, colorFilter:colorFilter, colorSensitivity:colorSensitivity});
	else {
		if (!zot(colorFilter)) camMotion.colorFilter = colorFilter;
		if (!zot(colorSensitivity)) camMotion.colorSensitivity = colorSensitivity;
	}
	camMotion.addTo();    
	
	if (zot(stillTime)) stillTime = 1;
	
	
	this.zimContainer_constructor(cursor.width, cursor.height);
	this.type = "CamCursor"; 
	var that = this;               
	that.cursor = that.cursorObj = cursor.addTo(this);
	that.camMotion = camMotion;
	that.cam = camMotion.cam;
	that.noMouse();        
	
	var lastMoveTime = Date.now();
	that.motion = false;
	var lastX = 0;
	var lastY = 0;
	cursor.originalAlpha = cursor.alpha;
	cursor.alp(0);
	camMotion.on("cursor", function() {
		// use raw position not damped position
		if (Math.round(camMotion.rawX) != lastX || Math.round(camMotion.rawY) != lastY) {  
			if (!that.motion) {
				that.dispatchEvent("motion");  
				that.cursor.color = color;
				that.cursor.borderColor = borderColor;
			}              
			that.motion = true;                
			lastMoveTime = Date.now();
			lastX = Math.round(camMotion.rawX);
			lastY = Math.round(camMotion.rawY);
		} else {
			if (that.motion && Date.now()-lastMoveTime>stillTime*1000) {
				that.dispatchEvent("still");
				that.motion = false;
				that.cursor.color = stillColor;
				that.cursor.borderColor = stillBorderColor;
			}                
		}
		// use damped position
		that.loc(camMotion.motionX, camMotion.motionY);              
		that.dispatchEvent("cursor");      
	});    
	
	Object.defineProperty(that, 'colorFilter', {
		get: function() {
			return that.camMotion.colorFilter;
		},
		set: function(value) {
			that.camMotion.colorFilter = value; 
		}
	});
	Object.defineProperty(that, 'colorSensitivity', {
		get: function() {
			return that.camMotion.colorSensitivity;
		},
		set: function(value) {
			that.camMotion.colorSensitivity = value; 
		}
	});
	
	camMotion.on("ready", function() {
		that.dispatchEvent("ready");
		that.cursor.animate({alpha:that.cursor.originalAlpha});
	});        
	camMotion.on("error", function() {
		that.dispatchEvent("error");
	});                
}
	
zim.extend(zim.CamCursor, zim.Container, "clone", "zimContainer", false);

zim.CamAsk = function(color, backgroundColor) {
	
	if (zot(color)) color = zim.dark;
	if (zot(backgroundColor)) backgroundColor = zim.lighter;
	
	this.zimPane_constructor("",backgroundColor,color,200,200,false,null,true,100,black.toAlpha(.3), null, null, null, false, false);
	this.type = "CamAsk";
	var that = this;
	
	Style.addGroup("camAsk", {            
		width:100,
		color:color,
		rollColor:backgroundColor,
		corner:10,
		backgroundColor:zim.faint,
		rollBackgroundColor:color,
		borderColor:color,
		borderWidth:2         
	});
	that.yes = new zim.Button({label:"YES", group:"camAsk"}).sca(.65).pos(0,30,CENTER,TOP,this).tap(function() {
		that.hide(true);
		that.dispatchEvent("yes");
	});
	that.label = new zim.Label("Use cam?", null, null, color, null, null, null, "center").sca(.9).centerReg(this);
	that.no = new zim.Button({label:"NO", group:"camAsk"}).sca(.65).pos(0,30,CENTER,BOTTOM,this).tap(function() {
		that.hide(false);
		that.dispatchEvent("no");
	});
	
	new zim.Circle(110, zim.clear, color, 1).center(this).alp(.8);
	new zim.Circle(120, zim.clear, color, 1).center(this).alp(.5);
	new zim.Circle(130, zim.clear, color, 1).center(this).alp(.2);        

}
zim.extend(zim.CamAsk, zim.Pane, null, "zimPane", false);
	
zim.CamAlpha = function(cam, color) {
	if (zot(cam)) return;
	if (cam.cam) cam = cam.cam; // passing in a camMotion or camCursor rather than a cam
	if (zot(color)) color = "white";
	this.zimContainer_constructor(120,60);
	this.type = "CamAlpha";
	var that = this;
	this.cam = cam;
	var backing = this.backing = new zim.Rectangle(120,60,zim.faint,color.toAlpha(.4),1,10).addTo(this);
	var title = this.title = new zim.Label("cam alpha",16,null,color.toAlpha(.8),null,null,null,null,null,null,true).pos(0,8,CENTER,TOP,this);       
	var slider = this.slider = new zim.Slider({
		button:new zim.Button({width:30, height:30, corner:15, label:"", backgroundColor:color, rollBackgroundColor:color}),
		barColor:color, 
		barLength:110,
		min:0, max:1, 
		currentValue:cam.alpha
	})            
		.alp(.5)
		.siz(100)
		.pos(0,8,CENTER,BOTTOM,this)
		.change(function() {
			that.cam.alp(slider.currentValue);
		});
	this.alp(.8);    
}
zim.extend(zim.CamAlpha, zim.Container, null, "zimContainer", false);

zim.CamControls = function(camMotion, close, collapse) {
	if (zot(camMotion)) return;
	if (zot(close)) close = false;
	if (zot(collapse)) collapse = true;
	
	var camCursor;            
	if (camMotion.type == "CamCursor") {
		camCursor = camMotion;
		camMotion = camCursor.camMotion;
	}
	var cam = camMotion.cam; 
			
	function smoothen(num) {
		camMotion.smooth = num/100;
	}
	function sense(num) {
		camMotion.sensitivity = num/100;
	}
	function precise(num) {
		camMotion.precision = num/100;
	}
	function damping(num) {
		camMotion.dampX.damp = num/1000;
		camMotion.dampY.damp = num/1000;
	}
	var smoothS = Math.round(camMotion.smooth*100);
	var sensitivityS = Math.round(camMotion.sensitivity*100);
	var precisionS = Math.round(camMotion.precision*100);
	var dampS = Math.round(camMotion.dampX.damp*1000);
	var flippedS = cam.flipped;
	
	var list = [
		zim.List.slider("smooth", 0, 100, smoothS, smoothen),
		zim.List.slider("sensitivity", 0, 100, sensitivityS, sense),
		zim.List.slider("precision", 0, 100, precisionS, precise),
		zim.List.slider("damp", 0, 100, dampS, damping),
		zim.List.checkBox("flipped", flippedS, null, cam, "flipped"),
	];        
	
	if (zim.licorice == "#222222") this.zimList_constructor(180, 200, list, null, null, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 10, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "cam", zim.lighter, null, null, true, null, null, close, zim.lighter, collapse, zim.lighter);        
	else this.zimList_constructor(180, 200, list, null, null, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 10, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "cam", zim.lighter, null, null, true, null, null, close, zim.lighter, collapse, zim.lighter);
	
	this.type = "CamControls";
	var that = this;
	this.cam = cam;
	this.camMotion = camMotion;
	this.camCursor = camCursor;
	
	var reset = this.reset = new zim.Button({
		width:140,
		height:60,
		label:"RESET",
		corner:0,
		backgroundColor:zim.blue,
		rollBackgroundColor:zim.pink            
	}).sca(.3).pos(28,7,RIGHT,BOTTOM,this.contentContainer?this.contentContainer:this.content).tap(function () {
		that.items[0].slider.currentValue = smoothS;
		that.items[0].stepper.currentValue = smoothS;
		that.items[1].slider.currentValue = sensitivityS;
		that.items[1].stepper.currentValue = sensitivityS;
		that.items[2].slider.currentValue = precisionS;
		that.items[2].stepper.currentValue = precisionS;
		that.items[3].slider.currentValue = dampS;
		that.items[3].stepper.currentValue = dampS;
		that.items[4].checkBox.checked = flippedS;
		smoothen(smoothS);
		sense(sensitivityS);
		precise(precisionS);
		damping(dampS);
		cam.flipped = flippedS;
	});
						
}
zim.extend(zim.CamControls, zim.List, null, "zimList", false);
        

var WW = window||{};
if (!WW.zns) {
    WW.Cam = zim.Cam;
    WW.CamMotion = zim.CamMotion;
    WW.CamCursor = zim.CamCursor;
    WW.CamAsk = zim.CamAsk;
    WW.CamAlpha = zim.CamAlpha;
    WW.CamControls = zim.CamControls;
}

export const Cam = zim.Cam;
export const CamMotion = zim.CamMotion;
export const CamCursor = zim.CamCursor;
export const CamAsk = zim.CamAsk;
export const CamAlpha = zim.CamAlpha;
export const CamControls = zim.CamControls;