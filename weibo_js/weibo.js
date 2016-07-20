var json_data,
	csv_data=[],
	user_female,
	user_male;
//定义地图SVG
var svg_map=d3.select("#map")
	.append("svg")
	.attr({
		width:document.getElementById("map").clientWidth,
		height:document.getElementById("map").clientHeight-30,
		"id":"map"
	});   //地图SVG
d3.select("svg#map")
	.append("image")
	.attr("xlink:href","weibo_data/bar.png")
	.attr("width",300)
	.attr("height",35)
	.attr("x",100)
	.attr("y",400);
var svg_rank=d3.select("#rank")
	.append("svg")
	.attr({
		width:document.getElementById("rank").clientWidth,
		height:document.getElementById("rank").clientHeight-30,
		"id":"rank"
	}); //排名SVG
var svg_pie=d3.select("#pie")
	.append("svg")
	.attr({
		width:document.getElementById("pie").clientWidth,
		height:document.getElementById("pie").clientHeight-30,
		"id":"pie"
	}); //饼图SVG
var svg_create=d3.select("#create")
	.append("svg")
	.attr({
		width:document.getElementById("create").clientWidth,
		height:document.getElementById("create").clientHeight-30,
		"id":"created_at"
	})
var color=d3.scale.linear()
	.range(["#C4F5FE","#016AB2"]);
var color_bar=d3.scale.linear()
	.range(["#C4F5FE","#016AB2"]);
