Page({
  build() {

/*************************函数定义区******************************************** */


//文件处理函数	
	function read(file)
    	{
		const [fs_stat, err] = hmFS.stat_asset("raw/"+file+".txt")
    	var buffer = new ArrayBuffer(fs_stat.size)
		var f = hmFS.open_asset("raw/"+file+".txt", hmFS.O_RDONLY);
    
    	hmFS.read(f, buffer, 0, new Uint8Array(buffer).length);
		hmFS.close(f);
		return buffer
    }
	function Utf8ArrayToStr(array) 
		{
    	var out, i, len, c;
    	var char2, char3;
		var is_quo = 0;
 
    	out = "";
    	len = array.length;
    	i = 0;
    	while(i < len) {
    	c = array[i++];
    	switch(c >> 4)
    	{ 
    	  case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
    	    // 0xxxxxxx
    	    out += String.fromCharCode(c);
    	    break;
    	  case 12: case 13:
    	    // 110x xxxx   10xx xxxx
    	    char2 = array[i++];
    	    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
    	    break;
    	  case 14:
    	    // 1110 xxxx  10xx xxxx  10xx xxxx
    	    char2 = array[i++];
    	    char3 = array[i++];
    	    out += String.fromCharCode(((c & 0x0F) << 12) |
    	                   ((char2 & 0x3F) << 6) |
    	                   ((char3 & 0x3F) << 0));
    	    break;
    	}
    	}
    	return out;
	}
	function del(arr)
	{
		for (i = 0;i<arr.length;i++)
		{
			
			if(parseInt(fix(arr[i][1],2)+fix(arr[i][2],2)+fix(arr[i][3],2)) < parseInt(fix(c_y,2)+fix(c_m,2)+fix(c_d,2)))
				{
					
					arr.splice(i,1);
					i -= 1;
				}
				
		}
		return arr;
	}
	function machining(arr)
		{
			for (i = 0;i<arr.length;i++)
			{
			var _a = arr[i].indexOf("[");
			var _b = arr[i].indexOf("]");
			arr[i] = arr[i].substring(_a+1,_b).split("/");
				if (arr[i][1]=="00"&&arr[i][2]!="00")
				{
					
					if(parseInt(fix(arr[i][2],2)+fix(arr[i][3],2))>=parseInt(fix(c_m,2)+""+fix(c_d,2)+""))
					{
						arr[i][1] = c_y+""
					}
					else
					{
						arr[i][1] = (c_y+1)+""
					}

				}
				else if(arr[i][1]=="00"&&arr[i][2]=="00")
				{
					if(parseInt(arr[i][3],2) >= c_d)
					{
						arr[i][2] = c_m+""
						arr[i][1] = c_y+""

					}
					else
					{
						
						if (c_m+1 > 12)
						{
							arr[i][1] = (parseInt(arr[i][1]) + 1)+""
							arr[i][2] = "1"
						}
						else
						{
							arr[i][1] = c_y+""
							arr[i][2] = (c_m+1)+""
						}
						
					}
					if (parseInt(arr[i][3]) > check(parseInt(arr[i][1]),parseInt(arr[i][2])))
					{
						arr[i][2] = check(parseInt(arr[i][1]),parseInt(arr[i][2]))+"";
					}
				}				
			}
			return arr;
		}
	function fix(num, length) {
			return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
	}

	//功能函数
	function sort(data,n) {
		var len = data.length;
		for (var i = 0; i < len - 1; i++) {
			for (var j = n; j < len - 1 - i; j++) {
				if (parseInt(data[j][1]+fix(parseInt(data[j][2]),2)+fix(parseInt(data[j][3]),2)) > parseInt(data[j+1][1]+fix(parseInt(data[j+1][2]),2)+fix(parseInt(data[j+1][3]),2))) {        // 相邻元素两两对比
					var temp = data[j];        // 元素交换
					data[j] = data[j+1];
					data[j+1] = temp;
				}
			}
		} 
		return data;
	}
	function configure()
		{
			
			 var _conf = Utf8ArrayToStr(new Uint8Array(read("configure"))).split(/\r\n|\n/);
				for (i=0;i<_conf.length;i++)
				{
					var _a = _conf[i].indexOf("[");
					var _b = _conf[i].indexOf("]");
					_conf[i] = _conf[i].substring(_a+1,_b).split(":");
					
				}
			
			return _conf
		}
//计算函数
	function calc_d(y,m,d)
		{
			var i=c_y,j=c_m,k=c_d;
			var days = 0;
			
			while (1)
			{	
				days++;
				k++;			
				if (i == y && j == m && k == d)
				{
					return days;
				}
				if(k == check(i,j))
				{
					k = 0;
					j++;
				}
				if(j == 13)
				{
					j = 1;
					i++;
				}
				if(days>=3650)
				{
					break;
				}
			}							
		}
	function calc_m(y,m,d,n)
		{
			var mons=0,mons_d =0;
			if (c_d<=d)
			{
				mons = (y-c_y)*12 + (m-c_m);
				mons_d = (d-c_d);
			}
			else
			{
				mons = (y-c_y)*12 + (m-c_m) - 1;
				mons_d = check(y,m-1)-(c_d-d);
			}
			switch(n)
			{
				case 0:
					return mons;
				case 1:
					return mons_d;
			}
	}

    function check(y,m)
		{
			if (m==0||m==1||m==3||m==5||m==7||m==8||m==10||m==12)
			{
				return 31;
			}
			else if(m==4||m==6||m==9||m==11)
			{
				return 30;
			}
			else
			{
				if((y%4 == 0 && y%100 != 0) || y%400 == 0)
				{
					return 29;
				}
				else
				{
					return 28;
				}
      }
		}

/******************************************************************* */

    //获取当前日期
    const time = hmSensor.createSensor(hmSensor.id.TIME);
	var c_y = time.year, c_m = time.month, c_d = time.day;
	const conf = configure();
    var dates = machining(Utf8ArrayToStr(new Uint8Array(read("data"))).split(/\r\n|\n/));

	if (conf[4][1]==-1)
	{
		dates = sort(dates,0)
	}
	else
	{
		var temp = dates[conf[4][1]]
		dates[conf[4][1]] = dates[0]
		dates[0] = temp
		dates = sort(dates,1)
	}
    dates = del(dates)
	

    const num = dates.length
    const _x=192,_y=480
    hmUI.setScrollView(true, px(_y), num, true)
    const numArr = Array.from({ length: num }).map((_, index) => index)

	

//循环列表

    numArr.forEach((i) => {
    
    /** ***********************UI布局******************************************** */

  	var ds = calc_d(dates[i][1],dates[i][2],dates[i][3])


	const Days = hmUI.createWidget(hmUI.widget.TEXT, {
		x: 0,
		y: 191+ px(_y) * i,
		w: 192,
		h: 106,
		color:conf[1][1],
		text_size: 80,
		align_h: hmUI.align.CENTER_H,
		align_v: hmUI.align.CENTER_V,
		text_style: hmUI.text_style.NONE,
		text:ds+"d"
	  });

	const Title = hmUI.createWidget(hmUI.widget.TEXT, {
	
		x: 0,
		y: 64+ px(_y) * i,
		w: 192,
		h: 53,
		color: conf[0][1],
		text_size: 40,
		align_h: hmUI.align.CENTER_H,
		align_v: hmUI.align.CENTER_V,
		text_style: hmUI.text_style.NONE,
		text:dates[i][0]
	  });
	
	if(i == 0&&conf[4][1]!=-1)
	{
		const Days = hmUI.createWidget(hmUI.widget.TEXT, {
			x: 0,
			y: 191+ px(_y) * i,
			w: 192,
			h: 106,
			color:conf[3][1],
			text_size: 80,
			align_h: hmUI.align.CENTER_H,
			align_v: hmUI.align.CENTER_V,
			text_style: hmUI.text_style.NONE,
			text:ds+"d"
		  });
		  const Title = hmUI.createWidget(hmUI.widget.TEXT, {
		
			x: 0,
			y: 64+ px(_y) * i,
			w: 192,
			h: 53,
			color: conf[2][1],
			text_size: 40,
			align_h: hmUI.align.CENTER_H,
			align_v: hmUI.align.CENTER_V,
			text_style: hmUI.text_style.NONE,
			text:dates[i][0]
		  });
	}
	
		
	
		
	

		const Month = hmUI.createWidget(hmUI.widget.TEXT, {
		
			x: 0,
			y: 133+_y*i,
			w: 192,
			h: 26,
			color: 0x9b9b9b,
			text_size: 20,
			align_h: hmUI.align.CENTER_H,
			align_v: hmUI.align.CENTER_V,
			text_style: hmUI.text_style.NONE,
			text:`${calc_m(dates[i][1],dates[i][2],dates[i][3],0)}月${calc_m(dates[i][1],dates[i][2],dates[i][3],1)}天`
		  });
		const Week = hmUI.createWidget(hmUI.widget.TEXT, {
		
			x: 0,
			y: 165+_y*i,
			w: 192,
			h: 26,
			color: 0x9b9b9b,
			text_size: 20,
			align_h: hmUI.align.CENTER_H,
			align_v: hmUI.align.CENTER_V,
			text_style: hmUI.text_style.NONE,
			text: Math.floor(ds/7)+""+"周"+(ds%7)+""+"天"
		});
		const Date = hmUI.createWidget(hmUI.widget.TEXT, {
		
			x: 0,
			y: 315+_y*i,
			w: 192,
			h: 80,
			color: 0x9b9b9b,
			text_size: 20,	
			align_h: hmUI.align.CENTER_H,
			align_v: hmUI.align.CENTER_V,
			text_style: hmUI.text_style.NONE,
			text:`${c_y}/${c_m}/${c_d}\n~\n${dates[i][1]}/${dates[i][2]}/${dates[i][3]}`
		  });

/************************************************************************ */

    })


  }
})