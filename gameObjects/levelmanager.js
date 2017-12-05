class LevelManager
{
    constructor() {
	this.levels = []
	this.current_level = 0
    }

    add_level(str) {
	this.levels.push(str)
	scene.noOfLevels++
    }

    load_level(nr,scene,gameobjects,camera_controls) {
	this.clear_scene(scene,gameobjects)

	this.setup_lights(scene)

	let player = new Player(camera_controls)

	scene.player = player

	gameobjects.push(player)
	scene.add(player.model)

	generate_map_from(this.levels[nr], scene, gameobjects, (startpos) => {
	    scene.player.spawnpoint = startpos
	})

	player.respawn()
	document.exitPointerLock()
    }


    setup_lights(scene) {
	// LIGHTING
	let light = new THREE.DirectionalLight(0xaa7777, 1, 100)
	light.position.set(60,60,30)
	light.target.position.set(4*8,6*3,4*8)

	light.shadow.mapSize.width = shadowMapRes
	light.shadow.mapSize.height = shadowMapRes
	light.shadow.camera.left = -200
	light.shadow.camera.right = 200
	light.shadow.camera.top = 200
	light.shadow.camera.bottom = -200
	light.shadow.camera.near = 1
	light.shadow.camera.far = 150
	light.shadow.bias = 0.0001
	light.castShadow = true

	// AMBIENT LIGHT
	let ambient = new THREE.AmbientLight(0x222222)

	scene.add(light)
	scene.add(ambient)
    }

    clear_scene(scene,gameobjects) {
	while (scene.children.length > 0) {
	    scene.remove(scene.children[0])
	}
	let it = undefined
	while ((it = gameobjects.pop()) != undefined) {
	    it.destroy()
	}
	scene.numberofenemies = 0
    }
}
