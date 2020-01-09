# -imgCropper
简单的弹出框图片预览裁剪工具（依赖cropperjs,jquery和layer,ajaxform）

使用说明

	new PopCroper("#popImage").init({
			aspectRatio : 4 / 3,// 裁剪框宽高比例，默认比例1/1  
			title: "上传图片",//弹出框标题
			//btn:["yes","cancel"],//弹出框按钮，默认为['确认', '取消']
			maxmin:false,//是否支持弹出框最大最小化，默认true
			imgType: 'jpg,png,jpeg',//允许上传的图片类型,默认'jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF'
			//area: ["500px", "800px"],// 弹出框的大小[宽，高],默认900
			//showPreview: false, //是否显示预览区域，默认true
			maxSize : 1, //最大允许上传的图片大小(单位M)，默认5M
			uploadURL: "http://locahost/demo/image/upload", //上传到服务端的地址
			before: function (data){ //提交上传之前触发，参数为图片裁剪后的值 {x:'',y:'',height:'',width:''} x,y表示坐上角的其实坐标，height,width表示裁剪后的大小。这里可以改变data的数值
				console.log(data);
				//data.x = 123;
			},
			success: function (data) { //上传成功
				//TODO
			}
		});
