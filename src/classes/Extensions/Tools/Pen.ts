import glob = require('../../Global');
import color = require('../../Color');
import tool = require('./Tool');
import point = require('../../Point');
   
export class Pen extends tool.Tool
{
    static EXTENSION_NAME : string = "Pen";
    paint : glob.Paint;
    
    public constructor(paint:glob.Paint) {
        super(paint);
        this.paint = paint;
    }
    
    init() {
        var paint = this.paint;
        var $ = paint.$;
        $("#topBar").append('<button id="btnPen">Pen</button>');
        
        var curInstance = this;
        $("#btnPen").click(function() {
            paint.currentTool = curInstance;
        });
    }
    
    activated() {
        super.activated();
        
        console.log("Registrazione del tool Pen");
        
        var paint = this.paint;
        var $ = paint.$;
        var document = paint.document;
        
        
        // Load context
        var canvas = paint.currentPaper.canvas;
    
        $(canvas).on("mousedown", $.proxy(this.canvas_mousedown, this));
        $(canvas).on("mouseenter", $.proxy(this.canvas_mouseenter, this));
        $(document).on("mousemove", $.proxy(this.document_mousemove, this));
        $(canvas).on("mouseleave", $.proxy(this.canvas_mouseleave, this));
        $(document).on("mouseup", $.proxy(this.document_mouseup, this));
        
    }
    
    inkColor() : color.Color {
        return this.paint.primaryColor;
    }
    
    deactivated() {
        var $ = this.paint.$;
        var document = this.paint.document;
        var canvas = this.paint.currentPaper.canvas;
        
        $(canvas).off("mousedown", this.canvas_mousedown);
        $(canvas).off("mouseenter", this.canvas_mouseenter);
        $(document).off("mousemove", this.document_mousemove);
        $(canvas).off("mouseleave", this.canvas_mouseleave);
        $(document).off("mouseup", this.document_mouseup);
    }
    
    /**
     * Gets function that draw on context
     */
    private getDrawingFunction(pt : point.Point) : (context : CanvasRenderingContext2D) => void {

        return function(context : CanvasRenderingContext2D) {
            context.lineTo(pt.X, pt.Y);
            context.stroke(); 
        }
    }
    
    private canvas_mousedown(ev : JQueryMouseEventObject) {
        this.paint.currentPaper.startDrawing(new point.Point(ev.offsetX, ev.offsetY), this.inkColor(), this.paint.toolSize);
    }
    
    private canvas_mouseenter(ev : JQueryMouseEventObject) {
        if (this.paint.currentPaper.isDrawing())
            this.paint.currentPaper.startDrawing(new point.Point(ev.offsetX, ev.offsetY), this.inkColor(), this.paint.toolSize);
    }
    
    private document_mousemove(ev : JQueryMouseEventObject) {
        var cord = this.paint.currentPaper.pageXYtoCanvasXY(ev.pageX, ev.pageY);
        this.paint.currentPaper.recordOuterPoint(cord);
        
        if (ev.target === this.paint.currentPaper.canvas)
            
            // Call draw passing local drawing function
            this.paint.currentPaper.draw(
                this.getDrawingFunction(new point.Point(ev.offsetX, ev.offsetY))
            );
    }
  
    private canvas_mouseleave(ev) {
        var point = this.paint.currentPaper.pageXYtoCanvasXY(ev.pageX, ev.pageY);
        this.paint.currentPaper.exitFromPaper(point);
    }
        
    private document_mouseup(ev) {
        this.paint.currentPaper.stopDrawing();
    }
}