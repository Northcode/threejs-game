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

	this.model.name = "player"

	this.inventory = []

	this.lives = 5
	this.gunDamage = 25

	this.hitbar = document.getElementById("health")

	this.gunSound = new THREE.Audio(audioListener)
	audioLoader.load('assets/music/pew.mp3', buffer => {
		this.gunSound.setBuffer(buffer)
		this.gunSound.setVolume(0.6)
	})

	this.hurtsound = new THREE.Audio(audioListener)
	audioLoader.load('assets/music/deh!.mp3', buffer => {
		this.hurtsound.setBuffer(buffer)
		this.hurtsound.setVolume(0.8)
	})

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

	this.bullet = new THREE.Mesh(
	    new THREE.SphereGeometry(0.5,0.5,5),
	    new THREE.MeshStandardMaterial({ color: 0xffffff }))
	this.bullet.tween = undefined
    }

    pickup_item(item) {
	this.inventory.push(item)
    }

	update_inventory(){
		let inventory_content = []
		let inventory = this.inventory
		for (let item of inventory){
			inventory_content.push(item.model.children[0].name)
		}
		document.getElementById('inventory-content').innerHTML = inventory_content.join("</br>")
	}

    takeDamage(damage, direction){
		if (this.movement.stunned <= 0) {
			playerhurtsound.play()
		}
	super.takeDamage(damage,direction)
	this.hitbar.value = this.hp
    }

    die(){
	this.lives -= 1
	if (this.lives <= 0) {
		document.getElementById('instructions').innerHTML = "Game Over!</br>Click anywhere to restart"
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

    shootBullet(scene) {
	let dirvec = new THREE.Vector3()
	this.controls.getDirection(dirvec)
	let bullet_cast = new THREE.Raycaster(this.model.position.clone(), dirvec, 0, 80)
	bullet_cast.ray.origin.y += 1.7
	let intersects = bullet_cast.intersectObjects(scene.children)
	if (intersects.length > 0) {
	    // let arrow = new THREE.ArrowHelper(bullet_cast.ray.direction.normalize(), bullet_cast.ray.origin, intersects[0].distance, 0x0000ff)
	    // scene.add(arrow)

	    this.bullet.target = intersects[0].point
	    this.bullet.position.copy(bullet_cast.ray.origin)
	    this.bullet.tweenpos = this.bullet.position.clone()
	    this.bullet.tween = new TWEEN.Tween(this.bullet.tweenpos)
		.to(this.bullet.target, 200)
		.onUpdate(() => {
		    this.bullet.position.copy(this.bullet.tweenpos)
		})
		.onComplete(() => {
			if ('entity' in intersects[0].object) {
				if (intersects[0].object.entity.name == "zombie") {
					intersects[0].object.entity.takeDamage(this.gunDamage, dirvec)
				}
			}
		    scene.remove(this.bullet)
		})

	    scene.add(this.bullet)
	    this.bullet.tween.start()
		if (this.gunSound.isPlaying){
			this.gunSound.stop()
		}
		this.gunSound.play()
	}
    }

    onclick(keyboard, scene) {
	this.shootBullet(scene)
    }

	placeKeyPart(scene, keyPart, doorKeyPart){
		for (let invItem of this.inventory){
			if (invItem.name === keyPart.name) {
				this.inventory.splice(this.inventory.indexOf(invItem), 1)
				this.update_inventory()
				doorKeyPart.material.opacity = 1
				if (doorKey.every(item => item.material.opacity == 1)) {
					scene.door.build_tween()
				}
			}
		}
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
	    this.takeDamage(10, zero_vec.clone())
	}
	if (keyboard.pressed("R")) {
		scene.castray = true
	}else {
		scene.castray = false
	}

	let dirvec = new THREE.Vector3()
	this.controls.getDirection(dirvec)
	let key_cast = new THREE.Raycaster(this.model.position.clone(), dirvec, 0, 5)
	key_cast.ray.origin.y += 1.7
	let intersects = key_cast.intersectObjects(doorKey)
	if (intersects.length > 0) {
		let keyPart = this.inventory.find(item => {
			return item.name == intersects[0].object.name
		})
		if ( keyPart ) {
			if (keyboard.pressed("E")) {
				this.placeKeyPart(scene, keyPart, intersects[0].object)
			}
		}
	}

	super.update(keyboard, scene)
    }
}
