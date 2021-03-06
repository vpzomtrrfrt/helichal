function rAF(f) {
	if(window.requestAnimationFrame) {window.requestAnimationFrame(f);}
	else {setTimeout(f,33);}
}
inBack = false;
disableMouse=false;
pclrs = ["red","lime","cyan","orange"];
taptime=120;
cbx = [
	{
		txt: "Play Music?",
		default: false,
		toShow: function() {if("mus" in window) {
			if(window.mus._duration!=-1) {
				return true;
			}
		}}
	}
];
for(var i = 0; i < cbx.length; i++) {
	if("helichalOption"+i in localStorage) {
		cbx[i].enabled=localStorage.getItem("helichalOption"+i)!="false";
	}
	else {
		cbx[i].enabled=cbx[i].default;
	}
}
var gamemodes={
	1: {
		name: "Free Fly Mode",
		color: "red"
	},
	2: {
		name: "Lightning Mode",
		color: "yellow"
	},
	3: {
		name: "Motion Mode",
		color: "#00e"
	},
	4: {
		name: "Tap It Mode",
		color: "gray"
	},
	5: {
		name: "Custom Mode",
		color: "cyan",
		hide: !localStorage.helichalCM
	}
};
connseed = false;
connevts = false;
conother = {};
var HelichalGame = function(st,gm) {
	this.state=st===undefined?1:st;
	if(HelichalGame.currentGame) {
		if(this.state==1) {this.conn=HelichalGame.currentGame.conn;}
		else {if(HelichalGame.currentGame.conn){HelichalGame.currentGame.conn.close();connevts=false;conother={};}}
	}
	HelichalGame.currentGame=this;
	this.px=cnvs.width*.45;
	this.psz=cnvs.width*.1;
	this.adjustY();
	this.platforms = [{x: cnvs.width*.4, h: cnvs.height/5, stable: true}];
	this.score=0;
	this.dir0time=0;
	this.pickColor();
	this.secret={};
	this.setGamemode(gm?gm:0);
	this.prog=0;
	if(!connevts&&this.conn) {
		this.conn.onmessage = function(d) {
			console.log(d);
			var m = d.data;
			var c = m.split(":");
			if(c[0]=="add") {
				conother[c[1]] = {
					c: pclrs[Math.floor(Math.random()*pclrs.length)]
				};
			}
			else if(c[0]=="u") {
				connseed=c[1];
			}
			else if(c[0]=="move") {
				conother[c[1]].x=parseFloat(c[2]);
				conother[c[1]].y=parseFloat(c[3]);
			}
		};
		this.conn.send("join");
		connevts=true;
	}
};
HelichalGame.prototype.setGamemode = function(gm) {
	this.gamemode=gm;
	this.eqg = ""+gm;
	if(gm==5) {
		this.eqg+=localStorage.helichalCM;
	}
};
HelichalGame.prototype.isGM = function(gm) {
	return this.eqg.indexOf(gm)>-1;
}
HelichalGame.prototype.die = function() {
	if(this.invulnerable) return;
	this.state=-3;
};
HelichalGame.seed=Math.random()*234567;
HelichalGame.prototype.adjustY = function() {
	cnvs.height=window.innerHeight;
	this.py=cnvs.height-this.psz-2;
	maxpy=this.py;
};
HelichalGame.prototype.keepAwake = function() {
	if(window.plugins&&window.plugins.insomnia&&!this.stayingAwake) {
		window.plugins.insomnia.keepAwake();
		this.stayingAwake=true;
	}
};
HelichalGame.prototype.allowSleep = function() {
	if(window.plugins&&window.plugins.insomnia&&this.stayingAwake) {
		window.plugins.insomnia.allowSleepAgain();
		this.stayingAwake=false;
	}
};
HelichalGame.prototype.pickColor = function() {this.pclr = pclrs[Math.floor(Math.random()*pclrs.length)];};
HelichalGame.prototype.drawGM = function(m,mty,a) {
	if(!(m in gamemodes)) return;
	var M = gamemodes[m];
	var txm = M.name+a;
	ctx.font=Math.floor(cnvs.height/20)+"px monospace";
	var msm = ctx.measureText(txm);
	ctx.fillStyle=M.color;
	ctx.fillRect(0,mty-cnvs.height*.06,cnvs.width,cnvs.height*.06);
	ctx.fillStyle="black";
	ctx.fillText(txm,cnvs.width/2-msm.width/2,mty-cnvs.height*.01);
};
HelichalGame.prototype.getHighscore = function() {
	var hsk = this.gamemode==0?"helichalHighscore":("helichalGM"+this.gamemode+"HS");
	if(hsk in localStorage) {
		var high = parseInt(localStorage.getItem(hsk));
	}
	else {
		var high = -1;
	}
	return high;
};
HelichalGame.prototype.saveHighscore = function(high) {
	var hsk = this.gamemode==0?"helichalHighscore":("helichalGM"+this.gamemode+"HS");
	localStorage.setItem(hsk,high);
};
HelichalGame.prototype.drawChar = function(x,y,clr) {
	if(this.strobe) this.pickColor();
	ctx.fillStyle=clr?clr:this.pclr;
	ctx.fillRect(x,y,this.psz,this.psz);
	ctx.fillStyle="yellow";
	ctx.fillRect(x+this.psz/5,y+this.psz/5,this.psz/5,this.psz/((this.dir0time>60&&this.dir0time<65)?10:5));
	ctx.fillRect(x+this.psz*3/5,y+this.psz/5,this.psz/5,this.psz/((this.dir0time>60&&this.dir0time<65)?10:5));
	ctx.fillStyle="black";
	var dir = accel.x<-1?-1:(accel.x>1?1:0);
	if(dir==0) {
		this.dir0time++;
		if(this.dir0time>240&&Math.random()<0.1) this.dir0time=1;
	}
	else {
		this.dir0time=0;
	}
	var ex = x+this.psz*(dir==-1?.6:(dir==1?.7:.65));
	var ey = y+this.psz*(dir==0?.22:.25);
	ctx.fillRect(ex,ey,this.psz/10,this.psz/10);
	ctx.fillRect(ex-this.psz*.4,ey,this.psz/10,this.psz/10);
};
HelichalGame.prototype.draw = function() {
	if(this.state==1||this.state==-3||this.state==-6.9) {
		ctx.clearRect(0,0,cnvs.width,cnvs.height);
		for(var e in conother) {
			if(conother[e].x) {
				var coy = conother[e].y*(cnvs.width/240);
				if(conother[e].y>this.prog&&coy-this.psz<this.prog*(cnvs.width/240)+cnvs.height) {
					this.drawChar(conother[e].x*(cnvs.width/240),cnvs.height-(coy-this.prog*(cnvs.width/240)),conother[e].c);
				}
			}
		}
		this.drawChar(this.px,this.py);
		for(var p=0;p<this.platforms.length;p++) {
			var cp = this.platforms[p];	
			if(isNaN(cp.h)) continue;
			ctx.fillStyle="blue";
			ctx.fillRect(0,cnvs.height*.94-cp.h,cp.x,cnvs.height*.06);
			if(cp.x<cnvs.width*2/3) {
				ctx.fillRect(cp.x+cnvs.width/3,cnvs.height*.94-cp.h,cnvs.width*2/3-cp.x,cnvs.height*.06);
			}
		}
		if(this.isGM(4)) {
			if(this.tappity < 0) {
				var txtT = "TAP!";
				ctx.fillStyle="red";
				ctx.font=(24*cnvs.width/240)+"pt serif";
				var msT = ctx.measureText(txtT);
				ctx.fillText(txtT,cnvs.width/2-msT.width/2,cnvs.height/2);
				ctx.fillRect(cnvs.width/6,cnvs.height/2,cnvs.width*2/3+(this.tappity*cnvs.width*2/3)/this.dtt,cnvs.height*0.05);
			}
		}
		if(this.state==1||this.state==-6.9) {
			ctx.fillStyle="black";
			ctx.font=(12*cnvs.width/240)+"pt serif";
			var txt1 = "Score: "+this.score;
			ctx.fillText(txt1,0,cnvs.height-3);
		}
		if(this.state==1) {
			var high = this.getHighscore();
			var txt2 = "High Score: "+high;
			var ms2 = ctx.measureText(txt2);
			if(high>-1&&(ctx.measureText(txt1).width+ms2.width+20<cnvs.width)) {
				ctx.fillText(txt2,cnvs.width-ms2.width,cnvs.height-3);
			}
			//pause bars
			ctx.fillStyle="#ddd";
			ctx.fillRect(cnvs.width/25,(this.gamemode!=0?cnvs.height*0.06:0)+cnvs.width/25,cnvs.width/25,cnvs.width*3/25);
			ctx.fillRect(cnvs.width*3/25,(this.gamemode!=0?cnvs.height*0.06:0)+cnvs.width/25,cnvs.width/25,cnvs.width*3/25);
		}
		else if(this.state==-6.9) {
			this.state=-7;
			this.tick();
		}
		else {
			this.state=-2;
		}
	}
	else if(this.state==-2||this.state==-7) {
		ctx.fillStyle="rgba(255,255,255,0.5)";
		ctx.fillRect(0,0,cnvs.width,cnvs.height);
		var high = this.getHighscore();
		var hst = "High Score: ";
		ctx.fillStyle="black";
		if(this.score>high&&this.state==-2) {
			ctx.fillStyle="red";
			hst="New "+hst;
			high = this.score;
			this.saveHighscore(high);
		}
		hst+=high;
		ctx.font=Math.ceil(10*cnvs.width/240)+"pt monospace";
		var msh = ctx.measureText(hst);
		ctx.fillText(hst,cnvs.width/2-msh.width/2,cnvs.height*.53);
		ctx.fillStyle="black";
		ctx.font=(this.state==-7?"italic ":"")+Math.ceil(20*cnvs.width/240)+"pt monospace";
		var txt = this.state==-2?("Score: "+this.score):"Paused";
		var msm = ctx.measureText(txt);
		ctx.fillText(txt,cnvs.width/2-msm.width/2,cnvs.height/2);
		ctx.drawImage(rpimg,cnvs.width*.4,cnvs.height*.55,cnvs.width*.2,cnvs.width*.1);
		ctx.drawImage(mmimg,cnvs.width*.4,cnvs.height*.7,cnvs.width*.2,cnvs.width*.1);
	}
	else if(this.state==0) {
		ctx.clearRect(0,0,cnvs.width,cnvs.height);
		ctx.font=Math.ceil(30*cnvs.width/240)+"pt monospace";
		var msm = ctx.measureText("Helichal");
		ctx.fillStyle="black";
		var sot = (new Date().getTime()/10)%120;
		var diff = Math.min(Math.max(sot-30,0),60)-Math.min(sot,30)-Math.max(0,sot-90);
		ctx.fillText("Helichal",cnvs.width/2-msm.width/2+diff*cnvs.width/960,cnvs.height/2);
		var txt = "Touch anywhere to play!";
		ctx.font=Math.ceil(12*cnvs.width/240)+"pt monospace";
		var msa = ctx.measureText(txt);
		ctx.fillText(txt,cnvs.width/2-msa.width/2,cnvs.height*.6);
		
		var mty = cnvs.height;
		for(var m in gamemodes) {
			if(gamemodes[m].hide) continue;
			this.drawGM(m,mty,"?");
			mty-=cnvs.height*.06;
		}

		ctx.drawImage(stimg,cnvs.width*7/8,0,cnvs.width/8,cnvs.width/8);
		this.drawChar(cnvs.width/2-this.psz/2,cnvs.height/4);
	}
	else if(this.state==7) {
		ctx.clearRect(0,0,cnvs.width,cnvs.height);
		var htx = "Helichal Settings";
		ctx.font=Math.ceil(20*cnvs.width/240)+"px monospace";
		var msh = ctx.measureText(htx);
		ctx.fillStyle="black";
		var y = parseInt(ctx.font);
		ctx.fillText(htx,cnvs.width/2-msh.width/2,y);
		y*=2;
		ctx.font=Math.ceil(16*cnvs.width/240)+"px monospace";
		var sz = parseInt(ctx.font);
		for(var i = 0; i < cbx.length; i++) {
			if(cbx[i].toShow&&!cbx[i].toShow()) continue;
			var txt = cbx[i].txt;
			var msc = ctx.measureText(txt);
			var x = cnvs.width/2-msc.width/2;
			y+=sz*1.5;
			ctx.fillText(txt,x+sz/4,y);
			ctx.strokeStyle="black";
			ctx.strokeRect(x-sz,y-sz,sz,sz);
			if(cbx[i].enabled) {
				ctx.beginPath();
				ctx.moveTo(x-sz*.75,y-sz*.75);
				ctx.lineTo(x-sz*.5,y-sz/4);
				ctx.lineTo(x+sz*.3,y-sz*1.5);
				ctx.stroke();
			}
		}
		ctx.drawImage(okimg, cnvs.width*.3, cnvs.height*.7, cnvs.width*.4, cnvs.width*.2);
		this.drawGM(5,cnvs.height,"");
	}
	else if(this.state==7.5) {
		ctx.clearRect(0,0,cnvs.width,cnvs.height);
		this.drawGM(5,cnvs.height*0.06,"");
		var yo = 0;
		var cm = localStorage.helichalCM;
		if(!cm) cm="";
		for(var m in gamemodes) {
			if(m!=5&&!gamemodes[m].hide) {
				this.drawGM(m,cnvs.height*(0.7-yo),(cm.indexOf(m)>-1)?"!":"?");
				yo+=0.1;
			}
		}
		if(cm.length>1) {
			ctx.drawImage(okimg, cnvs.width*.3, cnvs.height*.8, cnvs.width*.4, cnvs.width*.2);
		}
	}
	if(this.state==1||this.state==-3||this.state==-2) {
		this.drawGM(this.gamemode,cnvs.height*.06,"!");
	}
};
HelichalGame.prototype.tick = function() {
	if(cbx[0].enabled&&window.mus&&(mus.paused||!("paused" in mus))&&!inBack) mus.play();
	if(!cbx[0].enabled&&window.mus&&!mus.paused) mus.pause();
	if(this.state==1) {
		this.keepAwake();
		if(this.conn&&!connseed) {
			rAF(HelichalGame.tickIt);
			return;
		}
		if(!this.seeded) {
			if(connseed) {HelichalGame.seed=connseed;}
			console.log("seed: "+HelichalGame.seed);
			HelichalGame.seed=HelichalGame.seededRandom()*234567;
			this.seeded=true;
		}
		if(this.lastTime) {
			fps = (1000/(new Date().getTime()-this.lastTime));
		}
		else {
			fps = 60;
		}
		this.adj = (60/fps)*(cnvs.width/240);
		if(this.isGM(4)) {
			this.dtt = Math.max(taptime-Math.log(this.prog),10);
		}
		this.px+=accel.x*this.adj*(this.isGM(2)?1.2:1);
		if(this.isGM(1)) {
			this.py=Math.max(Math.min(this.py+accel.y*this.adj,maxpy),0);
		}
		this.genPlatforms();
		if(this.px<0) {this.px=0;}
		if(this.px+this.psz>cnvs.width) {this.px=cnvs.width-this.psz}
		this.lastTime=new Date().getTime();
		var platmove = (this.isGM(2)?2.85:1)*this.adj;
		this.prog += platmove/(cnvs.width/240);
		for(var p = 0; p < this.platforms.length; p++) {
			var cp = this.platforms[p];
			cp.h-=platmove;
			if(this.isGM(3)&&!cp.stable) {
				cp.x+=cp.rev?-1:1;
				if(cp.x+cnvs.width/3>=cnvs.width) {
					cp.rev=true;
				}
				if(cp.x<=0) {
					cp.rev=false;
				}
			}
			if(this.py<cnvs.height-cp.h&&this.py+this.psz>cnvs.height*.94-cp.h&&(this.px<cp.x||this.px+this.psz>cp.x+cnvs.width/3)) {
				this.die();
			}
		}
		if(this.isGM(4)) {
			if(this.tappity===undefined) {
				this.tappity=20;
			}
			this.tappity-=(60/fps)*(1+(this.score/400));
			if(this.tappity<-this.dtt) {
				this.die();
			}
		}
		if(this.state==-3) {
			this.draw();
		}
		if(this.platforms[0].h<-cnvs.height*.06) {
			this.platforms.shift();
			this.score++;
		}
		if(this.conn) {
			this.conn.send("move:"+this.px/(cnvs.width/240)+":"+(this.prog+(cnvs.height-this.py)*(cnvs.width/240)));
		}
	}
	else {
		this.allowSleep();
	}
	this.draw();
	if(this.state==-2) {this.state=-42;}
	if(this.state==-7) {this.state=-67;}
	if(this.state==0) {document.getElementById('inp').style.zIndex=-1;}
	if(this.state===0||this.state==1) {
		rAF(HelichalGame.tickIt);
	}
};
HelichalGame.tickIt = function() {HelichalGame.currentGame.tick();};
HelichalGame.fire = function(x) {
	return HelichalGame.currentGame[x].apply(HelichalGame.currentGame,arguments);
}
HelichalGame.prototype.genPlatforms = function() {
	while(this.platforms[this.platforms.length-1].h<cnvs.height) {
		var lp = this.platforms[this.platforms.length-1];
		var npx = Math.floor(HelichalGame.seededRandom()*(cnvs.width*.8));
		var nph = lp.h+Math.max(0,Math.min(cnvs.height*0.2*(1-this.score/1000)+Math.abs(npx-lp.x)*(this.isGM(2)?2:1)/((5-HelichalGame.seededRandom()*(4-this.score/100))*this.adj),cnvs.height));
		if(!isNaN(nph)) {
			this.platforms.push({x: npx, h: nph});
		}
	}
};
HelichalGame.prototype.click = function(x,y) {
	if(this.state==-42||this.state==-67) {
		if(x>cnvs.width*.4&&x<cnvs.width*.6&&y>cnvs.height*.55&&y<cnvs.height*.55+cnvs.width*.1) {
			if(this.state==-42) {
				var ng = new HelichalGame(undefined,this.gamemode);
				if(this.strobe) ng.strobe=this.strobe;
				ng.tick();
			}
			else {
				this.state=1;
				delete this.lastTime;
				this.tick();
			}
		}
		else if(x>cnvs.width*.4&&x<cnvs.width*.6&&y>cnvs.height*.7&&y<cnvs.height*.7+cnvs.width*.1) {
			var ng = new HelichalGame(0);
			ng.tick();
		}
		if(y<cnvs.height/10) {
			this.secret.up=this.secret.up?this.secret.up+1:1;
		}
		if(y>cnvs.height*.9) {
			this.secret.down=this.secret.down?this.secret.down+1:1;
			if(this.secret.down==2&&this.secret.up>1) this.strobe=!this.strobe;
		}
	}
	else if(this.state==0) {
		var toState=1;
		var msy = cnvs.height;
		for(var m in gamemodes) {
			msy-=0.06*cnvs.height;
			if(y>msy) {
				this.setGamemode(m);
				console.log(m);
				break;
			}
			else {
				console.log(y);
				console.log(msy);
			}
		}
		if(x>cnvs.width*3/4&&y<cnvs.width/4) {toState=7;}
		this.state=toState;
		this.tick();
	}
	else if(this.state==1) {
		if(x<cnvs.width/5&&y<(this.gamemode!=0?cnvs.height*0.06:0)+cnvs.width/5) {
			this.state=-6.9;
		}
		if(this.isGM(4)) {
			if(this.tappity<0) {
				this.tappity=Math.random()*(300-this.score/3);
			}
			else if(this.state==1) {
				this.die();
			}
		}
		if(this.state==-3) {this.draw();}
	}
	else if(this.state==7) {
		var ty = Math.ceil(20*cnvs.width/240)*2;
		for(var i = 0; i < cbx.length; i++) {
			if(cbx[i].toShow&&!cbx[i].toShow()) continue;
			var ny = ty+Math.ceil(16*cnvs.width/240)*1.5;
			if(y>ty&&y<ny) {
				cbx[i].enabled=!cbx[i].enabled;
				localStorage.setItem("helichalOption"+i,cbx[i].enabled);
				this.tick();
			}
			ty=ny;
		}
		if(x>cnvs.width*.3&&x<cnvs.width*.7&&y>cnvs.height*.7&&y<cnvs.height*.7+cnvs.width*.2) {
			this.state=0;
			this.tick();
		}
		if(y>cnvs.height*.94) {
			this.state=7.5;
			this.tick();
		}
	}
	else if(this.state==7.5) {
		var yo = 0.7;
		var cm = localStorage.helichalCM;
		if(!cm) cm="";
		for(var m in gamemodes) {
			if(m!=5&&!gamemodes[m].hide) {
				if(y<yo*cnvs.height&&y>(yo-0.06)*cnvs.height) {
					if(cm.indexOf(m)>-1) {
						cm = cm.replace(m,"");
					}
					else {
						cm+=m;
					}
				}
				yo-=0.1;
			}
		}
		localStorage.helichalCM=cm;
		if(x>cnvs.width*.3&&x<cnvs.width*.7&&y>cnvs.height*.8&&y<cnvs.height*.8+cnvs.width*.2&&cm.length>1) {
			this.state=7;
			delete gamemodes[5].hide;
		}
		this.tick();
	}
};
HelichalGame.prototype.touchstart = function($0, e) {
	var x = e.changedTouches[0].clientX;
	var y = e.changedTouches[0].clientY;
	this.click(x,y);
	disableMouse=true;
};
HelichalGame.prototype.mousestart = function($0, e) {
	if(!disableMouse) {
		console.log(e);
		this.click(e.pageX,e.pageY);
	}
};
HelichalGame.seededRandom = function(max, min) {
	max = max || 1;
	min = min || 0;
	HelichalGame.seed = (HelichalGame.seed * 9301 + 49297) % 233280;
	var rnd = HelichalGame.seed / 233280;
	return min + rnd * (max - min);
}
accel = {x:0,y:0};

