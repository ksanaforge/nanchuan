/*
TODO , normalize all traditional and variants to simplified Chinese
*/


var nanchuan="/CBReader/XML_n/N*/*.xml";//T01n0001_001
var tei=require("ksana-document").tei;
var juanstart=0;
var njuan=0;
var filename2sutrano=function(fn) {
	var m=fn.match(/n(.*?)_/);
	if (m) return m[1];
}

var do_ref=function(text,tag,attributes,status) {
	var target=attributes["target"];
	if (!target)return null	;
	target=target.replace("#PTS.","");
	return [
		{path:["pts"], value:target  }
		,{path:["pts_voff"], value:status.vpos }
	]
}
var do_juan=function(text,tag,attributes,status) {
	if (attributes["unit"]=="juan") {
		return [
			{path:["juan"], value:attributes.n  }
			,{path:["juan_voff"], value: status.vpos }
		]
	}
	return null;
}

//from CBReader/Toc/N00.toc
var folder2name=[
[ 1 ,"律藏",1],
[ 1 ,"經分別",2],
[ 1 ,"律藏一　經分別一",3],
[ 2 ,"律藏二　經分別二",3],
[ 3 ,"犍度及附隨",2],
[ 3 ,"律藏三　犍度一　大品",3],
[ 4 ,"律藏四　犍度二　小品",3],
[ 5 ,"律藏五　附隨",3],
[ 6 ,"經藏",1],
[ 6 ,"長部",2],
[ 6 ,"長部經典一",3],
[ 7 ,"長部經典二",3],
[ 8 ,"長部經典三",3],
[ 9 ,"中部",2],
[ 9 ,"中部經典一",3],
[10 ,"中部經典二",3],
[11 ,"中部經典三",3],
[12 ,"中部經典四",3],
[13 ,"相應部",2],
[13 ,"相應部經典一　有偈篇",3],
[14 ,"相應部經典二　因緣篇",3],
[15 ,"相應部經典三　犍度篇",3],
[16 ,"相應部經典四　六處篇（第一～七）",3],
[17 ,"相應部經典五　六處篇下、大篇上",3],
[18 ,"相應部經典六　大篇下",3],
[19 ,"增支部",2],
[19 ,"增支部經典一　一～三集",3],
[20 ,"增支部經典二　四集",3],
[21 ,"增支部經典三　五集",3],
[22 ,"增支部經典四　六～七集",3],
[23 ,"增支部經典五　八集",3],
[24 ,"增支部經典六　九集、一〇集上",3],
[25 ,"增支部經典七　一〇集下、十一集",3],
[26 ,"小部一",2],
[26 ,"小部經典一　小誦經、法句經、自說經、如是語經",3],
[27 ,"小部經典二　經集、天宮事經",3],
[28 ,"小部經典三　長老〔尼〕偈經、餓鬼事經",3],
[29 ,"小部經典四　譬喻經一",3],
[30 ,"小部經典五　譬喻經二",3],
[31 ,"小部二-本生",2],
[31 ,"小部經典六　本生經一",3],
[32 ,"小部經典七　本生經二",3],
[33 ,"小部經典八　本生經三",3],
[34 ,"小部經典九　本生經四",3],
[35 ,"小部經典十　本生經五",3],
[36 ,"小部經典十一　本生經六",3],
[37 ,"小部經典十二　本生經七",3],
[38 ,"小部經典十三　本生經八",3],
[39 ,"小部經典十四　本生經九",3],
[40 ,"小部經典十五　本生經十",3],
[41 ,"小部經典十六　本生經十一",3],
[42 ,"小部經典十七　本生經十二",3],
[31 ,"小部三-其他",2],
[43 ,"小部經典十八　無礙解道一",3],
[44 ,"小部經典十九　無礙解道二",3],
[45 ,"小部經典二十　大義釋一",3],
[46 ,"小部經典二十一　大義釋二",3],
[47 ,"小部經典二十二　小義釋",3],
[48 ,"論藏",1],
[48 ,"七部論",2],
[48 ,"法集論",3],
[49 ,"分別論一",3],
[50 ,"分別論二、界論、人施設論",3],
[51 ,"雙論一（根雙論）",3],
[52 ,"雙論二（隨眠雙論）",3],
[53 ,"雙論三（心雙論……）",3],
[54 ,"發趣論一（順三法發趣第一）",3],
[55 ,"發趣論二（順三法發趣第二～八）",3],
[56 ,"發趣論三（順三法發趣第九～二二）",3],
[57 ,"發趣論四（順二法發趣第一～五四）",3],
[58 ,"發趣論五（順二法發趣第五五～一〇〇）",3],
[59 ,"發趣論六（順二法三法發趣）",3],
[60 ,"發趣論七（順三法三法發趣）",3],
[61 ,"論事一（第一～五品）",3],
[62 ,"論事二（第六～二三品）",3],
[63 ,"其他",2],
[63 ,"彌蘭王問經一",3],
[64 ,"彌蘭王問經二",3],
[65 ,"島王統史、大王統史（第一～三七章）",3],
[66 ,"小大統史（第三七～一〇一章）",3],
[67 ,"清淨道論一（第一～七品）",3],
[68 ,"清淨道論二（第八～一三品）",3],
[69 ,"清淨道論三（第一四～二三品）",3],
[70 ,"一切善見律註序、攝阿毘達磨義論、阿育王刻文",3]
];


