function rAF(f) {
	if(window.requestAnimationFrame) {window.requestAnimationFrame(f);}
	else {setTimeout(f,33);}
}
pclrs = ["red","lime","cyan","orange"];
var HelichalGame = function(st,gm) {
	HelichalGame.currentGame=this;
	this.px=cnvs.width*.45;
	this.psz=cnvs.width*.1;
	this.py=cnvs.height-this.psz-2;
	maxpy=this.py;
	this.platforms = [{x: cnvs.width*.4, h: cnvs.height/5}];
	this.score=0;
	this.state=st===undefined?1:st;
	this.dir0time=0;
	this.pickColor();
	this.secret={};
	this.gamemode=gm?gm:0;
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
HelichalGame.prototype.draw = function() {
	if(this.state==1||this.state==-3) {
		ctx.clearRect(0,0,cnvs.width,cnvs.height);
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
			ctx.fillRect(0,cnvs.height*.94-cp.h,cp.x,cnvs.height*.06);
			ctx.fillRect(cp.x+cnvs.width/3,cnvs.height*.94-cp.h,cnvs.width*2/3-cp.x,cnvs.height*.06);
		}
		if(this.state==1) {
			ctx.fillStyle="black";
			ctx.font=(12*cnvs.width/240)+"pt serif";
			ctx.fillText("Score: "+this.score,0,cnvs.height-3);
		}
		else {
			this.state=-2;
		}
	}
	else if(this.state==-2) {
		ctx.fillStyle="rgba(255,255,255,0.5)";
		ctx.fillRect(0,0,cnvs.width,cnvs.height);
		var hsk = this.gamemode==0?"helichalHighscore":("helichalGM"+this.gamemode+"HS");
		if(hsk in localStorage) {
			var high = parseInt(localStorage.getItem(hsk));
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
			localStorage.setItem(hsk,high);
		}
		hst+=high;
		ctx.font=Math.ceil(10*cnvs.width/240)+"pt monospace";
		var msh = ctx.measureText(hst);
		ctx.fillText(hst,cnvs.width/2-msh.width/2,cnvs.height*.53);
		ctx.fillStyle="black";
		ctx.font=Math.ceil(20*cnvs.width/240)+"pt monospace";
		var txt = "Score: "+this.score;
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
		
		var txt2 = "Free Fly Mode?";
		ctx.font=Math.floor(cnvs.height/20)+"px monospace";
		var ms2 = ctx.measureText(txt2);
		ctx.fillStyle="red";
		ctx.fillRect(0,cnvs.height*.94,cnvs.width,cnvs.height*.06);
		ctx.fillStyle="black";
		ctx.fillText(txt2,cnvs.width/2-ms2.width/2,cnvs.height*.99);
		
		var txt3 = "Lightning Mode?";
		var ms3 = ctx.measureText(txt3);
		ctx.fillStyle="yellow";
		ctx.fillRect(0,cnvs.height*.88,cnvs.width,cnvs.height*.06);
		ctx.fillStyle="black";
		ctx.fillText(txt3,cnvs.width/2-ms3.width/2,cnvs.height*.93);
	}
};
HelichalGame.prototype.tick = function() {
	if(this.state==1) {
		this.keepAwake();
		if(this.lastTime) {
			fps = (1000/(new Date().getTime()-this.lastTime));
		}
		else {
			fps = 60;
		}
		this.adj = (60/fps)*(cnvs.width/240);
		this.px+=accel.x*this.adj;
		if(this.gamemode==1) {
			this.py=Math.max(Math.min(this.py+accel.y*this.adj,maxpy),0);
		}
		this.genPlatforms();
		if(this.px<0) {this.px=0;}
		if(this.px+this.psz>cnvs.width) {this.px=cnvs.width-this.psz}
		this.lastTime=new Date().getTime();
		for(var p = 0; p < this.platforms.length; p++) {
			var cp = this.platforms[p];
			cp.h-=this.adj*(this.gamemode==2?3:1);
			if(this.py<cnvs.height-cp.h&&this.py+this.psz>cnvs.height*.94-cp.h&&(this.px<cp.x||this.px+this.psz>cp.x+cnvs.width/3)) {
				this.state=-3;
			}
		}
		if(this.state==-3) {
			this.draw();
		}
		if(this.platforms[0].h<-cnvs.height*.06) {
			this.platforms.shift();
			this.score++;
		}
	}
	else {
		this.allowSleep();
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
	while(this.platforms[this.platforms.length-1].h<cnvs.height) {
		var lp = this.platforms[this.platforms.length-1];
		var npx = Math.floor(Math.random()*(cnvs.width*.8));
		var nph = lp.h+Math.min(cnvs.height*.2+Math.abs(npx-lp.x)/((5-Math.random()*(4-this.score/100))*this.adj),cnvs.height);
		
		this.platforms.push({x: npx, h: nph});
	}
};
HelichalGame.prototype.click = function(x,y) {
	if(this.state==-42) {
		if(x>cnvs.width*.4&&x<cnvs.width*.6&&y>cnvs.height*.55&&y<cnvs.height*.55+cnvs.width*.1) {
			var ng = new HelichalGame(undefined,this.gamemode);
			if(this.strobe) ng.strobe=this.strobe;
			ng.tick();
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
		if(y>cnvs.height*.94) {this.gamemode=1;}
		else if(y>cnvs.height*.88) {this.gamemode=2;}
		this.state=1;
		this.tick();
	}
};
HelichalGame.prototype.touchstart = function($0, e) {
	var x = e.changedTouches[0].clientX;
	var y = e.changedTouches[0].clientY-adh;
	this.click(x,y);
	disableMouse=true;
};
HelichalGame.prototype.mousestart = function($0, e) {
	if(!disableMouse) {
		console.log(e);
		this.click(e.pageX,e.pageY-adh);
	}
};
accel = {x:0,y:0};

var orient = function(e) {
	accel.x=Math.min(5,e.gamma/9);
	accel.y=Math.min(5,e.beta/9);
};
function onLoad() {
	console.log("loaded");
	if(window.cordova) {
		document.addEventListener("deviceready", onReady);
	}
	else {
		onReady();
	}
	rpimg = document.createElement('img');
	rpimg.src="img/replay.png";
	mmimg = document.createElement('img');
	mmimg.src="img/menu.png";
}
function onReady() {
	console.log("ready");
	adh = document.getElementById('smaatoad').clientHeight;
	cnvs = document.getElementById('cnvs');
	cnvs.width=window.innerWidth;
	cnvs.height=window.innerHeight-adh;
	cnvs.style.top=adh;
	ctx = cnvs.getContext('2d');
	var game = new HelichalGame(0);
	game.tick();
	window.addEventListener("deviceorientation", orient);
	window.addEventListener("touchstart", HelichalGame.fire.bind(HelichalGame,"touchstart"));
	window.addEventListener("mousedown", HelichalGame.fire.bind(HelichalGame,"mousestart"));
};
