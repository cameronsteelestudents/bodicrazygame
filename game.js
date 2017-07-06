// opacity

// metalboss
	// always charge player
	// move faster than the player

// collision stuff
// healthbar
// powerups/new ammo

var score = 0;

var gamecan = document.getElementById("gamecan");
gamecan.width = document.body.offsetWidth;
gamecan.height = document.body.offsetHeight;

window.addEventListener("keydown", keyDown);

var tools = gamecan.getContext("2d");

var gameObjects = [];

function randomEnemy() {
    var range = 5000;

	var enemyX = player.position.x + (Math.random() * range * 2) - range;

	if (enemyX < 0) {
		enemyX = 0;
	}

    new Enemy(enemyX, -100, 50, 50, 'images/metalboss.gif');
}

function Character(x,y,w,h,image) {
    GameObject.call(this, x, y, w, h, image);

	var me = this;
    me.maxHealth = 100;
	me.health = me.maxHealth;
    me.speed = 4;
    me.tags.push('character');

	me.changeHealth = function(amount) {
		me.health += amount;
        me.opacity = me.health / me.maxHealth;

		if(me.health <= 0) {
			me.destroy();
			player.speed = 3;

			if(me.tags.indexOf('enemy') != -1) {
				randomEnemy();

			    setTimeout(function() {
	    		    randomEnemy();
			    }, 2000);


				if(player.health > 0) {
					score += 1;
					console.log(score)
				}
			}
		}
	}

}

function Enemy(x,y,w,h,image) {
	Character.call(this,x,y,w,h,image);
    var me = this;
    me.tags.push('enemy');

    me.speed = 3;

	me.think = function() {
		
		if (me.grounded == true) {
			if (me.position.x > player.position.x) {
				me.position.x -= me.speed;
			} else{
				me.position.x += me.speed;

			}
		}
	}
}



function GameObject(x,y,w,h,image) {
	var me = this;

	// this.x = x;
	// this.y = y;
	this.position = new Vector2D(x, y);
	this.velocity = new Vector2D(0, 0);
	this.w = w;
	this.h = h;
	this.static = false;
	this.grounded = false;
	this.image = image;
	this.tags = [];
	this.opacity = 1;

	this.destroy = function() {
		gameObjects.splice(gameObjects.indexOf(me), 1);
	}



	gameObjects.push(this);
}

function Vector2D(x, y) {
	var me = this;
	me.x = x;
	me.y = y;

	me.subtract = function(anotherVector) {
		var newX = me.x - anotherVector.x;
		var newY = me.y - anotherVector.y;

		return new Vector2D(newX, newY);
	}

	me.getMagnitude = function() {
		var magnitude = Math.sqrt(me.x * me.x + me.y * me.y);
		return magnitude;
	}

	me.normalize = function() {
		var magnitude = me.getMagnitude();
		me.x /= magnitude;
		me.y /= magnitude;
	}

	me.scale = function(amount){
		me.x *= amount;
		me.y *= amount;
	}
}

var jumpBoosts = 0;
var xdirection = 0;
var metalboss = new Enemy(2000,0,50,50,'images/metalboss.gif');
var player = new Character(0, 0, 100, 100);
player.speed = 4;
var underground = new GameObject(0, -1700, 10000000, 50);
underground.static = true;
var ground = new GameObject(0, -500, 10000000, 50);
ground.static = true;
// var cage = new GameObject(5000);

 
// var range = 10000;
var jumpBoost = new GameObject(Math.random() * 10000, -100, 20, 20, "images/jump.png");
jumpBoost.tags.push("jumpBoost");

// NEXT TIME!
function generateArea() {
    // generate stuff in like a 10000 unit area
}

function keyDown(event) {
	switch(event.keyCode) {
		case 87: {
			//w
			 // += 10;


		} break;



		case 83: {

		} break;


		case 65: {
			//a
			// player.x -= 5;
			xdirection = -1;
		} break;

		case 68: {
			//d
			//player.x += 5;
			xdirection = 1;
		} break;

		case 32: {
			// spacebar
			if(jumpBoosts > 0) {
				player.grounded = false;
				player.speed = 6;
				player.position.y += 5;
				player.velocity.y = 4;
				jumpBoosts--;
			} else if(player.grounded) {
				player.grounded = false;
				player.position.y += 5;
				player.velocity.y = 2;
			}
		} break;
	}
}

