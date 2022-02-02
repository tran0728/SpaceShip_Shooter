/* Assignment 1: Space Minesweeper
 * CSCI 4611, Spring 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as paper from 'paper';

class Game 
{
    // Width and height are defined in project coordinates
    // This is different than screen coordinates!
    private width : number;
    private height : number;

    // TypeScript will throw an error if you define a type but don't initialize in the constructor
    // This can be prevented by including undefined as a second possible type
    private ship : paper.Group | undefined;
    private stars : paper.Group | undefined;
    private mines : paper.Group | undefined;
    private lasers: paper.Group | undefined;
    private mine : paper.Item | undefined;
    private mineSymbol : paper.SymbolDefinition | undefined;
    private mouseVector : paper.Point | undefined;

    constructor()
    {
        paper.setup('canvas');
        this.width = 1200;
        this.height = 800;
        this.mouseVector = new paper.Point(0,0);
    }

    start() : void 
    {
        this.createScene();
        this.resize();

        // This registers the event handlers for window and mouse events
        paper.view.onResize = () => {this.resize();};
        paper.view.onMouseMove = (event: paper.MouseEvent) => {this.onMouseMove(event);};
        paper.view.onMouseDown = (event: paper.MouseEvent) => {this.onMouseDown(event);};
        paper.view.onFrame = (event: GameEvent) => {this.update(event);};

    }

    private createScene() : void 
    {
        // Create a new group to hold the ship graphic
        this.ship = new paper.Group();
        this.stars = new paper.Group();
        this.mines = new paper.Group();
        this.lasers = new paper.Group();

        // This line prevents the transformation matrix from being baked directly into its children
        // Instead, will be applied every frame
        this.ship.applyMatrix = false;

        // This code block loads an SVG file asynchronously
        // It uses an arrow function to specify the code that gets executed after the file is loaded
        // We will go over this syntax in class
        paper.project.importSVG('./assets/ship.svg', (item: paper.Item) => {
            // The exclamation point tells TypeScript you are certain the variable has been defined
            item.addTo(this.ship!);
            this.ship!.scale(3);
            this.ship!.position.x = this.width / 2;
            this.ship!.position.y = this.height / 2;
        });

        paper.project.importSVG('./assets/mine.svg', (item: paper.Item) => {
            // The exclamation point tells TypeScript you are certain the variable has been defined
            item.scale(4);
            this.mine = item;
            this.mines!.scale(5);
            this.mines!.position.x = this.width /2;
            this.mines!.position.y = this.height/2;
            this.mineSymbol = new paper.SymbolDefinition(item);
            this.mines!.addChild(this.mineSymbol.place(new paper.Point(1400,900)));
        });

       
        var star = new paper.Path.Circle(new paper.Point(20, 20), 1);
        star.fillColor = new paper.Color('white');
    
        var symbol = new paper.SymbolDefinition(star);

        for(var i =0; i < 200; i++) {
            var newSymbol = symbol.place(this.randomPoint(0, 1200, 0, 800));
            newSymbol.scale(this.randomRange(1,3));
            this.stars.addChild(newSymbol);

        }

        setInterval(() => this.mines!.addChild(this.mineSymbol!.place(this.randomMinePoint(1300,1400,900,1000))),1000);
    

    }
    private randomMinePoint(minX: number, maxX: number, minY: number, maxY: number) : paper.Point {
        var ranX = Math.random();
        var ranY = Math.random();
        var randomX = 0;
        var randomY = 0;
        if(ranX < 0.5) {
            randomX = -this.randomRange(minX, maxX);
        } else {
            randomX = this.randomRange(minX, maxX);
        }
        
        if(ranY < 0.5) {
            randomY = -this.randomRange(minY, maxY);
        } else {
            randomY = this.randomRange(minY, maxY);
        }

        return new paper.Point(randomX, randomY);
    }

    private randomRange(min: number, max: number) : number { 
        return Math.random() * (max - min) + min;
    } 

    private randomPoint(minX: number, maxX: number, minY: number, maxY: number) : paper.Point {
        let randomX = this.randomRange(minX, maxX);
        let randomY = this.randomRange(minY, maxY);
        return new paper.Point(randomX, randomY);
    }
    // This method will be called once per frame
    private update(event: GameEvent) : void
    {
        // Add code here
        for(var i = 0; i < this.stars!.children.length; i++) {
            var scale = this.stars!.children[i].scaling
            // console.log(this.stars!.children.length);
           // this.stars!.children[i].translate(this.mouseVector!.multiply(event.delta));
           this.stars!.children[i].translate( (this.mouseVector!.multiply(-0.01)).multiply(scale) );
           if(this.stars!.children[i].position.y >= this.height) {
               this.stars!.children[i].position.y = 0;
           }
           if(this.stars!.children[i].position.x >= this.width) {
               this.stars!.children[i].position.x = 0;
           }
           if(this.stars!.children[i].position.x < 0) {
               this.stars!.children[i].position.x = 1200
           }
           if(this.stars!.children[i].position.y < 0) {
            this.stars!.children[i].position.y = 800
           }
        }
        for(var j = 0; j < this.mines!.children.length; j++) {
            this.mines!.children[j].translate( (this.mouseVector!.multiply(-0.005)) );
            this.mines!.children[j].rotate(3);
        }
        for(var j = 0; j < this.mines!.children.length; j++) {
            var toCenter = this.mines!.children[j].position.subtract(paper.view.center);
            this.mines!.children[j].translate( (toCenter.multiply(-0.01)) );
        }

        for( var i = 0; i< this.lasers!.children.length; i++) {
            this.lasers!.children[i].translate(this.lasers!.children[i].data.multiply(0.5));
            if(this.lasers!.children[i].position.y >= this.height) {
                this.lasers!.children[i].remove();
            }
            else if(this.lasers!.children[i].position.x >= this.width) {
                this.lasers!.children[i].remove();
            }
            else if(this.lasers!.children[i].position.x < 0) {
                this.lasers!.children[i].remove();
            }
            else if(this.lasers!.children[i].position.y < 0) {
             this.lasers!.children[i].remove();
            }
        }
        
        if(this.mines!.children.length > 7) {
            this.mines!.children[0].remove();
        }

        var newSymbol = new paper.Item;
        this.lasers!.children.forEach((item1: paper.Item) => {
            this.mines!.children.forEach((item2: paper.Item) => {
                if((item1.position.isClose(item2.position,50)) == true) {
                    item1.remove();
                    var effect = new paper.Path.Circle(new paper.Point(20, 20), 3);
                    effect.position = item2.position;
                    effect.fillColor = new paper.Color('red');
                    var symbolEffect = new paper.SymbolDefinition(effect);
                    newSymbol = symbolEffect.place(item2.position);
                    setInterval(() => {
                        newSymbol.scale(2.5)
                        if(newSymbol.scaling > new paper.Point(500,500)) {
                            newSymbol.remove();
                        }
                        } , 100);
                    console.log(event.delta);

                    item2.remove();
                }
            })
        })



        // setInterval(() => newSymbol.remove(), 500)
        
        // if(newSymbol.scaling > new paper.Point(.9,.9)) {
        //     newSymbol.remove();
        // }
    

    }

    // This handles dynamic resizing of the browser window
    // You do not need to modify this function
    private resize() : void
    {
        var aspectRatio = this.width / this.height;
        var newAspectRatio = paper.view.viewSize.width / paper.view.viewSize.height;
        if(newAspectRatio > aspectRatio)
            paper.view.zoom = paper.view.viewSize.width  / this.width;    
        else
            paper.view.zoom = paper.view.viewSize.height / this.height;
        
        paper.view.center = new paper.Point(this.width / 2, this.height / 2);
        
    }

    private onMouseMove(event: paper.MouseEvent) : void
    {
        // Get the vector from the center of the screen to the mouse position
        var mouseVector = event.point.subtract(paper.view.center);

        this.mouseVector = mouseVector;

        // Point the ship towards the mouse cursor by converting the vector to an angle
        // This only works if applyMatrix is set to false
        this.ship!.rotation = mouseVector.angle + 90;

    }

    private onMouseDown(event: paper.MouseEvent) : void
    {
        console.log("Mouse click!");
        
        var rectangle = new paper.Rectangle(new paper.Point(this.width/2, this.height/2), new paper.Size(4,40))
        var laser = new paper.Path.Rectangle(rectangle);
        laser.fillColor = new paper.Color('red');
    

        var laserSymbol = new paper.SymbolDefinition(laser);
        var newSymbol = laserSymbol.place(new paper.Point(this.width/2, this.height/2));
        newSymbol.data = this.mouseVector!;
        newSymbol.data.normalize();
        newSymbol.rotation = this.mouseVector!.angle + 90;
        this.lasers!.addChild(newSymbol);

        // for(var i = 0; i < this.lasers!.children.length; i++) {
        //     this.lasers!.children[i].rotation = this.mouseVector!.angle + 90;
        // }

    } 
}

// This is included because the paper is missing a TypeScript definition
// You do not need to modify it
class GameEvent
{
    readonly delta: number;
    readonly time: number;
    readonly count: number;

    constructor()
    {
        this.delta = 0;
        this.time = 0;
        this.count = 0;
    }
}
    
// Start the game
var game = new Game();
game.start();