/*

  File: map.js

  This entire file handles map generation, 
  it defines all the different building blocks a map can be built out of.

  The map is constructed from a grid system,
  and the levels are generated from a string containing different characters for each block.

  All the blocks inherit from the Part class, which share a constructor containing grid position and color of the block.
  The "Block" class also extends SizedPart, which means it also has a defined size instead of the default {1,1,1}.

  This is used to optimize generation of blocks, as having less of them makes the scene less laggy.

  The bulk of the work for positioning is done in the generate_block and generate_map_from functions,
  but the actually construction of the objects is done inside each blocks build function.

 */

const get_grid_pos = (x,y,z) => new THREE.Vector3(x*8,y*6 - 3,z*8)

class Part
{
    constructor(x,y,z, color) {
	this.x = x
	this.y = y
	this.z = z
	this.color = color
    }

    build(scene) {
	return undefined
    }
}

class SizedPart extends Part
{
    constructor(x,y,z ,w,h,d, color) {
	super(x,y,z,color)
	this.w = w
	this.h = h
	this.d = d
    }

    build(scene) {
	return undefined
    }
}
class Block extends SizedPart
{
    build(scene) {
	load_texture("assets/textures/brick.jpg").then(tex => {

	    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	    let ctex = tex
	    ctex.clone(tex)

	    ctex.repeat.set(this.w, 1)

	    let box = new Physijs.BoxMesh(
		new THREE.BoxGeometry(8*this.w,6*this.h,8*this.d),
		Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color, map: ctex }), 0.3,0.3), 0)

	    let shadowCaster = new THREE.Mesh(
		new THREE.BoxGeometry(7*this.w,5*this.h,7*this.d),
		new THREE.MeshBasicMaterial({ color: this.color }))

	    shadowCaster.castShadow = true
	    box.receiveShadow = true
	    box.position.copy(get_grid_pos(this.x,this.y,this.z))
	    box.add(shadowCaster)
	    scene.ground.push(box)
	    scene.add(box)
	})
    }
}

class Roof extends Part
{
    build(scene) {
	let box = new Physijs.BoxMesh(
	    new THREE.BoxGeometry(8,0.5,8),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)

	box.castShadow = true
	box.position.copy(get_grid_pos(this.x,this.y,this.z))
	box.position.y += 2.75
	scene.ground.push(box)
	scene.add(box)
    }
}

class Platform extends Part
{
    build(scene) {
	let box = new Physijs.BoxMesh(
	    new THREE.BoxGeometry(6,1,6),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)

	box.castShadow = true
	box.position.copy(get_grid_pos(this.x,this.y,this.z))
	scene.ground.push(box)
	scene.add(box)
    }
}

class SmallPlatform extends Part
{
    build(scene) {
	let box = new Physijs.BoxMesh(
	    new THREE.BoxGeometry(3,0.5,3),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)

	box.castShadow = true
	box.position.copy(get_grid_pos(this.x,this.y,this.z))
	box.position.y -= 3.25
	scene.ground.push(box)
	scene.add(box)
    }
}

let stairP = load_geometry("assets/models/stairs.json")

class Stairs extends Part
{
    build(scene,angle) {
	stairP.then(geometry => {
	    let stair = new Physijs.BoxMesh(
		geometry,
		Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 1,1), 0)

	    stair.castShadow = true
	    stair.rotation.set(deg_to_rad(36),deg_to_rad(180),0)
	    stair.rotateOnWorldAxis(new THREE.Vector3(0,1,0), deg_to_rad(angle))
	    stair.position.copy(get_grid_pos(this.x,this.y,this.z))
	    stair.position.y -= 0.5
	    // stair.translateZ(0.1)
	    scene.ground.push(stair)
	    scene.add(stair)
	})
    }
}

class ZombiePart extends Part
{
    build(scene,gameobjects) {
	let spawner = new ZombieSpawner(get_grid_pos(this.x,this.y,this.z), scene, gameobjects)
	gameobjects.push(spawner)
    }
}

let keyColors = [0x3BFF21, 0xE8B71E, 0xFF472D, 0x741EE8, 0x5AEBFF]
let keyPartsP = load_object('assets/models/compleateCircleKey.json')

let keyParts = []
let doorKey = []
let keyPartsLoadedP = undefined

const load_key = () => {
    keyPartsLoadedP = new Promise((resolve, reject) => {
	let allKeyParts = keyPartsP.then(object => {
	    while(keyParts.pop()) {}
	    while(doorKey.pop()) {}
	    for (child of object.children){
		keyParts.push(child.clone())
		doorKey.push(child.clone())
	    }
	    resolve(keyParts)
	})
    })
}

class CubeItemPart extends Part
{
    build(scene, gameobjects) {
	let item = new CubeItem()
	item.model.position.copy(get_grid_pos(this.x, this.y, this.z))

	keyPartsLoadedP.then( object => {
		let index = Math.floor(Math.random() * keyParts.length)
		let keyPart = keyParts[index]
		keyParts.splice(index, 1)
		keyPart.material = new  THREE.MeshStandardMaterial({ color: get_key_color(keyPart) })
	    item.model.add(keyPart)
		item.name = keyPart.name
	})

	item.model.addEventListener("collision", (other, relative_velocity, contact_normal) => {
	    if (other == scene.player.model) {
		scene.remove(item.model)
		scene.player.pickup_item(item)
		scene.player.update_inventory()
		pickupsound.play()
	    }
	})
	gameobjects.push(item)
	scene.add(item.model)
    }
}


