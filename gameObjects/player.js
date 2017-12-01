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

	this.gunSound = new THREE.Audio(audioListener)
	let audioLoader = new THREE.AudioLoader()

	audioLoader.load('assets/music/pew.mp3', buffer => {
		this.gunSound.setBuffer(buffer)
		this.gunSound.setVolume(0.6)
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

    takeDamage(damage, direction){
	super.takeDamage(damage,direction)
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

    shootBullet(scene) {
	let dirvec = new THREE.Vector3()
	this.controls.getDirection(dirvec)
	let bullet_cast = new THREE.Raycaster( new THREE.Vector3(), dirvec, 0, 80)
	bullet_cast.ray.origin.copy(this.model.position)
	bullet_cast.ray.origin.y += 1.7
	let intersects = bullet_cast.intersectObjects(scene.children)
	if (intersects.length > 0) {
	    let arrow = new THREE.ArrowHelper(bullet_cast.ray.direction.normalize(), bullet_cast.ray.origin, intersects[0].distance, 0x0000ff)
	    scene.add(arrow)

	    this.bullet.target = intersects[0].point
	    this.bullet.position.copy(bullet_cast.ray.origin)
	    this.bullet.tweenpos = this.bullet.position.clone()
	    // console.log("bullet from: " + vec_to_str(bullet_cast.ray.origin) + " to: " + vec_to_str(this.bullet.target))
	    this.bullet.tween = new TWEEN.Tween(this.bullet.tweenpos)
		.to(this.bullet.target, 200)
		.onUpdate(() => {
		    this.bullet.position.copy(this.bullet.tweenpos)
		})
		.onComplete(() => {
		    scene.remove(this.bullet)
		    console.log("Pew done!")
		})

	    scene.add(this.bullet)
	    this.bullet.tween.start()
		this.gunSound.play()
	}
    }

    onclick(keyboard, scene) {
	console.log("pew!")
	this.shootBullet(scene)
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