var folder=0,lastfolder=0,newfolder=0;
var extramulu=function(vpos) {
	var res=[];
	if (newfolder>0) {
		for (var i=0;i<folder2name.length;i++){
			var toc=folder2name[i];
			if (toc[0]==newfolder) {
				res.push(
					{path:["mulu_depth"], value:toc[2] }
					,{path:["mulu"], value:toc[1]+"(v"+toc[0]+")"  }
					,{path:["mulu_voff"], value: vpos }
				);
			}
		}
		newfolder=-1;	
	}
	
	return res;
}
var do_mulu=function(text,tag,attributes,status) {
	var res=[];
	if (!attributes["level"]) return null;
		//console.log(text,attributes.level);
	var level=parseInt(attributes.level);

	var res=extramulu(status.vpos);

	res=res.concat([
		{path:["mulu_depth"], value:level+3 }
		,{path:["mulu"], value:text  }
		,{path:["mulu_voff"], value: status.vpos }
	]);
	return res;
}

var captureTags={
	"milestone":do_juan,
	"cb:mulu":do_mulu,
	"ref":do_ref
};

var beforebodystart=function(s,status) {
}
var afterbodyend=function(s,status) {
	//status has parsed body text and raw body text, raw start text
	var apps=tei(status.starttext+s,status.parsed,status.filename,config,status);
	//console.log(apps)
}
var warning=function() {
	console.log.apply(console,arguments);
}

var getFolder=function(fn) {
	var idx=fn.lastIndexOf("/");
	folder=parseInt(fn.substr(idx+2,2));
	return folder;
}
var onFile=function(fn) {
	var folder=getFolder(fn);
	if (folder!=lastfolder) {
		newfolder=folder;
	}
	lastfolder=folder;
//	process.stdout.write("indexing "+fn+"\033[0G");
}
var setupHandlers=function() {
	this.addHandler("cb:div/p/note", require("./note"));
//	this.addHandler("cb:div/p/app", require("./apparatus"));
	this.addHandler("cb:div/p/choice", require("./choice"));
//	this.addHandler("cb:div/p/cb:tt", require("./cbtt"));
}
var finalized=function(session) {
	console.log("VPOS",session.vpos);
	console.log("FINISHED");
}
var finalizeField=function(fields) {

}
var beforeParseTag=function(xml) {
	//make <back> as root node
	var back=xml.indexOf("<back>");
	xml=xml.substr(back);
	xml=xml.replace("</text></TEI>","");
	return xml;
}
var config={
	name:"nanchuan"
	,meta:{
		config:"simple1"	
	}
	,glob:nanchuan
	,pageSeparator:"pb.n"
	,format:"TEI-P5"
	,bodystart: "<body>"
	,bodyend : "</body>"
	,reset:true
	,setupHandlers:setupHandlers
	,finalized:finalized
	,finalizeField:finalizeField
	,warning:warning
	,captureTags:captureTags
	,callbacks: {
		beforebodystart:beforebodystart
		,afterbodyend:afterbodyend
		,onFile:onFile
		,beforeParseTag:beforeParseTag
	}
}
setTimeout(function(){ //this might load by gulpfile-app.js
	if (!config.gulp) {
		var kd=require("ksana-document");
		if (kd && kd.build) kd.build();
	}
},100)
module.exports=config;