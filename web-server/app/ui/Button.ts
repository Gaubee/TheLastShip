import {
    VIEW,
    L_ANI_TIME,
    B_ANI_TIME,
    M_ANI_TIME,
    S_ANI_TIME,
    on,
    pt2px,
    mix_options,
    copy,
} from "../common";
import TWEEN, {Tween} from "../../class/Tween";
import SVGGraphics from "../../class/SVGGraphics";

export interface ButtonStyle{
	width?:number
	height?:number
	backgrounColor?:number
	backgrounAlpha?:number
	color?:number
	value?:string
	paddingTop?:number
	paddingLeft?:number
	paddingBottom?:number
	paddingRight?:number
	borderColor?:number
	borderAlpha?:number
	borderWidth?:number
	fontSize?:number
	fontFamily?:string
	hoverStyle?:ButtonStyle
	activeStyle?:ButtonStyle
	radius?:number
}

export default class Button extends PIXI.Graphics {
	style:ButtonStyle = (()=>{
		var baseStyle:ButtonStyle =	{
			width:0,
			height:0,
			backgrounColor:0x4444ff,
			backgrounAlpha:1,
			color:0,
			value:"",
			paddingTop:0,
			paddingLeft:0,
			paddingBottom:0,
			paddingRight:0,
			borderColor:0x333333,
			borderAlpha:1,
			borderWidth:0,
			fontSize:pt2px(10),
			fontFamily:"微软雅黑",
			radius:pt2px(2)
		};

		return baseStyle
	})();
	text = new PIXI.Text("");
	constructor(text_or_proto:string|ButtonStyle){
		super();
		var style = this.style;
		if(typeof text_or_proto === "string" ) {
			style.value = text_or_proto;
		}else if(typeof text_or_proto === "object"){
			mix_options(style, text_or_proto);
		}
		this.addChild(this.text);
		this.redraw();
		this.interactive = true;
		on(this,"mouseover", ()=> {
			var baseStyle = this.style;
			var hoverStyle = copy(baseStyle);
			baseStyle.hoverStyle = hoverStyle;
			hoverStyle.backgrounColor = (hoverStyle.backgrounColor * 0.8)|0;
			hoverStyle&&this.redraw(hoverStyle);
		});
		on(this,"mouseout", ()=> {
			this.redraw(this.style);
		});
		on(this,"touchstart|mousedown", ()=> {
			var baseStyle = this.style;
			var activeStyle = copy(baseStyle);
			baseStyle.activeStyle = activeStyle;
			activeStyle.backgrounColor = Math.min((activeStyle.backgrounColor * 1.1)|0, 0xffffff);
			this.redraw(activeStyle);
		});
		on(this,"touchend|mouseup", ()=> {
			this.redraw(this.style);
		});
	}
	redraw(style?:ButtonStyle){
		style||(style = this.style);
		var text = this.text;
		text.text = style.value||this.style.value;
		// if(style.width&&style.height) {// 使用宽高等算出字体大小
		// }else{//使用字体大小算出宽高
		// }
		text.style = {
			fill:style.color,
			font:`${style.fontSize} ${style.fontFamily}`
		}
		text.x = style.paddingLeft
		text.y = style.paddingTop
		var text_width = text.width;
		var text_height = text.height;
		
		this.clear();
		this.beginFill(style.backgrounColor,style.backgrounAlpha);
		this.lineStyle(style.borderWidth,style.borderColor,style.borderAlpha);
		var button_width = text_width + style.paddingLeft+style.paddingRight;
		var button_height = text_height + style.paddingTop+style.paddingBottom;
		this.drawRoundedRect(0,0,button_width,button_height,style.radius);

	}
}