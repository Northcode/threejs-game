
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


class Block extends Part
{
    build(scene) {
	 let box = new Physijs.BoxMesh(
	     new THREE.BoxGeometry(8,6,8),
	     Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)

	box.castShadow = true
	box.position.copy(get_grid_pos(this.x,this.y,this.z))
	scene.add(box)
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
	box.position.y -= 3.25
	scene.add(box)
    }
}

class Platform extends Part
{
    build(scene) {
	let box = new Physijs.BoxMesh(
	    new THREE.BoxGeometry(6,1,6),
	    Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x22aaaa }), 0.3,0.3), 0)

	box.castShadow = true
	box.position.copy(get_grid_pos(this.x,this.y,this.z))
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
		Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: this.color }), 0.3,0.3), 0)

	    stair.castShadow = true
	    stair.rotation.set(deg_to_rad(36),deg_to_rad(180),0)
	    stair.rotateOnWorldAxis(new THREE.Vector3(0,1,0), deg_to_rad(angle))
	    stair.position.copy(get_grid_pos(this.x,this.y,this.z))
	    stair.translateY(-0.5)
	    scene.add(stair)
	})
    }
}

const generate_block = (x,y,z, chr, scene) => {
    switch (chr) {
    case '#': {
	let part = new Block(x,y,z, 0x22aa00)
	part.build(scene)
    } break
    case '_': {
	let part = new Roof(x,y,z, 0x22aaaa)
	part.build(scene)
    } break
    case '-': {
	let part = new Platform(x,y,z, 0x22aaaa)
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
    }
}

const generate_map_from = (str,scene,startpos_f) => {

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
	    width = line.length * 8
	    for (const c of line) {
		if (c == "S") {
		    startpos_f(get_grid_pos(x,y,z))
		} else {
		    generate_block(x,y,z, c, scene)
		}
		x += 1
	    }
	    x = 0
	    z += 1
	}
    }
    let floor = new Physijs.BoxMesh(new THREE.BoxGeometry(height,width + 16,10),
				    new THREE.MeshStandardMaterial({color: 0x2222aa }),0)
    floor.receiveShadow = true
    floor.rotation.set(deg_to_rad(270), 0,0)
    floor.position.set(height / 2 - 4,-5,width / 2 + 4)

    scene.add(floor)
}
