var app=new Vue({
	el:"#openmage",
	data:{
     papers:[
        { name: "身份证照片", tips: "证件照需清晰可辨认，不得使用复印件", img: "images/papers1.jpg" },
        { name: "营业执照 ", tips: "正面拍摄证件，照片需清晰可辨认，不得使用复印件", img: "images/setTyps.jpg" },
        { name: "餐饮行业许可证  ", tips: "正面拍摄证件，照片需清晰可辨认，不得使用复印件", img: "images/setAllow.jpg" },
        { name: " 店内照片", tips: " 照片体现店铺环境，地面需干净，墙面无霉斑，图片不得有水印、logo和其他网站信息", img: "images/shopImg1.jpg" },
        { name: " 门脸照 ", tips: " 店面招牌和店面大门全景拍摄，图片不得有水印、logo和其他网站信息", img: "images/shopImg2.jpg" },
        { name: " 商户logo", tips: "符合商品气质的店铺标志", img: "images/logo.png" },
      ],
      imgTogle:-1,
	},
  created:function(){},
	methods:{}
})
