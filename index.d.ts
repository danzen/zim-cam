
import { Bitmap, Container, DisplayObject, List, zimVee, Frame, Damp, Rectangle, Label, Slider, Button, Pane } from "zimjs"

declare namespace zim {

    export class Cam extends Container {
        constructor(config_or_width?: number, height?: number, flip?: boolean, facingMode?: boolean, config?: {});
        constructor(width?: number, height?: number, flip?: boolean, facingMode?: boolean, config?: {});        
		resetSize():this
		pause(state?:boolean):this 
		toggle():this
		flip(state?:boolean):this 
		snapshot():Bitmap
		keyOut(color?: string|[string], tolerance?: number, replacement?: string|[string]):this
		setFacingMode(mode?: string):this
        readonly tag:HTMLVideoElement
		readonly display:Container
		paused:boolean
		flipped:boolean
		readonly facingMode:string       
    }

	export class CamMotion extends Container {
        constructor(config_or_obj?: DisplayObject, preview?: number, smooth?: number, damp?: number, sensitivity?: number, precision?: number, period?: number, colorFilter?: string, colorSensitivity?: number, mode?: number, visualizerObj?: DisplayObject|zimVee, visualizerColor?: string|zimVee, visualizerBaseColor?: string|zimVee, visualizerScale?: number|zimVee, visualizerBaseScale?: number|zimVee, guideH?: string, guideV?: string, randomize?: boolean, cam?: Cam, frame?: Frame, facingMode?: string, config?: {});
        constructor(config: {obj?: DisplayObject, preview?: number, smooth?: number, damp?: number, sensitivity?: number, precision?: number, period?: number, colorFilter?: string, colorSensitivity?: number, mode?: number, visualizerObj?: DisplayObject|zimVee, visualizerColor?: string|zimVee, visualizerBaseColor?: string|zimVee, visualizerScale?: number|zimVee, visualizerBaseScale?: number|zimVee, guideH?: string, guideV?: string, randomize?: boolean, cam?: Cam, frame?: Frame, facingMode?: string, config?: {}});
		readonly obj:DisplayObject
		smooth:number
		sensitivity:number
		precision:number
		colorFilter:number
		colorSensitivity:number
		readonly motionX:number
		readonly motionY:number
		readonly rawX:number
		readonly rawY:number
		readonly cam:Cam
		readonly dampX:Damp
		readonly dampY:Damp
		readonly data:[number]
		readonly points:{x:number, y:number} 
		readonly camPoints:{x:number, y:number} 
		readonly interval:any
		readonly ticker:any
		readonly visualizer:Container
		readonly facingMode:string       
    }

	export class CamCursor extends Container {
        constructor(config_or_cursor?: DisplayObject, preview?: number, camMotion?: CamMotion, radius?: number, color?: string, borderColor?: string, borderWidth?: number, stillColor?: string, stillBorderColor?: string, stillTime?: number, colorFilter?: string, colorSensitivity?: number, cam?: Cam, frame?: Frame, facingMode?: string, config?: {});
        constructor(config:{ cursor?: DisplayObject, preview?: number, camMotion?: CamMotion, radius?: number, color?: string, borderColor?: string, borderWidth?: number, stillColor?: string, stillBorderColor?: string, stillTime?: number, colorFilter?: string, colorSensitivity?: number, cam?: Cam, frame?: Frame, facingMode?: string, config?: {}});
		readonly obj:DisplayObject
		smooth:number
		sensitivity:number
		precision:number
		colorFilter:string
		colorSensitivity:number
		readonly motionX:number
		readonly motionY:number
		readonly rawX:number
		readonly rawY:number
		readonly cam:Cam
		readonly dampX:Damp
		readonly dampY:Damp
		readonly data:[number]
		readonly points:{x:number, y:number} 
		readonly camPoints:{x:number, y:number} 
		readonly interval:any
		readonly ticker:any
		readonly visualizer:Container
		readonly facingMode:string		
		readonly cursorObj:DisplayObject
		readonly camMotion:CamMotion
		readonly motion:boolean
    }

	export class CamAlpha extends Container {
        constructor(cam?: Cam, color?: string);
		cam:Cam
		readonly backing:Rectangle
		readonly label:Label
		readonly slider:Slider
    }

	export class CamControls extends List {
        constructor(camMotion?: CamMotion, close?: boolean, collapse?: boolean);
		readonly cam:Cam
		readonly camMotion:CamMotion
		readonly camCursor:CamCursor
		readonly reset:Button
    }

	export class CamAsk extends Pane {
        constructor(color?: string, backgroundColor?: string);
		color:string
		backgroundColor:string
    }

}

export = zim
