class Player extends GameUnit
{
	constructor(controls) {
		super(new Physijs.CapsuleMesh(
			new THREE.CylinderGeometry(1,1,4,32),
			Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0}), 0.3, 0.3), 1))
		this.model.setAngularFactor(new THREE.Vector3(0,0,0))
		// this.model.castShadow = true
		this.controls = controls
		this.model.add(controls.getObject())
		this.movespeed = 10
		this.sprintspeed = 20
		this.jumppower = 15

	    this.inventory = []

		this.lives = 5

		this.hitbar = document.getElementById("health")

		load_object("assets/models/characterBase.json").then(object => {
		    // let mesh = new THREE.Mesh(
		    // 	geometry,
		    // 	new THREE.MeshStandardMaterial({ color: 0xffffff })
		    // )
		    this.animationMixer = new THREE.AnimationMixer( object )
		    object.position.set(0,-1.8,0)
		    object.scale.set(2,2,2)
		    object.children.map(c => {
			c.material.transparent = true
			c.material.opacity = 0
		    })
		    this.object = object
		    this.controls.getObject().add(object)
		})
	}

    pickup_item(item) {
	this.inventory.push(item)
    }

	takeDamage(damage){
		super.takeDamage(damage)
		this.hitbar.value = this.hp
	}

	die(){
		this.lives -= 1
		if (this.lives <= 0) {
			document.exitPointerLock();
		}
		super.die()
	}

	respawn(){
		super.respawn()
		this.hitbar.value = this.hp
		document.getElementById("lives").innerHTML = "Lives: " + this.lives;
	}

    updateMatrix() {
		this.rotationMatrix = this.controls.getObject().matrix
    }

    update(keyboard, scene) {
	this.resetMovement()
	
		if (keyboard.pressed("shift")) {
			this.sprint()
		}
		if (keyboard.pressed("W")) {
			this.forward()
		}
		if (keyboard.pressed("S")) {
			this.backward()
		}
		if (keyboard.pressed("A")) {
			this.left()
		}
		if (keyboard.pressed("D")) {
			this.right()
		}
		if (keyboard.pressed("space")) {
			this.jump()
		}

		if (keyboard.pressed("M")) {
			this.takeDamage(10)
		}

		super.update(keyboard, scene)
    }
}
