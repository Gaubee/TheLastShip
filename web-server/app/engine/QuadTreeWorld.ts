import QuadTree,{Node} from "./QuadTree";
import {P2I} from "./Collision";
/** 基于四叉树的世界*/
interface Bounds{
	width: number
	height: number
	x: number
	y: number
}
/** 四叉树世界管理器
 *	工作原理：将所有对象抽象成一个点，然后给出足够的预留空间
 *	空间采用3*3=>(1100px*1100px)的构造，固定提供2000px*2000px的视野
 *	在视野点移动到下一个单位区域的时候，改变提供的视野区域，即便切换视野区域，也能有200px的预留空间来确保以外物体的出现
 *	
 *	所以初步视野定位：35200*35200，就是2^5
 */
const POS_P2I_WM = new WeakMap();
const P2I_S = new Set();
export default class QuadTreeWorld extends QuadTree {
	/**一个单位计算区域的单位大小*/
	static UNIT_SIZE = 550
	/**一个单位视野区域的单位大小，确保大于常用的计算机屏幕*/
	static get UNIT_VIEW_SIZE(){
		return this.UNIT_SIZE*3
	}
	WIDTH:number
	HEIGHT:number
	constructor(bounds:Bounds = {width:35200,height:35200,x:0,y:0}){
		super(bounds,true, Math.log2(Math.max(bounds.width, bounds.height) / QuadTreeWorld.UNIT_SIZE));
		this.WIDTH = bounds.width;
		this.HEIGHT = bounds.height;
	}
	insert(item:P2I) {
		P2I_S.add(item);
		POS_P2I_WM.set(item.position, item);
	}
	remove(item:P2I){
		P2I_S.delete(item);
		POS_P2I_WM.delete(item.position);
	}
	refresh(){//刷新四叉树
		var entries = P2I_S.entries();
		var next = entries.next();
		this.clear();
		while(!next.done){
			const [_,item]:P2I[] = next.value;
			super.insert(item.position);
			next = entries.next();
		}
	}
	private _getRectViewNodes(x,y,end_x,end_y,node:Node,res_nodes:Node[]){
		var node_bounds = node._bounds;
		var node_bounds_end_x = node_bounds.x+node_bounds.width;
		var node_bounds_end_y = node_bounds.y+node_bounds.height;
		if(
			(
				(node_bounds.x <= x && node_bounds_end_x >= x)
				|| 
				(node_bounds.x >= x && node_bounds_end_x <= end_x)
				|| 
				(node_bounds.x <= end_x && node_bounds_end_x >= end_x)
			)
			&&
			(
				(node_bounds.y <= y && node_bounds_end_y >= y)
				|| 
				(node_bounds.y >= y && node_bounds_end_y <= end_y)
				|| 
				(node_bounds.y <= end_y && node_bounds_end_y >= end_y)
			)
		) {
			if(node.nodes.length) {
				node.nodes.forEach(child_node=>this._getRectViewNodes(x,y,end_x,end_y,child_node,res_nodes));
			}else{
				res_nodes.push(node)
			}
		}
	}
	getRectView(x,y,width,height){
		var res_nodes:Node[] = [];
		this._getRectViewNodes(x,y,x+width,y+height,this.root,res_nodes);
		return res_nodes;
	}
	getRectViewItems(x,y,width,height){
		var nodes = this.getRectView(x,y,width,height);
		var res:P2I[] = [];
		nodes.forEach(node=>{
			node.children.forEach(position=>{
				res.push(POS_P2I_WM.get(position))
			})
		})
		return res;
	}
}