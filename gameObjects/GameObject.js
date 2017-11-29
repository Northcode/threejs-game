class GameObject
{
    constructor() {
    }

    animate() {
    }

    update(keyboard, scene) {
    }
}


class GameUnit extends GameObject
{
    constructor(model) {
	super()
	this.movement = {
	    forward: false,
	    backward: false,
	    left: false,
	    right: false,
	    jump: false,
	    sprinting: false,
	    speed: 10,
	    sprintspeed: 20,
	    jumpforce: 15,
	    velocity: new THREE.Vector3(0,0,0)
	}
	this.rotationMatrix = new THREE.Matrix4()
	this.model = model
	this.killplane = -10
	this.spawnpoint = new THREE.Vector3(0,30,0)
	this.hp = 100
	this.isDead = false
    }

    forward() {
	this.movement.forward = true
    }

    backward() {
	this.movement.backward = true
    }

    left() {
	this.movement.left = true
    }

    right() {
	this.movement.right = true
    }

    jump() {
	this.movement.jump = true
    }

    sprint() {
	this.movement.sprinting = true
    }

    is_moving() {
	return this.movement.forward || this.movement.backward || this.movement.left || this.movement.right
    }

	takeDamage(damage){
		this.hp -= damage
		if (this.hp <= 0) {
			this.die()
		}
	}

	die(){
		this.isDead = true
		this.respawn()
	}

	respawn() {
		this.isDead = false
		this.hp = 100
		this.model.position.copy(this.spawnpoint)
		this.model.__dirtyPosition = true
	}

    updateMatrix() {
	return undefined
    }

    update(keyboard, scene) {
	super.update(keyboard, scene)

	this.updateMatrix()

	let old_velocity = this.model.getLinearVelocity()
	this.movement.velocity.set(0,0,0)
	let cur_mov_speed = 0

	if (this.model.position.y < this.killplane) {
	    this.die()
	}

	if (this.movement.sprinting) {
	    cur_mov_speed = this.sprintspeed
	    this.movement.sprinting = false
	}else {
	    cur_mov_speed = this.movespeed
	}

	if (this.movement.forward) {
	    this.movement.velocity.z = -cur_mov_speed
	    this.movement.forward = false
	}
	if (this.movement.backward) {
	    this.movement.velocity.z = cur_mov_speed
	    this.movement.backward = false
	}
	if (this.movement.left) {
	    this.movement.velocity.x = -cur_mov_speed
	    this.movement.left = false
	}
	if (this.movement.right) {
	    this.movement.velocity.x = cur_mov_speed
	    this.movement.right = false
	}

	if (this.movement.velocity.length() > cur_mov_speed) {
	    this.movement.velocity.multiplyScalar(0.7071)
	}

	this.movement.velocity.applyMatrix4(this.rotationMatrix)
	this.movement.velocity.y = old_velocity.y

	let raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 3 )
	raycaster.ray.origin.copy( this.model.position )
	let intersections = raycaster.intersectObjects( scene.children )

	if (this.movement.jump && intersections.length > 0) {
	    this.movement.velocity.y = this.jumppower
	}
	this.movement.jump = false

	this.model.setLinearVelocity(this.movement.velocity)
	this.model.setAngularFactor(zero_vec)

    }
}
