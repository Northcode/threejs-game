/*

  File: enemies.js

  This file contains the logic for all the enemies,
  Currently the Zombie and the ZombieSpawner.
  
  The Zombie handles movement and death of the Zombie enemies.

  The Zombie spawner continously spawns new zombies every 200 ticks,
  unless there are more than the max allowed amount in the scene.

  
  The Zombies have a timer to only execute their physics loop every 8 ticks,
  this has the effect of drastically improving performance, like, a lot,
  while not hampering their ability to move or hurt the player.

 */
class Zombie extends GameUnit
{
    constructor(){
	super(new Physijs.CapsuleMesh(
	    new THREE.CylinderGeometry(1,1,4,32),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0}), 0.3, 0.3), 1))
	this.model.setAngularFactor(new THREE.Vector3(0,0,0))
	load_object("assets/models/characterBase.json").then(object => {
	    this.animationMixer = new THREE.AnimationMixer( object )
	    object.scale.set(2,2,2)
	    this.object = object
	    this.model.add(object)
	    this.name = "zombie"
	    this.stuntime = 20

	})
	this.movespeed = 5

	this.hittimer = 3
	this.moveforward = false
    }

    destroy() {
	clearTimeout(this.respawntimer)
    }

    takeDamage(damage, direction){
	if (this.movement.stunned == 0) {
	    zombiehurtsound.play()
	}
	super.takeDamage(damage, direction)
    }

    die(){
	if (!this.isDead) {
	    this.isDead = true
	    scene.remove(this.model)
	    scene.numberofenemies--
	}
    }

    respawn(){
	scene.add(this.model)
	super.respawn()
    }

    update(keyboard, scene) {
	this.resetMovement()

	this.rotationMatrix.extractRotation(this.model.matrix)

	if (!this.isDead) {
	    this.lookAt(scene.player.model.position.clone())

	    if (this.moveforward) {
		this.forward()
	    }

	    if (this.hittimer <= 0) {
		this.hittimer = 8

		let rayvec = new THREE.Vector3(0,-1,-0.5)
		rayvec.applyMatrix4(this.rotationMatrix)

		let raycaster = new THREE.Raycaster( this.model.position.clone(), rayvec, 0, 5 )
		let intersections = raycaster.intersectObjects( scene.children )

		this.moveforward = intersections.length > 0
		
		let hitrayvec = zero_vec.clone()
		hitrayvec.subVectors(scene.player.model.position.clone(), this.model.position.clone())
		hitrayvec.normalize()

		let hitrayorigin = this.model.position.clone()
		hitrayorigin.y += 1.7
		let hitraycaster = new THREE.Raycaster(hitrayorigin, hitrayvec, 0, 3)
		let hitintersectiuons = hitraycaster.intersectObjects(scene.children)

		if (scene.castray) {
		    let arrow = new THREE.ArrowHelper(hitrayvec, hitrayorigin, 5, 0x0000ff )
		    scene.add(arrow)
		}

		if (hitintersectiuons.length > 0) {
		    if (hitintersectiuons[0].object.name == "player") {
			scene.player.takeDamage(10, hitrayvec)
		    }
		}

	    } else {
		this.hittimer--
	    }

	}

	super.update(keyboard, scene)
    }
}

class ZombieSpawner extends GameObject
{
    constructor(position,scene, gameobjects) {
	super()
	this.position = position
	this.scene = scene
	this.gameobjects = gameobjects
	this.sincelastspawn = 0
    }

    spawn_zombie() {
	let zombie = new Zombie()
	zombie.model.position.copy(this.position)
	zombie.spawnpoint.copy(zombie.model.position)

	this.gameobjects.push(zombie)
	this.scene.add(zombie.model)
	scene.numberofenemies++
    }

    update(keyboard, scene) {
	if (this.sincelastspawn <= 0 && scene.numberofenemies < scene.maxenemies) {
	    this.spawn_zombie()
	    this.sincelastspawn = 200
	} else {
	    this.sincelastspawn--
	}
    }
}