window.addEventListener("keyup",keyUp)

function keyUp(event) {
	switch(event.keyCode) {
		case 65: {
			xdirection = 0;
		} break;

		case 68: {
			xdirection = 0;
		}break;

	}
}

function localToWorld(x, y) {
	y *= -1;
	x += (player.position.x - 500);
	y += (player.position.y + 500);

	return new Vector2D(x, y);
}


window.addEventListener("mousedown", mouseDown);

function mouseDown(event) {
	var worldPosition = localToWorld(event.clientX, event.clientY);

	var bullet = new GameObject(player.position.x + 70, player.position.y - 47, 20,10);
	bullet.tags.push('projectile');

	var velocityVector = worldPosition.subtract(bullet.position);
	velocityVector.normalize();
	velocityVector.scale(25);

	bullet.velocity = velocityVector;
}

function update() {
	tools.clearRect(0,0,gamecan.width,gamecan.height);

	if(checkCollision(player, ground)) {
		player.grounded = true;
		player.velocity.y = 0;
	} else {
		player.grounded = false;
	}

	if(player.position.y < -10000) {
		player.position.y = 0;
		player.position.x = 0;
	}

	player.position.x += xdirection * player.speed;

	

	for(var index = 0; index < gameObjects.length; index++) {
		var gameObject = gameObjects[index];

        if(gameObject.tags.indexOf('enemy') != -1) {
            gameObject.think();
        }

		for(var colliderIndex = 0; colliderIndex < gameObjects.length; colliderIndex++) {
			var collider = gameObjects[colliderIndex];
			var collision = checkCollision(gameObject, collider);
			if(collision) {
				if(gameObject == player) {
					if(collider.tags.indexOf('jumpBoost') != -1) {
						jumpBoosts = 8;
						jumpBoost.destroy();
						jumpBoost = new GameObject(Math.random() * 10000, -100, 20, 20, "images/jump.png");
                        jumpBoost.tags.push('jumpBoost');
					}

					if(collider.static && jumpBoosts > 0) {
						player.speed = 4;
					}
				}

				if(gameObject.tags.indexOf('projectile') != -1) {
					if(collider.static) {
						// it is a projectile
						gameObject.destroy();
					} else if(collider.tags.indexOf('enemy') != -1) {
						collider.changeHealth(-5);
					} else {
					}
				} else if(gameObject.tags.indexOf('character') != -1 && gameObject.tags.indexOf('enemy') == -1) {
				    if(collider.tags.indexOf('enemy') != -1) {
				        gameObject.changeHealth(-1);
				        
				    }
				} else {
					if(collider.static) {
						gameObject.velocity.y = 0;
						gameObject.grounded = true;
					}
				}
			}
		}

		if(gameObject.static == false && gameObject.grounded == false) {
			gameObject.velocity.y -= 0.08;
		}

		gameObject.position.x += gameObject.velocity.x;
		gameObject.position.y += gameObject.velocity.y;

		if(gameObject == player) {
			var image = new Image();
			image.src = 'images/player.gif';
			tools.globalAlpha = player.opacity;
			tools.drawImage(image, 500, 500, player.w, player.h);

			var image = new Image();
			image.src = 'images/gun.png';
			tools.drawImage(image, 535, 530, 50, 50);
		} else {
		    tools.globalAlpha = gameObject.opacity;
			if(gameObject.image) {
				var image = new Image();
				image.src = gameObject.image;
				tools.drawImage(image, gameObject.position.x - (player.position.x - 500), -(gameObject.position.y - (player.position.y + 500)), gameObject.w,gameObject.h);
			} else {
				tools.fillRect(
					gameObject.position.x - (player.position.x - 500),
					-(gameObject.position.y - (player.position.y + 500)),
					gameObject.w,
					gameObject.h
				);
			}
		}
	}

	tools.font = '36px Arial';
	tools.fillText(score, 10, 40);

	setTimeout(update, 15);
}

update();


function checkCollision(a,b) {
	var lxa = a.position.x;
	var rxa = a.position.x + a.w;
	var tya = a.position.y;
	var bya = a.position.y - a.h;

	var lxb = b.position.x;
	var rxb = b.position.x + b.w;
	var tyb = b.position.y;
	var byb = b.position.y - b.h;

	if(rxa < lxb || rxb < lxa || tyb < bya || tya < byb) {
		return false;
	} else {
		return true;
	}
}