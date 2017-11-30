class Player extends GameUnit
{
	constructor(controls) {
		super(new Physijs.CapsuleMesh(
			new THREE.CylinderGeometry(1,1,4,32),
			Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0}), 0.3, 0.3), 1))
		this.model.setAngularFactor(new THREE.Vector3(0,0,0))
		// this.model.castShadow = true
		load_object("assets/models/characterBase.json").then(object => {
			/*let mesh = new THREE.Mesh(
				geometry,
				new THREE.MeshStandardMaterial({ color: 0xffffff })
			)*/
			this.animationMixer = new THREE.AnimationMixer( object )
			object.scale.set(2,2,2)
			this.object = object
			this.model.add(object)
		})
		this.controls = controls
		this.model.add(controls.getObject())
		this.movespeed = 10
		this.sprintspeed = 20
		this.jumppower = 15

		this.lives = 5

		this.hitbar = document.getElementById("health")
	}

	takeDamage(damage){
		super.takeDamage(damage)
		this.hitbar.value = this.hp
	}

	die(){
		this.lives -= 1
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