loadfile();
function loadfile(){
	load_csv();
}
function load_csv(){
	d3.csv("weibo_data/weibo_user.csv",function(data){
		csv_data=data;//csv赋值给全局变量
		load_json();
		console.log("csv加载完毕,长度为:"+csv_data.length);
	})
}
function load_json(){
	d3.json("weibo_json/china.json",function(error,json){

		json_data=json; //json赋值给全局变量
		console.log("json加载完毕,长度为:"+json.features.length);

		var g_map=svg_map.append("g")
			.attr("id","map");
		//定义投影
		var projection=d3.geo.mercator()
			.center([107,31])
			.scale(2800)
			.translate([280,270]);

		var path_map=d3.geo.path()
			.projection(projection);

		data_pro_all();
		creat_table_data("全国","0");
		create(0);
		//为color输入赋值
		var json_features=json_data.features;
		color.domain([
			d3.min(json_features,function(d){return parseFloat(d.properties.usernum);}),
			d3.max(json_features,function(d){return parseFloat(d.properties.usernum);})
		]);
		//显示地图
		g_map.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr({
				"stroke":"#3399FF",
				"stroke-width":1,
				"d":path_map,
			})
			.attr("fill",function(d){
				return color(d.properties.usernum);
			})
			.on("click",function(d){
				d3.select("g#map")
					.selectAll("path")
					.data(json.features)
					.attr("fill",function(d){
						return color(d.properties.usernum);
					})
				d3.select(this)
					.attr("fill","yellow")
				data_pro(d.properties.id);
				create(d.properties.id);
			})
		show_rank_all();
	})
}
function data_pro(flag){
	var i=0;
	for(i;i<json_data.features.length;++i){
		if(json_data.features[i].properties.id==flag){
			break;
		}
	}
	//console.log("当前省份:"+json_data.features[i].properties.name);

	show_pie(json_data.features[i].properties.name,json_data.features[i].properties.user_male,json_data.features[i].properties.user_female);
	show_rank_province(json_data.features[i].properties.name,flag);
	creat_table_data(json_data.features[i].properties.name,flag);
}
function show_pie(flag,male,female){
	//已完成
	//饼图显示
	//console.log("饼图函数");
	d3.select("g#pie")
		.remove();
	d3.select("g#detail")
		.remove();
	d3.select("text#tip_pie")
		.remove();
	svg_pie.append("text")
		.attr("id","tip_pie")
		.attr({
			x:40,
			y:30
		})
		.style("font-weight","bold")
		.style("font-size",18)
		.style("fill","#d9d9d9")
		.text("总人数:"+(male+female)+"人");
	var dataset=[];
	dataset.push({"gender":"男性","usernum":male});
	dataset.push({"gender":"女性","usernum":female});
	var g_pie=svg_pie.append("g")
		.attr("id","pie")
		.attr("transform","translate(100,120)");
	var arc=d3.svg.arc()
		.innerRadius(30)
		.outerRadius(70)
	var pie=d3.layout.pie()
		.value(function(d){
			return d.usernum;
		})
	g_pie.selectAll("path")
		.data(pie(dataset))
		.enter()
		.append("path")
		.attr("d",arc)
		.style("fill",function(d,i){
			if(d.data.gender=="女性"){
				return "#EE1196";
			}else{
				return "#08E7BA";
			}
		});

	g_pie.selectAll("text")
		.data(pie(dataset))
		.enter()
		.append("text")
		.style("font-weight","bold")
		.text(function(d){return d.data.gender;})
		.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
		.style("text-anchor","middle")
		.style("font-size",20);
	var g_pie_detail=svg_pie.append("g")
		.attr("id","detail")
		.attr("transform","translate(0,210)")

	g_pie_detail.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.style("fill","#d9d9d9")
		.style("font-size",18)
		.attr({
			x:30,
			y:function(d,i){return i*25;}
		})
		.text(function(d){
			return d.gender+":"+d.usernum+"人 占"+(d.usernum/(female+male)*100).toFixed(1)+'%';
		})
	/*g_pie_detail.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr({
			x:0,
			y:0,
			width:15,
			height:15
		})
		.attr("fill",function(d,i){
			if(d.gender=="女性"){
				return "#EE1196";
			}else{
				return "#08E7BA";
			}
		})*/
	svg_pie.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr({
			x:5,
			y:function(d,i){return 195+i*25;},
			width:18,
			height:18
		})
		.attr("fill",function(d,i){
			if(d.gender=="女性"){
				return "#EE1196";
			}else{
				return "#08E7BA";
			}
		})
}		
function data_pro_all(){
	//console.log("数据预处理(全局)");
		//遍历赋值到json中
		var unknow_sum=0,
			total_female=0,
			total_male=0;
		//初始化
		for(var j=0;j<json_data.features.length;++j){
			json_data.features[j].properties.usernum=0;
			json_data.features[j].properties.user_male=0;
			json_data.features[j].properties.user_female=0;
		}
		//循环赋值
		for(var i=0;i<csv_data.length;++i){
			var j=0;
			/*if(csv_data[i].gender=='m'){
				total_male++;
			}else{
				total_female++;
			}*/

			for(j;j<json_data.features.length;++j){
				if(csv_data[i].province==json_data.features[j].properties.id){
					json_data.features[j].properties.usernum++;
					if(csv_data[i].gender=='m'){
						json_data.features[j].properties.user_male++;
						total_male++;
					}
					break;
				}
			}
			if(j>=json_data.features.length){
				unknow_sum++;
			}
		}
		for(var i=0;i<json_data.features.length;++i){
			json_data.features[i].properties.user_female=json_data.features[i].properties.usernum-json_data.features[i].properties.user_male;
		}
		total_female=csv_data.length-total_male-unknow_sum;
		//console.log("未知地区用户数:"+unknow_sum);
		//console.log("全国女性用户:"+total_female);
		//console.log("全国男性用户:"+total_male);
		show_pie("全国",total_male,total_female);
}
function show_rank_province(province,flag){
	//console.log("省份排名函数:"+province);
	var dataset_province=[];
	for(var i=0;i<csv_data.length;++i){
		if((csv_data[i].province==flag)&&(csv_data[i].city!=1000)){
			dataset_province.push(csv_data[i].location);
		}
	}
	var dataset=[];
	dataset[0]={"province":dataset_province[0],"usernum":1};
	var num=0;
	for(var i=1;i<dataset_province.length;++i){
		var j=0;
		for(j;j<dataset.length;++j){
			if(dataset[j].province==dataset_province[i]){
				dataset[j].usernum++;
				break;
			}
		}
		if(j>=dataset.length){
			dataset.push({"province":dataset_province[i],"usernum":1});
		}
	}
	for(var i=0;i<dataset.length-1;++i){
		for(var j=i+1;j<dataset.length;++j){
			if(dataset[j].usernum>dataset[i].usernum){
				var temp;
				temp=dataset[i];
				dataset[i]=dataset[j];
				dataset[j]=temp;
			}
		}
	}
	if(dataset.length>5){dataset.length=5;}
	show_rect(province,dataset);
}
function show_rank_all(){
	//console.log("排名函数");
	
	var json_copy=[],
		rank_data=[];
	var max_i=0;
	for(var i=0;i<json_data.features.length;++i){
		json_copy.push({"name":json_data.features[i].properties.name,"usernum":json_data.features[i].properties.usernum});
	}
	for(var i=0;i<5;++i){

		for(var j=0;j<json_copy.length;++j){
			if(json_copy[j].usernum>json_copy[max_i].usernum){
				max_i=j;
			}
		}
		rank_data.push({"province":json_copy[max_i].name,"usernum":json_copy[max_i].usernum});
		json_copy[max_i].usernum=0;
		max_i=0;
	}
	show_rect("全国",rank_data);
}
function show_rect(province,dataset){
	var padding=60,
		padding_left=35,
		size=document.getElementById("rank").clientWidth
	d3.select("text#tip_rank")
		.remove();
	svg_rank.append("text")
		.attr("id","tip_rank")
		.attr({
			x:50,
			y:30
		})
		.style("font-weight","bold")
		.style("font-size",18)
		.style("fill","#d9d9d9")
		.text("当前地区:"+province);

	d3.select("g#rank_tip")
		.remove();

	d3.select("g#rank")
		.remove();
	

	var g_rank=svg_rank.append("g")
		.attr("id","rank");
	var g_rank_tip=svg_rank.append("g")
		.attr("id","rank_tip");
	var xscale=d3.scale.ordinal()
		.domain(dataset.map(function(d){
			var temp=d.province.split(' ');
			temp=temp[temp.length-1];
			if(temp.length>4){
				temp=temp.substring(0,4);
			}
			return temp;
		}))
		.rangeRoundBands([size-padding_left,0],0.1);
	var yscale=d3.scale.linear()
		.domain([
			0,
			d3.max(dataset,function(d){return d.usernum;})/100
		])
		.range([size-padding-padding_left,0]);
	var xAxis=d3.svg.axis()
		.scale(xscale)
		.orient("bottom");
	var yAxis=d3.svg.axis()
		.scale(yscale)
		.ticks(5)
		.orient("left")
	//x轴
	g_rank.append("g")
		.attr("class","axis")
		.attr("transform","translate("+padding_left+","+(size-padding)+")")
		.call(xAxis)
		.selectAll("text")
		.attr("transform","rotate("+315+",10,20)");
	//y轴
	g_rank.append("g")
		.attr("class","axis")
		.attr("transform","translate("+padding_left+","+padding_left+")")
		.call(yAxis)
		.append("text")
		.text("(百人)")
		.attr("transform","rotate(-90)")
		.attr("text-anchor","end")
		.attr("dy","1em")
	//条形图	
	g_rank.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr({
			"x":function(d,i){return xscale(i)+padding_left;},
			"y":function(d,i){return yscale(d.usernum/100)+padding_left;},
			"width":xscale.rangeBand(),
			"height":0
		})
		.attr("fill","steelblue");
	g_rank.selectAll("rect")
		.data(dataset)
		.transition()
		.duration(500)
		//.enter()
		//.append("rect")
		.attr({
			"x":function(d,i){return xscale(i)+padding_left;},
			"y":function(d,i){return yscale(parseFloat(d.usernum/100))+padding_left;},
			"width":xscale.rangeBand(),
			"height":function(d,i){return size-yscale((d.usernum)/100)-padding-padding_left;}
		})
		.attr("fill","steelblue")

	//标签
	g_rank_tip.selectAll("text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d){
			return d.usernum;
		})
		.attr({
			"x":function(d,i){return xscale(i)+padding_left+xscale.rangeBand()/2;},
			"y":function(d,i){return yscale(d.usernum/100)+padding_left;},
		})
		.attr({
			"fill":"#d9d9d9",
			"stroke":"bold",
			"text-anchor":"middle"
		})
}
function creat_table_data(str,flag){
	//创建表格数据
	//console.log("创建表格数据,当前地域:"+str);
	var data;
	if(flag==0){
			data=creat_table_all();
	}else{
		data=creat_table_province(str,flag);
	}
	//show_table(str,data);
}
function show_table(str,data){
	for(var i=0;i<data.length;++i){
		data[i][0]=i+1;
	}
	d3.select("g#table")
		.remove();
	var data_table_title=["排名","昵称","粉丝数","所在地","注册时间"];
	//定义g来放table  方便删除重建
	var g=d3.select("div#other")
		.append("g")
		.attr("id","table")
	var table=g.append("table")
		.attr("class","toptable")
	var title=table.append("tr")
		.attr("id","title")
		.attr({
			"height":"35",
			"width":"100%",
			"background":"#fff"
		})
		.style("border-bottom","2 solid #006465");

	title.selectAll("th")
		.data(data_table_title)
		.enter()
		.append("th")
		.text(function(d){return d;})
	for(var j=0;j<data.length;++j){
		table.append("tr")
			.attr("id","rank_data")
			.attr("class",function(d){
				if(j%2==0){return "tr0";}
				else{return "tr1";}
			})
			.on("cilck",function(d){
				d3.select(this)
					.attr("fill","red")
			})
			.selectAll("td")
			.data(data[j])
			.enter()
			.append("td")
			.text(function(d){return d;})
	}
}
function creat_table_all(){
	//console.log("quanbu");
	var temp=[];
	for(var i=0;i<5;++i){
		temp.push([temp.length+1,csv_data[i].name,csv_data[i].followersnum,csv_data[i].location,csv_data[i].created_at]);
	}
	for(var i=0;i<temp.length-1;++i){
		for(var j=i+1;j<temp.length;++j){
			if(temp[j][2]>temp[i][2]){
				var tmp=temp[j];
				temp[j]=temp[i];
				temp[i]=tmp;
			}
		}
	}
	//console.log(temp);
	for(var i=5;i<csv_data.length-1;++i){
		if(parseFloat(csv_data[i].followersnum)<parseFloat(temp[4][2])){
			continue;
		}else{
			for(var j=0;j<temp.length-1;++j){
				if(parseFloat(csv_data[i].followersnum)>=parseFloat(temp[j][2])){
					for(var k=temp.length-1;k>j;--k){
						temp[k]=temp[k-1];
					}
					temp[j]=[j,csv_data[i].name,csv_data[i].followersnum,csv_data[i].location,csv_data[i].created_at];
					break;
				}else{
					continue;
				}
			}
		}
	}
	//console.log(temp);
	show_table("全国",temp);
}
function creat_table_province(str,flag){
	//console.log(str);
	var temp=[];
	for(var i=0;i<csv_data.length;++i){
		if(csv_data[i].province==flag){
			temp.push([temp.length+1,csv_data[i].name,csv_data[i].followersnum,csv_data[i].location,csv_data[i].created_at]);
		}
		if(temp.length>=5){
			break;
		}
	}
	for(var i=0;i<temp.length-1;++i){
		for(var j=i+1;j<temp.length;++j){
			if(temp[j][2]>temp[i][2]){
				var tmp=temp[j];
				temp[j]=temp[i];
				temp[i]=tmp;
			}
		}
	}
	//console.log(temp);
	for(var i=5;i<csv_data.length-1;++i){
		if(csv_data[i].province!=flag){
			continue;
		}
		if(parseFloat(csv_data[i].followersnum)<parseFloat(temp[4][2])){
			continue;
		}else{
			for(var j=0;j<temp.length-1;++j){
				if(parseFloat(csv_data[i].followersnum)>=parseFloat(temp[j][2])){
					for(var k=temp.length-1;k>j;--k){
						temp[k]=temp[k-1];
					}
					temp[j]=[j,csv_data[i].name,csv_data[i].followersnum,csv_data[i].location,csv_data[i].created_at];
					break;
				}else{
					continue;
				}
			}
		}
	}
	//console.log(temp);
	show_table(str,temp);
}
function create(flag){
	console.log("注册函数");
	var data_created=[];
	var format_date=d3.time.format("%x"),
		format_time=d3.time.format("%X");
	var padding=30;
	var svg_create_width=d3.select("svg#created_at").attr("width"),
		svg_create_height=d3.select("svg#created_at").attr("height");
	d3.select("g#create_circle")
		.remove();
	d3.select("g#time_axis")
		.remove();
	d3.select("g#date_axis")
		.remove();	
	if(flag==0){
		for(var i=0;i<csv_data.length;++i){
			var date_temp=new Date(csv_data[i].created_at);
			var date=format_date(date_temp);
			var time=format_time(date_temp);
			//date=new Date(date.split('/')[2],date.split('/')[0],date.split('/')[1]);
			data_created.push({"name":csv_data[i].name,"gender":csv_data[i].gender,"date":date,"time":time});
		}
	}else{
		for(var i=0;i<csv_data.length;++i){
			if(csv_data[i].province!=flag){
				continue;
			}
			var date_temp=new Date(csv_data[i].created_at);
			var date=format_date(date_temp);
			var time=format_time(date_temp);
			//date=new Date(date.split('/')[2],date.split('/')[0],date.split('/')[1]);
			data_created.push({"name":csv_data[i].name,"gender":csv_data[i].gender,"date":date,"time":time});
		}
	}

	var s_e=findStart_end(data_created);  //找出数据中最早注册和最迟注册的日期
	var scale_date=d3.time.scale()
		.domain([s_e[0],s_e[1]])
		.range([0,svg_create_width-2*padding]);
	var scale_time=d3.scale.linear()
		.domain([0,24])
		.range([svg_create_height-2*padding,0]);
	var xAxis=d3.svg.axis()
		.scale(scale_date)
		/*.tickFormat(function(v){
			return format_date(v).split('/')[2]+"年";
		})*/
		.orient("bottom");
	var yAxis=d3.svg.axis()
		.scale(scale_time)
		.tickSubdivide(1)
		.orient("left");
	var g_axis=svg_create.append("g")
		.attr("id","g_axis");
	g_axis.append("g")
		.attr("class","axis")
		.attr("id","date_axis")
		.attr("transform","translate("+padding+","+(svg_create_height-padding)+")")
		.call(xAxis)
		.append("text")
		.text("日期")
		.attr("transform","translate("+(svg_create_width-2*padding-2)+",0)")
	g_axis.append("g")
		.attr("class","axis")
		.attr("id","time_axis")
		.attr("transform","translate("+padding+","+padding+")")
		.call(yAxis)
		.append("text")
		.text("(时)")
		.attr("transform","rotate(-90)")
		.attr("text-anchor","top")
		.attr("dy","1em")
	var lines=d3.selectAll("g#time_axis g.tick")
		.append("line")
		.classed("grid-line",true)
		.attr({
			"x1":0,
			"y1":0,
			"x2":svg_create_width-2*padding,
			"y2":0
		});
	var lines_date=d3.selectAll("g#date_axis g.tick")
		.append("line")
		.classed("grid-line",true)
		.attr({
			"x1":0,
			"y1":0,
			"x2":0,
			"y2":-(svg_create_width-2*padding)			
		});
	var g_node=svg_create.append("g")
		.attr("id","create_circle")
		.attr("transform","translate("+padding+","+padding+")");
	g_node.selectAll("circle")		
		.data(data_created)
		.enter()
		.append("circle")
		.attr({
			"cx":function(d){
				return scale_date(new Date(d.date.split('/')[2],d.date.split('/')[0],d.date.split('/')[1]));
			},
			"cy":function(d){
				var time_temp=d.time.split(':'),
					t=time_temp[0]+(time_temp[1]/60)*100;
				return scale_time(parseFloat(t)/100);
			},
			"r":"2",
			"fill":function(d){
				if(d.gender=="f"){
					return "#EE1196";
				}else{
					return "#08E7BA";
				}
			}
		})
}
function findStart_end(date){
	//console.log(date);
	var s=0,
		e=0;
	for(var i=0;i<date.length;++i){
		if(com(date[i].date,date[s].date)<0){
			s=i;
			continue;
		}
		if(com(date[i].date,date[e].date)>0){
			e=i;
			continue;
		}
	}
	var start=new Date(date[s].date.split('/')[2],date[s].date.split('/')[0],date[s].date.split('/')[1]),
		end=new Date(date[e].date.split('/')[2],date[e].date.split('/')[0],date[e].date.split('/')[1]);
	return [start,end];
}
function com(date1,date2){
	var temp1=date1.split('/'),
		y1=temp1[2],
		m1=temp1[0],
		d1=temp1[1];
	var temp2=date2.split('/'),
		y2=temp2[2],
		m2=temp2[0],
		d2=temp2[1];
	var str1=parseFloat(y1+m1+d1),
		str2=parseFloat(y2+m2+d2);
	//console.log(str1);
	//console.log(str2);
	return str1-str2;
}