var orient = function(e) {
	accel.x=Math.min(5,e.gamma/9);
	accel.y=Math.min(5,e.beta/9);
};
function onLoad() {
	console.log("loaded");
	rpimg = document.createElement('img');
	rpimg.src="img/replay.png";
	mmimg = document.createElement('img');
	mmimg.src="img/menu.png";
	okimg = document.createElement('img');
	okimg.src="img/okimg.png";
	stimg = document.createElement('img');
	stimg.src="img/gear.png";
	if(window.cordova) {
		document.addEventListener("deviceready", onReady);
	}
	if(!("Media" in window)) {
		mus = document.createElement('audio');
		var asrc = document.createElement('source');
		asrc.src="sound/pi.mp3";
		asrc.type="audio/mpeg";
		mus.appendChild(asrc);
		var asrc2 = document.createElement('source');
		asrc2.src="sound/pi.ogg";
		asrc2.type="audio/ogg";
		mus.appendChild(asrc2);
		mus.loop=true;
	}
	if(!window.cordova) {
		onReady("trololol");
	}
}
function onResume() {
	if(window.mus&&cbx[0].enabled) mus.play();
	inBack=false;
}
function onPause() {
	if(window.mus) mus.pause();
	inBack=true;
	if(HelichalGame.currentGame.state==1) {
		HelichalGame.currentGame.state=-6.9;
	}
}
function onBack() {
	if(HelichalGame.currentGame.state==1) {
		HelichalGame.currentGame.state=-6.9;
	}
}
isAlreadyReady=false;
function onReady(t) {
	if(isAlreadyReady) return;
	isAlreadyReady=true;
	console.log("ready");
	if(t!="trololol"&&window.Media) mus=new Media(location.href.substring(0,location.href.indexOf('www/')+4)+'sound/pi.mp3');
	if(t!="trololol") {
		document.addEventListener("pause",onPause);
		document.addEventListener("resume",onResume);
		document.addEventListener("backbutton",onBack);
		if("plugins" in window && "AdMob" in window.plugins) {
			var admob = window.plugins.AdMob;
			admob.setOptions({
				publisherId: "ca-app-pub-8192472098497743/5140228512",
				bannerAtTop: true
			});
			admob.createBannerView();
		}
		if(window.Media) {
			mus.setVolume(0);mus.play();mus.pause();mus.setVolume(1);
		}
	}
	cnvs = document.getElementById('cnvs');
	cnvs.width=window.innerWidth;
	ctx = cnvs.getContext('2d');
	var game = new HelichalGame(0);
	game.tick();
	window.addEventListener("deviceorientation", orient);
	window.addEventListener("touchstart", HelichalGame.fire.bind(HelichalGame,"touchstart"));
	window.addEventListener("mousedown", HelichalGame.fire.bind(HelichalGame,"mousestart"));
	window.addEventListener("resize", HelichalGame.fire.bind(HelichalGame,"adjustY"));
};
