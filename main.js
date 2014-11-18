function rAF(f) {
	if(window.requestAnimationFrame) {window.requestAnimationFrame(f);}
	else {setTimeout(f,33);}
}
pclrs = ["red","lime","cyan"];
var HelichalGame = function(st) {
	HelichalGame.currentGame=this;
	this.px=window.innerWidth*.45;
	this.psz=window.innerWidth*.1;
	this.py=window.innerHeight-this.psz-2;
	this.platforms = [{x: window.innerWidth*.4, h: window.innerHeight/5}];
	this.score=0;
	this.state=st===undefined?1:st;
	this.dir0time=0;
	this.pickColor();
	this.secret={};
};
HelichalGame.prototype.pickColor = function() {this.pclr = pclrs[Math.floor(Math.random()*pclrs.length)];};
HelichalGame.prototype.draw = function() {
	if(this.state==1) {
		ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
		if(this.strobe) this.pickColor();
		ctx.fillStyle=this.pclr;
		ctx.fillRect(this.px,this.py,this.psz,this.psz);
		ctx.fillStyle="yellow";
		ctx.fillRect(this.px+this.psz/5,this.py+this.psz/5,this.psz/5,this.psz/((this.dir0time>30&&this.dir0time<35)?10:5));
		ctx.fillRect(this.px+this.psz*3/5,this.py+this.psz/5,this.psz/5,this.psz/((this.dir0time>30&&this.dir0time<35)?10:5));
		ctx.fillStyle="black";
		var dir = accel.x<-1?-1:(accel.x>1?1:0);
		if(dir==0) {
			this.dir0time++;
		}
		else {
			this.dir0time=0;
		}
		var ex = this.px+this.psz*(dir==-1?.6:(dir==1?.7:.65));
		var ey = this.py+this.psz*(dir==0?.22:.25);
		ctx.fillRect(ex,ey,this.psz/10,this.psz/10);
		ctx.fillRect(ex-this.psz*.4,ey,this.psz/10,this.psz/10);
		for(var p=0;p<this.platforms.length;p++) {
			var cp = this.platforms[p];	
			if(isNaN(cp.h)) continue;
			ctx.fillStyle="blue";
			ctx.fillRect(0,window.innerHeight*.97-cp.h,cp.x,window.innerHeight*.06);
			ctx.fillRect(cp.x+window.innerWidth/3,window.innerHeight*.97-cp.h,window.innerWidth*2/3-cp.x,window.innerHeight*.06);
		}
		ctx.fillStyle="black";
		ctx.font=(12*window.innerWidth/240)+"pt serif";
		ctx.fillText("Score: "+this.score,0,window.innerHeight-3);
	}
	else if(this.state==-2) {
		ctx.fillStyle="rgba(255,255,255,0.5)";
		ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
		if("helichalHighscore" in localStorage) {
			var high = parseInt(localStorage.getItem("helichalHighscore"));
		}
		else {
			var high = -1;
		}
		var hst = "High Score: ";
		ctx.fillStyle="black";
		if(this.score>high) {
			ctx.fillStyle="red";
			hst="New "+hst;
			high = this.score;
			localStorage.setItem("helichalHighscore",high);
		}
		hst+=high;
		ctx.font=Math.ceil(10*window.innerWidth/240)+"pt monospace";
		var msh = ctx.measureText(hst);
		ctx.fillText(hst,window.innerWidth/2-msh.width/2,window.innerHeight*.53);
		ctx.fillStyle="black";
		ctx.font=Math.ceil(20*window.innerWidth/240)+"pt monospace";
		var txt = "Score: "+this.score;
		var msm = ctx.measureText(txt);
		ctx.fillText(txt,window.innerWidth/2-msm.width/2,window.innerHeight/2);
		ctx.drawImage(rpimg,window.innerWidth*.4,window.innerHeight*.55,window.innerWidth*.2,window.innerWidth*.1);
	}
	else if(this.state==0) {
		ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
		ctx.font=Math.ceil(30*window.innerWidth/240)+"pt monospace";
		var msm = ctx.measureText("Helichal");
		ctx.fillStyle="black";
		var sot = (new Date().getTime()/10)%120;
		var diff = Math.min(Math.max(sot-30,0),60)-Math.min(sot,30)-Math.max(0,sot-90);
		ctx.fillText("Helichal",window.innerWidth/2-msm.width/2+diff*window.innerWidth/960,window.innerHeight/2);
		var txt = "Touch anywhere to play!";
		ctx.font=Math.ceil(12*window.innerWidth/240)+"pt monospace";
		var msa = ctx.measureText(txt);
		ctx.fillText(txt,window.innerWidth/2-msa.width/2,window.innerHeight*.6);
	}
};
HelichalGame.prototype.tick = function() {
	if(this.state==1) {
		if(window.plugins&&window.plugins.insomnia) {window.plugins.insomnia.keepAwake();}
		if(this.lastTime) {
			fps = (1000/(new Date().getTime()-this.lastTime));
		}
		else {
			fps = 60;
		}
		this.adj = (60/fps)*(window.innerWidth/240);
		this.px+=accel.x*this.adj;
		this.genPlatforms();
		if(this.px<0) {this.px=0;}
		if(this.px+this.psz>window.innerWidth) {this.px=window.innerWidth-this.psz}
		this.lastTime=new Date().getTime();
		for(var p = 0; p < this.platforms.length; p++) {
			var cp = this.platforms[p];
			cp.h-=this.adj;
			if(this.py<window.innerHeight-cp.h&&window.innerHeight>window.innerHeight*.95-cp.h&&(this.px<cp.x||this.px+this.psz>cp.x+window.innerWidth/3)) {
				this.state=-2;
				//this.draw();
			}
		}
		if(this.platforms[0].h<-window.innerHeight*.06) {
			this.platforms.shift();
			this.score++;
		}
	}
	else {
		if(window.plugins&&window.plugins.insomnia) {window.plugins.insomnia.allowSleepAgain();}
	}
	this.draw();
	if(this.state==-2) {this.state=-42;}
	if(this.state===0||this.state==1) {
		rAF(HelichalGame.tickIt);
	}
};
HelichalGame.tickIt = function() {HelichalGame.currentGame.tick();};
HelichalGame.fire = function(x) {
	return HelichalGame.currentGame[x].apply(HelichalGame.currentGame,arguments);
}
HelichalGame.prototype.genPlatforms = function() {
	while(this.platforms[this.platforms.length-1].h<window.innerHeight) {
		var lp = this.platforms[this.platforms.length-1];
		var npx = Math.floor(Math.random()*(window.innerWidth*.8));
		var nph = lp.h+window.innerHeight*.2+Math.abs(npx-lp.x)/((5-Math.random()*(4-this.score/100))*this.adj);
		
		this.platforms.push({x: npx, h: nph});
	}
};
HelichalGame.prototype.touchstart = function($0, e) {
	if(this.state==-42) {
		console.log(e);
		var x = e.changedTouches[0].clientX;
		var y = e.changedTouches[0].clientY;
		if(x>window.innerWidth*.4&&x<window.innerWidth*.6&&y>window.innerHeight*.55&&y<window.innerHeight*.55+window.innerWidth*.1) {
			var ng = new HelichalGame();
			if(this.strobe) ng.strobe=this.strobe;
			ng.tick();
		}
		if(y<window.innerHeight/10) {
			this.secret.up=this.secret.up?this.secret.up+1:1;
		}
		if(y>window.innerHeight*.9) {
			this.secret.down=this.secret.down?this.secret.down+1:1;
			if(this.secret.down==2&&this.secret.up>1) this.strobe=!this.strobe;
		}
	}
	else if(this.state==0) {
		this.state=1;
		this.tick();
	}
};
accel = {x: 0};

var orient = function(e) {
	accel.x=Math.min(5,e.gamma/9);
};
function onLoad() {
	console.log("loaded");
	document.addEventListener("deviceready", onReady);
	rpimg = document.createElement('img');
	rpimg.src="img/replay.png";
}
function onReady() {
	console.log("ready");
	var cnvs = document.getElementById('cnvs');
	cnvs.width=window.innerWidth;
	cnvs.height=window.innerHeight;
	ctx = cnvs.getContext('2d');
	var game = new HelichalGame(0);
	game.tick();
	window.addEventListener("deviceorientation", orient);
	window.addEventListener("touchstart", HelichalGame.fire.bind(HelichalGame,"touchstart"));
};