let movingplatform_points = []

class MovingPlatformPart extends Part
{
    build(start_point, scene, gameobjects) {
	let platform = new MovingPlatform()
	platform.startpos.copy(start_point)
	platform.endpos.copy(get_grid_pos(this.x,this.y,this.z))
	platform.rebuild_tween()
	gameobjects.push(platform)
	scene.ground.push(platform.model)
	scene.add(platform.model)
    }
}

class FinishDoor extends Part {
	build(scene, gameobjects) {
		let door = new Door(this.color)
		door.model.position.copy(get_grid_pos(this.x, this.y, this.z))
		door.startpos.copy(get_grid_pos(this.x, this.y, this.z))
		door.endpos.copy(get_grid_pos(this.x, this.y-0.95, this.z))
		scene.door = door
		gameobjects.push(door)
		scene.add(door.model)
	}
}

class ExitPart extends Part {
    build (scene, gameobjects) {
	let box = new Physijs.BoxMesh(
	    new THREE.BoxGeometry(8,6,8),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)
	box.position.copy(get_grid_pos(this.x,this.y,this.z))

	box.addEventListener("collision", (other, relative_velocity, contact_normal) => {
	    if (other == scene.player.model) {
		scene.nextlevel()
	    }
	})

	scene.add(box)
    }
}

let lastblock = undefined

const generate_block = (x,y,z, chr, scene, gameobjects) => {
    let tmp = true
    switch (chr) {
    case '#': {
	tmp = false
	if (lastblock != undefined) {
	    lastblock.w += 1
	    lastblock.x += 0.5
	} else {
	    lastblock = new Block(x,y,z, 1,1,1, 0xffffff)
	}
    } break
    case '_': {
	let part = new Roof(x,y,z, 0x22aaaa)
	part.build(scene)
    } break
    case '-': {
	let part = new Platform(x,y,z, 0x22aaaa)
	part.build(scene)
    } break
    case '.': {
	let part = new SmallPlatform(x,y,z, 0x2222dd)
	part.build(scene)
    } break
    case '<': {
	let part = new Stairs(x,y,z, 0xaa2222)
	part.build(scene,-90)
    } break
    case '>': {
	let part = new Stairs(x,y,z, 0xaa2222)
	part.build(scene,90)
    } break
    case '^': {
	let part = new Stairs(x,y,z, 0xaa2222)
	part.build(scene,180)
    } break
    case 'v': {
	let part = new Stairs(x,y,z, 0xaa2222)
	part.build(scene,0)
    } break
    case 'Z': {
	let part = new ZombiePart(x,y,z, 0xaa2222)
	part.build(scene,gameobjects)
    } break
    case 'c': {
	let part = new CubeItemPart(x,y,z, 0xaa2222)
	part.build(scene,gameobjects)
    } break
    case 'M': {
	movingplatform_points.push(new THREE.Vector3(x,y,z))
    } break
    case 'N': {
	movingplatform_points = movingplatform_points.filter(p => {
	    if(p.x == x || p.z == z) {
		let part = new MovingPlatformPart(x,y,z, 0x22aa22)
		let gp = get_grid_pos(p.x, p.y, p.z)
		part.build(gp, scene, gameobjects)
		return true
	    } else {
		return false
	    }
	})
    } break
	case 'D': {
	let part = new FinishDoor(x,y,z, 0x0000ff)
	part.build(scene, gameobjects)
    } break
    case 'E': {
	let part = new ExitPart(x,y,z, 0x000000)
	part.build(scene,gameobjects)
    } break
    }
    if (tmp && lastblock != undefined) {
	lastblock.build(scene)
	lastblock = undefined
    }
}

const generate_map_from = (str,scene, gameobjects,startpos_f) => {

    while (movingplatform_points.pop()) {}
    load_key()


    scene.ground = []

    let lines = str.split("\n")
    let x = 0,y = 0,z = 0

    let width = 0, height = 0

    for (const line of lines) {
	if (is_num(line[0])) {
	    if (z > 0) {
		height = z * 8
	    }
	    y = parseFloat(line[0])
	    x = 0
	    z = 0
	} else {
	    if (lastblock != undefined) {
		lastblock.build(scene)
		lastblock = undefined
	    }
	    lastblock = undefined
	    width = line.length * 8
	    for (const c of line) {
		if (c == "S") {
		    startpos_f(get_grid_pos(x,y,z))
		    if (lastblock != undefined) {
			lastblock.build(scene)
			lastblock = undefined
		    }
		} else {
		    generate_block(x,y,z, c, scene, gameobjects)
		}
		x += 1
	    }
	    x = 0
	    z += 1
	}
    }
    // let floor = new Physijs.BoxMesh(new THREE.BoxGeometry(height,width + 16,10),
    // 				    new THREE.MeshStandardMaterial({color: 0x2222aa }),0)
    // floor.receiveShadow = true
    // floor.rotation.set(deg_to_rad(270), 0,0)
    // floor.position.set(height / 2 - 4,-5,width / 2 + 4)

    // scene.add(floor)
}

const reset_map_gen = () => {

}
